<?php 
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $gamesPath = __DIR__ . "/../../MockData/LOCAL-games.json";
    $pdo = checkConnectionOrFallBack($gamesPath);

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    $games = [];

    if (in_array($action, ['addGame', 'updateGame', 'deleteGame', 'buy']) && !$data) jsonError('Нет нужных данных', 400);

    switch ($action) {
        case 'getGames':
            if (is_array($pdo)) {
                $games = $pdo;
                jsonResponse(['success' => true, 'games' => $games]);
            } else {
                $stmt = safeQuery($pdo, "SELECT * FROM games ORDER BY id DESC");
                jsonResponse(['success' => true, 'source' => 'db', 'games' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        case 'addGame':

            if (isset($data['data'])) $data = $data['data'];

            if (is_array($pdo)) {
                $games = $pdo;

                $newId = !empty($games) ? max(array_column($games, 'id')) + 1 : 1;
                $newGame = array_merge(['id' => $newId], $data);

                $games[] = $newGame;
                file_put_contents($gamesPath, json_encode($games, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Новая запись (игра) добавлена в файл', 'game' => $newGame]);
            } else {
                safeQuery($pdo, "INSERT INTO games (title, published_at, genre, rating, system_requirements, price, image, developer, company_name, localization) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)", 
                [
                    $data['title'],
                    $data['published_at'] ?? '',
                    $data['genre'],
                    $data['rating'],
                    $data['system_requirements'] ?? '',
                    $data['price'],
                    $data['image'] ?? '',
                    $data['developer'],
                    $data['company_name'],
                    $data['localization']
                ]);
                jsonResponse(['success' => true, 'message' => 'Игра добавлена', 'id' => $pdo->lastInsertId()]);
            }
            break;
        case 'updateGame':

            if (isset($data['data'])) $data = $data['data'];

            if (is_array($pdo)) {
                $games = $pdo;
                $updated = false;

                foreach ($games as &$game) {
                    if ($game['id'] == $data['id']) {
                        $game = array_merge($game, $data);
                        $updated = true;
                        break;
                    }
                }

                if ($updated) {
                    file_put_contents($gamesPath, json_encode($games, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    jsonResponse(['success' => true, 'message' => 'Игра обновлена (локально)']);
                } else {
                    jsonError('Игра с указанным ID - не найдена!', 404);
                }
            } else {
                safeQuery($pdo, "UPDATE games SET title = ?, published_at = ?, genre = ?, rating = ?, system_requirements = ?, price = ?, image = ?, developer = ?, company_name = ?, localization = ? WHERE id = ?", 
                [
                    $data['title'],
                    $data['published_at'] ?? '',
                    $data['genre'],
                    $data['rating'],
                    $data['system_requirements'] ?? '',
                    $data['price'],
                    $data['image'] ?? '',
                    $data['developer'],
                    $data['company_name'],
                    $data['localization']
                ]);
                jsonResponse(['success' => true, 'message' => 'Игра обновлена']);
            }
            break;
        case 'deleteGame':
            requireFields($data, ['id']);

            if (is_array($pdo)) {
                $games = $pdo;

                $games = array_values(array_filter($games, fn($g) => $g['id'] != $data['id']));
                file_put_contents($gamesPath, json_encode($games, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Удалена запись (игра) из файла']);
            } else {
                safeQuery($pdo, "DELETE FROM games WHERE id = ?", [$data['id']]);
                jsonResponse(['success' => true, 'message' => 'Игра удалена']);
            }
            break;
        case 'buy':
            requireFields($data, ['user_id', 'game_id']);

            $userId = $data['user_id'];
            $gameId = $data['game_id'];

            if (!$userId || !$gameId) jsonError('Нет данных (ID) пользователя и покупаемой игры!', 404);

            if ($pdo instanceof PDO) {
                $checkExisting = safeQuery($pdo, "SELECT id FROM cart WHERE user_id = ? AND game_id = ?", [$userId, $gameId]);
                // Проверка, что существует такая игра
                if ($checkExisting->fetch()) {
                    jsonError('Игра уже есть в корзине', 409);
                }

                safeQuery($pdo, "INSERT INTO cart (user_id, game_id) VALUES (?, ?)", [$userId, $gameId]);
                jsonResponse(['success' => true, 'message' => 'Игра куплена и добавлена в корзину!']);
                break;
            }

            $games = $pdo;
            $jsonDir = __DIR__ . "/../../MockData/";
            $cartPath = $jsonDir . "LOCAL-cart.json";
            $cart = json_decode(file_get_contents($cartPath), true);

            $exists = array_filter($cart, fn($c) => $c['user_id'] == $data['user_id'] && $c['game_id'] == $data['game_id']);
            if ($exists) jsonError('Игра уже есть в корзине', 409);

            $newId = empty($cart) ? 1 : max(array_column($cart, 'id')) + 1;
            $game = array_values(array_filter($games, fn($g) => $g['id'] == $gameId))[0];

            $cart[] = [
                'id' => $newId,
                'user_id' => $userId,
                'game_id' => $gameId,
                'title' => $game['title'],
                'price' => $game['price']
            ];
            file_put_contents($cartPath, json_encode($cart, JSON_PRETTY_PRINT));

            jsonResponse(['success' => true, 'message' => 'Куплено и добавлено в корзину (локально)', 'cart' => array_values(array_filter($cart, fn($c) => $c['user_id'] == $userId))]);
            break;
        default:
            jsonError('Неизвестное действие', 400);
            break;
    }
?>