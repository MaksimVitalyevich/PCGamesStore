<?php
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $dir = __DIR__ . "/../../MockData/";
    $pdo = checkConnectionOrFallBack(__DIR__ . "/../../MockData/LOCAL-cart.json");

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = $_POST ?: json_decode(file_get_contents("php://input"), true);
    if ($_SERVER['REQUEST_METHOD'] === 'GET') $data = $_GET;
    $cartPath = $dir . "LOCAL-cart.json";

    if (in_array($action, ['remove', 'clear']) && !$data) jsonError('Нет нужных данных', 400);

    switch ($action) {
        case 'getCart':
            requireFields($data, ['user_id']);

            if (is_array($pdo)) {
                $cart = json_decode(file_get_contents($cartPath), true);
                $games = json_decode(file_get_contents($dir . "LOCAL-games.json"), true);

                if (!$data['user_id']) jsonError('Не найден пользователь для получения корзины!', 404);

                $userCart = array_values(array_filter($cart, fn($c) => $c['user_id'] == $data['user_id']));
                $result = [];

                foreach ($userCart as &$item) {
                    $game = array_values(array_filter($games, fn($g) => $g['id'] == $item['game_id']))[0];
                    if ($game) {
                        $result[] = [
                            'id' => $item['id'],
                            'title' => $game['title'],
                            'price' => $game['price']
                        ];
                    }
                }
                $result = $cart;
                jsonResponse(['success' => true, 'cart' => $result]);
            } else {
                $stmt = safeQuery($pdo, "SELECT c.id, g.title, g.price FROM cart c JOIN games g ON c.game_id = g.id WHERE c.user_id = ?", [$data['user_id']]);
                jsonResponse(['success' => true, 'source' => 'db', 'cart' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        case 'remove':
            requireFields($data, ['id']);

            if (is_array($pdo)) {
                $cart = json_decode(file_get_contents($cartPath), true);
                $filtered = array_values(array_filter($cart, fn($c) => $c['id'] != $data['id']));

                file_put_contents($cartPath, json_encode($filtered, JSON_PRETTY_PRINT));
                jsonResponse(['success' => true, 'message' => 'Игра удалена (локально)']);
            } else {
                safeQuery($pdo, "DELETE FROM cart WHERE id = ?", [$data['id']]);
                jsonResponse(['success' => true, 'message' => 'Игра удалена из корзины']);
            }
            break;
        case 'clear':
            requireFields($data, ['user_id']);

            if (is_array($pdo)) {
                $cart = json_decode(file_get_contents($cartPath), true);
                $filtered = array_values(array_filter($cart, fn($c) => $c['user_id'] != $data['user_id']));
                
                file_put_contents($cartPath, json_encode($filtered, JSON_PRETTY_PRINT));
                jsonResponse(['success' => true, 'message' => 'Корзина очищена (локально)']);
            } else {
                $check = safeQuery($pdo, "SELECT COUNT(*) AS cnt FROM cart WHERE user_id = ?", [$data['user_id']]);
                $exists = $check->fetchColumn();

                if ($exists == 0) jsonError('Корзина уже пустая', 200);

                safeQuery($pdo, "DELETE FROM cart WHERE user_id = ?", [$data['user_id']]);
                jsonResponse(['success' => true, 'message' => 'Корзина успешно очищена']);
            }
            break;
        default:
            jsonError('Неизвестное действие', 400);
            break;
    }
?>