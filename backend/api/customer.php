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
    $name = $_POST['name'] ?? '';
    $email = $_POST['email'] ?? '';
    $phone = $_POST['phoneNumber'] ?? '';
    $staffPhone = $_POST['staffPhoneNumber'] ?? '';
    $address = $_POST['address'] ?? '';
    $state = $_POST['state'] ?? '';
    $city = $_POST['city'] ?? '';
    $pincode = $_POST['pincode'] ?? '';
    $status = $_POST['status'] ?? '';
    $growers = isset($_POST['growers']) ? json_decode($_POST['growers'], true) : [];

    $profilePic = $_FILES['profilePic'] ?? null;
    $profilePicPath = null;
    $date = date("Y-m-d");
    $time = date("H:i:s");

    $password_raw = 'customer123@345';
    $password_hash = password_hash($password_raw, PASSWORD_DEFAULT);


    // Upload Profile Pic
    if ($profilePic && $profilePic['error'] === 0) {
        $uploadDir = __DIR__ . '/uploads/customers/';
        if (!is_dir($uploadDir)) mkdir($uploadDir, 0777, true);
        $newPicName = uniqid() . '_' . basename($profilePic['name']);
        $profilePicPath = 'uploads/customers/' . $newPicName;
        move_uploaded_file($profilePic['tmp_name'], __DIR__ . '/' . $profilePicPath);
    }

    if ($name && $phone) {
        // Insert Customer Data
        $sql = "INSERT INTO users 
                (name, email, phone, address, password_hash, profile_pic, role, status, date, time)
                VALUES
                ('$name', '$email', '$phone', '$address', '$password_hash', '$profilePicPath', 'customer', '$status', '$date', '$time')";

        if ($conn->query($sql)) {
            $customer_id = $conn->insert_id;

            // Insert Growers Data
            if (!empty($growers)) {
                foreach ($growers as $grower) {
                    $plantName = $grower['plantName'] ?? '';
                    $otherPlant = $grower['otherPlant'] ?? '';

                    $sql2 = "INSERT INTO customer_plants 
                             (customer_id, plant_name, other_plant, date, time)
                             VALUES
                             ('$customer_id', '$plantName', '$otherPlant', '$date', '$time')";
                    $conn->query($sql2);
                }
            }

            echo json_encode([
                "status" => "success",
                "message" => "Customer created successfully",
                "data" => ["customer_id" => $customer_id]
            ]);
        } else {
            echo json_encode(["status" => "error", "message" => $conn->error]);
        }
    } else {
        echo json_encode(["status" => "error", "message" => "Missing required fields"]);
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
