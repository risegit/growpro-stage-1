<?php
header("Access-Control-Allow-Origin: *"); // Allow requests from frontend
header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json");

include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$userCode = $_GET['user_code'] ?? null;
$userId = $_GET['id'] ?? null;

if ($method === 'POST' && isset($_POST['_method'])) {
    $method = strtoupper($_POST['_method']);
}

switch ($method) {

    case 'GET':
        $role = "";
        $techId = null;
        if (!empty($userCode)) {
            // Find user using user_code
            $userQuery = $conn->query("SELECT id, user_code FROM users WHERE user_code='$userCode' LIMIT 1");
            if ($userRow = $userQuery->fetch_assoc()) {

                if (str_starts_with($userRow['user_code'], 'TC')) {
                    $role = "technician";
                    $techId = $userRow['id'];
                } elseif (str_starts_with($userRow['user_code'], 'AD') || str_starts_with($userRow['user_code'], 'MN')) {
                    $role = "admin";
                }
            }
        }

        // -----------------------------
        // 2️⃣ MAIN DASHBOARD STATS
        // If technician: restrict to his records only
        // -----------------------------

        if ($role === "technician") {

            // Technician only sees his own visits
            $summarySql = "
                SELECT 
                (SELECT COUNT(*) FROM site_visit_schedule WHERE technician_id = '$techId' AND visit_date = CURRENT_DATE) AS today_scheduled,
                (SELECT COUNT(*) FROM site_visit_schedule WHERE technician_id = '$techId' AND MONTH(created_date)=MONTH(CURRENT_DATE)) AS monthly_visits,
                (SELECT COUNT(DISTINCT technician_id) FROM site_visit_schedule WHERE visit_date = CURRENT_DATE AND technician_id='$techId') AS technicians_today,
                (SELECT COUNT(*) FROM users WHERE id='$techId') AS active_customers
                ";
        } else {

            // Admin / Manager → See everything
            $summarySql = "
                SELECT 
                (SELECT COUNT(*) FROM users WHERE status='active') AS active_customers,
                (SELECT COUNT(*) FROM amc_details WHERE validity_upto >= CURRENT_DATE) AS active_amc,
                (SELECT COUNT(*) FROM amc_details WHERE validity_upto < CURRENT_DATE) AS expired_amc,
                (SELECT COUNT(*) FROM site_visit_schedule WHERE visit_date = CURRENT_DATE) AS today_scheduled,
                (SELECT COUNT(*) FROM site_visit_schedule WHERE MONTH(created_date)=MONTH(CURRENT_DATE)) AS monthly_visits,
                (SELECT COUNT(DISTINCT technician_id) FROM site_visit_schedule WHERE visit_date = CURRENT_DATE) AS technicians_today,
                (SELECT COUNT(*) FROM amc_details WHERE validity_upto BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 7 DAY)) AS renew_amc_7_days
                ";
        }

        $result = $conn->query($summarySql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        // -----------------------------
        // 3️⃣ TECHNICIAN VISIT ASSIGN LIST
        // -----------------------------

        if ($role === "technician") {
            // Only his data
            $visitSql = "
                SELECT u.name AS technician_name, COUNT(s.id) AS total_visits 
                FROM site_visit_schedule s 
                LEFT JOIN users u ON s.technician_id = u.id 
                WHERE s.visit_date = CURRENT_DATE 
                AND s.technician_id = '$techId'
                GROUP BY s.technician_id
            ";
        } else {
            // Admin sees all technicians
            $visitSql = "
                SELECT u.name AS technician_name, COUNT(s.id) AS total_visits 
                FROM site_visit_schedule s 
                LEFT JOIN users u ON s.technician_id = u.id 
                WHERE s.visit_date = CURRENT_DATE 
                GROUP BY s.technician_id
            ";
        }

        $result1 = $conn->query($visitSql);
        $visit_assign_data = [];
        while ($row = $result1->fetch_assoc()) {
            $visit_assign_data[] = $row;
        }

        echo json_encode(["status" => "success","data" => $data,"visit_assign_data" => $visit_assign_data,"role" => $role]);
        // echo json_encode(["status" => "success","data" => $data,"visit_assign_data"=>$visit_assign_data]);

        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>