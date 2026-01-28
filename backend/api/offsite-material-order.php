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
$techId = $_GET['techId'] ?? null;
$editSiteVisit = $_GET['editSiteVisit'] ?? null;
$schId = $_GET['schId'] ?? null;
$chkScheduleVisit = $_GET['chkScheduleVisit'] ?? null;


if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$date = date("Y-m-d");
$time = date("H:i:s");

switch ($method) {

    case 'GET':

        $offsite_id = $_GET['offsite_id'] ?? 0;

        if (empty($offsite_id)) {
            echo json_encode([
                "status" => "error",
                "message" => "offsite_id is required"
            ]);
            exit;
        }
        $sqlMain = "SELECT omd.id, omd.customer_id, omd.material_delivered_neemoil, omd.delivery_status, omd.created_date, omd.created_time, omd.created_by, u.name FROM offsite_material_deliver omd INNER JOIN users u ON omd.customer_id=u.id WHERE omd.id = '$offsite_id' LIMIT 1";

        $resMain = $conn->query($sqlMain);

        if ($resMain->num_rows === 0) {
            echo json_encode([
                "status" => "error",
                "message" => "Record not found"
            ]);
            exit;
        }

        $offsite = $resMain->fetch_assoc();

        // ===============================
        // MATERIALS (PLANTS)
        // ===============================
        $materials = [];
        $sqlPlants = "SELECT id, plant_name AS material_name, other_plant_name AS material_type, quantity FROM offsite_material_need_plants WHERE offsite_id = '$offsite_id'";

        $resPlants = $conn->query($sqlPlants);
        while ($row = $resPlants->fetch_assoc()) {
            $materials[] = $row;
        }

        // ===============================
        // NUTRIENTS
        // ===============================
        $nutrients = [];
        $sqlNutrients = "SELECT id, nutrient_type AS type, tank_capacity, topups, other_nutrient_name, other_tank_capacity FROM offsite_material_need_nutrients WHERE offsite_id = '$offsite_id'";

        $resNutrients = $conn->query($sqlNutrients);
        while ($row = $resNutrients->fetch_assoc()) {
            $nutrients[] = $row;
        }

        // ===============================
        // CHARGEABLE ITEMS
        // ===============================
        $chargeableItems = [];
        $sqlItems = "SELECT id, item_name, quantity FROM offsite_material_need_chargeable_items WHERE offsite_id = '$offsite_id'";

        $resItems = $conn->query($sqlItems);
        while ($row = $resItems->fetch_assoc()) {
            $chargeableItems[] = $row;
        }

        $sqlOffsiteMaterialDeliver = "SELECT * FROM offsite_material_deliver WHERE id='$offsite_id'";
        $resOffsiteMaterialDeliver = $conn->query($sqlOffsiteMaterialDeliver);
        $offsiteMaterialDeliver = [];
        while ($row = $resOffsiteMaterialDeliver->fetch_assoc()) {
            $offsiteMaterialDeliver[]=$row;
        }

        // ===============================
        // FINAL RESPONSE
        // ===============================
        echo json_encode([
            "status" => "success",
            "data" => [
                "offsite"          => $offsite,
                "materials"        => $materials,
                "nutrients"        => $nutrients,
                "chargeable_items" => $chargeableItems,
                "offsiteMaterialDeliver" => $offsiteMaterialDeliver
            ]
        ]);
        exit;

    break;


    case 'POST':

        // ===============================
        // BASIC DATA
        // ===============================
        $userId = $_POST['id'] ?? '';
        $customerId = $_POST['customer_id'] ?? '';
        // $visitedBy  = $_POST['visited_by'] ?? '';
        $needsNeemOil = $_POST['needs_neem_oil'] ?? false;

        // Decode JSON arrays from $_POST
        $materials = isset($_POST['materials'])
            ? json_decode($_POST['materials'], true)
            : [];

        $nutrients = isset($_POST['nutrients'])
            ? json_decode($_POST['nutrients'], true)
            : [];

        $chargeableItems = isset($_POST['chargeable_items'])
            ? json_decode($_POST['chargeable_items'], true)
            : [];

        // Normalize neem oil value
        $needsNeemOil = ($needsNeemOil === true || $needsNeemOil === "true" || $needsNeemOil == 1)
            ? 'yes'
            : 'no';

        // if (empty($scheduleId) || empty($customerId)) {
        //     echo json_encode([
        //         "status" => "error",
        //         "message" => "schedule_id and customer_id are required"
        //     ]);
        //     exit;
        // }

        // ===============================
        // INSERT SITE VISIT
        // ===============================
        $sqlVisit = "
            INSERT INTO offsite_material_deliver
            (customer_id, technician_id, material_delivered_neemoil, delivery_status, created_date, created_time, created_by)
            VALUES
            ('$customerId', 'null', '$needsNeemOil', 'no','$date', '$time','$userId')
        ";

        if (!$conn->query($sqlVisit)) {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to insert site visit",
                "error" => $conn->error
            ]);
            exit;
        }

        $offsite_id = $conn->insert_id;

        // ===============================
        // MATERIALS (PLANTS)
        // ===============================
        if (is_array($materials)) {
            foreach ($materials as $material) {

                $plantType = $material['material_type'] == 'Others' ? $material['material_type'] : '';
                $plantName = $material['material_name'] ?? '';
                $qty       = $material['quantity'] ?? 0;

                // if (empty($plantType) || empty($qty)) continue;               
                
                $sql = "
                    INSERT INTO offsite_material_need_plants
                    (offsite_id, plant_name, other_plant_name, quantity)
                    VALUES
                    ('$offsite_id', '$plantName', '$plantType', '$qty')
                ";

                $conn->query($sql);
            }
        }

        // ===============================
        // NUTRIENTS
        // ===============================
        if (is_array($nutrients)) {
            foreach ($nutrients as $nutrient) {

                $type         = $nutrient['type'] ?? '';
                $tankCapacity = $nutrient['tank_capacity'] ?? '';
                $topups       = $nutrient['topups'] ?? '';

                if (empty($type)) continue;

                $sql = "
                    INSERT INTO offsite_material_need_nutrients
                    (offsite_id, nutrient_type, tank_capacity, topups)
                    VALUES
                    ('$offsite_id', '$type', '$tankCapacity', '$topups')
                ";

                $conn->query($sql);
            }
        }

        // ===============================
        // CHARGEABLE ITEMS
        // ===============================
        if (is_array($chargeableItems)) {
            foreach ($chargeableItems as $item) {

                $itemName = $item['item_name'] ?? '';
                $qty      = $item['quantity'] ?? 0;

                if (empty($itemName) || empty($qty)) continue;

                $sql = "
                    INSERT INTO offsite_material_need_chargeable_items
                    (offsite_id, item_name, quantity)
                    VALUES
                    ('$offsite_id', '$itemName', '$qty')
                ";

                $conn->query($sql);
            }
        }

        echo json_encode([
            "status"   => "success",
            "message"  => "Offsite Material Order recorded successfully"
        ]);
        exit;

    break;

    
    case 'PUT':

        // ===============================
        // BASIC DATA
        // ===============================
        $offsite_id = $_POST['offsite_id'] ?? 0;
        $userId     = $_POST['user_id'] ?? '';
        $customerId = $_POST['customer_id'] ?? '';
        $needsNeemOil = $_POST['material_delivered_neemoil'] ?? false;
        $delivery_note = $_POST["delivery_note"] ?? '';
        $delivery_status = $_POST["delivery_status"] ?? '';

        // Decode JSON arrays
        $materials = isset($_POST['materials'])
            ? json_decode($_POST['materials'], true)
            : [];

        $nutrients = isset($_POST['nutrients'])
            ? json_decode($_POST['nutrients'], true)
            : [];

        $chargeableItems = isset($_POST['chargeable_items'])
            ? json_decode($_POST['chargeable_items'], true)
            : [];

        if (empty($offsite_id)) {
            echo json_encode([
                "status" => "error",
                "message" => "offsite_id is required"
            ]);
            exit;
        }

        $sqlUpdate = "UPDATE offsite_material_deliver SET customer_id = '$customerId', material_delivered_neemoil = '$needsNeemOil',`delivery_status`='$delivery_status',`delivery_note`='$delivery_note', updated_date = '$date', updated_time = '$time', created_by = '$userId' WHERE id = '$offsite_id' ";
        
        if (!$conn->query($sqlUpdate)) {
            echo json_encode([
                "status" => "error",
                "message" => "Failed to update offsite material",
                "error" => $conn->error
            ]);
            exit;
        }

        // ===============================
        // CLEAR OLD CHILD RECORDS
        // ===============================
        $conn->query("DELETE FROM offsite_material_need_plants WHERE offsite_id = '$offsite_id'");
        $conn->query("DELETE FROM offsite_material_need_nutrients WHERE offsite_id = '$offsite_id'");
        $conn->query("DELETE FROM offsite_material_need_chargeable_items WHERE offsite_id = '$offsite_id'");

        // ===============================
        // RE-INSERT MATERIALS (PLANTS)
        // ===============================
        if (is_array($materials)) {
            foreach ($materials as $material) {

                $plantType = ($material['material_type'] ?? '') === 'Others'
                    ? $material['material_type']
                    : '';

                $plantName = $material['material_name'] ?? '';
                $qty       = $material['quantity'] ?? 0;

                if (empty($plantName) || empty($qty)) continue;

                $sql = "
                    INSERT INTO offsite_material_need_plants
                    (offsite_id, plant_name, other_plant_name, quantity)
                    VALUES
                    ('$offsite_id', '$plantName', '$plantType', '$qty')
                ";

                $conn->query($sql);
            }
        }

        // ===============================
        // RE-INSERT NUTRIENTS
        // ===============================
        if (is_array($nutrients)) {
            foreach ($nutrients as $nutrient) {

                $type         = $nutrient['type'] ?? '';
                $tankCapacity = $nutrient['tank_capacity'] ?? 0;
                $topups       = $nutrient['topups'] ?? 0;

                if (empty($type)) continue;

                $sql = "
                    INSERT INTO offsite_material_need_nutrients
                    (offsite_id, nutrient_type, tank_capacity, topups)
                    VALUES
                    ('$offsite_id', '$type', '$tankCapacity', '$topups')
                ";

                $conn->query($sql);
            }
        }

        // ===============================
        // RE-INSERT CHARGEABLE ITEMS
        // ===============================
        if (is_array($chargeableItems)) {
            foreach ($chargeableItems as $item) {

                $itemName = $item['item_name'] ?? '';
                $qty      = $item['quantity'] ?? 0;

                if (empty($itemName) || empty($qty)) continue;

                $sql = "
                    INSERT INTO offsite_material_need_chargeable_items
                    (offsite_id, item_name, quantity)
                    VALUES
                    ('$offsite_id', '$itemName', '$qty')
                ";

                $conn->query($sql);
            }
        }

        
        echo json_encode([
            "status"     => "success",
            "message"    => "Offsite Material Order updated successfully"
        ]);
        exit;

    break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
