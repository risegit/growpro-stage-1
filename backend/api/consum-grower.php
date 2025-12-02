<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$customerId = $_GET['customer_id'] ?? null;
$amcId = $_GET['amc_id'] ?? null;
$input = json_decode(file_get_contents("php://input"), true);
$date = date("Y-m-d");
$time = date("H:i:s");

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        $grower_data = [];
        $result = $conn->query("SELECT * FROM consumables_master");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        if($amcId){
            $grower_result = $conn->query("SELECT amc_growers.grower_id,growers.system_type,growers.system_type_other,growers.grower_qty FROM amc_growers INNER JOIN growers ON amc_growers.grower_id=growers.id where amc_growers.amc_id='$amcId'");
            while ($row = $grower_result->fetch_assoc()) {
                $grower_data[] = $row;
            }
        }
        echo json_encode(["status" => "success", "data" => $data, "grower_data" => $grower_data]);
        
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>