<?php
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
// test
switch ($method) {

    case 'GET':
        $result = $conn->query("SELECT * FROM users where role='customer' ORDER BY id DESC");
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
        $status = ($status === 'success' ? 'active' : 'inactive');
        // $growerdata=var_dump($_POST['growers']);
        $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';

    $growers = json_decode($jsonGrowers, true);
// $growerdata=var_dump($growers);
    // if (json_last_error() !== JSON_ERROR_NONE) {
    //     die("JSON Decode Error: " . json_last_error_msg());
    // }
        // echo json_encode(["status" => "success", "message" => $growers]);
        // $growers = isset($_POST['growers']) ? json_decode($_POST['growers'], true) : [];


        $profilePic = $_FILES['profilePic'] ?? null;
        $profilePicName = '';
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
            $sql = "INSERT INTO users 
                    (name, email, phone, password, profile_pic, role, status, date, time)
                    VALUES
                    ('$name', '$email', '$phone', '$password_hash', '$profilePicName', 'customer', '$status', '$date', '$time')";
                    
            if ($conn->query($sql)) {
                $user_id = $conn->insert_id;
                
                $sql1="INSERT INTO `customers_details`
                (`user_id`, `staff_phone`, `state`, `city`, `pincode`, `street_address`,  `created_by`, `updated_by`, `date`, `time`) 
                VALUES 
                ('$user_id','$staffPhone','$state','$city','$pincode','$address','1','1','$date','$time')";
                $plantNAME='';
                $queryPlant='';
                $k=0;
                if ($conn->query($sql1)) {
                    if (!empty($growers)) {
                        
                        foreach ($growers as $index => $grower) {
                            $fileKey = "photoAtInstallation_" . $index;

                            if(!empty($grower['systemTypeOther'])){
                                $grower['systemType']=$grower['systemTypeOther'];
                            }
                            if(!empty($grower['motorTypeOther'])){
                                $grower['motorType']=$grower['motorTypeOther'];
                            }
                            if(!empty($grower['timerUsedOther'])){
                                $grower['timerUsed']=$grower['timerUsedOther'];
                            }
                            if(!empty($grower['modelOfLightOther'])){
                                $grower['modelOfLight']=$grower['modelOfLightOther'];
                            }
                            if(!empty($grower['lengthOfLightOther'])){
                                $grower['lengthOfLight']=$grower['lengthOfLightOther'];
                            }
                            if(!empty($grower['tankCapacityOther'])){
                                $grower['tankCapacity']=$grower['tankCapacityOther'];
                            }
                            
                            // Check if the file exists in $_FILES
                            if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                                $photoFile = $_FILES[$fileKey];

                                // Create upload folder if not exists
                                $uploadDir = dirname(__DIR__) . '/uploads/customers/';
                                if (!is_dir($uploadDir)) {
                                    mkdir($uploadDir, 0777, true);
                                }

                                // Clean and rename
                                $originalName = $photoFile['name'];
                                $cleanName = str_replace(' ', '_', $originalName);
                                $newName = uniqid('grower_installation_') . '_' . $cleanName;
                                $filePath = $uploadDir . $newName;

                                // Save (you can use your compressImage function)
                                compressImage($photoFile['tmp_name'], $filePath, 80);

                                // Store the relative path to DB
                                $photoAtInstallationPath = 'uploads/customers/' . $newName;
                            } else {
                                $photoAtInstallationPath = null;
                            }

                            $sql2 = "INSERT INTO growers (customer_id, system_type, no_of_plants, no_of_levels, setup_dimension, motor_used, timer_used, no_of_lights, model_of_lights, length_of_lights, tank_capacity, nutrition_given, other_specifications, installation_photo_url, status, date, time) VALUES ('$user_id', '{$grower['systemType']}', '{$grower['numPlants']}', '{$grower['numLevels']}', '{$grower['setupDimension']}', '{$grower['motorType']}', '{$grower['timerUsed']}', '{$grower['numLights']}', '{$grower['modelOfLight']}', '{$grower['lengthOfLight']}', '{$grower['tankCapacity']}', '{$grower['nutritionGiven']}', '{$grower['otherSpecifications']}', '$newName', 'active', '$date', '$time')";

                            $conn->query($sql2);

                            $grower_id = $conn->insert_id;

                            foreach ($grower['selectedPlants'] as $plant) {
                                $plantNAME.=$plant['value'];
                                $sql3 = "SELECT * FROM plants where name='{$plant['value']}'";
                                $result3 = $conn->query($sql3);                               
                                if ($result3 && $result3->num_rows > 0) {
                                    $row3 = $result3->fetch_assoc();
                                    $plant_id = $row3['id'];
                                } else {
                                    $sql4 = "INSERT INTO plants (name, status, date, time) VALUE ('{$grower['selectedPlantsOther']}','active','$date','$time')";
                                    $conn->query($sql4);
                                    $plant_id = $conn->insert_id;
                                }

                                $sql5 = "INSERT INTO customer_plants(customer_id, grower_id, plant_id, other_plant, date, time) VALUES ('$user_id', '$grower_id', '$plant_id', '', '$date', '$time')";
                                // $queryPlant.='growerId='.$grower_id.'___'.$sql4;
                                $conn->query($sql5);
                            }
                                
                        }

                        echo json_encode(["status" => "success", "message" => "Customer Details Saved Successfully!".$sql4]);
                    }
                }
            }else{
                echo json_encode(["status" => "error", "message" => "Customer Already Exist"]);    
            }
        }
        else {
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
