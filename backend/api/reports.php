<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['user_id'] ?? null;

$reportType = $_GET['report_type'] ?? '';
$startDate  = $_GET['start_date'] ?? '';
$endDate    = $_GET['end_date'] ?? '';

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$date = date("Y-m-d");
$time = date("H:i:s");

switch ($method) {

    case 'GET':
        if ($userId) {
            if($reportType=='RAW Material'){
                $sql1 = "SELECT u.name,sv.id,sn.nutrient_type,sn.tank_capacity,sn.topups,sn.other_nutrient_name,sn.other_tank_capacity FROM site_visit sv INNER JOIN site_visit_material_supplied_nutrients sn ON sv.id=sn.visit_id INNER JOIN users u ON u.id=sv.customer_id WHERE sv.created_date BETWEEN '$startDate' and '$endDate' and u.status='active'";
                $result1 = $conn->query($sql1);

                $supplied_nutrients = [];
                while ($row = $result1->fetch_assoc()) {
                    $supplied_nutrients[] = $row;
                }

                $sql2 = "SELECT u.name,sv.id,nn.nutrient_type,nn.tank_capacity,nn.topups,nn.other_nutrient_name,nn.other_tank_capacity FROM site_visit sv INNER JOIN site_visit_material_need_nutrients nn ON sv.id=nn.visit_id INNER JOIN users u ON u.id=sv.customer_id WHERE sv.created_date BETWEEN '$startDate' and '$endDate' and u.status='active'";
                $result2 = $conn->query($sql2);

                $need_nutrients = [];
                while ($row = $result2->fetch_assoc()) {
                    $need_nutrients[] = $row;
                }

                echo json_encode([
                    "status" => "success",
                    "supplied_nutrients" => $supplied_nutrients,
                    "need_nutrients" => $need_nutrients
                ]);
            }else{
                $sql1 = "SELECT u.name,sv.id,AVG(sv.site_rating) site_rating,sv.created_date,sv.created_time FROM site_visit sv INNER JOIN users u ON sv.customer_id=u.id WHERE sv.created_date BETWEEN '$startDate' and '$endDate' and u.status='active' GROUP BY u.name;";
                $result1 = $conn->query($sql1);

                $client_performance = [];
                while ($row = $result1->fetch_assoc()) {
                    $client_performance[] = $row;
                }

                echo json_encode([
                    "status" => "success",
                    "client_performance" => $client_performance
                ]);
            }

        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
