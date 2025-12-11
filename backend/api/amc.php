<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$amcId = $_GET['id'] ?? null;
$customerId = $_GET['customer_id'] ?? null;
$viewAMC = $_GET['view-amc'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);
$date = date("Y-m-d");
$time = date("H:i:s");

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        if ($amcId) {
            $amc_detail = $conn->query("SELECT amc.id,amc.amc_free_paid,amc.duration,amc.validity_from,amc.validity_upto,amc.other_duration,amc.visits_per_month,amc.pricing,amc.transport,amc.gst,amc.total,users.name,amc.customer_id FROM amc_details as amc INNER JOIN users ON amc.customer_id=users.id WHERE amc.id='$amcId'");
            $amc_data = [];
            while ($row = $amc_detail->fetch_assoc()) {
                $amc_data[] = $row;
            }
            // $customerId = $amc_detail['customer_id'];
            $grower_detail = $conn->query("SELECT amc_growers.grower_id,growers.system_type,growers.system_type_other,amc_growers.grower_qty,growers.grower_qty max_qty FROM amc_growers INNER JOIN growers ON amc_growers.grower_id=growers.id where amc_growers.amc_id='$amcId'");
            $grower_data = [];
            while ($row = $grower_detail->fetch_assoc()) {
                $grower_data[] = $row;
            }

            // $grower_options = $conn->query("SELECT growers.id,growers.system_type FROM users INNER JOIN growers ON users.id=growers.customer_id where growers.customer_id='$customerId'");
            // $grower_data = [];
            // while ($row = $grower_detail->fetch_assoc()) {
            //     $grower_data[] = $row;
            // }
            
            $consumable_detail = $conn->query("SELECT consum_master.id,consum_master.name,consum.other_consumable FROM amc_consumables as consum INNER JOIN consumables_master as consum_master ON consum.consumable_id=consum_master.id WHERE consum.amc_id='$amcId'");
            $consumable_data = [];
            while ($row = $consumable_detail->fetch_assoc()) {
                $consumable_data[] = $row;
            }
            echo json_encode(["status" => "success", "amc_data" => $amc_data, "grower_data" => $grower_data, "consumable_data" => $consumable_data]);
        }elseif ($customerId) {
            // $growerResult = $conn->query("SELECT growers.id,growers.system_type,growers.system_type_other FROM users INNER JOIN growers ON users.id=growers.customer_id where growers.customer_id='$customerId'");
            $growerResult = $conn->query("SELECT g.id, g.system_type, g.system_type_other, g.grower_qty AS total_grower_qty, IFNULL(SUM(ag.grower_qty), 0) AS used_grower_qty, (g.grower_qty - IFNULL(SUM(ag.grower_qty), 0)) AS remaining_grower_qty FROM growers g LEFT JOIN amc_growers ag ON ag.grower_id = g.id WHERE g.customer_id = '$customerId' GROUP BY g.id, g.system_type,g.system_type_other,g.grower_qty HAVING remaining_grower_qty > 0");
            $growerData = [];
            while ($row1 = $growerResult->fetch_assoc()) {
                $growerData[] = $row1;
            }
            echo json_encode(["status" => "success", "data" => $growerData]);
        }elseif ($viewAMC){
            // $result = $conn->query("SELECT u.id AS customer_id, u.name, u.phone, a.id as amc_id,a.amc_free_paid, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto");
            $result = $conn->query("SELECT u.id AS customer_id, u.name, u.phone, a.id AS amc_id, a.amc_free_paid, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (TIMESTAMPDIFF(MONTH, a.validity_from, a.validity_upto) * a.visits_per_month) AS total_allowed_visits, ((TIMESTAMPDIFF(MONTH, a.validity_from, a.validity_upto) * a.visits_per_month) - COUNT(s.id)) AS pending_visits, (SELECT COUNT(*) FROM site_visit sv WHERE sv.customer_id = u.id AND sv.created_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') AND sv.created_date < DATE_FORMAT(CURRENT_DATE + INTERVAL 1 MONTH, '%Y-%m-01')) AS current_month_visits_done, (a.visits_per_month - (SELECT COUNT(*) FROM site_visit sv WHERE sv.customer_id = u.id AND sv.created_date >= DATE_FORMAT(CURRENT_DATE, '%Y-%m-01') AND sv.created_date < DATE_FORMAT(CURRENT_DATE + INTERVAL 1 MONTH, '%Y-%m-01'))) AS remaining_visits_current_month FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto GROUP BY u.id, u.name, u.phone, a.id, a.amc_free_paid, a.visits_per_month, a.validity_from, a.validity_upto");
            $data = [];

            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success", "data" => $data]);
        }else{
            $result = $conn->query("SELECT g.id AS grower_id, g.customer_id, g.system_type, g.grower_qty, u.name, u.phone FROM growers g LEFT JOIN amc_growers ag ON ag.grower_id = g.id INNER JOIN users u ON g.customer_id = u.id WHERE u.status='active' and ag.id IS NULL GROUP BY u.name");
            // $result = $conn->query("SELECT u.id AS customer_id, u.name, u.phone, SUM(g.grower_qty) AS total_grower_qty, IFNULL(SUM(ag.used_qty), 0) AS used_grower_qty, (SUM(g.grower_qty) - IFNULL(SUM(ag.used_qty), 0)) AS remaining_grower_qty FROM users u INNER JOIN growers g ON g.customer_id = u.id LEFT JOIN ( SELECT grower_id, SUM(grower_qty) AS used_qty FROM amc_growers GROUP BY grower_id ) ag ON ag.grower_id = g.id WHERE u.status = 'active' GROUP BY u.id, u.name, u.phone HAVING remaining_grower_qty > 0;");
            $data = [];

            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }
            echo json_encode(["status" => "success", "data" => $data]);
        }
        
        break;
    
    case 'POST':
        $customerId = $_POST['customer_id'] ?? '';
        $amcFreePaid = $_POST['amc_free_paid'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $other_duration=$_POST['otherDuration'] ?? '';
        $visitsPerMonth = $_POST['visitsPerMonth'] ?? '';
        $validityFrom = $_POST['validityFrom'] ?? '';
        $validityUpto = $_POST['validityUpto'] ?? '';
        $pricing = $_POST['pricing'] ?? '';
        $transport = $_POST['transport'] ?? '';
        $gst = $_POST['gst'] ?? '';
        $other_consumable=$_POST['otherConsumable'] ?? '';

        $jsonGrowersQuantities = isset($_POST['grower_quantities']) ? $_POST['grower_quantities'] : '';
        $growers = json_decode($jsonGrowersQuantities, true);
        // $growerdata=var_dump($growers);
        
        $jsonConsumables = isset($_POST['consumables']) ? $_POST['consumables'] : '';
        $consumables = json_decode($jsonConsumables, true);
        // echo json_encode(["status" => "error", "grower_data" => $growers, "consumable" => $consumables]);
        $subtotal = $pricing+$transport;
        $gstAmount = ($subtotal * $gst) / 100;
        $total = round($subtotal + $gstAmount);
        
        $sql = "INSERT INTO amc_details (`customer_id`, `amc_free_paid`, `duration`, `other_duration`, `visits_per_month`, `validity_from`, `validity_upto`, `pricing`, `transport`, `gst`,`total`, `updated_by`, `created_date`, `created_time`) VALUES ('$customerId', '$amcFreePaid', '$duration', '$other_duration', '$visitsPerMonth', '$validityFrom', '$validityUpto', '$pricing', '$transport', '$gst', '$total', '1', '$date', '$time')";
        if ($conn->query($sql)) {
            $amc_id = $conn->insert_id;
            foreach ($growers as $growerId => $qty) {
                $sql1 = "INSERT INTO `amc_growers`(`amc_id`, `grower_id`, `grower_qty`) VALUES ('$amc_id','$growerId','$qty')";
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
        $amcFreePaid = $_POST['amc_free_paid'] ?? '';
        $duration = $_POST['duration'] ?? '';
        $other_duration = $_POST['otherDuration'] ?? '';
        $visitsPerMonth = $_POST['visitsPerMonth'] ?? '';
        $validityFrom = $_POST['validityFrom'] ?? '';
        $validityUpto = $_POST['validityUpto'] ?? '';
        $pricing = $_POST['pricing'] ?? '';
        $transport = $_POST['transport'] ?? '';
        $gst = $_POST['gst'] ?? '';
        $other_consumable = $_POST['otherConsumable'] ?? '';
        $sql1='';
        $jsonGrowersQuantities = isset($_POST['growerData']) ? $_POST['growerData'] : '';
        $growers_quantity = json_decode($jsonGrowersQuantities, true);
        // if(!empty($_POST['customDuration'])){
        //     $duration=$_POST['customDuration'];
        // }

        // $jsonGrowers = isset($_POST['growers']) ? $_POST['growers'] : '';
        // $growers = json_decode($jsonGrowers, true);
        // $growerdata=var_dump($growers);
        
        $jsonConsumables = isset($_POST['consumables']) ? $_POST['consumables'] : '';
        $consumables = json_decode($jsonConsumables, true);
        $subtotal = $pricing+$transport;
        $gstAmount = ($subtotal * $gst) / 100;
        $total = round($subtotal + $gstAmount);
        $sql = "UPDATE `amc_details` SET `amc_free_paid`='$amcFreePaid',`duration`='$duration',`other_duration`='$other_duration',`visits_per_month`='$visitsPerMonth',`validity_from`='$validityFrom',`validity_upto`='$validityUpto',`pricing`='$pricing',`transport`='$transport',`gst`='$gst',`total`='$total',`updated_by`='1',`updated_date`='$date',`updated_time`='$time' WHERE id='$amcId'";
        if ($conn->query($sql)) {
            foreach ($growers_quantity as $growersQty) {
                $amc_grower_sql = "UPDATE `amc_growers` SET `grower_qty`='{$growersQty['qty']}' WHERE amc_id='$amcId'";
                $conn->query($amc_grower_sql);
            }
            
            if (!empty($consumables)) {
                $conn->query("DELETE FROM amc_consumables WHERE amc_id='$amcId'");
            }
            foreach ($consumables as $index => $consumable) {
                if ($consumable === "9") {
                    $sql1 = "INSERT INTO amc_consumables (amc_id, consumable_id, other_consumable) 
                            VALUES ('$amcId', $consumable, '$other_consumable')";
                }else{
                    $sql1 = "INSERT INTO `amc_consumables`(`amc_id`, `consumable_id`, `other_consumable`) VALUES ('$amcId','$consumable','')";
                }
                $conn->query($sql1);
            }
            
        }
        echo json_encode(["status" => "success", "message" => "AMC updated successfully."]);

        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
