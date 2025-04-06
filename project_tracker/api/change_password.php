<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;
$password = $data['password'] ?? null;

if (!$user_id || !$password) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id or password']);
    exit;
}

$stmt = $pdo->prepare('UPDATE users SET password = ? WHERE id = ?');
$stmt->execute([password_hash($password, PASSWORD_DEFAULT), $user_id]);

echo json_encode(['success' => true]);
?>