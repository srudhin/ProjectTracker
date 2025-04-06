<?php
session_start();
require_once 'db.php';

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['error' => 'Login required']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
$id = $data['id'] ?? null;

if (!$id) {
    http_response_code(400);
    echo json_encode(['error' => 'Project ID required']);
    exit;
}

// Get project department
$stmt = $pdo->prepare('SELECT department FROM projects WHERE id = ?');
$stmt->execute([$id]);
$department = $stmt->fetchColumn();

if (!$department) {
    http_response_code(404);
    echo json_encode(['error' => 'Project not found']);
    exit;
}

// Check delete permission
if (!$_SESSION['is_admin']) {
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_department_mapping WHERE user_id = ? AND department = ?');
    $stmt->execute([$_SESSION['user_id'], $department]);
    if ($stmt->fetchColumn() == 0) {
        http_response_code(403);
        echo json_encode(['error' => 'No permission to delete this department']);
        exit;
    }
}

$stmt = $pdo->prepare('DELETE FROM projects WHERE id = ?');
$stmt->execute([$id]);

echo json_encode(['success' => true]);
?>