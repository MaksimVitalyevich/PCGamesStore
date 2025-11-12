<?php
    require_once(__DIR__ . "/../config/corsoptions.php");
    require_once(__DIR__ . "/../utils/helpers.php");

    $usersPath = __DIR__ . "/../../MockData/LOCAL-users.json";
    $pdo = checkConnectionOrFallBack($usersPath);

    $action = $_GET['action'] ?? $_POST['action'] ?? '';
    $data = json_decode(file_get_contents("php://input"), true);
    $users = [];

    if (in_array($action, ['login', 'register']) && !$data) {
        jsonError('Нет нужных данных', 400);
    }

    switch ($action) {
        case 'getUsers':
            if (is_array($pdo)) {
                $users = $pdo;
                jsonResponse(['success' => true, 'users' => $users]);
            } else {
                $stmt = safeQuery($pdo, "SELECT * FROM users ORDER BY id DESC");
                jsonResponse(['success' => true, 'source' => 'db', 'users' => $stmt->fetchAll(PDO::FETCH_ASSOC)]);
            }
            break;
        case 'register':
            requireFields($data, ['username', 'password', 'email', 'phone']);

            $role = strtolower(trim($data['role'] ?? 'user'));
            $balance = getDefaultBalance($role);

            if (is_array($pdo)) {
                $users = $pdo;

                $newId = empty($users) ? 1 : max(array_column($users, 'id')) + 1;
                $newUser = [
                    'id' => $newId,
                    'username' => $data['username'],
                    'password' => password_hash($data['password'], PASSWORD_BCRYPT),
                    'email' => $data['email'],
                    'phone' => $data['phone'],
                    'role' => $role,
                    'balance' => $balance
                ];
                $users[] = $newUser;
                file_put_contents($usersPath, json_encode($users, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));

                jsonResponse(['success' => true, 'message' => 'Пользователь добавлен (локально)', 'user' => $newUser]);
            } else {
                safeQuery($pdo, "INSERT INTO users (username, password, email, phone, balance, role) VALUES (?, ?, ?, ?, ?, ?)", 
                [
                    $data['username'],
                    password_hash($data['password'], PASSWORD_BCRYPT),
                    $data['email'],
                    $data['phone'],
                    $data['balance'],
                    $role,
                    $balance
                ]);
                jsonResponse(['success' => true, 'message' => 'Пользователь добавлен', 'id' => $pdo->lastInsertId()]);
            }
            
            break;
        case 'login':
            requireFields($data, ['username', 'password']);

            if (is_array($pdo)) {
                $users = $pdo;
                $user = null;

                foreach($users as $u) {
                    if ($u['username'] === $data['username'] && $u['password'] === $data['password']) {
                        if (!isset($u['role']) || empty($u['role'])) {
                            $u['role'] = 'user';
                        }
                        if (!isset($u['balance']) || !is_numeric($u['balance'])) {
                            $u['balance'] = getDefaultBalance($u['role']);
                        }
                        $users = $u;
                        break;
                    }
                }

                if ($user) {
                    jsonResponse(['success' => true, 'message' => 'Успешный вход выполнен!', 'user' => $user]);
                } else {
                    jsonError('Неверное имя пользователя или пароль', 401);
                }

            } else {
                safeQuery($pdo, "SELECT * FROM users WHERE username = ?", [$data['username']]);
                $user = $stmt->fetch();
                
                // Проверка соответствия паролей
                if ($user && password_verify($data['password'], $user['password'])) {
                    jsonResponse(['success' => true, 'message' => 'Пользователь вошел как: ' . $user['role'], 'user' => $user]);
                } else {
                    jsonError('Пользователь не найден', 404);
                }
            }
            break;
        default: 
            jsonError('Неизвестное действие', 400);
            break;
    }
?>