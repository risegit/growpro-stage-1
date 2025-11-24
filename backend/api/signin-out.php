<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['id'] ?? null;
$emailId = $_GET['email'] ?? null;

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        $sql1 = "SELECT * FROM users WHERE role!='customer' ORDER BY id DESC";
        $result = $conn->query($sql1);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        echo json_encode([
            "status" => "success",
            "data" => $userId ? ($data[0] ?? null) : $data
        ]);
        break;
    
    case 'POST':  
        $name = $_POST['username'] ?? '';
        $password = $_POST['password'] ?? '';

        // Step 1: Check if user exists
        $stmt = $conn->prepare("SELECT id, user_code, name, role, status, password FROM users WHERE user_code = ? AND status = 'active' LIMIT 1");
        $stmt->bind_param("s", $name);
        $stmt->execute();
        $result = $stmt->get_result();

        if ($result->num_rows == 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid username or password"
            ]);
            break;
        }

        $user = $result->fetch_assoc();

        // Step 2: Verify password
        if (!password_verify($password, $user['password'])) {
            echo json_encode([
                "status" => "error",
                "message" => "Invalid username or password"
            ]);
            break;
        }

        // ----------------------------------
        // ✔ Remove sensitive details
        // ----------------------------------
        unset($user['password']);

        // ----------------------------------
        // ✔ Create token (recommended)
        // ----------------------------------
        $token = bin2hex(random_bytes(16));

        // Save token in DB (optional)
        $sql = "UPDATE users SET token='$token' WHERE id={$user['id']}";
        $conn->query($sql);

        echo json_encode([
            "status" => "success",
            "data" => $user,
            "token" => $token
        ]);
        break;


    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>