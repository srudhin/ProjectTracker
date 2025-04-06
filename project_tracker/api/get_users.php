<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id']) || !$_SESSION['is_admin']) {
    echo json_encode(['success' => false, 'error' => 'Unauthorized']);
    exit;
}

$stmt = $pdo->query('SELECT id, username FROM users');
$users = $stmt->fetchAll(PDO::FETCH_ASSOC);

echo json_encode($users);
?>