<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json');

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    http_response_code(403);
    echo json_encode(['error' => 'Admin access required']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$username = $data['username'] ?? '';
$password = $data['password'] ?? '';
$departments = $data['departments'] ?? []; // Array of departments

if (empty($username) || empty($password)) {
    http_response_code(400);
    echo json_encode(['error' => 'Username and password are required']);
    exit;
}

$hashedPassword = password_hash($password, PASSWORD_DEFAULT);

try {
    $pdo->beginTransaction();
    
    // Insert user
    $stmt = $pdo->prepare('INSERT INTO users (username, password, is_admin) VALUES (?, ?, 0)');
    $stmt->execute([$username, $hashedPassword]);
    $userId = $pdo->lastInsertId();

    // Insert department mappings
    if (!empty($departments)) {
        $stmt = $pdo->prepare('INSERT INTO user_department_mapping (user_id, department) VALUES (?, ?)');
        foreach ($departments as $dept) {
            $stmt->execute([$userId, $dept]);
        }
    }

    $pdo->commit();
    echo json_encode(['success' => true, 'username' => $username]);
} catch (PDOException $e) {
    $pdo->rollBack();
    http_response_code(500);
    echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
}
?>