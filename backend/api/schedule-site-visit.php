<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userId = $_GET['id'] ?? null;
$editScheduleVisit = $_GET['edit_schedule_visit'] ?? null;
$schVisitId = $_GET['schVisitId'] ?? null;
$scheduleVisit = $_GET['schedule_visit'] ?? null;
$viewScheduleVisit = $_GET['view-schedule-visit'] ?? null;
$userCode = $_GET['user_code'] ?? null;
$techId = $_GET['techId'] ?? null;

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

$date = date("Y-m-d");
$time = date("H:i:s");

switch ($method) {

    case 'GET':
        if ($viewScheduleVisit) {
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

        }else{
            $sql1 = "SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0";
            $result = $conn->query($sql1);
            $data = [];
            $custTech = [];
            while ($row = $result->fetch_assoc()) {
                $data[] = $row;
            }

            $sql2 = "SELECT * FROM `users` WHERE role='technician' AND status='active'";
            $result2 = $conn->query($sql2);
            $technician = [];
            while ($row2 = $result2->fetch_assoc()) {
                $technician[] = $row2;
            }

            if(!empty($schVisitId)){
                $selectCustTech = "SELECT u.id AS customer_id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto, COUNT(s.id) AS total_visits_done, (a.visits_per_month - COUNT(s.id)) AS pending_visits,svs.customer_id,svs.technician_id,t.name technician_name,t.user_code,svs.visit_date,svs.visit_time FROM users u INNER JOIN amc_details a ON u.id = a.customer_id LEFT JOIN site_visit s ON s.customer_id = u.id AND s.created_date BETWEEN a.validity_from AND a.validity_upto Left JOIN site_visit_schedule svs ON u.id=svs.customer_id LEFT JOIN users t ON t.id = svs.technician_id  WHERE u.status = 'active' AND CURRENT_DATE <= a.validity_upto and svs.id='$schVisitId' GROUP BY u.id, u.name, u.phone, a.visits_per_month, a.validity_from, a.validity_upto HAVING pending_visits > 0;";
                $result3 = $conn->query($selectCustTech);
                
                while ($row3 = $result3->fetch_assoc()) {
                    $custTech[] = $row3;
                }
            }

            echo json_encode(["status" => "success","data" => $data,"technician" => $technician, "custTech" => $custTech]);
        }

    break;

    case 'POST':
        // Get POST data
        $customerId = $_POST['customers'] ?? null;
        $technicianId = $_POST['technicians'] ?? null;
        $visitDate = $_POST['visitDate'] ?? null;
        $visitTime = $_POST['visitTime'] ?? null;

        // Update existing schedule
        $insertSql = "INSERT INTO `site_visit_schedule`(`customer_id`, `technician_id`, `visit_date`, `visit_time`, `status`, `created_by`, `created_date`, `created_time`) VALUES ('$customerId','$technicianId','$visitDate','$visitTime','scheduled','$userId','$date','$time')";
        $stmt = $conn->query($insertSql);
        // $stmt->bind_param("iissi", $customerId, $technicianId, $visitDate, $visitTime, $editSchId);

        if ($stmt) {
                echo json_encode(["status" => "success", "message" => "Site visit scheduled successfully"]);
        } else {
            echo json_encode(["status" => "error", "message" => "Failed to schedule site visit"]);
        }
        break;

    case 'PUT':
        $schid = $_POST['schid'] ?? null;

        // Get POST data
        $customerId = $_POST['customers'] ?? null;
        $technicianId = $_POST['technicians'] ?? null;
        $visitDate = $_POST['visitDate'] ?? null;
        $visitTime = $_POST['visitTime'] ?? null;

        if ($schid) {
            // Update existing schedule
            $updateSql = "UPDATE site_visit_schedule SET customer_id = ?, technician_id = ?, visit_date = ?, visit_time = ? WHERE id = ?";
            $stmt = $conn->prepare($updateSql);
            $stmt->bind_param("iissi", $customerId, $technicianId, $visitDate, $visitTime, $schid);

            if ($stmt->execute()) {
                echo json_encode(["status" => "success", "message" => "Schedule updated successfully"]);
            } else {
                echo json_encode(["status" => "error", "message" => "Failed to update schedule"]);
            }
            $stmt->close();
        } else {
            echo json_encode(["status" => "error", "message" => "Schedule ID is required for editing"]);
        }
        break;



    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>