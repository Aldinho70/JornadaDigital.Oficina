<?php
require './ConexionBD.php';

$conexion = new ConexionBD();
$conexion->conectar();

// Obtener el contenido del cuerpo de la solicitud (request body)
$data = json_decode(file_get_contents("php://input"), true);

if( $data ){
    $SQL = $data['SQL'];
    $resultado = $conexion->ejecutarConsulta($SQL);
    
    // Procesar resultados
    if ($resultado->num_rows > 0) {
        $rows = [];
        while($row = $resultado->fetch_assoc()) {
            $rows[] = $row;
        }
        echo json_encode($rows);
    } else {
        echo json_encode([]);
    }    
}

$conexion->desconectar();

?>
