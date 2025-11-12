<?php
    /** Проверка подключения PDO */
    function checkConnectionOrFallBack(string $jsonPath): PDO|array {
        if (isset($pdo)) {
            require_once(__DIR__ . "/../config/database.php");
            try {
                $pdo->query("SELECT 1");
                return $pdo;
            } catch (PDOException $pdo_e) {
                throw new PDOException('БД недоступна: ' . $pdo_e->getMessage());
            }
        }
        
        if (!file_exists($jsonPath)) {
            throw new RuntimeException("БД недоступна и локальный файл данных не найден: $jsonPath"); 
        }
        $data = json_decode(file_get_contents($jsonPath), true);
        if ($data === null) {
            throw new RuntimeException("Не удалось прочитать локальный файл данных: $jsonPath");
        }
        return $data;
    }

    /** Возвращает JSON с правильными заголовками */ 
    function jsonResponse(array $data, int $status = 200, string $action = ''): void {
        $logData = [
            'time' => date('Y-m-d H:i:s'),
            'action' => $action? : 'unknown',
            'status' => $status,
        ];
        file_put_contents("../debug/server_info.log", json_encode($logData, JSON_UNESCAPED_UNICODE));

        http_response_code($status);
        echo json_encode($data, JSON_UNESCAPED_UNICODE);
        exit;
    }

    /** Логирование ошибок JSON, в формате: HTTP-статус; действие + время */
    function jsonError(string $error, int $status, string $action = ''): void {
        $logErrorData = [
            'time' => date('Y-m-d H:i:s'),
            'action' => $action? : 'unknown',
            'status' => $status,
            'error' => $error
        ];
        file_put_contents("../debug/server_errors.log", json_encode($logErrorData, JSON_UNESCAPED_UNICODE));

        http_response_code($status);
        echo json_encode(['success' => false, 'error' => $error], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
        exit;
    }

    /** Проверка обязательных полей JSON */
    function requireFields(array $data, array $fields): void {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || $data[$field] === '') {
                jsonResponse(['success' => false, 'error' => "Отсутствует поле: $field"], 404);
            }
        }
    }

    /** Безопасный тип запросов PDO */
    function safeQuery(PDO $pdo, string $query, array $params = []) {
        try {
            $stmt = $pdo->prepare($query);
            $stmt->execute($params);
            return $stmt;
        } catch (PDOException $pdo_e) {
            jsonResponse(['success' => false, 'error' => 'Некорректный запрос: ' . $pdo_e->getMessage()], 500);
        }
    }

    /** Соотношение текущей роли пользователя с исходным балансом */
    function getDefaultBalance(string $role): int {
        return match ($role) {
            'premium' => 10000,
            'moderator' => 50000,
            default => 5000
        };
    }
?>