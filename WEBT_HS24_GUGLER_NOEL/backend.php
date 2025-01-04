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
    
    // Validate appointment date
    if (!isset($data['appointment_date']) || !strtotime($data['appointment_date'])) {
        $errors[] = "Please provide a valid appointment date";
    } else {
        $appointmentDate = new DateTime($data['appointment_date']);
        $today = new DateTime('today');
        
        if ($appointmentDate < $today) {
            $errors[] = "Appointment date cannot be in the past";
        }
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
    $appointment_date = date('Y-m-d', strtotime($data['appointment_date']));

    // Set cookie with proper configuration
    $cookieOptions = [
        'expires' => time() + 3600, // 1 hour
        'path' => '/',
        'domain' => '',
        'secure' => true,
        'httponly' => false, // Allow JavaScript access
        'samesite' => 'Strict'
    ];

    setcookie('child_name', $name, $cookieOptions);

    // Store in database
    $stmt = $pdo->prepare("
        INSERT INTO children (name, age, appointment_date, registration_date) 
        VALUES (?, ?, ?, NOW())
    ");
    
    $stmt->execute([$name, $age, $appointment_date]);

    // Create response with cookie information
    $response = [
        'status' => 'success',
        'message' => isset($_COOKIE['child_name']) 
            ? "Welcome back, {$name}'s parents!" 
            : "Registration successful! Welcome, {$name}'s parents!",
        'user' => [
            'name' => $name,
            'isReturning' => isset($_COOKIE['child_name']),
            'cookieSet' => true
        ]
    ];

    echo json_encode($response);

} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['error' => 'Database error occurred']);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['error' => 'An unexpected error occurred']);
}
