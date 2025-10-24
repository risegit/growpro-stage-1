<?php
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {

    case 'GET':
        $result = $conn->query("SELECT * FROM users ORDER BY id DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break; 

    case 'POST':
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phone'] ?? '';
    $role = $_POST['role'] ?? '';
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

    // Save profile pic if uploaded
    if ($profilePic && $profilePic['error'] === 0) {
        $uploadDir = __DIR__ . '/uploads/users/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $profilePicName = uniqid() . '_' . basename($profilePic['name']);
        $profilePicPath = 'uploads/users/' . $profilePicName;
        move_uploaded_file($profilePic['tmp_name'], __DIR__ . '/' . $profilePicPath);
    }

    if ($name && $email) {
        $sql = "INSERT INTO users 
                (name, email, phone, role, profile_pic, status, date, time)
                VALUES 
                ('$name','$email','$phone','$role','$profilePicPath','active','$date','$time')";

        if ($conn->query($sql)) {
            $user_id = $conn->insert_id;

            // Insert employee other details only if role is manager or technician
            if (in_array($role, ['manager', 'technician'])) {
                $sql2 = "INSERT INTO employee_other_details
                         (user_id, aadhaar_no, bank_name, acc_no, IFSC_code, state, city, pincode, street_address, date, time)
                         VALUES
                         ('$user_id', '$aadharno', '$bankName', '$accountNumber', '$ifscNo', '$state', '$city', '$pincode', '$streetAddress', '$date', '$time')";
                $conn->query($sql2);
            }

            echo json_encode([
                "status" => "success",
                "message" => "User added",
                "data" => ['user_id' => $user_id]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Missing name or email"]);
    }
    break;


    // Optional: you can implement PUT and DELETE similarly for updating and deleting users
    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
