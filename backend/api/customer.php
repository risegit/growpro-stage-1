<?php
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
// test
switch ($method) {

    case 'GET':
        $result = $conn->query("SELECT * FROM customers ORDER BY id DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break; 

    case 'POST':
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phoneNumber'] ?? '';
    $staffPhone = $_POST['staffPhoneNumber'] ?? '';
    $address = $_POST['address'] ?? '';
    $state = $_POST['state'] ?? '';
    $city = $_POST['city'] ?? '';
    $pincode = $_POST['pincode'] ?? '';
    $status = $_POST['status'] ?? '';
    $growers = isset($_POST['growers']) ? json_decode($_POST['growers'], true) : [];

    $profilePic = $_FILES['profilePic'] ?? null;
    $profilePicPath = null;
    $date = date("Y-m-d");
    $time = date("H:i:s");

    $password_raw = 'customer123@345';
    $password_hash = password_hash($password_raw, PASSWORD_DEFAULT);


    // Image Compression function
        function compressImage($source, $destination, $quality = 80) {
            $info = getimagesize($source);

            if ($info['mime'] == 'image/jpeg') {
                $img = imagecreatefromjpeg($source);
                imagejpeg($img, $destination, $quality);
            } elseif ($info['mime'] == 'image/png') {
                $img = imagecreatefrompng($source);
                $pngQuality = 9 - floor($quality / 10);
                imagepng($img, $destination, $pngQuality);
            } else {
                return false;
            }
            imagedestroy($img);
            return true;
        }


        // Save profile pic if uploaded
        if ($profilePic && $profilePic['error'] === 0) {
            $uploadDir = dirname(__DIR__) . '/uploads/customers/';
            if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
            $originalName = $profilePic['name'];
            $cleanName = str_replace(' ', '_', $originalName);
            $profilePicName = uniqid() . '_' . basename($cleanName);
            $profilePicPath = 'uploads/customers/' . $profilePicName;
            $destination = dirname(__DIR__) . '/' . $profilePicPath;

            // Compress image and save
            compressImage($profilePic['tmp_name'], $destination, 80);
        }

    if ($name && $phone) {
        // Insert Customer Data
        $sql = "INSERT INTO users 
                (name, email, phone, address, password, profile_pic, role, status, date, time)
                VALUES
                ('$name', '$email', '$phone', '$address', '$password_hash', '$profilePicPath', 'customer', '$status', '$date', '$time')";

        // if ($conn->query($sql)) {
        //     $user_id = $conn->insert_id;

        //     $sql1="INSERT INTO `customers_details`
        //     (`user_id`, `staff_phone`, `state`, `city`, `pincode`, `street_address`, `status`, `created_by`, `updated_by`, `date`, `time`) 
        //     VALUES 
        //     ('$user_id','$staffPhone','$state','$city','$pincode','$address','$status','admin','admin','$date','$time')";

        //     // Insert Growers Data
        //     // if (!empty($growers)) {
        //     //     foreach ($growers as $grower) {
        //     //         $plantName = $grower['plantName'] ?? '';
        //     //         $otherPlant = $grower['otherPlant'] ?? '';
        //     //         if(!empty($grower['systemTypeOther'])){
        //     //             $grower['systemType']=$grower['systemTypeOther'];
        //     //         }
        //     //         if(!empty($grower['motorTypeOther'])){
        //     //             $grower['motorType']=$grower['motorTypeOther'];
        //     //         }
        //     //         if(!empty($grower['timerUsedOther'])){
        //     //             $grower['timerUsed']=$grower['timerUsedOther'];
        //     //         }
        //     //         if(!empty($grower['modelOfLightOther'])){
        //     //             $grower['modelOfLight']=$grower['modelOfLightOther'];
        //     //         }
        //     //         if(!empty($grower['lengthOfLightOther'])){
        //     //             $grower['lengthOfLight']=$grower['lengthOfLightOther'];
        //     //         }
        //     //         if(!empty($grower['tankCapacityOther'])){
        //     //             $grower['tankCapacity']=$grower['tankCapacityOther'];
        //     //         }

        //     //         // Save profile pic if uploaded
        //     //         if ($photoAtInstallation && $photoAtInstallation['error'] === 0) {
        //     //             $uploadDir = dirname(__DIR__) . '/uploads/grower_installation/';
        //     //             if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        //     //             $originalName = $photoAtInstallation['name'];
        //     //             $cleanName = str_replace(' ', '_', $originalName);
        //     //             $photoAtInstallationName = uniqid() . '_' . basename($cleanName);
        //     //             $photoAtInstallationPath = 'uploads/grower_installation/' . $photoAtInstallationName;
        //     //             $destination = dirname(__DIR__) . '/' . $photoAtInstallationPath;

        //     //             // Compress image and save
        //     //             compressImage($photoAtInstallation['tmp_name'], $destination, 80);
        //     //         }

        //     //         $sql2 = "INSERT INTO `growers`
        //     //         (`customer_id`, `system_type`, `no_of_plants`, `no_of_levels`, `setup_dimension`, `motor_used`, `timer_used`, `no_of_lights`, `model_of_lights`, `length_of_lights`, `tank_capacity`, `nutrition_given`, `other_specifications`, `installation_photo_url`, `status`, `date`, `time`) 
        //     //         VALUES 
        //     //         ('$user_id','$grower['systemType']','$grower['numPlants']','$grower['numLevels']','$grower['setupDimension']','$grower['motorType']','$grower['timerUsed']','$grower['numLights']','$grower['modelOfLight']','$grower['lengthOfLight']','$grower['tankCapacity']','$grower['nutritionGiven']','$grower['otherSpecifications']','$photoAtInstallationName','$grower['modelOfLight']','$grower['modelOfLight']','[value-17]','[value-18]')";
        //     //         $conn->query($sql2);

        //     //         $grower_id = $conn->insert_id;

        //     //         foreach ($grower['selectedPlants'] as $plant) {
        //     //             $sql3 = "SELECT * FROM plants where name='$plant['value]'";
        //     //             $row3 = $sql3->fetch_assoc();
        //     //             $plant_id = $row3['id'];

        //     //             $sql4 = "INSERT INTO customer_plants 
        //     //                  (customer_id, grower_id, plant_id, other_plant, date, time)
        //     //                  VALUES
        //     //                  ('$user_id', '$grower_id', '$plant_id','$plant['value']', '', '$date', '$time')";

        //     //             $conn->query($sql4);
        //     //         }
                    
        //     //     }
        //     // }

        //     echo json_encode([
        //         "status" => "success",
        //         "message" => "Customer created successfully",
        //         "data" => ["customer_id" => $customer_id]
        //     ]);
        // } else {
        //     echo json_encode(["status" => "error", "message" => $conn->error]);
        // }
    } else {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
    }
    break;

    case 'PUT':
        $id = $input['id'] ?? 0;
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        if ($id && $name && $email) {
            $sql = "UPDATE customers SET name='$name', email='$email' WHERE id=$id";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Customer updated"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid input"]);
        }
        break;

    case 'DELETE':
        $id = $input['id'] ?? 0;
        if ($id) {
            $sql = "DELETE FROM customers WHERE id=$id";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Customer deleted"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing id"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
