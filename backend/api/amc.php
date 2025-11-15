<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$amcId = $_GET['id'] ?? null;
$customerId = $_GET['customer_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);
$date = date("Y-m-d");
$time = date("H:i:s");

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        if ($amcId) {
            $amc_detail = $conn->query("SELECT amc.id,amc.duration,amc.validity_from,amc.validity_upto,amc.other_duration,amc.visits_per_month,amc.pricing,amc.transport,amc.gst,amc.total,users.name,amc.customer_id FROM amc_details as amc INNER JOIN users ON amc.customer_id=users.id WHERE amc.id='$amcId'");
            $amc_data = [];
            while ($row = $amc_detail->fetch_assoc()) {
                $amc_data[] = $row;
            }
            // $customerId = $amc_detail['customer_id'];
            $grower_detail = $conn->query("SELECT growers.id,growers.system_type,growers.system_type_other FROM amc_growers INNER JOIN growers ON amc_growers.grower_id=growers.id where amc_growers.amc_id='$amcId'");
            $grower_data = [];
            while ($row = $grower_detail->fetch_assoc()) {
                $grower_data[] = $row;
            }

            // $grower_options = $conn->query("SELECT growers.id,growers.system_type FROM users INNER JOIN growers ON users.id=growers.customer_id where growers.customer_id='$customerId'");
            // $grower_data = [];
            // while ($row = $grower_detail->fetch_assoc()) {
            //     $grower_data[] = $row;
            // }
            
            $consumable_detail = $conn->query("SELECT consum_master.id,consum_master.name FROM amc_consumables as consum INNER JOIN consumables_master as consum_master ON consum.consumable_id=consum_master.id WHERE consum.amc_id='$amcId'");
            $consumable_data = [];
            while ($row = $consumable_detail->fetch_assoc()) {
                $consumable_data[] = $row;
            }
            echo json_encode(["status" => "success", "amc_data" => $amc_data, "grower_data" => $grower_data, "consumable_data" => $consumable_data]);
        }elseif ($customerId) {
            $growerResult = $conn->query("SELECT growers.id,growers.system_type FROM users INNER JOIN growers ON users.id=growers.customer_id where growers.customer_id='$customerId'");
            $growerData = [];
            while ($row1 = $growerResult->fetch_assoc()) {
                $growerData[] = $row1;
            }
            echo json_encode(["status" => "success", "data" => $growerData]);
        }else{
            $result = $conn->query("SELECT users.name,users.phone,amc.id,amc.validity_upto,amc.visits_per_month FROM amc_details as amc INNER JOIN users ON users.id=amc.customer_id");
            $data = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success", "data" => $data]);
        }
        
        break;
    
    case 'POST':
        $customerId = $_POST['customer_id'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $other_duration=$_POST['otherDuration'] ?? '';
        $visitsPerMonth = $_POST['visitsPerMonth'] ?? '';
        $validityFrom = $_POST['validityFrom'] ?? '';
        $validityUpto = $_POST['validityUpto'] ?? '';
        $pricing = $_POST['pricing'] ?? '';
        $transport = $_POST['transport'] ?? '';
        $gst = $_POST['gst'] ?? '';
        $other_consumable=$_POST['otherConsumable'] ?? '';

        $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';
        $growers = json_decode($jsonGrowers, true);
        // $growerdata=var_dump($growers);
        
        $jsonConsumables = isset($_POST['consumables']) ? $_POST['consumables'] : '';
        $consumables = json_decode($jsonConsumables, true);
        // echo json_encode(["status" => "error", "grower_data" => $growers, "consumable" => $consumables]);
        $subtotal = $pricing+$transport;
        $gstAmount = ($subtotal * $gst) / 100;
        $total = round($subtotal + $gstAmount);
        $sql = "INSERT INTO amc_details (`customer_id`, `duration`, `other_duration`, `visits_per_month`, `validity_from`, `validity_upto`, `pricing`, `transport`, `gst`,`total`, `updated_by`, `created_at`, `updated_at`) VALUES ('$customerId', '$duration', '$other_duration', '$visitsPerMonth', '$validityFrom', '$validityUpto', '$pricing', '$transport', '$gst', '$total', '1', '$date', '$time')";
        if ($conn->query($sql)) {
            $amc_id = $conn->insert_id;
            foreach ($growers as $index => $grower) {
                $sql1 = "INSERT INTO `amc_growers`(`amc_id`, `grower_id`) VALUES ('$amc_id','$grower')";
                $conn->query($sql1);
            }
            foreach ($consumables as $index => $consumable) {
                // If this is the "other" option
                if ($consumable === "9") {
                    $sql1 = "INSERT INTO amc_consumables (amc_id, consumable_id, other_consumable) 
                            VALUES ('$amc_id', $consumable, '$other_consumable')";
                }else{
                    $sql1 = "INSERT INTO `amc_consumables`(`amc_id`, `consumable_id`, `other_consumable`) VALUES ('$amc_id','$consumable','')";
                }
                $conn->query($sql1);
            }
            
        }
        echo json_encode(["status" => "success", "message" => "AMC created successfully"]);

        break;

    case 'PUT':
        $amcId = $_POST['id'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $other_duration = $_POST['otherDuration'] ?? '';
        $visitsPerMonth = $_POST['visitsPerMonth'] ?? '';
        $validityFrom = $_POST['validityFrom'] ?? '';
        $validityUpto = $_POST['validityUpto'] ?? '';
        $pricing = $_POST['pricing'] ?? '';
        $transport = $_POST['transport'] ?? '';
        $gst = $_POST['gst'] ?? '';
        $other_consumable = $_POST['otherConsumable'] ?? '';
        // if(!empty($_POST['customDuration'])){
        //     $duration=$_POST['customDuration'];
        // }
        // $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';
        // $growers = json_decode($jsonGrowers, true);
        // $growerdata=var_dump($growers);
        
        // $jsonConsumables = isset($_POST['consumables']) ? $_POST['consumables'] : '';
        // $consumables = json_decode($jsonConsumables, true);
        // echo json_encode(["status" => "error", "grower_data" => $growers, "consumable" => $consumables]);
        $subtotal = $pricing+$transport;
        $gstAmount = ($subtotal * $gst) / 100;
        $total = round($subtotal + $gstAmount);
        $sql = "INSERT INTO amc_details (`customer_id`, `duration`, `other_duration`, `visits_per_month`, `validity_from`, `validity_upto`, `pricing`, `transport`, `gst`,`total`, `updated_by`, `created_at`, `updated_at`) VALUES ('$amcId', '$duration','$other_duration', '$visitsPerMonth', '$validityFrom', '$validityUpto', '$pricing', '$transport', '$gst', '$total', '1', '$date', '$time')";
        if ($conn->query($sql)) {
            foreach ($growers as $index => $grower) {
                $sql1 = "INSERT INTO `amc_growers`(`amc_id`, `grower_id`) VALUES ('$amc_id','$grower')";
                $conn->query($sql1);
            }
            foreach ($consumables as $index => $consumable) {
                $sql1 = "INSERT INTO `amc_consumables`(`amc_id`, `consumable_id`) VALUES ('$amc_id','$consumable')";
                $conn->query($sql1);
            }
            
        }
        echo json_encode(["status" => "error", "message" => "AMC updated successfully."]);

        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
