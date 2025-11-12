<?php 
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $dir = __DIR__ . "/../../MockData/";
    $pdo = checkConnectionOrFallBack(__DIR__ . "/../../MockData/LOCAL-purchases.json");

    $action = $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    
    if (in_array($action, ['pay']) && !$data) {
        jsonError('Нет нужных данных', 400);
    }

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

                if (!$user || !$game) {
                    jsonError('Пользователь ИЛИ игра не найдены', 404);
                    break;
                }

                $gameStmt = safeQuery($pdo, "SELECT * FROM games WHERE id = ?", [$data['game_id']]);
                $game = $gameStmt->fetch();

                $price = $game['price'];
                $discountApplied = false;

                // Если имеется промокод
                if (!empty($data['code'])) {
                    $promoStmt = safeQuery($pdo, "SELECT * FROM promocodes Where code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())", [$data['code']]);
                    $promo = $promoStmt->fetch();

                    if ($promo) {
                        // Проверка лимита
                        if ($promo['used_count'] < $promo['max_uses']) {
                            // Проверка роли
                            if (in_array($user['role'], ['user', 'premium'])) {
                                $discount = $price * ($promo['discount'] / 100);
                                $price -=$discount;
                                $discountApplied = true;

                                // Покупаем с примененой скидкой
                                safeQuery($pdo, "UPDATE promocodes SET used_by = ?, used_count = used_count + 1, is_active = CASE WHEN used_count + 1 >= max_uses THEN 0 ELSE 1 END WHERE id = ?", [$user['id'], $promo['id']]);
                            }
                        }
                    }
                }

                $cartStmt = safeQuery($pdo, "SELECT c.game_id, g.price FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = ?", [$data['user_id']]);

                $cart = $cartStmt->fetchAll(PDO::FETCH_ASSOC);
                $total = array_sum(array_column($cart, 'price'));

                if ($user['balance'] < $total) {
                    jsonError('Недостаточно средств', 402);
                    break;
                }

                // Списание средств
                safeQuery($pdo, "UPDATE users SET balance = balance - ? WHERE id = ?", [$total, $data['user_id']]);
                // Записываем покупку (со всей корзины)
                foreach ($cart as $item) {
                    safeQuery($pdo, "INSERT INTO purchases (user_id, game_id) VALUES (?, ?)", [$user['id'], $item['game_id']]);
                }
                // Очистка корзины
                safeQuery($pdo, "DELETE FROM cart WHERE user_id = ?", [$data['user_id']]);
                jsonResponse(['success' => true, 'message' => 'Оплата успешно завершена', 'total' => $total, 'purchased' => $cart]);
                break;
            }

            $cartPath = $dir . "LOCAL-cart.json";
            $purchasesPath = $dir . "LOCAL-purchases.json";

            $users = json_decode(file_get_contents($dir . "LOCAL-users.json"), true);
            $games = json_decode(file_get_contents($dir . "LOCAL-games.json"), true);
            $cart = json_decode(file_get_contents($cartPath), true);

            $user = findById($users, $data['user_id']);
            if (!$user) {
                jsonError('Пользователь не найден', 404);
                break;
            }

            $userCart = array_values(array_filter($cart, fn($c) => $c['user_id'] == $data['user_id']));
            if (empty($userCart)) {
                jsonError('Корзина пуста', 400);
                break;
            }

            $total = 0;
            foreach ($userCart as $item) {
                $game = findById($games, $item['game_id']);
                if ($game) $total += $game['price'];
            }

            if ($user['balance'] < $total) {
                jsonError('Недостаточно средств', 402);
                break;
            }

            foreach ($users as &$u) {
                if ($u['id'] == $user['id']) {
                    $u['balance'] -= $total;
                    break;
                }
            }
            unset($u);
            file_put_contents($dir . "LOCAL-users.json", json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            $purchases = json_decode(file_get_contents($purchasesPath), true);
            foreach ($userCart as $item) {
                $purchases[] = [
                    'user_id' => $item['user_id'],
                    'game_id' => $item['game_id'],
                    'price' => findById($games, $item['game_id'])['price'] ?? 0
                ];
            }
            file_put_contents($purchasesPath, json_encode($purchases, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            $cart = array_values(array_filter($cart, fn($c) => $c['user_id'] != $data['user_id']));
            file_put_contents($cartPath, json_encode($cart, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

            jsonResponse(['success' => true, 'message' => 'Оплата завершена (локально)', 'total' => $total]);
            break;
        default:
            jsonError('Неизвестное действие', 400);
            break;
    }
?>