<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$amcId = $_GET['id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);
$date = date("Y-m-d");
$time = date("H:i:s");

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        if ($amcId) {
            $amc_detail = $conn->query("SELECT amc.id,amc.duration,amc.validity_from,amc.validity_upto,amc.duration_other,amc.visits_per_month,amc.pricing,amc.transport,amc.gst,amc.total,users.name FROM amc_details as amc INNER JOIN users ON amc.customer_id=users.id WHERE amc.id='$amcId'");
            $amc_data = [];
            while ($row = $amc_detail->fetch_assoc()) {
                $amc_data[] = $row;
            }
            $consumable_detail = $conn->query("SELECT consum_master.id,consum_master.name FROM amc_consumables as consum INNER JOIN consumables_master as consum_master ON consum.consumable_id=consum_master.id WHERE consum.amc_id='$amcId'");
            $consumable_data = [];
            while ($row = $consumable_detail->fetch_assoc()) {
                $consumable_data[] = $row;
            }
            echo json_encode(["status" => "success", "amc_data" => $amc_data, "consumable_data" => $consumable_data]);
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
        $customerId = $_POST['customer'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $visitsPerMonth = $_POST['visitsPerMonth'] ?? '';
        $validityFrom = $_POST['validityFrom'] ?? '';
        $validityUpto = $_POST['validityUpto'] ?? '';
        $pricing = $_POST['pricing'] ?? '';
        $transport = $_POST['transport'] ?? '';
        $gst = $_POST['gst'] ?? '';
        if(!empty($_POST['customDuration'])){
            $duration=$_POST['customDuration'];
        }
        $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';
        $growers = json_decode($jsonGrowers, true);
        // $growerdata=var_dump($growers);
        
        $jsonConsumables = isset($_POST['consumables']) ? $_POST['consumables'] : '';
        $consumables = json_decode($jsonConsumables, true);
        // echo json_encode(["status" => "error", "grower_data" => $growers, "consumable" => $consumables]);
        $subtotal = $pricing+$transport;
        $gstAmount = ($subtotal * $gst) / 100;
        $total = round($subtotal + $gstAmount);
        $sql = "INSERT INTO amc_details (`customer_id`, `duration`, `visits_per_month`, `validity_from`, `validity_upto`, `pricing`, `transport`, `gst`,`total`, `updated_by`, `created_at`, `updated_at`) VALUES ('$customerId', '$duration', '$visitsPerMonth', '$validityFrom', '$validityUpto', '$pricing', '$transport', '$gst', '$total', '1', '$date', '$time')";
        if ($conn->query($sql)) {
            $amc_id = $conn->insert_id;
            foreach ($growers as $index => $grower) {
                $sql1 = "INSERT INTO `amc_growers`(`amc_id`, `grower_id`) VALUES ('$amc_id','$grower')";
                $conn->query($sql1);
            }
            foreach ($consumables as $index => $consumable) {
                $sql1 = "INSERT INTO `amc_consumables`(`amc_id`, `consumable_id`) VALUES ('$amc_id','$consumable')";
                $conn->query($sql1);
            }
            
        }
        echo json_encode(["status" => "error", "message" => "Customer Already Exist123".'==userstatus='.$subtotal.'===sql='.$sql1]);

        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
