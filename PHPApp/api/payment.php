<?php 
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $pdo = checkConnectionOrFallBack(__DIR__ . "/../../MockData/LOCAL-purchases.json");

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (in_array($action, ['pay']) && !$data) jsonError('Нет нужных данных', 400);

    function findById(array $list, $id) {
        foreach ($list as $item) {
            if ($item['id'] === $id) return $item;
        }
    }

    switch ($action) {
        case 'pay':
            requireFields($data, ['user_id']);

            if ($pdo instanceof PDO) {
                $userStmt = safeQuery($pdo, "SELECT * FROM users WHERE id = ?", [$data['user_id']]);
                $user = $userStmt->fetch();

                if (!$user) jsonError('Пользователь не найден', 404);

                $cartStmt = safeQuery($pdo, "SELECT c.id as cart_id, c.game_id, g.price, g.title FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = ?", [$data['user_id']]);

                $cart = $cartStmt->fetchAll(PDO::FETCH_ASSOC);

                if (empty($cart)) jsonError('Корзина пуста', 400);

                $total = array_sum(array_column($cart, 'price'));

                if ($user['balance'] < $total) jsonError('Недостаточно средств', 402);

                $pdo->beginTransaction();
                try {
                    // Списание средств
                    safeQuery($pdo, "UPDATE users SET balance = balance - ? WHERE id = ?", [$total, $user['id']]);

                    $insertStmt = $pdo->prepare("INSERT INTO purchases (user_id, game_id, price) VALUES (?, ?, ?)");
                    foreach ($cart as $item) {
                        $insertStmt->execute([$user['id'], $item['game_id'], $item['price']]);
                    }

                    safeQuery($pdo, "DELETE FROM cart WHERE user_id = ?", [$data['user_id']]);

                    $pdo->commit();

                    $userStmt = safeQuery($pdo, "SELECT * FROM users WHERE id = ?", [$data['user_id']]);
                    $user = $userStmt->fetch();

                    jsonResponse(['success' => true, 'message' => 'Оплата успешно завершена', 'total' => $total, 'purchased' => $cart, 'user' => $user]);
                } catch (Exception $e) {
                    $pdo->rollBack();
                    jsonError('Ошибка при обработке оплаты' . $e->getMessage(), 500);
                }
                break;
            }

            $dir = __DIR__ . "/../../MockData/";
            $cartPath = $dir . "LOCAL-cart.json";
            $purchasesPath = $dir . "LOCAL-purchases.json";
            $usersPath = $dir . "LOCAL-users.json";
            $gamesPath = $dir . "LOCAL-games.json";

            $users = json_decode(file_get_contents($dir . "LOCAL-users.json"), true);
            $games = json_decode(file_get_contents($dir . "LOCAL-games.json"), true);
            $cart = json_decode(file_get_contents($cartPath), true);
            $purchases = json_decode(file_get_contents($purchasesPath), true);

            $user = findById($users, $data['user_id']);

            if (!$user) jsonError('Пользователь не найден', 404);

            $userCart = array_values(array_filter($cart, fn($c) => $c['user_id'] == $data['user_id']));

            if (empty($userCart)) {
                jsonResponse(['success' => true, 'message' => 'Корзина пуста', 'total' => 0, 'user' => $user]);
            }

            $total = 0;
            foreach ($userCart as $item) {
                $game = findById($games, $item['game_id']);
                if ($game) $total += $game['price'] ?? 0;
            }

            if ($user['balance'] < $total) jsonError('Недостаточно средств', 402);

            foreach ($users as &$u) {
                if ($u['id'] == $user['id']) {
                    $u['balance'] = $u['balance'] - $total;
                    break;
                }
            }
            unset($u);

            foreach ($userCart as $item) {
                $game = findById($games, $item['game_id']);
                $purchases[] = [
                    'id' => empty($purchases) ? 1 : max(array_column($purchases, 'id')) + 1,
                    'user_id' => $item['user_id'],
                    'game_id' => $item['game_id'],
                    'price' => $game['price'] ?? 0,
                    'purchased_at' => date('c')
                ];
            }
            $cart = array_values(array_filter($cart, fn($c) => $c['user_id'] != $data['user_id']));

            file_put_contents($usersPath, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            file_put_contents($purchasesPath, json_encode($purchases, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            file_put_contents($cartPath, json_encode($cart, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            jsonResponse(['success' => true, 'message' => 'Оплата завершена (локально)', 'total' => $total, 'user' => $user]);
            break;
        default:
            jsonError('Неизвестное действие', 400);
            break;
    }
?>