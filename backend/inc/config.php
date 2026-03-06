<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS");

// $servername = "localhost";
// $username = "root";
// $password = "";
// $database = "growpro";

$servername = "localhost";
$username = "growpro_11_Nov_User";
$password = "R0z2P[Yic)2z";
$database = "growpro";

$conn = new mysqli($servername, $username, $password, $database);
if ($conn->connect_error) {
    http_response_code(500);
    echo json_encode(["status" => "error", "message" => "Database connection failed"]);
    // test
    exit; 
}
?>
