<?php
require_once 'db.php';

$stmt = $pdo->query('SELECT * FROM projects');
$projects = $stmt->fetchAll(PDO::FETCH_ASSOC);

// Map DB fields to frontend keys
$result = array_map(function($project) {
    return [
        'id' => $project['id'],
        'Department' => $project['department'],
        'Project Title' => $project['project_title'],
        'Description' => $project['description'],
        'Focal In-Charge' => $project['focal_in_charge'],
        'Vendor Name' => $project['vendor_name'],
        'WO Issuance Date' => $project['wo_issuance_date'],
        'Status' => $project['status'],
        'Timeline' => $project['timeline'],
        'Revised Timeline' => $project['revised_timeline'],
        'Dependencies/Risks' => $project['dependencies_risks'],
        'Key Deliverables' => $project['key_deliverables'],
        'Milestones Achieved' => $project['milestones_achieved'],
        'Budget' => floatval($project['budget']),
        'PO Value' => floatval($project['po_value']),
        'Budget Utilization (%)' => floatval($project['budget_utilization']),
        'YTD Utilization' => floatval($project['ytd_utilization']),
        'Projected Next Qtr Utilization' => floatval($project['projected_next_qtr_utilization']),
        'Balance' => floatval($project['balance']),
        'Total YEP' => floatval($project['total_yep']),
        'Remarks' => $project['remarks']
    ];
}, $projects);

echo json_encode($result);
?>