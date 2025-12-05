<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

        case 'GET':
            $sql1 = "SELECT sv.id,u.name,u.phone,u.profile_pic,t.name tech_name 
            FROM site_visit sv 
            INNER JOIN users u ON sv.customer_id=u.id 
            INNER JOIN users t ON sv.visited_by=t.user_code";

            $result = $conn->query($sql1);

            $data = [];

            while ($row = $result->fetch_assoc()) {

                // Move your checks inside the loop

                $sql2 = "SELECT * FROM site_visit sv 
                        INNER JOIN site_visit_material_need_plants svp ON sv.id=svp.visit_id";
                $result2 = $conn->query($sql2);
                $row['plant'] = ($result2 && $result2->num_rows > 0) ? 'Plants' : '';

                $sql3 = "SELECT * FROM site_visit sv 
                        INNER JOIN site_visit_material_need_nutrients svn ON sv.id=svn.visit_id";
                $result3 = $conn->query($sql3);
                $row['nutrients'] = ($result3 && $result3->num_rows > 0) ? ', Nutrients' : '';

                $sql4 = "SELECT * FROM site_visit sv 
                        INNER JOIN site_visit_material_need_chargeable_items svci ON sv.id=svci.visit_id";
                $result4 = $conn->query($sql4);
                $row['chargeableItem'] = ($result4 && $result4->num_rows > 0) ? ', Chargeable Item' : '';

                // add row to data
                $data[] = $row;
            }

            echo json_encode([
                "status" => "success",
                "data" => $data
            ]);
        
        break;

    
    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>