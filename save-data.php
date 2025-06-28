<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');

// Handle preflight requests
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit(0);
}

// Only allow POST requests
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'Method not allowed']);
    exit;
}

try {
    // Get the raw POST data
    $input = file_get_contents('php://input');
    $data = json_decode($input, true);
    
    // If JSON parsing failed, try form data
    if (!$data) {
        $data = $_POST;
    }
    
    // Validate required fields
    if (empty($data['name1']) || empty($data['name2']) || !isset($data['percentage'])) {
        throw new Exception('Missing required fields');
    }
    
    // Sanitize the data
    $submission = [
        'name1' => htmlspecialchars(trim($data['name1'])),
        'name2' => htmlspecialchars(trim($data['name2'])),
        'percentage' => intval($data['percentage']),
        'timestamp' => $data['timestamp'] ?? date('c'),
        'userAgent' => $data['userAgent'] ?? $_SERVER['HTTP_USER_AGENT'] ?? 'Unknown',
        'ip' => $_SERVER['REMOTE_ADDR'] ?? 'Unknown'
    ];
    
    // Validate percentage range
    if ($submission['percentage'] < 0 || $submission['percentage'] > 100) {
        throw new Exception('Invalid percentage value');
    }
    
    // Load existing data
    $dataFile = 'submissions.json';
    $submissions = [];
    
    if (file_exists($dataFile)) {
        $existingData = file_get_contents($dataFile);
        $submissions = json_decode($existingData, true) ?: [];
    }
    
    // Add new submission
    $submissions[] = $submission;
    
    // Keep only last 1000 submissions to prevent file from getting too large
    if (count($submissions) > 1000) {
        $submissions = array_slice($submissions, -1000);
    }
    
    // Save back to file
    $result = file_put_contents($dataFile, json_encode($submissions, JSON_PRETTY_PRINT));
    
    if ($result === false) {
        throw new Exception('Failed to save data');
    }
    
    // Return success response
    echo json_encode([
        'success' => true,
        'message' => 'Data saved successfully',
        'total_submissions' => count($submissions)
    ]);
    
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode([
        'error' => $e->getMessage()
    ]);
}
?> 