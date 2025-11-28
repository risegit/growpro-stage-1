<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['id'] ?? null;
$emailId = $_GET['email'] ?? null;
$viewVisit = $_GET['view-visit'] ?? null;
$userCode = $_GET['user_code'] ?? null;
$scheduleVisit = $_GET['schedule_visit'] ?? null;
$chkScheduleVisit = $_GET['chkScheduleVisit'] ?? null;
$techId = $_GET['techId'] ?? null;
$viewScheduleVisit = $_GET['view-schedule-visit'] ?? null;
$editSiteVisit = $_GET['editSiteVisit'] ?? null;
$schId = $_GET['schId'] ?? null;

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
        }elseif ($viewScheduleVisit) {
            if (!empty($userCode)) {
                if (str_starts_with($userCode, 'TC')) {
                    $whereClause = "WHERE sch.technician_id= '$techId'";
                } elseif (str_starts_with($userCode, 'AD') || str_starts_with($userCode, 'MN')) {
                    $whereClause = '';
                }
            }
            $result = $conn->query("SELECT sch.id,sch.visit_date,sch.visit_time,sch.status,u.id customer_id,u.name as customer_name,u.phone customer_phone,t.name technician_name FROM site_visit_schedule sch INNER JOIN users u ON sch.customer_id=u.id INNER JOIN users t ON sch.technician_id=t.id $whereClause order by sch.id DESC");
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success","data" => $data]);

        }elseif ($viewVisit) {
            if (!empty($userCode)) {
                if (str_starts_with($userCode, 'TC')) {
                    $whereClause = "WHERE sv.visited_by = '$userCode'";
                } elseif (str_starts_with($userCode, 'AD') || str_starts_with($userCode, 'MN')) {
                    $whereClause = '';
                }
            }

            $sql1 = "SELECT u.id AS customer_id, u.name AS customer_name, u.profile_pic, u.phone, tech.id AS technician_id, tech.name AS technician_name,sv.id site_visit_id,sv.visited_by, sv.created_date FROM site_visit sv INNER JOIN users u ON sv.customer_id = u.id LEFT JOIN users tech ON sv.visited_by = tech.user_code $whereClause Order By sv.id DESC;";
            $result = $conn->query($sql1);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);
        }elseif ($chkScheduleVisit) {
            if (!empty($userCode)) {
                if (str_starts_with($userCode, 'TC')) {
                    $whereClause = "WHERE sch.technician_id = '$techId' and sch.status='scheduled'";
                } elseif (str_starts_with($userCode, 'AD') || str_starts_with($userCode, 'MN')) {
                    $whereClause = 'WHERE sch.status="scheduled"';
                }
            }

            $sql1 = "SELECT u.id as customer_id,u.name,u.phone,sch.id schedule_id,sch.technician_id,sch.visit_time,t.name AS technician_name,t.user_code AS tech_code FROM site_visit_schedule sch INNER JOIN users u ON sch.customer_id=u.id INNER JOIN users t ON sch.technician_id = t.id $whereClause Order By sch.id DESC;";
            $result = $conn->query($sql1);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);
        }elseif ($editSiteVisit) {
            if (!empty($userCode)) {
                if (str_starts_with($userCode, 'TC')) {
                    $whereClause = "WHERE sv.visited_by = '$userCode'";
                } elseif (str_starts_with($userCode, 'AD') || str_starts_with($userCode, 'MN')) {
                    $whereClause = '';
                }
            }

            $sql1 = "SELECT sv.id,sv.schedule_id,sv.are_plants_getting_water,sv.water_above_pump,sv.timer_working,sv.timer_issue,sv.motor_working,sv.motor_issue,sv.light_working,sv.light_issue,sv.equipment_damaged,sv.damaged_items,sv.any_leaks,sv.clean_equipment,sv.electric_connections_secured,sv.initial_ph,sv.corrected_ph,sv.initial_tds,sv.corrected_tds,sv.presence_of_pests,sv.nutrient_deficiency,sv.deficiency_details,sv.which_crop,sv.client_training_harvest,sv.pest_management,sv.equipment_cleaning,sv.plant_maintenance,sv.scope_of_improvement,sv.material_supplied_neemoil,sv.material_delivered_neemoil,sv.material_needs_delivery,u.name customer_name FROM site_visit sv INNER JOIN users u ON sv.customer_id=u.id WHERE sv.id='$schId'";
            $result = $conn->query($sql1);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            $sql2 = "SELECT * FROM site_visit_plant_problems WHERE visit_id='$schId'";
            $result2 = $conn->query($sql2);
            $plant_problems = [];
            while ($row = $result2->fetch_assoc()) {
                $plant_problems[] = $row;
            }

            $sql3 = "SELECT * FROM site_visit_presence_of_pests WHERE visit_id='$schId'";
            $result3 = $conn->query($sql3);
            $pest_types = [];
            while ($row = $result3->fetch_assoc()) {
                $pest_types[] = $row;
            }

            $sql4 = "SELECT * FROM site_visit_material_supplied_plants WHERE visit_id='$schId'";
            $result4 = $conn->query($sql4);
            $supplied_plants = [];
            while ($row = $result4->fetch_assoc()) {
                $supplied_plants[] = $row;
            }

            $sql5 = "SELECT * FROM site_visit_material_supplied_chargeable_items WHERE visit_id='$schId'";
            $result5 = $conn->query($sql5);
            $supplied_chargeable_item = [];
            while ($row = $result5->fetch_assoc()) {
                $supplied_chargeable_item[] = $row;
            }

            $sql6 = "SELECT * FROM site_visit_material_supplied_nutrients WHERE visit_id='$schId'";
            $result6 = $conn->query($sql6);
            $supplied_nutrients = [];
            while ($row = $result6->fetch_assoc()) {
                $supplied_nutrients[] = $row;
            }

            $sql7 = "SELECT * FROM site_visit_photos WHERE visit_id='$schId'";
            $result7 = $conn->query($sql7);
            $supplied_photo_setup = [];
            while ($row = $result7->fetch_assoc()) {
                $supplied_photo_setup[] = $row;
            }

            $sql8 = "SELECT * FROM site_visit_material_need_plants WHERE visit_id='$schId'";
            $result8 = $conn->query($sql8);
            $need_plants = [];
            while ($row = $result8->fetch_assoc()) {
                $need_plants[] = $row;
            }

            $sql9 = "SELECT * FROM site_visit_material_need_nutrients WHERE visit_id='$schId'";
            $result9 = $conn->query($sql9);
            $need_nutrients = [];
            while ($row = $result9->fetch_assoc()) {
                $need_nutrients[] = $row;
            }

            $sql10 = "SELECT * FROM site_visit_material_need_chargeable_items WHERE visit_id='$schId'";
            $result10 = $conn->query($sql10);
            $need_chargeable_item = [];
            while ($row = $result10->fetch_assoc()) {
                $need_chargeable_item[] = $row;
            }

            echo json_encode(["status" => "success","data" => $data, "plantProblems" => $plant_problems, "pestTypes" => $pest_types, "suppliedPlants" => $supplied_plants, "suppliedChargeableItem" => $supplied_chargeable_item, "suppliedNutrients" => $supplied_nutrients, "suppliedPhotoSetup" => $supplied_photo_setup, "needPlants" => $need_plants, "needNutrients" => $need_nutrients, "needChargeableItem" => $need_chargeable_item]);
        } else {
            // SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto -- AMC still active GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0; 
            // This query count Total_visit and pending_visit

            $sql1 = "SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0";
            $result = $conn->query($sql1);
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            $sql2 = "SELECT * FROM `users` WHERE role='technician' AND status='active'";
            $result2 = $conn->query($sql2);
            $technician = [];
            while ($row2 = $result2->fetch_assoc()) {
                $technician[] = $row2;
            }

            echo json_encode(["status" => "success","data" => $data,"technician" => $technician]);
        }

        
        break;


    case 'POST':
        if(empty($scheduleVisit)){
            //Visual Observation
            $scheduleId = $_POST['schedule_id'] ?? '';
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
            $userCode = $_POST['user_code'] ?? '';

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
            $sqlSchedule = "SELECT * FROM `site_visit_schedule` WHERE id='$scheduleId'";
            $scheduleResult = $conn->query($sqlSchedule);

            if ($scheduleResult && $scheduleResult->num_rows > 0) {
                $scheduleRow = $scheduleResult->fetch_assoc();
                $customerId = $scheduleRow['customer_id'];
            }else{
                echo json_encode(["status" => "error", "message" => "Invalid schedule ID"]);
                exit;
            }
            $sql = "INSERT INTO `site_visit`(`schedule_id`,`customer_id`, `visited_by`, `are_plants_getting_water`, `water_above_pump`, `timer_working`,`timer_issue`, `motor_working`, `motor_issue`, `light_working`, `light_issue`, `equipment_damaged`, `damaged_items`, `any_leaks`, `clean_equipment`, `electric_connections_secured`, `initial_ph`, `corrected_ph`, `initial_tds`, `corrected_tds`, `presence_of_pests`, `nutrient_deficiency`, `deficiency_details`, `which_crop`, `client_training_harvest`, `pest_management`, `equipment_cleaning`, `plant_maintenance`, `scope_of_improvement`, `material_supplied_neemoil`, `material_needs_delivery`, `created_date`, `created_time`) VALUES ('$scheduleId','$customerId','$userCode','$plantsWater','$waterAbovePump','$timerWorking','$timerIssue','$motorWorking','$motorIssue','$lightsWorking','$lightsIssue','$equipmentDamaged','$equipmentDamageDetails','$anyLeaks','$cleanEnvironment','$electricSecured','$initialPh','$correctedPh','$initialTds','$correctedTds','$pestsPresent','$nutrientDeficiency','$deficiencyDetails','$cropNames','$harvestTraining','$pestManagement','$equipmentCleaning','$plantMaintenance','$scopesOfImprovement','$material_supplied_neemoil','$materialNeedsDelivery','$date','$time')";
            // echo json_encode(["status" => "success", "message" => $sql]);
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
                // echo json_encode(["status" => "success", "message" => $sql2]);
                foreach ($plant_problems as $plantProblem) {
                    $sql3 = "INSERT INTO `site_visit_plant_problems`(`visit_id`, `problem_name`, `other_problem_name`) VALUES ('$visit_id','$plantProblem','')";
                    $conn->query($sql3);
                }
                // echo json_encode(["status" => "success", "message" => $sql3]);
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
                // echo json_encode(["status" => "success", "message" => $sql5]);
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
                $updateScheduleStatus = "UPDATE `site_visit_schedule` SET `status`='completed' WHERE id='$scheduleId'";
                $conn->query($updateScheduleStatus);

                $chk=!empty($materialNeedsDelivery);
                // echo json_encode(["status" => "success", "message" => $chk]);
                if(!empty($materialNeedsDelivery)){
                    $sql8 = "UPDATE `site_visit` SET `material_delivered_neemoil`='$material_need_neemoil' WHERE id='$visit_id'";
                    // echo json_encode(["status" => "success", "sql8" => $sql8]);
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
            echo json_encode(["status" => "success", "message" => "Site visit recorded successfully"]);
        }else{
            $customerId = $_POST['customers'] ?? '';
            $technicianId = $_POST['technicians'] ?? '';
            $visitDate = $_POST['visitDate'] ?? '';
            $visitTime = $_POST['visitTime'] ?? '';
            $data = $customerId.','.$technicianId.','.$visitDate.','.$visitTime;
            $sql = "SELECT * FROM `site_visit_schedule` WHERE customer_id='$customerId' AND technician_id='$technicianId' AND visit_date='$visitDate' AND visit_time='$visitTime'";

            if($conn->query($sql)->num_rows > 0){
                echo json_encode(["status" => "error", "message" => "This visit is already scheduled. Please choose a different date/time."]);
                exit;
            }

            $sql1 = "INSERT INTO `site_visit_schedule`(`customer_id`, `technician_id`, `visit_date`, `visit_time`, `created_by`, `created_date`, `created_time`) VALUES ('$customerId','$technicianId','$visitDate','$visitTime','$userId','$date','$time')";
            $conn->query($sql1);

            echo json_encode(["status" => "success", "message" => "Site visit scheduled successfully"]);
        }

        

        break;

    
    case 'PUT':
            //Visual Observation
            $scheduleId = $_POST['schedule_id'] ?? '';
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
            $userCode = $_POST['user_code'] ?? '';

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
            $sqlSchedule = "SELECT * FROM `site_visit_schedule` WHERE id='$scheduleId'";
            $scheduleResult = $conn->query($sqlSchedule);

            if ($scheduleResult && $scheduleResult->num_rows > 0) {
                $scheduleRow = $scheduleResult->fetch_assoc();
                $customerId = $scheduleRow['customer_id'];
            }else{
                echo json_encode(["status" => "error", "message" => "Invalid schedule ID"]);
                exit;
            }
            $sql = "INSERT INTO `site_visit`(`schedule_id`,`customer_id`, `visited_by`, `are_plants_getting_water`, `water_above_pump`, `timer_working`,`timer_issue`, `motor_working`, `motor_issue`, `light_working`, `light_issue`, `equipment_damaged`, `damaged_items`, `any_leaks`, `clean_equipment`, `electric_connections_secured`, `initial_ph`, `corrected_ph`, `initial_tds`, `corrected_tds`, `presence_of_pests`, `nutrient_deficiency`, `deficiency_details`, `which_crop`, `client_training_harvest`, `pest_management`, `equipment_cleaning`, `plant_maintenance`, `scope_of_improvement`, `material_supplied_neemoil`, `material_needs_delivery`, `created_date`, `created_time`) VALUES ('$scheduleId','$customerId','$userCode','$plantsWater','$waterAbovePump','$timerWorking','$timerIssue','$motorWorking','$motorIssue','$lightsWorking','$lightsIssue','$equipmentDamaged','$equipmentDamageDetails','$anyLeaks','$cleanEnvironment','$electricSecured','$initialPh','$correctedPh','$initialTds','$correctedTds','$pestsPresent','$nutrientDeficiency','$deficiencyDetails','$cropNames','$harvestTraining','$pestManagement','$equipmentCleaning','$plantMaintenance','$scopesOfImprovement','$material_supplied_neemoil','$materialNeedsDelivery','$date','$time')";
            // echo json_encode(["status" => "success", "message" => $sql]);
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
                // echo json_encode(["status" => "success", "message" => $sql2]);
                foreach ($plant_problems as $plantProblem) {
                    $sql3 = "INSERT INTO `site_visit_plant_problems`(`visit_id`, `problem_name`, `other_problem_name`) VALUES ('$visit_id','$plantProblem','')";
                    $conn->query($sql3);
                }
                // echo json_encode(["status" => "success", "message" => $sql3]);
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
                // echo json_encode(["status" => "success", "message" => $sql5]);
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
                $updateScheduleStatus = "UPDATE `site_visit_schedule` SET `status`='completed' WHERE id='$scheduleId'";
                $conn->query($updateScheduleStatus);

                $chk=!empty($materialNeedsDelivery);
                // echo json_encode(["status" => "success", "message" => $chk]);
                if(!empty($materialNeedsDelivery)){
                    $sql8 = "UPDATE `site_visit` SET `material_delivered_neemoil`='$material_need_neemoil' WHERE id='$visit_id'";
                    // echo json_encode(["status" => "success", "sql8" => $sql8]);
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
            echo json_encode(["status" => "success", "message" => "Site visit recorded successfully"]);
        
        break;



    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
