<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['id'] ?? null;
$userStatus = $_GET['status'] ?? null;
$emailId = $_GET['email'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$whereAddition = ($userStatus === 'active') ? "and users.status='active'" : "";

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
            $result = $conn->query("SELECT * FROM users INNER JOIN customers_details ON users.id=customers_details.user_id where users.role='customer' $whereAddition ORDER BY users.id DESC");
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success", "data" => $data]);
        }
        
        break; 

    case 'POST':
        $user_id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phoneNumber'] ?? '';
        $staffPhone = $_POST['staffPhoneNumber'] ?? '';
        $address = $_POST['address'] ?? '';
        $state = $_POST['state'] ?? '';
        $city = $_POST['city'] ?? '';
        $locality = $_POST['locality'] ?? '';
        $landmark = $_POST['landmark'] ?? '';
        $pincode = $_POST['pincode'] ?? '';
        $status = $_POST['status'] ?? '';
        // $status = ($status === 'success' ? 'active' : 'inactive');
        // $growerdata=var_dump($_POST['growers']);
        $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';
        $growers = json_decode($jsonGrowers, true);

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
                    ('$name', '$email', '$phone', '$password_hash', '$profilePicName', 'customer', 'active', '$date', '$time')";
                    
            if ($conn->query($sql)) {
                $user_id = $conn->insert_id;
                
                $sql1="INSERT INTO `customers_details` (`user_id`, `staff_phone`, `state`, `city`, `locality`, `landmark`, `pincode`, `street_address`,  `created_by`, `updated_by`, `date`, `time`) VALUES ('$user_id','$staffPhone','$state','$city','$locality','$landmark','$pincode','$address','1','1','$date','$time')";
                $queryPlant='';
                $newName='';
                $k=0;
                if ($conn->query($sql1)) {
                    if (!empty($growers)) {
                        
                        foreach ($growers as $index => $grower) {
                            $fileKey = "photoAtInstallation_" . $index;
                            
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

                            $sql2 = "INSERT INTO growers (customer_id, system_type, system_type_other, no_of_plants, no_of_levels, setup_dimension, motor_used, motor_used_other, timer_used, timer_used_other, no_of_lights, model_of_lights, model_of_lights_other, length_of_lights, length_of_lights_other, tank_capacity, tank_capacity_other, nutrition_given, other_specifications, installation_photo_url, status, date, time) VALUES ('$user_id', '{$grower['systemType']}', '{$grower['systemTypeOther']}', '{$grower['numPlants']}', '{$grower['numLevels']}', '{$grower['setupDimension']}', '{$grower['motorType']}', '{$grower['motorTypeOther']}', '{$grower['timerUsed']}', '{$grower['timerUsedOther']}', '{$grower['numLights']}', '{$grower['modelOfLight']}', '{$grower['modelOfLightOther']}', '{$grower['lengthOfLight']}', '{$grower['lengthOfLightOther']}', '{$grower['tankCapacity']}', '{$grower['tankCapacityOther']}', '{$grower['nutritionGiven']}', '{$grower['otherSpecifications']}', '$newName', 'active', '$date', '$time')";

                            $conn->query($sql2);

                            $grower_id = $conn->insert_id;

                            foreach ($grower['selectedPlants'] as $plant) {
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

                        echo json_encode(["status" => "success", "message" => "Customer Details Saved Successfully!"]);
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
        $user_id = $_POST['id'] ?? '';
        $name = $_POST['name'] ?? '';
        $email = $_POST['email'] ?? '';
        $phone = $_POST['phoneNumber'] ?? '';
        $staffPhone = $_POST['staffPhoneNumber'] ?? '';
        $address = $_POST['address'] ?? '';
        $state = $_POST['state'] ?? '';
        $city = $_POST['city'] ?? '';
        $locality = $_POST['locality'] ?? '';
        $landmark = $_POST['landmark'] ?? '';
        $pincode = $_POST['pincode'] ?? '';
        $status = $_POST['isActive'] ?? '';
        $userstatus = filter_var($status, FILTER_VALIDATE_BOOLEAN) ? 'active' : 'inactive';
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
        $profilePicName = null;
        $pic='';
        $date = date("Y-m-d");
        $time = date("H:i:s");
        // echo json_encode(["status" => "error", "message" => "Grower Data".$growerdata]);
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
                $uploadDir = dirname(__DIR__) . '/uploads/customers/';
                if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
                $originalName = $profilePic['name'];
                $cleanName = str_replace(' ', '_', $originalName);
                $profilePicName = uniqid() . '_' . basename($cleanName);
                $profilePicPath = 'uploads/customers/' . $profilePicName;
                $destination = dirname(__DIR__) . '/' . $profilePicPath;

                // Compress image and save
                compressImage($profilePic['tmp_name'], $destination, 80);
                $oldPicRes = $conn->query("SELECT profile_pic FROM users WHERE id = '$user_id'");
                $num_rows=$oldPicRes->num_rows;
                if ($oldPicRes && $oldPicRes->num_rows > 0) {
                    $oldPic = $oldPicRes->fetch_assoc()['profile_pic'];
                    $oldPath = dirname(__DIR__) . '/uploads/customers/' . $oldPic;
                    if (file_exists($oldPath) && !is_dir($oldPath)) unlink($oldPath);
                }
                $profilePIC= ",`profile_pic`='$profilePicName'";
            }else{
                // $pic='empty';
                $profilePIC='';
            }
    
        if ($name && $phone) {
            $sql = "UPDATE `users` SET `name`='$name',`email`='$email',`phone`='$phone',`password`='$password_hash' $profilePIC,`status`='$userstatus' WHERE id='$user_id'";
            // echo json_encode(["status" => "error", "message" => "Customer Already Exist123".'==userstatus='.$userstatus.'===sql='.$sql]);
            
            $growerIDs=[];
            if ($conn->query($sql)) {
                                
                $sql1="UPDATE `customers_details` SET `staff_phone`='$staffPhone',`state`='$state',`city`='$city',`locality`='$locality',`landmark`='$landmark',`pincode`='$pincode',`street_address`='$address' WHERE user_id=$user_id";
                $plantNAME='';
                $queryPlant='';
                $newName='';
                $k=0;
                if ($conn->query($sql1)) {
                    if (!empty($growers)) {
                        
                        foreach ($growers as $index => $grower) {
                            $grower_id = $grower['growerId'] ?? null;
                            $fileKey = "photoAtInstallation_" . $index;
                            $growerIDs[] = $fileKey;
                            $newName = null;
                            $photoAtInstallationPath = null;
                            if (!empty($grower_id)) {
                                                                
                                if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                                    $photoFile = $_FILES[$fileKey];
                                    $uploadDir = dirname(__DIR__) . '/uploads/customers/';
                                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

                                    $originalName = str_replace(' ', '_', $photoFile['name']);
                                    $newName = uniqid('grower_installation_') . '_' . $originalName;
                                    $filePath = $uploadDir . $newName;
                                    compressImage($photoFile['tmp_name'], $filePath, 80);

                                    $photoAtInstallationPath = 'uploads/customers/' . $newName;
                                }
                                $grower['systemTypeOther']=$grower['systemType'] == 'Other' ? $grower['systemTypeOther'] : '';
                                
                                $updateSQL = "UPDATE growers SET system_type='{$grower['systemType']}', system_type_other='{$grower['systemTypeOther']}', no_of_plants='{$grower['numPlants']}', no_of_levels='{$grower['numLevels']}', setup_dimension='{$grower['setupDimension']}', motor_used='{$grower['motorType']}', motor_used_other='{$grower['motorTypeOther']}', timer_used='{$grower['timerUsed']}', timer_used_other='{$grower['timerUsedOther']}', no_of_lights='{$grower['numLights']}', model_of_lights='{$grower['modelOfLight']}', model_of_lights_other='{$grower['modelOfLightOther']}', length_of_lights='{$grower['lengthOfLight']}', length_of_lights_other='{$grower['lengthOfLightOther']}', tank_capacity='{$grower['tankCapacity']}', tank_capacity_other='{$grower['tankCapacityOther']}', nutrition_given='{$grower['nutritionGiven']}',other_specifications='{$grower['otherSpecifications']}', date='$date',time='$time' " . (!empty($newName) ? ", installation_photo_url='$newName'" : "") . " WHERE id='$grower_id' AND customer_id='$user_id'";
                                $conn->query($updateSQL);
                                // echo json_encode(["status" => "success", "message" => "Growerid".$updateSQL]);
                            } else {
                                if (isset($_FILES[$fileKey]) && $_FILES[$fileKey]['error'] === 0) {
                                    $photoFile = $_FILES[$fileKey];
                                    $uploadDir = dirname(__DIR__) . '/uploads/customers/';
                                    if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);

                                    $originalName = str_replace(' ', '_', $photoFile['name']);
                                    $newName = uniqid('grower_installation_') . '_' . $originalName;
                                    $filePath = $uploadDir . $newName;
                                    compressImage($photoFile['tmp_name'], $filePath, 80);

                                    $photoAtInstallationPath = 'uploads/customers/' . $newName;
                                }
                                // ✅ Otherwise, insert new grower
                                $insertSQL ="INSERT INTO growers (customer_id, system_type, no_of_plants, no_of_levels, setup_dimension, motor_used, timer_used, no_of_lights, model_of_lights, length_of_lights, tank_capacity, nutrition_given, other_specifications, installation_photo_url, status, date, time) VALUES ('$user_id', '{$grower['systemType']}', '{$grower['numPlants']}', '{$grower['numLevels']}', '{$grower['setupDimension']}', '{$grower['motorType']}', '{$grower['timerUsed']}', '{$grower['numLights']}', '{$grower['modelOfLight']}', '{$grower['lengthOfLight']}', '{$grower['tankCapacity']}', '{$grower['nutritionGiven']}', '{$grower['otherSpecifications']}', '$newName', 'active', '$date', '$time')";
                                $conn->query($insertSQL);
                                $grower_id = $conn->insert_id;
                                
                            }

                            if (!empty($grower_id)) {
                                $conn->query("DELETE FROM customer_plants WHERE customer_id='$user_id' AND grower_id='$grower_id'");
                            }
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
                                // $queryPlant.='growerId='.$grower_id.'__SQL5__'.$sql5;
                                $conn->query($sql5);
                            }
                                
                        }
                        
                        echo json_encode(["status" => "success", "message" => "Customer Details Updated Successfully!"]);
                    }
                }
            } else{
                echo json_encode(["status" => "error", "message" => "Customer Already Exist"]);    
            }
        }
        else {
            echo json_encode(["status" => "error", "message" => "Missing required fields"]);
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
