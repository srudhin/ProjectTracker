<?php
session_start();
require_once 'db.php'; // Move up one directory if db.php is in root

header('Content-Type: application/json');

if (isset($_SESSION['user_id'])) {
    try {
        $stmt = $pdo->prepare('SELECT department FROM user_department_mapping WHERE user_id = ?');
        $stmt->execute([$_SESSION['user_id']]);
        $departments = $stmt->fetchAll(PDO::FETCH_COLUMN);

        echo json_encode([
            'success' => true,
            'username' => $_SESSION['username'],
            'is_admin' => $_SESSION['is_admin'],
            'departments' => $departments
        ]);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['error' => 'Database error: ' . $e->getMessage()]);
        exit;
    }
} else {
    http_response_code(401);
    echo json_encode(['error' => 'Not logged in']);
    exit;
}
?>