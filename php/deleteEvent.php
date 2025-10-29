<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recibir los datos enviados desde JavaScript
    require 'ConexionBD.php';

    $conexion = new ConexionBD();
    $conexion->conectar();

    // Obtener los datos en formato JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar y sanitizar los datos
    if (isset($data['id'])) {
        $id = $conexion->conexion->real_escape_string($data['id']);
        
        // Insertar en la base de datos
        $SQL = "DELETE FROM data WHERE `data`.`id` = '$id'";


        if ($conexion->ejecutarConsulta($SQL)) {
            echo json_encode(array('success' => true, 'message' => 'Registro exitoso en insertSession'));
        } else {
            echo json_encode(array('success' => false, 'message' => 'Error: ' . $conexion->conexion->error));
        }
    } else {
        echo json_encode(array('success' => false, 'message' => 'Error, no se recibieron JSon'));
    }

    $conexion->desconectar();
} else {
    // Manejar el caso en que no se recibieron datos mediante POST
    echo json_encode(array('success' => false, 'message' => 'Error: No se recibieron datos mediante POST.'));
}
?>
