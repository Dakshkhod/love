<?php
// Simple authentication (you should use proper authentication in production)
$adminPassword = 'lovecalculator2024'; // Change this to a secure password

if (isset($_POST['password']) && $_POST['password'] === $adminPassword) {
    $authenticated = true;
} elseif (isset($_SESSION['admin_authenticated']) && $_SESSION['admin_authenticated']) {
    $authenticated = true;
} else {
    $authenticated = false;
}

if ($authenticated) {
    session_start();
    $_SESSION['admin_authenticated'] = true;
}

$dataFile = 'submissions.json';
$submissions = [];

if (file_exists($dataFile)) {
    $submissions = json_decode(file_get_contents($dataFile), true) ?: [];
}

// Calculate statistics
$totalSubmissions = count($submissions);
$todaySubmissions = 0;
$totalPercentage = 0;

$today = date('Y-m-d');
foreach ($submissions as $sub) {
    if (date('Y-m-d', strtotime($sub['timestamp'])) === $today) {
        $todaySubmissions++;
    }
    $totalPercentage += $sub['percentage'];
}

$averagePercentage = $totalSubmissions > 0 ? round($totalPercentage / $totalSubmissions) : 0;

// Handle export
if (isset($_GET['export']) && $authenticated) {
    header('Content-Type: text/csv');
    header('Content-Disposition: attachment; filename="love-calculator-data-' . date('Y-m-d') . '.csv"');
    
    echo "Name 1,Name 2,Percentage,Timestamp,User Agent,IP\n";
    foreach ($submissions as $sub) {
        echo '"' . str_replace('"', '""', $sub['name1']) . '",';
        echo '"' . str_replace('"', '""', $sub['name2']) . '",';
        echo $sub['percentage'] . ',';
        echo '"' . $sub['timestamp'] . '",';
        echo '"' . str_replace('"', '""', $sub['userAgent']) . '",';
        echo '"' . ($sub['ip'] ?? 'Unknown') . '"' . "\n";
    }
    exit;
}

// Handle clear data
if (isset($_POST['clear_data']) && $authenticated) {
    file_put_contents($dataFile, '[]');
    $submissions = [];
    $totalSubmissions = 0;
    $todaySubmissions = 0;
    $averagePercentage = 0;
}
?>

<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Love Calculator Admin Panel</title>
    <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css">
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        
        .admin-container {
            max-width: 1200px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
            overflow: hidden;
        }
        
        .admin-header {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            padding: 30px;
            text-align: center;
        }
        
        .admin-header h1 {
            font-size: 2.5rem;
            margin-bottom: 10px;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            padding: 30px;
            background: #f8f9fa;
        }
        
        .stat-card {
            background: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .stat-card h3 {
            color: #666;
            font-size: 0.9rem;
            margin-bottom: 10px;
        }
        
        .stat-card .number {
            font-size: 2.5rem;
            font-weight: 700;
            color: #667eea;
        }
        
        .admin-content {
            padding: 30px;
        }
        
        .admin-actions {
            margin-bottom: 30px;
            display: flex;
            gap: 15px;
            flex-wrap: wrap;
        }
        
        .btn {
            padding: 12px 25px;
            border: none;
            border-radius: 25px;
            font-size: 1rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
            text-decoration: none;
            display: inline-flex;
            align-items: center;
            gap: 8px;
        }
        
        .btn-primary {
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
        }
        
        .btn-danger {
            background: linear-gradient(135deg, #e91e63, #ff6b9d);
            color: white;
        }
        
        .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
        }
        
        .submissions-table {
            background: white;
            border-radius: 15px;
            overflow: hidden;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }
        
        .table-header {
            background: #667eea;
            color: white;
            padding: 20px;
            font-weight: 600;
            display: grid;
            grid-template-columns: 1fr 1fr 80px 150px 100px;
            gap: 15px;
        }
        
        .submission-row {
            display: grid;
            grid-template-columns: 1fr 1fr 80px 150px 100px;
            gap: 15px;
            padding: 15px 20px;
            border-bottom: 1px solid #f0f0f0;
            align-items: center;
        }
        
        .submission-row:hover {
            background: #f8f9fa;
        }
        
        .submission-row:last-child {
            border-bottom: none;
        }
        
        .percentage {
            font-weight: 600;
            color: #e91e63;
        }
        
        .timestamp {
            font-size: 0.8rem;
            color: #666;
        }
        
        .login-form {
            max-width: 400px;
            margin: 100px auto;
            background: white;
            padding: 40px;
            border-radius: 20px;
            box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
        }
        
        .login-form h2 {
            text-align: center;
            margin-bottom: 30px;
            color: #333;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #333;
            font-weight: 500;
        }
        
        .form-group input {
            width: 100%;
            padding: 12px;
            border: 2px solid #e1e5e9;
            border-radius: 8px;
            font-size: 1rem;
            font-family: 'Poppins', sans-serif;
        }
        
        .form-group input:focus {
            outline: none;
            border-color: #667eea;
        }
        
        .login-btn {
            width: 100%;
            padding: 12px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            color: white;
            border: none;
            border-radius: 8px;
            font-size: 1rem;
            font-weight: 600;
            cursor: pointer;
        }
        
        @media (max-width: 768px) {
            .table-header, .submission-row {
                grid-template-columns: 1fr;
                text-align: center;
            }
            
            .admin-actions {
                flex-direction: column;
            }
        }
    </style>
</head>
<body>
    <?php if (!$authenticated): ?>
        <div class="login-form">
            <h2><i class="fas fa-user-shield"></i> Admin Login</h2>
            <form method="POST">
                <div class="form-group">
                    <label for="password">Password</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="login-btn">Login</button>
            </form>
        </div>
    <?php else: ?>
        <div class="admin-container">
            <div class="admin-header">
                <h1><i class="fas fa-chart-line"></i> Love Calculator Analytics</h1>
                <p>Track all user submissions from any device</p>
            </div>
            
            <div class="stats-grid">
                <div class="stat-card">
                    <h3>Total Submissions</h3>
                    <div class="number"><?php echo $totalSubmissions; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Today's Submissions</h3>
                    <div class="number"><?php echo $todaySubmissions; ?></div>
                </div>
                <div class="stat-card">
                    <h3>Average Love %</h3>
                    <div class="number"><?php echo $averagePercentage; ?>%</div>
                </div>
                <div class="stat-card">
                    <h3>Data File Size</h3>
                    <div class="number"><?php echo file_exists($dataFile) ? round(filesize($dataFile) / 1024, 1) . 'KB' : '0KB'; ?></div>
                </div>
            </div>
            
            <div class="admin-content">
                <div class="admin-actions">
                    <a href="?export=1" class="btn btn-primary">
                        <i class="fas fa-download"></i> Export CSV
                    </a>
                    <form method="POST" style="display: inline;" onsubmit="return confirm('Are you sure you want to clear all data? This cannot be undone.')">
                        <button type="submit" name="clear_data" class="btn btn-danger">
                            <i class="fas fa-trash"></i> Clear All Data
                        </button>
                    </form>
                    <a href="index.html" class="btn btn-primary">
                        <i class="fas fa-home"></i> Back to Calculator
                    </a>
                </div>
                
                <div class="submissions-table">
                    <div class="table-header">
                        <div>Name 1</div>
                        <div>Name 2</div>
                        <div>%</div>
                        <div>Time</div>
                        <div>IP</div>
                    </div>
                    
                    <?php if (empty($submissions)): ?>
                        <div style="text-align: center; padding: 40px; color: #666;">
                            No submissions yet
                        </div>
                    <?php else: ?>
                        <?php foreach (array_slice(array_reverse($submissions), 0, 50) as $sub): ?>
                            <div class="submission-row">
                                <div><?php echo htmlspecialchars($sub['name1']); ?></div>
                                <div><?php echo htmlspecialchars($sub['name2']); ?></div>
                                <div class="percentage"><?php echo $sub['percentage']; ?>%</div>
                                <div class="timestamp"><?php echo date('M j, Y g:i A', strtotime($sub['timestamp'])); ?></div>
                                <div><?php echo htmlspecialchars($sub['ip'] ?? 'Unknown'); ?></div>
                            </div>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </div>
            </div>
        </div>
    <?php endif; ?>
</body>
</html> 