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
                (SELECT COUNT(*) FROM amc_details WHERE validity_upto BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY)) AS renew_amc_30_days
                ";

            $expiredAMCDetailsSql = "
                SELECT c.id AS customer_id, c.name AS customer_name, a.id AS amc_id, a.visits_per_month, a.validity_from, a.validity_upto, a.amc_free_paid FROM amc_details a INNER JOIN ( SELECT customer_id, MAX(validity_upto) AS max_validity FROM amc_details GROUP BY customer_id ) latest ON a.customer_id = latest.customer_id AND a.validity_upto = latest.max_validity LEFT JOIN users c ON a.customer_id = c.id WHERE a.validity_upto < CURRENT_DATE ORDER BY a.validity_upto ASC;";

            $expiredAMC7DaysDetailsSql = "
                SELECT c.id AS customer_id, c.name AS customer_name, a.id AS amc_id, a.visits_per_month, a.validity_from, a.validity_upto, a.amc_free_paid FROM amc_details a INNER JOIN ( SELECT customer_id, MAX(id) AS latest_amc_id FROM amc_details GROUP BY customer_id ) latest ON a.id = latest.latest_amc_id LEFT JOIN users c ON a.customer_id = c.id WHERE a.validity_upto BETWEEN CURRENT_DATE AND DATE_ADD(CURRENT_DATE, INTERVAL 30 DAY) ORDER BY a.validity_upto ASC;";
        }

        $result = $conn->query($summarySql);
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }

        $expiredAMCDetailsResult = $conn->query($expiredAMCDetailsSql);
        $expiredAMCData = [];
        while ($row = $expiredAMCDetailsResult->fetch_assoc()) {
            $expiredAMCData[] = $row;
        }

        $expiredAMC7DaysDetailsResult = $conn->query($expiredAMC7DaysDetailsSql);
        $expiredAMC7DaysData = [];
        while ($row = $expiredAMC7DaysDetailsResult->fetch_assoc()) {
            $expiredAMC7DaysData[] = $row;
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

        echo json_encode(["status" => "success","data" => $data,"visit_assign_data" => $visit_assign_data,"role" => $role, "expired_amc_data" => $expiredAMCData, "expired_amc_in_30_days" => $expiredAMC7DaysData]);
        // echo json_encode(["status" => "success","data" => $data,"visit_assign_data"=>$visit_assign_data]);

        break;

    default: 
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>