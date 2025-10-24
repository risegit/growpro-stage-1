<?php
header('Content-Type: application/json');
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Make sure form-data is received
$name = $_POST['name'] ?? '';
$email = $_POST['email'] ?? '';
$phone = $_POST['phone'] ?? '';
$role = $_POST['role'] ?? '';
$bankName = $_POST['bankName'] ?? '';
$accountNumber = $_POST['accountNumber'] ?? '';
$ifscNo = $_POST['ifscNo'] ?? '';
$state = $_POST['state'] ?? '';
$city = $_POST['city'] ?? '';
$pincode = $_POST['pincode'] ?? '';
$streetAddress = $_POST['streetAddress'] ?? '';
$profilePic = $_FILES['profilePic'] ?? null;
$date=date("Y-m-d");
$time=date("H:i:s");

echo json_encode([
    'success' => true,
    'data' => [
        'name' => $date,
        'email' => $time,
        'phone' => $phone,
        'role' => $role,
        'bankName' => $bankName,
        'accountNumber' => $accountNumber,
        'ifscNo' => $ifscNo,
        'state' => $state,
        'city' => $city,
        'pincode' => $pincode,
        'streetAddress' => $streetAddress,
        'profilePic' => $profilePic ? $profilePic['name'] : null
    ]
]);


// Example: Save uploaded profile picture
// if ($profilePic && $profilePic['error'] === 0) {
//     $uploadDir = __DIR__ . '/uploads/';
//     if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
//     $filePath = $uploadDir . basename($profilePic['name']);
//     move_uploaded_file($profilePic['tmp_name'], $filePath);
// }

// Insert into database (example PDO)
// try {
//     $pdo = new PDO("mysql:host=localhost;dbname=your_db", "username", "password");
//     $stmt = $pdo->prepare("INSERT INTO users 
//         (name,email,phone,role,bank_name,account_number,ifsc_no,state,city,pincode,street_address,profile_pic) 
//         VALUES (:name,:email,:phone,:role,:bankName,:accountNumber,:ifscNo,:state,:city,:pincode,:streetAddress,:profilePic)");

//     $stmt->execute([
//         ':name' => $name,
//         ':email' => $email,
//         ':phone' => $phone,
//         ':role' => $role,
//         ':bankName' => $bankName,
//         ':accountNumber' => $accountNumber,
//         ':ifscNo' => $ifscNo,
//         ':state' => $state,
//         ':city' => $city,
//         ':pincode' => $pincode,
//         ':streetAddress' => $streetAddress,
//         ':profilePic' => $profilePic ? $filePath : null
//     ]);

//     echo json_encode(['success' => true]);

// } catch (PDOException $e) {
//     echo json_encode(['success' => false, 'message' => $e->getMessage()]);
// }
