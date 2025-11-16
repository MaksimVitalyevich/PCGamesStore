<?php 
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $dir = __DIR__ . "/../../MockData/";
    $pdo = checkConnectionOrFallBack(__DIR__ . "/../../MockData/LOCAL-purchases.json");

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    $purchasesPath = $dir . "LOCAL-purchases.json";

    if (in_array($action, ['checkPurchase', 'addPurchase', 'owned']) && !$data) {
        jsonError('Нет нужных данных', 400);
    }

    switch($action) {
        case 'getPurchases':
            requireFields($data, ['user_id']);

            if (is_array($pdo)) {
                $purchases = json_decode(file_get_contents($purchasesPath), true);
                $games = json_decode(file_get_contents($dir . "LOCAL-games.json"), true);

                if (!$data['user_id']) jsonError('Не найден пользователь для получения списка покупок!', 404);

                $userPurchases = array_values(array_filter($purchases, fn($p) => $p['user_id'] === $data['user_id']));
                $result = [];

                foreach ($userPurchases as &$purchase) {
                    $game = array_values(array_filter($games, fn($g) => $g['id'] === $purchase['game_id']))[0];
                    if ($game) {
                        $result[] = [
                            'id' => $purchase['id'],
                            'title' => $game['title'],
                            'price' => $game['price'],
                            'purchase_date' => $purchase['purchase_date']
                        ];
                    }
                }
                $result = $purchases;
                jsonResponse(['success' => true, 'purchases' => $result]);
            } else {
                $stmt = safeQuery($pdo, "SELECT p.id, p.title, p.price, p.purchase_date FROM purchases p JOIN games g ON p.game_id = g.id WHERE p.user_id = ?", [$data['user_id']]);
                jsonResponse(['success' => true, 'source' => 'db', 'purchases' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        case 'checkPurchase':
            requireFields($data, ['user_id', 'game_id']);

            if (is_array($pdo)) {
                $purchases = json_decode(file_get_contents($purchasesPath), true);

                $alreadyBought = array_filter($purchases, fn($p) => $p['user_id'] == $data['user_id'] && $p['game_id'] == $data['game_id']);

                if (!empty($alreadyBought)) jsonError('Данная игра уже куплена пользователем!', 409);

                jsonResponse(['success' => true, 'message' => 'Прверка купленности - обработана (локально)!']);
            } else {
                $stmt = safeQuery($pdo, "SELECT id FROM purchases WHERE user_id = ?", [$data['user_id'], $data['game_id']]);

                if ($stmt->rowCount() > 0) jsonError('Данная игра уже куплена пользователем!', 409);
                jsonResponse(['success' => true, 'message' => 'Прверка купленности - обработана!']);
            }
            break;
        case 'addPurchase':
            if (!$data) {
                error_log("addPurchase received empty data");
                jsonError('Нет нужных данных', 400);
            }
            
            error_log("addPurchase payload: " . print_r($data, true));
            requireFields($data, ['user_id', 'game_id', 'title', 'price', 'added_at']);

            if (isset($data['data'])) $data = $data['data'];

            $purchaseDate = date('Y-m-d H:i:s', strtotime($data['added_at']));

            if (is_array($pdo)) {
                $purchases = json_decode(file_get_contents($purchasesPath), true);

                $newId = empty($purchases) ? 1 : max(array_column($purchases, 'id')) + 1;
                $newPurchase = [
                    'id' => $newId,
                    'user_id' => $data['user_id'],
                    'game_id' => $data['game_id'],
                    'title' => $data['title'],
                    'price' => $data['price'],
                    'purchase_date' => $purchaseDate
                ];
                $purchases[] = $newPurchase;
                file_put_contents($purchasesPath, json_encode($purchases, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Занесено в раздел покупок (локально)']);
            } else {
                $stmt = safeQuery($pdo, "INSERT INTO purchases (user_id, game_id, price, purchase_date) VALUES (?, ?, ?, ?)", 
                [
                    $data['user_id'],
                    $data['game_id'],
                    $data['title'],
                    $data['genre'] ?? '',
                    $data['price'],
                    $purchaseDate,
                    $data['promo_used'] ?? null
                ]);
                jsonResponse(['success' => true, 'message' => 'Оформлено успешно и добавлено в раздел покупок', 'id' => $pdo->lastInsertId()]);
            }
            break;
        case 'owned':
            requireFields($data, ['user_id']);

            if (is_array($pdo)) {
                $purchases = json_decode(file_get_contents($purchasesPath), true);

                $userPurchases = array_values(array_filter($purchases, fn($p) => $p['user_id'] == $data['user_id']));

                jsonResponse(['success' => true, 'purchases' => $userPurchases]);
            } else {
                $stmt = safeQuery($pdo, "SELECT * FROM purchases WHERE user_id = ?", [$data['user_id']]);
                jsonResponse(['success' => true, 'purchases' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        default:
            jsonError('Неизвестное действие', 400);
            break;
    }
?>