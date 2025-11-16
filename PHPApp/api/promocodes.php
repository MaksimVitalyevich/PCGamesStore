<?php 
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $promocodesPath = __DIR__ . "/../../MockData/LOCAL-promocodes.json";
    $usersPath = __DIR__ . "/../../MockData/LOCAL-users.json";
    $pdo = checkConnectionOrFallBack($promocodesPath);

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    $promocodes = [];
    $found = false;

    if (in_array($action, ['checkPromo', 'addPromo', 'updatePromo', 'apply', 'deactivate', 'reactivate']) && !$data) {
        jsonError('Нет нужных данных', 400);
    }

    switch ($action) {
        case 'getPromocodes':
            if (is_array($pdo)) {
                $promocodes = $pdo;
                jsonResponse(['success' => true, 'promocodes' => $promocodes]);
            } else {
                $stmt = safeQuery($pdo, "SELECT * FROM promocodes ORDER BY id DESC");
                jsonResponse(['success' => true, 'source' => 'db', 'codes' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        case 'checkPromo': // Только для сервиса Angular
            requireFields($data, ['code']);

            $code = $data['code'];

            if (is_array($pdo)) {
                $promocodes = $pdo;
                $found = array_filter($promocodes, fn($p) => $p['code'] === $code && !$p['used_by']);
                if ($found) {
                    jsonResponse(['success' => true, 'discount' => array_values($found)[0]['discount']]);
                } else {
                    jsonError('Промокод недействителен или уже использован', 409);
                }
            } else {
                $PromoStmt = safeQuery($pdo, "SELECT code, discount, is_active, expires_at, max_uses, used_count FROM promocodes WHERE code = ?)", [$code]);
                $promo = $PromoStmt->fetch();

                if (!$promo) {
                    jsonError('Промокод не найден', 404);
                }
                if (!$promo['is_active'] || ($promo['expires_at'] && strtotime($promo['expires_at']) < time())) {
                    jsonError('Данный промокод недействителен', 400);
                }
                // Проверка лимита использовании
                if ($promo['used_count'] >= $promo['max_uses']) {
                    jsonError('Лимит использовании исчерпан', 409);
                }

                jsonResponse(['success' => true, 'message' => 'Промокод действителен', 'discount' => $promo['discount'], 'reamining_usage' => $promo['max_uses'] - $promo['used_count']]);
            }
            break;
        case 'addPromo':
            requireFields($data, ['code', 'discount', 'created_at']);

            if (isset($data['data'])) $data = $data['data'];

            if (is_array($pdo)) {
                $promocodes = $pdo;

                $newId = !empty($games) ? max(array_column($promocodes, 'id')) + 1 : 1;
                $newPromoCode = array_merge(['id' => $newId], $data);

                $promocodes[] = $newPromoCode;
                file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Новый промокод добавлен!', 'promocode' => $newPromoCode]);
            } else {
                safeQuery($pdo, "INSERT INTO promocodes (code, discount, description, is_active, created_at, expires_at) VALUES (?, ?, ?, ?, ?, ?)", 
                [
                    strtoupper(trim($data['code'])),
                    $data['discount'],
                    $data['description'] ?? '',
                    $data['is_active'] ?? true,
                    $data['created_at'],
                    $data['expires_at'] ?? null
                ]);
                jsonResponse(['success' => true, 'message' => 'Промокод добавлен', 'id' => $pdo->lastInsertId()]);
            }
            break;
        case 'updatePromo':
            requireFields($data, ['code', 'discount', 'created_at']);

            if (isset($data['data'])) $data = $data['data'];

            if (is_array($pdo)) {
                $promocodes = $pdo;
                $updated = false;

                foreach ($promocodes as &$promo) {
                    if ($promo['id'] === $data['id']) {
                        $promo = array_merge($promo, $data);
                        $updated = true;
                        break;
                    }
                }

                if ($updated) {
                    file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                    jsonResponse(['success' => true, 'message' => 'Промокод успешно обновлен (локально)']);
                } else {
                    jsonError('Промокод с таким ID - Не удалось найти!', 404);
                }
            } else {
                safeQuery($pdo, "UPDATE promocodes SET code = ?, discount = ?, created_at = ?", 
                [
                    $data['code'], 
                    $data['discount'],
                    $data['description'] ?? '',
                    $data['is_active'],
                    $data['created_at'],
                    $data['expires_at'] ?? '',
                    $data['max_uses'],
                    $data['is_new_user_only'] ?? false,
                    $data['used_count']
                ]);
                jsonResponse(['success' => true, 'message' => 'промокод изменен успешно!']);
            }
            break;
        case 'apply':
            requireFields($data, ['user_id', 'code']);

            if ($pdo instanceof PDO) {
                $stmt = safeQuery($pdo, "SELECT * FROM promocodes WHERE code = ? AND is_active = 1 AND (expires_at IS NULL OR expires_at > NOW())", [$data['code']]);
                $promo = $stmt->fetch();

                if (!$promo) jsonError('Промокод не найден или неактивен', 404);

                // Если промокод - уже использован
                if (!empty($promo['used_by'])) jsonError('Промокод уже использован', 409);
                // Проверка лимита использования
                if ($promo['used_count'] >= $promo['max_uses']) jsonError('Лимит использовании исчерпан', 409);
                // Одноразовый промокод - не используется повторно
                if ($promo['max_uses'] == 1 && $promo['used_count'] >= 1) {
                    jsonError('Одноразовый промокод уже был использован', 409);
                }

                // Если новый пользователь
                if ($promo['is_new_user_only']) {
                    $user = safeQuery($pdo, "SELECT created_at FROM users WHERE id = ?", [$data['user_id']])->fetch();

                    if (!$user) jsonError('Пользователь не найден', 404);

                    $isNew = strtotime($user['created_at']) >= strtotime('-7 days');

                    if (!$isNew) jsonError('Промокод доступен только новым пользователям', 403);
                }

                // Проверка роли пользователя для использования
                $user = safeQuery($pdo, "SELECT role FROM users WHERE id = ?", [$data['user_id']])->fetch();
                if (!$user || !in_array($user['role'], ['user', 'premium'])) {
                    jsonError('Недостаточно привилегии на использование такого промокода', 403);
                }

                // Применяем скидку и помечаем промокод
                safeQuery($pdo, "UPDATE promocodes SET used_by = ?, used_count = used_count + 1, is_active = CASE WHEN used_count + 1 >= max_uses THEN 0 ELSE 1 END WHERE id = ?", [$data['user_id'], $promo['id']]);
                jsonResponse(['success' => true, 'message' => 'Применена скидка', 'discount' => $promo['discount']]);
                break;
            }
            $promocodes = $pdo;
            $promoKey = null;
            foreach ($promocodes as $key => $p) {
                if ($p['code'] === $data['code'] && ($p['is_active'] ?? 1) == 1) {
                    $promoKey = $key;
                    break;
                }
            }

            if (!$promoKey) jsonError('Промокод не найден или неактивен', 404);

            $promo = $promocodes[$promoKey];

            if (!empty($promo['used_by'])) jsonError('Промокод уже использован!', 409);

            if (($promo['used_count'] ?? 0) >= ($promo['max_uses'] ?? 1)) jsonError('Лимит использования исчерпан', 409);
            if ($promo['max_usage'] == 1 && $promo['used_count'] >= 1) {
                jsonError('Одноразовый промокод уже был использован', 409);
            }

            $users = json_decode(file_get_contents($usersPath), true);
            $user = null;
            foreach ($users as $u) {
                if ($u['id'] == $data['user_id']) {
                    $user = $u;
                    break;
                }
            }
            if (!$user || !in_array($user['role'], ['user', 'premium'])) {
                jsonError('Недостаточно привилегии на использование такого промокода', 403);
            }

            if ($promo['is_new_user_only']) {
                $user = array_filter($users, fn($u) => $u['id'] === $u['created_at']);

                if (!$user) jsonError('Пользователь не найден', 404);

                $isNew = strtotime($user['created_at']) >= strtotime('-7 days');

                if (!$isNew) jsonError('Промокод доступен только новым пользователям', 409);
            }

            $promocodes[$promoKey]['used_by'] = $data['user_id'];
            $promocodes[$promoKey]['used_count'] = ($promos[$promoKey]['used_count'] ?? 0) + 1;
            $promocodes[$promoKey]['is_active'] = ($promo[$promoKey]['used_count'] >= ($promo[$promoKey]['max_uses'] ?? 1)) ? 0 : 1;

            file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
            jsonResponse(['success' => true, 'message' => 'Промокод применен', 'discount' => $promo['discount'] ?? 0]);
            break;
        case 'reactivate':
            requireFields($data, ['code']);

            if (is_array($pdo)) {
                $promocodes = $pdo;

                foreach ($promocodes as &$promo) {
                    if ($promo['code'] === $data['code']) {
                        $found = true;

                        $isExpired = isset($promo['expires_at']) && strtotime($promo['expires_at']) < time();
                        $isUsedUp = $promo['used_count'] >= $promo['max_users'];

                        if (!$isExpired && !$isUsedUp) jsonError('Промокод еще активен или не требует переактивации', 409);

                        $promo['is_active'] = true;

                        if ($isExpired) $promo['expires_at'] = date("Y-m-d\TH:i:s\Z", strtotime("+1 year"));
                        break;
                    }
                }

                if (!$found) jsonError('Промокод не найден', 404);

                file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                jsonResponse(['success' => true, 'message' => 'Промокод переактивирован! (локально)']);
            } else {
                safeQuery($pdo, "UPDATE promocodes SET is_active = 1 WHERE code = ?", [$data['code']]);
                jsonResponse(['success' => true, 'message' => 'Промокод переактивирован!']);
            }
            break;
        case 'reset_usage':
            requireFields($data, ['code']);

            if (is_array($pdo)) {
                $promocodes = $pdo;

                foreach ($promocodes as &$promo) {
                    if ($promo['code'] === $data['code']) {
                        $found = true;

                        if ($promo['used_count'] <= 0) {
                            jsonError('Этот промокод еще не использовали - нечего сбрасывать', 409);
                        }

                        $promo['used_count'] = 0;
                        $promo['is_active'] = true;
                        break;
                    }
                }

                if (!$found) jsonError('Промокод не найден!', 404);

                file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Использование промокода сброшено (локально)']);
            } else {
                safeQuery($pdo, "UPDATE promocodes SET used_count = 0, is_active = 1 WHERE code = ?", [$data['code']]);
                jsonResponse(['success' => true, 'message' => 'Использование промокода сброшено']);
            }

            break;
        case 'deactivate':
            requireFields($data, ['code']);

            if (is_array($pdo)) {
                $promocodes = $pdo;

                foreach ($promocodes as &$promo) {
                    if ($promo['code'] === $data['code']) {
                        $promo['is_active'] = 0;
                        $found = true;
                        break;
                    }
                }

                if (!$found) jsonError('Промокод не найден', 404);

                file_put_contents($promocodesPath, json_encode($promocodes, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
                jsonResponse(['success' => true, 'message' => 'Промокод деактивирован (локально)!']);
            } else {
                safeQuery($pdo, "UPDATE promocodes SET is_active = 0 WHERE code = ?", [$data['code']]);
                jsonResponse(['success' => true, 'message' => 'Промокод деактивирован']);
            }
            break;
        default:
            jsonError('Неизвестное действие', 400);
    }
?>