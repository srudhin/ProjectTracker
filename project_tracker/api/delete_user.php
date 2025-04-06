<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$user_id = $data['user_id'] ?? null;

if (!$user_id) {
    echo json_encode(['success' => false, 'error' => 'Missing user_id']);
    exit;
}

$stmt = $pdo->prepare('DELETE FROM users WHERE id = ?');
$stmt->execute([$user_id]);

echo json_encode(['success' => true]);
?>