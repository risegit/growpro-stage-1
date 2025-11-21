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

$date = date("Y-m-d");
$time = date("H:i:s");

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
            // SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto -- AMC still active GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0; 
            // This query count Total_visit and pending_visit

            $sql1 = "SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0";
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
        //Visual Observation
        $customerId = $_POST['customer_id'] ?? '';
        $plantsWater = $_POST['plantsWater'] ?? '';
        $waterAbovePump = $_POST['waterAbovePump'] ?? '';
        $timerWorking = $_POST['timerWorking'] ?? '';
        $timerIssue = $_POST['timerIssue'] ?? '';
        $motorWorking = $_POST['motorWorking'] ?? '';
        $motorIssue = $_POST['motorIssue'] ?? '';
        $lightsWorking = $_POST['lightsWorking'] ?? '';
        $lightsIssue = $_POST['lightsIssue'] ?? '';
        $equipmentDamaged = $_POST['equipmentDamaged'] ?? '';
        $equipmentDamageDetails = $_POST['equipmentDamageDetails'] ?? '';
        $anyLeaks = $_POST['anyLeaks'] ?? '';
        $cleanEnvironment = $_POST['cleanEnvironment'] ?? '';
        $electricSecured = $_POST['electricSecured'] ?? '';

        // Technical Observation
        $initialPh = $_POST['initialPh'] ?? '';
        $correctedPh = $_POST['correctedPh'] ?? '';
        $initialTds = $_POST['initialTds'] ?? '';
        $correctedTds = $_POST['correctedTds'] ?? '';
        $pestsPresent = $_POST['pestsPresent'] ?? '';
        $pestOther = $_POST['pestOther'] ?? '';
        $nutrientDeficiency = $_POST['nutrientDeficiency'] ?? '';
        $deficiencyDetails = $_POST['deficiencyDetails'] ?? '';
        $cropNames = $_POST['cropNames'] ?? '';

        $jsonPestTypes = isset($_POST['pestTypes']) ? $_POST['pestTypes'] : '';
        $pest_types = json_decode($jsonPestTypes, true);
        // $growerdata=var_dump($pest_types);

        $jsonPlantProblems = isset($_POST['plantProblems']) ? $_POST['plantProblems'] : '';
        $plant_problems = json_decode($jsonPlantProblems, true);
        // $growerdata=var_dump($plant_problems);

        // Client Training
        $harvestTraining = $_POST['harvestTraining'] ?? '';
        $pestManagement = $_POST['pestManagement'] ?? '';
        $equipmentCleaning = $_POST['equipmentCleaning'] ?? '';
        $plantMaintenance = $_POST['plantMaintenance'] ?? '';
        $scopesOfImprovement = $_POST['scopesOfImprovement'] ?? '';

        //Material Supply
        $otherPlants = $_POST['otherPlants'] ?? '';
        $otherPlantName = $_POST['otherPlantName'] ?? '';
        $nutrients = $_POST['nutrients'] ?? '';
        $tankCapacity = $_POST['tankCapacity'] ?? '';
        $numberOfTopups = $_POST['numberOfTopups'] ?? '';
        $additionalNutrients = $_POST['additionalNutrients'] ?? '';
        $material_supplied_neemoil = $_POST['material_supplied_neemoil'] ?? '';
        $materialsSuppliedPlantData = $_POST['materialsSuppliedPlantData'] ?? '';
        $materialschargeableItemsOptionsother = $_POST['materialschargeableItemsOptionsother'] ?? '';
        $materialNeedsDelivery = $_POST['materialNeedsDelivery'] ?? '';

        $jsonplantQuantities = isset($_POST['plantQuantities']) ? $_POST['plantQuantities'] : '';
        $material_plants_supplied = json_decode($jsonplantQuantities, true);
        // $growerdata=var_dump($material_plants_supplied);

        $jsonnutrientsData = isset($_POST['nutrientsData']) ? $_POST['nutrientsData'] : '';
        $material_nutrients_data_supplied = json_decode($jsonnutrientsData, true);

        $jsonChargeableItemsSupplied = isset($_POST['material_supplied_chargeable_items']) ? $_POST['material_supplied_chargeable_items'] : '';
        $material_chargeable_Item_supplied = json_decode($jsonChargeableItemsSupplied, true);
        // $growerdata=var_dump($material_chargeable_Item_supplied);

        // Material Need To Deliver
        if(!empty($materialNeedsDelivery)){
            $material_need_neemoil = $_POST['material_need_neemoil'] ?? '';
            $materialsDeliveredPlantData = $_POST['materialsDeliveredPlantData'] ?? '';
            $step5MaterialsOtherInput = $_POST['step5MaterialsOtherInput'] ?? '';
            $materialsNeedChargeableItemsOptionsother = $_POST['materialsNeedChargeableItemsOptionsother'] ?? '';
            $step5OtherPlantName = $_POST['step5OtherPlantName'] ?? '';

            $jsonMaterialNeedPlantQuantities = isset($_POST['materialNeedPlantQuantities']) ? $_POST['materialNeedPlantQuantities'] : '';
            $material_plants_delivered = json_decode($jsonMaterialNeedPlantQuantities, true);
            // $growerdata=var_dump($material_plants_supplied);

            $jsonMaterialNeedNutrientsData = isset($_POST['material_need_nutrientsData']) ? $_POST['material_need_nutrientsData'] : '';
            $material_need_nutrients_data = json_decode($jsonMaterialNeedNutrientsData, true);

            $jsonMaterialNeedChargeableItemsDelivered = isset($_POST['material_need_chargeable_items']) ? $_POST['material_supplied_chargeable_items'] : '';
            $material_chargeable_Item_delivered = json_decode($jsonMaterialNeedChargeableItemsDelivered, true);
        }

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

        // $profilePic = $_FILES['setupPhotos_0'] ?? null;
        // $uploadDir = dirname(__DIR__) . '/uploads/site-visit/';
        // if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        // $originalName = $profilePic['name'];
        // $cleanName = str_replace(' ', '_', $originalName);
        // $profilePicName = uniqid() . '_' . basename($cleanName);
        // $profilePicPath = 'uploads/site-visit/' . $profilePicName;
        // $destination = dirname(__DIR__) . '/' . $profilePicPath;
        // compressImage($profilePic['tmp_name'], $destination, 80);

        $sql = "INSERT INTO `site_visit`(`customer_id`, `visited_by`, `are_plants_getting_water`, `water_above_pump`, `timer_working`,`timer_issue`, `motor_working`, `motor_issue`, `light_working`, `light_issue`, `equipment_damaged`, `damaged_items`, `any_leaks`, `clean_equipment`, `electric_connections_secured`, `initial_ph`, `corrected_ph`, `initial_tds`, `corrected_tds`, `presence_of_pests`, `nutrient_deficiency`, `deficiency_types`, `which_crop`, `client_training_harvest`, `pest_management`, `equipment_cleaning`, `plant_maintenance`, `scope_of_improvement`, `material_supplied_neemoil`, `created_date`, `created_time`) VALUES ('$customerId','technician','$plantsWater','$waterAbovePump','$timerWorking','$timerIssue','$motorWorking','$motorIssue','$lightsWorking','$lightsIssue','$equipmentDamaged','$equipmentDamageDetails','$anyLeaks','$cleanEnvironment','$electricSecured','$initialPh','$correctedPh','$initialTds','$correctedTds','$pestsPresent','$nutrientDeficiency','$deficiencyDetails','$cropNames','$harvestTraining','$pestManagement','$equipmentCleaning','$plantMaintenance','$scopesOfImprovement','$material_supplied_neemoil','$date','$time')";
        echo json_encode(["status" => "success", "message" => $sql]);
        if ($conn->query($sql)) {
            $visit_id = $conn->insert_id;
            foreach ($pest_types as $pest_type) {
                if($pest_type=='Others'){
                    $sql2 = "INSERT INTO `site_visit_presence_of_pests`(`visit_id`, `pest_name`, `other_pest_name`) VALUES ('$visit_id','Others','$pestOther')";
                }else{
                    $sql2 = "INSERT INTO `site_visit_presence_of_pests`(`visit_id`, `pest_name`, `other_pest_name`) VALUES ('$visit_id','$pest_type','')";
                }
                $conn->query($sql2);
            }
            echo json_encode(["status" => "success", "message" => $sql2]);
            foreach ($plant_problems as $plantProblem) {
                $sql3 = "INSERT INTO `site_visit_plant_problems`(`visit_id`, `problem_name`, `other_problem_name`) VALUES ('$visit_id','$plantProblem','')";
                $conn->query($sql3);
            }
            echo json_encode(["status" => "success", "message" => $sql3]);
            foreach ($material_plants_supplied as $plantName => $qty) {
                if($plantName === "Others"){
                    $sql4 = "INSERT INTO `site_visit_material_supplied_plants`(`visit_id`, `plant_name`, `other_plant_name`,`quantity`) VALUES ('$visit_id','$plantName','$materialsSuppliedPlantData','$qty')";    
                }else{
                    $sql4 = "INSERT INTO `site_visit_material_supplied_plants`(`visit_id`, `plant_name`, `other_plant_name`,`quantity`) VALUES ('$visit_id','$plantName','Others','$qty')";    
                }
                $conn->query($sql4);
            }
            foreach ($material_nutrients_data_supplied as $nutrientInfo) {
                if($nutrientInfo['nutrients'] === "Others"){
                    $sql5 = "INSERT INTO `site_visit_material_supplied_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','','{$nutrientInfo['tankCapacity']}','{$nutrientInfo['numberOfTopups']}','Others','')";
                }elseif($nutrientInfo['tankCapacity'] === "Others"){
                    $sql5 = "INSERT INTO `site_visit_material_supplied_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','{$nutrientInfo['nutrients']}','','{$nutrientInfo['numberOfTopups']}','','Others')";
                }else{
                    $sql5 = "INSERT INTO `site_visit_material_supplied_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','{$nutrientInfo['nutrients']}','{$nutrientInfo['tankCapacity']}','{$nutrientInfo['numberOfTopups']}','','')";
                }
                $conn->query($sql5);
            }
            echo json_encode(["status" => "success", "message" => $sql5]);
            foreach ($material_chargeable_Item_supplied as $materialSChargeableItems) {
                if($materialSChargeableItems === "Others"){
                    $sql6 = "INSERT INTO `site_visit_material_supplied_chargeable_items`(`visit_id`, `item_name`, `other_item_name`) VALUES ('$visit_id','$materialSChargeableItems','$materialschargeableItemsOptionsother')";    
                }else{
                    $sql6 = "INSERT INTO `site_visit_material_supplied_chargeable_items`(`visit_id`, `item_name`, `other_item_name`) VALUES ('$visit_id','$materialSChargeableItems','')";
                }
                $conn->query($sql6);
            }

            $uploadDir = dirname(__DIR__) . '/uploads/site-visit/';
            if (!is_dir($uploadDir)) {
                mkdir($uploadDir, 0777, true);
            }
            $savedFiles = [];

            foreach ($_FILES as $key => $file) {

                // Match only keys like setupPhotos_0, setupPhotos_1, etc.
                if (preg_match('/setupPhotos_\d+/', $key)) {

                    if ($file['error'] === UPLOAD_ERR_OK) {
                        $filename = "site_visit_installation_" . time() . "_" . basename($file['name']);
                        $targetPath = $uploadDir . $filename;

                        if (move_uploaded_file($file['tmp_name'], $targetPath)) {
                            $savedFiles[] = $filename;
                            $sql7 = "INSERT INTO `site_visit_photos`(`visit_id`, `image_url`) VALUES ('$visit_id','$filename')";
                            $conn->query($sql7);
                        }
                    }
                }
            }
            $chk=!empty($materialNeedsDelivery);
            echo json_encode(["status" => "success", "message" => $chk]);
            if(!empty($materialNeedsDelivery)){
                $sql8 = "UPDATE `site_visit` SET `material_delivered_neemoil`='$material_need_neemoil' WHERE id='$visit_id'";
                echo json_encode(["status" => "success", "sql8" => $sql8]);
                if ($conn->query($sql8)){
                    foreach ($material_plants_delivered as $plantName => $qty) {
                        if($plantName === "Others"){
                            $sql9 = "INSERT INTO `site_visit_material_need_plants`(`visit_id`, `plant_name`, `other_plant_name`,`quantity`) VALUES ('$visit_id','$plantName','$materialsDeliveredPlantData','$qty')";    
                        }else{
                            $sql9 = "INSERT INTO `site_visit_material_need_plants`(`visit_id`, `plant_name`, `other_plant_name`,`quantity`) VALUES ('$visit_id','$plantName','Others','$qty')";    
                        }
                        $conn->query($sql9);
                    }
                    foreach ($material_need_nutrients_data as $needNutrientInfo) {
                        if($needNutrientInfo['nutrients'] === "Others"){
                            $sql10 = "INSERT INTO `site_visit_material_need_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','','{$needNutrientInfo['tankCapacity']}','{$needNutrientInfo['numberOfTopups']}','Others','')";
                        }elseif($needNutrientInfo['tankCapacity'] === "Others"){
                            $sql10 = "INSERT INTO `site_visit_material_need_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','{$needNutrientInfo['nutrients']}','','{$needNutrientInfo['numberOfTopups']}','','Others')";
                        }else{
                            $sql10 = "INSERT INTO `site_visit_material_need_nutrients`(`visit_id`, `nutrient_type`, `tank_capacity`, `topups`, `other_nutrient_name`, `other_tank_capacity`) VALUES ('$visit_id','{$needNutrientInfo['nutrients']}','{$needNutrientInfo['tankCapacity']}','{$needNutrientInfo['numberOfTopups']}','','')";
                        }
                        $conn->query($sql10);
                    }
                    foreach ($material_chargeable_Item_delivered as $materialDChargeableItems) {
                        if($materialDChargeableItems === "Others"){
                            $sql11 = "INSERT INTO `site_visit_material_need_chargeable_items`(`visit_id`, `item_name`, `other_item_name`) VALUES ('$visit_id','$materialDChargeableItems','$materialsNeedChargeableItemsOptionsother')";    
                        }else{
                            $sql11 = "INSERT INTO `site_visit_material_need_chargeable_items`(`visit_id`, `item_name`, `other_item_name`) VALUES ('$visit_id','$materialDChargeableItems','')";
                        }
                        $conn->query($sql11);
                    }
                }
            }
            // $sql2 = "INSERT INTO `site_visit_material_needs`(`site_visit_id`, `neem_oil`) VALUES ('$visit_id','$neemOil')";
            // if ($conn->query($sql)) {
            //     $material_need_id = $conn->insert_id;    
            //     foreach ($material_plants_supplied as $plantName => $qty) {
            //         if($plantName === "Others"){
            //             $sql2 = "INSERT INTO `site_visit_plants_supplied`(`visit_id`, `plant_name`, `quantity`, `other_plant_name`) VALUES ('$material_need_id','Others','$qty','$materialsSuppliedPlantData')";
            //         }else{
            //             $sql2 = "INSERT INTO `site_visit_plants_supplied`(`visit_id`, `plant_name`, `quantity`, `other_plant_name`) VALUES ('$visit_id','$plantName','$qty','other')";
            //         }
            //     }
            // }
            
        }

        // echo json_encode(["status" => "success", "message" => $sql]);

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
        $motorWorking = $_POST['motorWorking'] ?? '';
        $motorIssue = $_POST['motorIssue'] ?? '';
        $lightsWorking = $_POST['lightsWorking'] ?? '';
        $lightsIssue = $_POST['lightsIssue'] ?? '';
        $equipmentDamaged = $_POST['equipmentDamaged'] ?? '';
        $equipmentDamageDetails = $_POST['equipmentDamageDetails'] ?? '';
        $anyLeaks = $_POST['anyLeaks'] ?? '';
        $cleanEnvironment = $_POST['cleanEnvironment'] ?? '';
        $electricSecured = $_POST['electricSecured'] ?? '';
        $initialPh = $_POST['initialPh'] ?? '';
        $correctedPh = $_POST['correctedPh'] ?? '';
        $initialTds = $_POST['initialTds'] ?? '';
        $correctedTds = $_POST['correctedTds'] ?? '';
        $pestsPresent = $_POST['pestsPresent'] ?? '';
        $$pestOther = $_POST['pestOther'] ?? '';
        $nutrientDeficiency = $_POST['nutrientDeficiency'] ?? '';
        $deficiencyDetails = $_POST['deficiencyDetails'] ?? '';
        $cropNames = $_POST['cropNames'] ?? '';
        // Client Training
        $harvestTraining = $_POST['harvestTraining'] ?? '';
        $pestManagement = $_POST['pestManagement'] ?? '';
        


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
        }

        

        echo json_encode([
            "status" => "success",
            "message" => "User details updated successfully"            
        ]);

        // Update employee details if applicable
        // if (in_array($role, ['admin','manager', 'technician'])) {
        //     $sqlCheck = $conn->query("SELECT id FROM employee_other_details WHERE user_id='$user_id'");
        //     if ($sqlCheck->num_rows > 0) {
        //         $sqlUpdateDetails = "UPDATE employee_other_details 
        //             SET aadhaar_no='$aadharno', bank_name='$bankName', acc_no='$accountNumber', IFSC_code='$ifscNo',
        //                 state='$state', city='$city', pincode='$pincode', street_address='$streetAddress', date='$date', time='$time'
        //             WHERE user_id='$user_id'";
        //         $conn->query($sqlUpdateDetails);
        //     } else {
        //         $sqlInsertDetails = "INSERT INTO employee_other_details 
        //             (user_id, aadhaar_no, bank_name, acc_no, IFSC_code, state, city, pincode, street_address, date, time)
        //             VALUES 
        //             ('$user_id', '$aadharno', '$bankName', '$accountNumber', '$ifscNo', '$state', '$city', '$pincode', '$streetAddress', '$date', '$time')";
        //         $conn->query($sqlInsertDetails);
        //     }
        // }

        // echo json_encode([
        //     "status" => "success",
        //     "message" => "User updated successfully",
        //     "data" => ["data" => $name]
        // ]);
        break;



    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
