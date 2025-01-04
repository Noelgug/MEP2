<?php
header('Content-Type: application/json');

function validateInput($data) {
    $errors = [];
    
    // Validate field1
    if (!isset($data['field1']) || strlen($data['field1']) < 3 || strlen($data['field1']) > 50) {
        $errors[] = "Field 1 must be between 3 and 50 characters";
    }
    
    // Validate field2
    if (!isset($data['field2']) || !is_numeric($data['field2']) || 
        $data['field2'] < 0 || $data['field2'] > 100) {
        $errors[] = "Field 2 must be a number between 0 and 100";
    }
    
    // Validate field3
    if (!isset($data['field3']) || !strtotime($data['field3'])) {
        $errors[] = "Field 3 must be a valid date";
    }
    
    return $errors;
}

$data = array_map('trim', $_POST);
$errors = validateInput($data);

if (!empty($errors)) {
    http_response_code(400);
    echo json_encode(['errors' => $errors]);
    exit;
}

// Sanitize and process data
$result = [
    'field1' => htmlspecialchars(strtoupper($data['field1'])),
    'field2' => filter_var($data['field2'] * 2, FILTER_SANITIZE_NUMBER_FLOAT),
    'field3' => date('Y-m-d', strtotime($data['field3']))
];

echo json_encode($result);
