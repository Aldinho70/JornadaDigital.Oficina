<?php
// Incluir la clase de conexión
require 'ConexionBD.php';

// Crear instancia de la clase ConexionBD
$conexion = new ConexionBD();

// Conectar a la base de datos
$conexion->conectar();

// Ejecutar una consulta
$sql = "SELECT * FROM data";

$resultado = $conexion->ejecutarConsulta($sql);

// Procesar resultados
if ($resultado->num_rows > 0) {
    $rows = [];
    while ($row = $resultado->fetch_assoc()) {
        $rows[] = $row;
    }
    echo json_encode($rows);
} else {
    echo json_encode([]);
}


// Desconectar
$conexion->desconectar();
?>