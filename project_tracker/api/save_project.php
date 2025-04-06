<?php
session_start();
require_once 'db.php';

header('Content-Type: application/json'); // Ensure JSON response

if (!isset($_SESSION['user_id'])) {
    http_response_code(401);
    echo json_encode(['success' => false, 'error' => 'Login required']);
    exit;
}

$data = json_decode(file_get_contents('php://input'), true);
if (!$data || !is_array($data)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Invalid or missing data']);
    exit;
}

$id = isset($data['id']) ? $data['id'] : null;
$department = $data['Department'] ?? '';

if (!$id && empty($department)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Department required for new projects']);
    exit;
}

// Permission check for both new and existing projects
if (!$_SESSION['is_admin']) {
    $checkDept = $department;
    if ($id) {
        // For updates, check the existing project's department
        $stmt = $pdo->prepare('SELECT department FROM projects WHERE id = ?');
        $stmt->execute([$id]);
        $existingDept = $stmt->fetchColumn();
        if ($existingDept === false) {
            http_response_code(404);
            echo json_encode(['success' => false, 'error' => 'Project not found']);
            exit;
        }
        $checkDept = $existingDept; // Use original department for permission check
    }

    $stmt = $pdo->prepare('SELECT COUNT(*) FROM user_department_mapping WHERE user_id = ? AND department = ?');
    $stmt->execute([$_SESSION['user_id'], $checkDept]);
    if ($stmt->fetchColumn() == 0) {
        http_response_code(403);
        echo json_encode(['success' => false, 'error' => "No permission to edit or add projects in the '$checkDept' department"]);
        exit;
    }
}

$fields = [
    'department' => $department,
    'project_title' => $data['Project Title'] ?? '',
    'description' => $data['Description'] ?? '',
    'focal_in_charge' => $data['Focal In-Charge'] ?? '',
    'vendor_name' => $data['Vendor Name'] ?? '',
    'wo_issuance_date' => $data['WO Issuance Date'] ?? null,
    'status' => $data['Status'] ?? '',
    'timeline' => $data['Timeline'] ?? '',
    'revised_timeline' => $data['Revised Timeline'] ?? '',
    'dependencies_risks' => $data['Dependencies/Risks'] ?? '',
    'key_deliverables' => $data['Key Deliverables'] ?? '',
    'milestones_achieved' => $data['Milestones Achieved'] ?? '',
    'budget' => floatval($data['Budget'] ?? 0),
    'po_value' => floatval($data['PO Value'] ?? 0),
    'budget_utilization' => floatval($data['Budget Utilization (%)'] ?? 0),
    'ytd_utilization' => floatval($data['YTD Utilization'] ?? 0),
    'projected_next_qtr_utilization' => floatval($data['Projected Next Qtr Utilization'] ?? 0),
    'balance' => floatval($data['Balance'] ?? 0),
    'total_yep' => floatval($data['Total YEP'] ?? 0),
    'remarks' => $data['Remarks'] ?? ''
];

$required = ['department', 'project_title', 'focal_in_charge', 'status'];
$missing = array_filter($required, fn($key) => empty($fields[$key]));
if (!empty($missing)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'error' => 'Missing required fields: ' . implode(', ', $missing)]);
    exit;
}

try {
    if ($id) {
        $sql = 'UPDATE projects SET ' . implode(', ', array_map(fn($k) => "$k = :$k", array_keys($fields))) . ' WHERE id = :id';
        $fields['id'] = $id;
    } else {
        $sql = 'INSERT INTO projects (' . implode(', ', array_keys($fields)) . ') VALUES (:' . implode(', :', array_keys($fields)) . ')';
    }

    $stmt = $pdo->prepare($sql);
    $stmt->execute($fields);
    $newId = $id ?: $pdo->lastInsertId();
    echo json_encode(['success' => true, 'id' => $newId]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'error' => 'Database error: ' . $e->getMessage()]);
    exit;
}
?>