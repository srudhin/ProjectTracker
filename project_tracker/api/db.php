<?php
header('Access-Control-Allow-Origin: *'); // Allow frontend to access
header('Content-Type: application/json');

$host = 'localhost';
$dbname = 'project_tracker';
$username = 'root'; // Default WAMP MySQL user
$password = 'root123';     // Default WAMP MySQL password (empty)

try {
    $pdo = new PDO("mysql:host=$host;dbname=$dbname", $username, $password);
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database connection failed: ' . $e->getMessage()]);
    exit;
}
?>