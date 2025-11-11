<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['id'] ?? null;
$emailId = $_GET['email'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        if ($userId) {
            $userResult = $conn->query("SELECT * FROM users INNER JOIN customers_details ON users.id=customers_details.user_id where users.role='customer' and users.id='$userId'");
            $data = [];
            while ($row = $userResult->fetch_assoc()) {
                $data[] = $row;
            }
            $growerResult = $conn->query("SELECT * FROM users INNER JOIN growers ON users.id=growers.customer_id where growers.customer_id=$userId");
            $growerData = [];
            while ($row1 = $growerResult->fetch_assoc()) {
                $growerData[] = $row1;
            }
            $customerPlantQuery = "SELECT * FROM plants INNER JOIN (SELECT customer_plants.*, growers.system_type, growers.no_of_plants, growers.no_of_levels, growers.setup_dimension, growers.motor_used, growers.timer_used, growers.no_of_lights, growers.model_of_lights, growers.length_of_lights, growers.tank_capacity, growers.nutrition_given, growers.other_specifications, growers.installation_photo_url, growers.status FROM customer_plants INNER JOIN growers ON growers.customer_id = customer_plants.customer_id WHERE growers.customer_id = $userId GROUP BY customer_plants.plant_id) AS cust_plant ON plants.id = cust_plant.plant_id";

            $customerPlantResult = $conn->query($customerPlantQuery);
            $customerPlantData = [];
            while ($row2 = $customerPlantResult->fetch_assoc()) {
                $customerPlantData[] = $row2;
            }
            echo json_encode(["status" => "success", "data" => $data, "grower" => $growerData, "customer_plant" => $customerPlantData]);
        }elseif ($emailId) {
            $userResult = $conn->query("SELECT * FROM users where email='$emailId'");
            if ($userResult && $userResult->num_rows > 0) {
                echo json_encode(["status" => "error", "message" => 'An account with this email already exists']);
            }else{
                echo json_encode(["status" => "success", "message" => 'An account with this email not exists']);
            }
            
        }else{
            $result = $conn->query("SELECT * FROM users where role='customer' ORDER BY id DESC");
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success", "data" => $data]);
        }
        
    break; 

    case 'POST':
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $role = $_POST['role'] ?? '';
        $password = $_POST['password'] ?? '';
        $aadharno = $_POST['aadhaarNo'] ?? '';
        $bankName = $_POST['bankName'] ?? '';
        $accountNumber = $_POST['accountNumber'] ?? '';
        $ifscNo = $_POST['ifscNo'] ?? '';
        $state = $_POST['state'] ?? '';
        $city = $_POST['city'] ?? '';
        $pincode = $_POST['pincode'] ?? '';
        $streetAddress = $_POST['streetAddress'] ?? '';

        $profilePic = $_FILES['profilePic'] ?? null;
        $profilePicPath = null;
        $date = date("Y-m-d");
        $time = date("H:i:s");

        $profilePicName='';

        // Secure password hashing
        $password_hash = password_hash($password, PASSWORD_DEFAULT);


        // Image Compression function
        function compressImage($source, $destination, $quality = 80) {
            $info = getimagesize($source);

            if ($info['mime'] == 'image/jpeg') {
                $img = imagecreatefromjpeg($source);
                imagejpeg($img, $destination, $quality);
            } elseif ($info['mime'] == 'image/png') {
                $img = imagecreatefrompng($source);
                imagealphablending($img, false);
                imagesavealpha($img, true);
                $pngQuality = 9 - floor($quality / 10);
                imagepng($img, $destination, $pngQuality);
            } else {
                move_uploaded_file($source, $destination);
                return true;
            }
            imagedestroy($img);
            return true;
        }


        // Save profile pic if uploaded
        if ($profilePic && $profilePic['error'] === 0) {
            $uploadDir = dirname(__DIR__) . '/uploads/users/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $originalName = $profilePic['name'];
            $cleanName = str_replace(' ', '_', $originalName);
            $profilePicName = uniqid() . '_' . basename($cleanName);
            $profilePicPath = 'uploads/users/' . $profilePicName;
            $destination = dirname(__DIR__) . '/' . $profilePicPath;

            // Compress image and save
            compressImage($profilePic['tmp_name'], $destination, 80);
        }

        if ($name && $email) {
            $checkEmail = $conn->query("SELECT id FROM users WHERE email = '$email' LIMIT 1");
            if ($checkEmail->num_rows > 0) {
                if (!empty($profilePicPath)) {
                    $fileFullPath = dirname(__DIR__) . '/' . $profilePicPath;
                    if (file_exists($fileFullPath) && !is_dir($fileFullPath)) {
                        unlink($fileFullPath);
                    }
                }
                echo json_encode([
                    "status" => "error",
                    "message" => "Email already exists"
                ]);
                exit;
            }

            $sql = "INSERT INTO users 
                    (name, email, phone, role, password, profile_pic, status, date, time)
                    VALUES 
                    ('$name','$email','$phone','$role','$password_hash','$profilePicName','active','$date','$time')";

            if ($conn->query($sql)) {
                $user_id = $conn->insert_id;
                $role = strtolower(trim($_POST['role'] ?? ''));
                if (in_array($role, ['admin','manager', 'technician'])) {
                    $sql2 = "INSERT INTO employee_other_details
                            (user_id, aadhaar_no, bank_name, acc_no, IFSC_code, state, city, pincode, street_address, date, time)
                            VALUES
                            ('$user_id', '$aadharno', '$bankName', '$accountNumber', '$ifscNo', '$state', '$city', '$pincode', '$streetAddress', '$date', '$time')";
                    $conn->query($sql2);
                }

                echo json_encode([
                    "status" => "success",
                    "message" => "User added successfully!",
                    "data" => ['user_id' => $user_id]
                ]);
            } else {
                unlink(dirname(__DIR__) . '/' . $profilePicPath);
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            unlink(dirname(__DIR__) . '/' . $profilePicPath);
            echo json_encode(["status" => "error", "message" => "Missing name or email"]);
        }
    break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
    break;
}
?>