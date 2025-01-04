<?php
header('Content-Type: application/json');

// Database configuration
$db_config = [
    'host' => 'localhost',
    'dbname' => 'childcare_db',
    'username' => 'root',
    'password' => ''
];

function validateInput($data) {
    $errors = [];
    
    // Validate name
    if (!isset($data['name']) || strlen($data['name']) < 3 || strlen($data['name']) > 50) {
        $errors[] = "Name must be between 3 and 50 characters";
    }
    
    // Validate age
    if (!isset($data['age']) || !is_numeric($data['age']) || 
        $data['age'] < 0 || $data['age'] > 12) {
        $errors[] = "Age must be between 0 and 12 years";
    }
    
    // Validate birth date
    if (!isset($data['birth_date']) || !strtotime($data['birth_date'])) {
        $errors[] = "Please provide a valid birth date";
    }
    
    return $errors;
}

try {
    // Connect to database
    $pdo = new PDO(
        "mysql:host={$db_config['host']};dbname={$db_config['dbname']};charset=utf8",
        $db_config['username'],
        $db_config['password'],
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]
    );

    // Sanitize and validate input
    $data = array_map('trim', $_POST);
    $errors = validateInput($data);

    if (!empty($errors)) {
        http_response_code(400);
        echo json_encode(['errors' => $errors]);
        exit;
    }

    // Sanitize data
    $name = filter_var($data['name'], FILTER_SANITIZE_STRING);
    $age = filter_var($data['age'], FILTER_SANITIZE_NUMBER_INT);
    $birth_date = date('Y-m-d', strtotime($data['birth_date']));

    // Set cookie
    setcookie('username', $name, time() + 3600, '/');

    // Store in database
    $stmt = $pdo->prepare("
        INSERT INTO children (name, age, birth_date, registration_date) 
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->execute([$name, $age, $birth_date]);

    // Success response
    echo json_encode([
        'message' => "Registration successful! Welcome, $name!",
        'user' => [
            'name' => $name,
            'cookie' => $_COOKIE['username'] ?? null
        ]
    ]);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An unexpected error occurred']);
}
