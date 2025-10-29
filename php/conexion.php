<?php
// Incluir la clase de conexión
require 'ConexionBD.php';

// Crear instancia de la clase ConexionBD
$conexion = new ConexionBD();

// Conectar a la base de datos
$conexion->conectar();

// Ejecutar una consulta
// $sql = "SELECT * FROM data";
// $sql = "SELECT 
//             id,
//             title, 
//             unidad, 
//             start, 
//             end, 
//             CASE user
//                  WHEN 'Alejandra' THEN 'evento-Alejandra' 
//                  WHEN 'Jesus' THEN 'evento-Jesus' 
//                  WHEN 'Guillermo' THEN 'evento-Guillermo' 
//                  WHEN 'Juan De Dios' THEN 'evento-JD' 
//                  WHEN 'Silvia' THEN 'evento-Silvia' 
//                  ELSE 'evento-default' 
//             END AS className, 
//             inicio, 
//             final, 
//             text, 
//             user, 
//             type, 
//             atendido 
//         FROM data;";
$sql = "SELECT 
    id,
    title,
    unidad,
    start,
    end,
    CASE user
        WHEN 'Alejandra' THEN 
            CASE atendido
                WHEN 0 THEN 'evento-Alejandra-no'
                WHEN 1 THEN 'evento-Alejandra-si'
            END
        WHEN 'Jesus' THEN 
            CASE atendido
                WHEN 0 THEN 'evento-Jesus-no'
                WHEN 1 THEN 'evento-Jesus-si'
            END
        WHEN 'Guillermo' THEN 
            CASE atendido
                WHEN 0 THEN 'evento-Guillermo-no'
                WHEN 1 THEN 'evento-Guillermo-si'
            END
        WHEN 'Juan De Dios' THEN 
            CASE atendido
                WHEN 0 THEN 'evento-JD-no'
                WHEN 1 THEN 'evento-JD-si'
            END
        WHEN 'Silvia' THEN 
            CASE atendido
                WHEN 0 THEN 'evento-Silvia-no'
                WHEN 1 THEN 'evento-Silvia-si'
            END
        ELSE 'evento-default'
    END AS className,
    inicio,
    final,
    text,
    user,
    type,
    atendido
FROM data;";

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