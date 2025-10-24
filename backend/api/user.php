<?php
header("Content-Type: application/json");
include('../inc/config.php');

$method = $_SERVER['REQUEST_METHOD'];
$input = json_decode(file_get_contents("php://input"), true);
// test
switch ($method) {

    case 'GET':
        $result = $conn->query("SELECT * FROM customers ORDER BY id DESC");
        $data = [];
        while ($row = $result->fetch_assoc()) {
            $data[] = $row;
        }
        echo json_encode(["status" => "success", "data" => $data]);
        break; 

    case 'POST':
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        if ($name && $email) {
            $sql = "INSERT INTO customers (name, email) VALUES ('$name', '$email')";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Customer added"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing name or email"]);
        }
        break;

    case 'PUT':
        $id = $input['id'] ?? 0;
        $name = $input['name'] ?? '';
        $email = $input['email'] ?? '';
        if ($id && $name && $email) {
            $sql = "UPDATE customers SET name='$name', email='$email' WHERE id=$id";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Customer updated"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Invalid input"]);
        }
        break;

    case 'DELETE':
        $id = $input['id'] ?? 0;
        if ($id) {
            $sql = "DELETE FROM customers WHERE id=$id";
            if ($conn->query($sql)) {
                echo json_encode(["status" => "success", "message" => "Customer deleted"]);
            } else {
                echo json_encode(["status" => "error", "message" => $conn->error]);
            }
        } else {
            echo json_encode(["status" => "error", "message" => "Missing id"]);
        }
        break;

    default:
        echo json_encode(["status" => "error", "message" => "Invalid request method"]);
        break;
}
?>
