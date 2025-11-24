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
        if ($userId) {
            $sql = "SELECT * FROM users WHERE id=$userId LIMIT 1";
            $result = $conn->query($sql);

            if ($result && $result->num_rows > 0) {
                $row = $result->fetch_assoc();
                $role = $row['role'];
                $table_name = ($role == 'customer') ? 'customers_details' : (($role == 'admin' || $role == 'manager' || $role == 'technician') ? 'employee_other_details' : '');
            }

            if (!empty($table_name)) {
                $sql1 = "SELECT * FROM users INNER JOIN $table_name AS cust_details ON users.id=cust_details.user_id WHERE users.id=$userId LIMIT 1";
            } else {
                $sql1 = "SELECT * FROM users WHERE id=$userId LIMIT 1";
            }
            $result = $conn->query($sql1);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            echo json_encode([
                "status" => "success",
                "data" => $userId ? ($data[0] ?? null) : $data
            ]);
        }elseif ($emailId) {
            $userResult = $conn->query("SELECT * FROM users where email='$emailId'");
            if ($userResult && $userResult->num_rows > 0) {
                echo json_encode(["status" => "error", "message" => 'An account with this email already exists']);
            }else{
                echo json_encode(["status" => "success", "message" => 'An account with this email not exists']);
            }
            
        } else {
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
        $locality = $_POST['locality'] ?? '';
        $landmark = $_POST['landmark'] ?? '';
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
                // 2. Generate prefix based on role
                $roleLower = strtolower(trim($_POST['role']));
                $prefix = '';

                if ($roleLower === 'manager') $prefix = 'MN';
                elseif ($roleLower === 'admin') $prefix = 'AD';
                elseif ($roleLower === 'technician') $prefix = 'TC';
                else $prefix = 'OT'; // default prefix
                // 3. Generate user_code (example: MN0023)
                $user_code = $prefix . str_pad($user_id, 4, '0', STR_PAD_LEFT);
                // 4. Update user_code back into users table
                $conn->query("UPDATE users SET user_code = '$user_code' WHERE id = '$user_id'");

                $role = strtolower(trim($_POST['role'] ?? ''));
                if (in_array($role, ['admin','manager', 'technician'])) {
                    $sql2 = "INSERT INTO employee_other_details
                            (user_id, aadhaar_no, bank_name, acc_no, IFSC_code, state, city, locality, landmark, pincode, street_address, date, time)
                            VALUES
                            ('$user_id', '$aadharno', '$bankName', '$accountNumber', '$ifscNo', '$state', '$city', '$locality', '$landmark', '$pincode', '$streetAddress', '$date', '$time')";
                    $conn->query($sql2);
                }

                echo json_encode([
                    "status" => "success",
                    "message" => "User added successfully!",
                    "data" => ['user_id' => $user_id,'user_code' => $user_code]
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

    
    case 'PUT':
        // Parse form data
        $user_id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phone'] ?? '';
        $password = $_POST['password'];
        $role = $_POST['role'] ?? '';
        $status = $_POST['status'] ?? '';
        $aadharno = $_POST['aadhaarNo'] ?? '';
        $bankName = $_POST['bankName'] ?? '';
        $accountNumber = $_POST['accountNumber'] ?? '';
        $ifscNo = $_POST['ifscNo'] ?? '';
        $state = $_POST['state'] ?? '';
        $city = $_POST['city'] ?? '';
        $locality = $_POST['locality'] ?? '';
        $landmark = $_POST['landmark'] ?? '';
        $pincode = $_POST['pincode'] ?? '';
        $streetAddress = $_POST['streetAddress'] ?? '';

        $profilePic = $_FILES['profilePic'] ?? null;
        $profilePicPath = null;
        $date = date("Y-m-d");
        $time = date("H:i:s");
        
        // $password_hash = password_hash($password, PASSWORD_DEFAULT);
        
        // else{
        //     $sql = "SELECT password FROM users WHERE id= $user_id";
        //     $result=$conn->query($sql);
        //     $row = $result->fetch_assoc();
        //     $password_hash = $row['password'];
        // }

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

       
        if (empty($user_id)) {
            echo json_encode(["status" => "error", "message" => "User ID is required"]);
            exit;
        }

        // Handle new profile picture upload if present
        $newProfilePicName = null;
        if ($profilePic && $profilePic['error'] === 0) {
            $uploadDir = dirname(__DIR__) . '/uploads/users/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

            $originalName = $profilePic['name'];
            $cleanName = str_replace(' ', '_', $originalName);
            $newProfilePicName = uniqid() . '_' . basename($cleanName);
            $profilePicPath = 'uploads/users/' . $newProfilePicName;
            $destination = dirname(__DIR__) . '/' . $profilePicPath;

            compressImage($profilePic['tmp_name'], $destination, 80);

            $oldPicRes = $conn->query("SELECT profile_pic FROM users WHERE id = '$user_id'");
            $num_rows=$oldPicRes->num_rows;
            if ($oldPicRes && $oldPicRes->num_rows > 0) {
                $oldPic = $oldPicRes->fetch_assoc()['profile_pic'];
                $oldPath = dirname(__DIR__) . '/uploads/users/' . $oldPic;
                if (file_exists($oldPath) && !is_dir($oldPath)) unlink($oldPath);
            }
        }

        // Update users table
        $updateFields = [];
        if (!empty($_POST['password'])) {
            $password_hash = password_hash($_POST['password'], PASSWORD_DEFAULT); 
            $updateFields[] = "password='$password_hash'";
        }
        if ($name) $updateFields[] = "name='$name'";
        if ($email) $updateFields[] = "email='$email'";
        if ($phone) $updateFields[] = "phone='$phone'";
        if ($role) $updateFields[] = "role='$role'";
        if ($status) $updateFields[] = "status='$status'";
        if ($newProfilePicName) $updateFields[] = "profile_pic='$newProfilePicName'";

        if (!empty($updateFields)) {
            $sqlUpdateUser = "UPDATE users SET " . implode(',', $updateFields) . ", date='$date', time='$time' WHERE id='$user_id'";
            if($conn->query($sqlUpdateUser)){
                $updateFields1 = [];
                if ($aadharno) $updateFields1[] = "aadhaar_no='$aadharno'";
                if ($bankName) $updateFields1[] = "bank_name='$bankName'";
                if ($accountNumber) $updateFields1[] = "acc_no='$accountNumber'";
                if ($ifscNo) $updateFields1[] = "IFSC_code='$ifscNo'";
                if ($state) $updateFields1[] = "state='$state'";
                if ($city) $updateFields1[] = "city='$city'";
                if ($locality) $updateFields1[] = "locality='$locality'";
                if ($landmark) $updateFields1[] = "landmark='$landmark'";
                if ($pincode) $updateFields1[] = "pincode='$pincode'";
                if ($streetAddress) $updateFields1[] = "street_address='$streetAddress'";
                // if ($newProfilePicName) $updateFields1[] = "profile_pic='$newProfilePicName'";

                if (!empty($updateFields1)) {
                    $sqlUpdateUser1 = "UPDATE employee_other_details SET " . implode(',', $updateFields1) . ", date='$date', time='$time' WHERE user_id='$user_id'";
                    $conn->query($sqlUpdateUser1);
                }
            }
            // Auto generate code if empty
        $checkCode = $conn->query("SELECT user_code, role FROM users WHERE id='$user_id'");
        if ($checkCode && $checkCode->num_rows > 0) {
            $row = $checkCode->fetch_assoc();

            if (empty($row['user_code'])) {
                $roleLower = strtolower(trim($row['role']));
                $prefix = ($roleLower === 'admin') ? 'AD' :
                          (($roleLower === 'manager') ? 'MN' :
                          (($roleLower === 'technician') ? 'TC' : 'US'));

                $user_code = $prefix . str_pad($user_id, 4, '0', STR_PAD_LEFT);

                $conn->query("UPDATE users SET user_code='$user_code' WHERE id='$user_id'");
            }
        }

        }

        echo json_encode([
            "status" => "success",
            "message" => "User details updated successfully"            
        ]);
        break;



    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
