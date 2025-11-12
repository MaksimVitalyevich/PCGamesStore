<?php 
    require_once("./utils/helpers.php");

    $pdo = checkConnectionOrFallBack("../../MockData/LOCAL-promocodes.json");

    $action = $_GET['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    file_put_contents('debug.txt', file_get_contents("php://input"));

    switch ($action) {
        case 'getPromocodes':
            $stmt = safeQuery($pdo, "SELECT * FROM promocodes ORDER BY id DESC");
            jsonResponse(['success' => true, 'source' => 'db', 'codes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            break;
        case 'check': // Только для сервиса Angular
            requireFields($data, ['code']);
            $PromoStmt = safeQuery($pdo, "SELECT code, discount, is_active, expires_at, max_uses, used_count FROM promocodes WHERE code = ?)", [$data['code']]);
            $promo = $PromoStmt->fetch();

            if (!$promo) {
                jsonResponse(['success' => false, 'error' => 'Промокод не найден'], 404);
            }
            if (!$promo['is_active'] || ($promo['expires_at'] && strtotime($promo['expires_at']) < time())) {
                jsonResponse(['success' => false, 'error' => 'Данный промокод недействителен'], 400);
            }
            // Проверка лимита использовании
            if ($promo['used_count'] >= $promo['max_uses']) {
                jsonResponse(['success' => false, 'error' => 'Лимит использовании исчерпан'], 409);
            }

            jsonResponse(['success' => true, 'message' => 'Промокод действителен', 'discount' => $promo['discount'], 'reamining_usage' => $promo['max_uses'] - $promo['used_count']]);
            break;
        case 'add':
            requireFields($data, ['code', 'discount', 'created_at']);
            safeQuery($pdo, "INSERT INTO promocodes (code, discount, description, is_active, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)", 
            [
                strtoupper(trim($data['code'])),
                (int)$data['discount'],
                $data['description'] ?? '',
                $data['is_active'] ?? true,
                $data['created_at'],
                $data['expires_at'] ?? null
            ]);
            jsonResponse(['success' => true, 'message' => 'Промокод добавлен', 'id' => $pdo->lastInsertId()]);
            break;
        case 'apply':
            requireFields($data, ['user_id', 'code']);
            $stmt = safeQuery($pdo, "SELECT * FROM promocodes WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())", [$data['code']]);
            $promo = $stmt->fetch();

            if (!$promo) {
                jsonResponse(['success' => false, 'error' => 'Промокод не найден или неактивен', 404]);
                break;
            }
            // Если промокод - уже использован
            if (!empty($promo['used_by'])) {
                jsonResponse(['success' => false, 'error' => 'Промокод уже использован'], 409);
                break;
            }
            // Проверка лимита использования
            if ($promo['used_count'] >= $promo['max_uses']) {
                jsonResponse(['success' => false, 'error' => 'Лимит использовании исчерпан'], 409);
            }

            // Проверка роли пользователя для использования
            $user = safeQuery($pdo, "SELECT role FROM users WHERE id = ?", [$data['user_id']])->fetch();
            if (!$user || !in_array($user['role'], ['user', 'premium'])) {
                jsonResponse(['success' => false, 'error' => 'Недостаточно привилегии на использование такого промокода'], 403);
                break;
            }

            // Применяем скидку и помечаем промокод
            safeQuery($pdo, "UPDATE promocodes SET used_by = ?, used_count = used_count + 1, is_active = CASE WHEN used_count + 1 >= max_uses THEN 0 ELSE 1 END WHERE id = ?", [$data['user_id'], $promo['id']]);
            jsonResponse(['success' => true, 'message' => 'Применена скидка', 'discount' => $promo['discount']]);
            break;
        case 'deactivate':
            requireFields($data, ['code']);
            safeQuery($pdo, "UPDATE promocodes SET is_active = 0 WHERE code = ?", [$data['code']]);
            jsonResponse(['success' => true, 'message' => 'Промокод деактивирован']);
            break;
        default:
            jsonResponse(['success' => false, 'error' => 'Неизвестное действие'], 400);
    }
?>