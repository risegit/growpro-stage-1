<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$siteVisitId = $_GET['id'] ?? null;
$userId = $_GET['user_id'] ?? null;

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$date = date("Y-m-d");
$time = date("H:i:s");

switch ($method) {

        case 'GET':
            if($siteVisitId){
                $sql1 = "SELECT sv.id,u.name,u.phone,u.profile_pic,t.name tech_name,mdr.delivery_status delivery_status FROM site_visit sv INNER JOIN users u ON sv.customer_id=u.id INNER JOIN users t ON sv.visited_by=t.user_code LEFT JOIN material_delivery_records mdr ON sv.id=mdr.visit_id WHERE sv.id='$siteVisitId'";
                $result = $conn->query($sql1);

                $data = [];
                while ($row = $result->fetch_assoc()) {
                    $data[]=$row;
                }

                $sql2 = "SELECT sv.id, svp.plant_name,svp.quantity,svp.other_plant_name FROM site_visit sv INNER JOIN site_visit_material_need_plants svp ON sv.id=svp.visit_id  WHERE sv.id='$siteVisitId';";
                $result2 = $conn->query($sql2);
                $plants = [];
                while ($row = $result2->fetch_assoc()) {
                    $plants[]=$row;
                }

                $sql3 = "SELECT sv.id,svn.nutrient_type,svn.tank_capacity,svn.topups,svn.other_nutrient_name,svn.other_tank_capacity FROM site_visit sv INNER JOIN site_visit_material_need_nutrients svn ON sv.id=svn.visit_id WHERE sv.id='$siteVisitId'";
                $result3 = $conn->query($sql3);
                $nutrients = [];
                while ($row = $result3->fetch_assoc()) {
                    $nutrients[]=$row;
                }

                $sql4 = "SELECT sv.id,svci.item_name,svci.other_item_name,svci.quantity FROM site_visit sv INNER JOIN site_visit_material_need_chargeable_items svci ON sv.id=svci.visit_id WHERE sv.id='$siteVisitId'";
                $result4 = $conn->query($sql4);
                $chargeableItems = [];
                while ($row = $result4->fetch_assoc()) {
                    $chargeableItems[]=$row;
                }

                $sql5 = "SELECT * FROM material_delivery_records WHERE visit_id='$siteVisitId'";
                $result5 = $conn->query($sql5);
                $materialDeliver = [];
                while ($row = $result5->fetch_assoc()) {
                    $materialDeliver[]=$row;
                }

                echo json_encode([
                    "status" => "success",
                    "data" => $data,
                    "plants" => $plants,
                    "nutrients" => $nutrients,
                    "chargeableItems" => $chargeableItems,
                    "materialDeliver" => $materialDeliver
                ]);

            }else{
                $sql1 = "SELECT sv.id,u.id customer_id,u.name,u.phone,u.profile_pic,cd.locality,t.name tech_name,COALESCE(mdr.delivery_status, 'no') AS delivery_status, sv.created_date, mdr.updated_date FROM site_visit sv INNER JOIN users u ON sv.customer_id=u.id INNER JOIN users t ON sv.visited_by=t.user_code LEFT JOIN material_delivery_records mdr ON sv.id=mdr.visit_id INNER JOIN customers_details cd ON cd.user_id=u.id";
                $result = $conn->query($sql1);

                $data = [];

                while ($row = $result->fetch_assoc()) {
                    $data[]=$row;
                }

                $sql2 = "SELECT sv.id, sv.customer_id, svp.plant_name,svp.quantity,svp.other_plant_name FROM site_visit sv INNER JOIN site_visit_material_need_plants svp ON sv.id=svp.visit_id";
                $result2 = $conn->query($sql2);
                $plants = [];
                while ($row = $result2->fetch_assoc()) {
                    $plants[]=$row;
                }

                $sql3 = "SELECT sv.id,sv.customer_id,svn.nutrient_type,svn.tank_capacity,svn.topups,svn.other_nutrient_name,svn.other_tank_capacity FROM site_visit sv INNER JOIN site_visit_material_need_nutrients svn ON sv.id=svn.visit_id";
                $result3 = $conn->query($sql3);
                $nutrients = [];
                while ($row = $result3->fetch_assoc()) {
                    $nutrients[]=$row;
                }

                $sql4 = "SELECT sv.id,sv.customer_id,svci.item_name,svci.other_item_name,svci.quantity FROM site_visit sv INNER JOIN site_visit_material_need_chargeable_items svci ON sv.id=svci.visit_id";
                $result4 = $conn->query($sql4);
                $chargeableItems = [];
                while ($row = $result4->fetch_assoc()) {
                    $chargeableItems[]=$row;
                }

                echo json_encode([
                    "status" => "success",
                    "data" => $data,
                    "plants" => $plants,
                    "nutrients" => $nutrients,
                    "chargeableItems" => $chargeableItems

                ]);
            }
        
        break;

    case 'POST':
        $siteVisitId = $_POST["id"] ?? '';
        $delivery_note = $_POST["delivery_note"] ?? '';
        $delivery_status = $_POST["delivery_status"] ?? '';

        $sql = "INSERT INTO `material_delivery_records`(`visit_id`, `delivery_status`, `delivery_note`, `updated_by`, `created_date`, `created_time`) VALUES ('$siteVisitId','$delivery_status','$delivery_note','$userId','$date','$time')";

        if($conn->query($sql)){
            echo json_encode(["status" => "success", "message" => "Material Delivery Status Updated Successfully"]);
        }else{
            echo json_encode(["status" => "error", "message" => "Material Delivery Status Not Updated"]);
        }
        break;

    case 'PUT':
        $siteVisitId = $_POST["id"] ?? '';
        $delivery_note = $_POST["delivery_note"] ?? '';
        $delivery_status = $_POST["delivery_status"] ?? '';

        $sql = "UPDATE `material_delivery_records` SET `delivery_status`='$delivery_status',`delivery_note`='$delivery_note',`updated_by`='$userId',`updated_date`='$date',`updated_time`='$time' WHERE visit_id='$siteVisitId'";

        if($conn->query($sql)){
            echo json_encode(["status" => "success", "message" => $sql]);
        }else{
            echo json_encode(["status" => "error", "message" => "Material Delivery Status Not Updated"]);
        }
        break;
    
    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>