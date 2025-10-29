<?php
// Incluir la clase de conexión
require 'ConexionBD.php';

// Crear instancia de la clase ConexionBD
$conexion = new ConexionBD();
$conexion->conectar();

// Obtener el contenido del cuerpo de la solicitud (request body)
$data = json_decode(file_get_contents("php://input"), true);

if($data){
    $id = $data['id'];
    $sql = "SELECT * FROM data WHERE id = $id";  
}else{
    $sql = "SELECT * FROM data";    
}

$resultado = $conexion->ejecutarConsulta($sql);

if ($resultado->num_rows > 0) {
    $rows = [];
    while($row = $resultado->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
} else {
    echo json_encode([]);
}


// Desconectar
$conexion->desconectar();
?>