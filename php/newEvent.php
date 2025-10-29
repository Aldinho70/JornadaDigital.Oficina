<?php
if ($_SERVER["REQUEST_METHOD"] == "POST") {
    // Recibir los datos enviados desde JavaScript
    require 'ConexionBD.php';

    $conexion = new ConexionBD();
    $conexion->conectar();

    // Obtener los datos en formato JSON
    $data = json_decode(file_get_contents("php://input"), true);

    // Verificar y sanitizar los datos
    if (isset($data['start'])) {
        $id = $conexion->conexion->real_escape_string($data['id']);
        $title = $conexion->conexion->real_escape_string($data['title']);
        $unidad = $conexion->conexion->real_escape_string($data['unidad']);
        $start = $conexion->conexion->real_escape_string($data['start']);
        $end = $conexion->conexion->real_escape_string($data['end']);
        $backgroundColor = $conexion->conexion->real_escape_string($data['backgroundColor']);
        $inicio = $conexion->conexion->real_escape_string($data['extendedProps']['inicio']);
        $final = $conexion->conexion->real_escape_string($data['extendedProps']['final']);
        $text = $conexion->conexion->real_escape_string($data['extendedProps']['text']);
        $user = $conexion->conexion->real_escape_string($data['extendedProps']['user']);
        $type = $conexion->conexion->real_escape_string($data['extendedProps']['type']);
        $atendido = $conexion->conexion->real_escape_string($data['extendedProps']['atendido']);
        
        // Insertar en la base de datos
        $SQL = "INSERT INTO `data` 
        (`id`, `title`, `unidad`, `start`, `end`, `backgroundColor`, `inicio`, `final`, `text`, `user`, `type`, `atendido`) 
        VALUES 
        ('$id', '$title', '$unidad', '$start', '$end', '$backgroundColor', '$inicio', '$final', '$text', '$user', '$type', '$atendido')";


        if ($conexion->ejecutarConsulta($SQL)) {

            // Parámetros para la función mail()
            $to = 'aldinhobobadilla@gmail.com, alu.19130509@correo.itlalaguna.edu.mx, jca.76@hotmail.com, alejornadajd@gmail.com';
            $subject = $user .' agrego un nuevo evento al calendario de Jornada Digital';
            $message = '<div class="card">
                <div class="card-header">
                    <div class="d-flex">
                        <div class="p-2 flex-grow-1 ">Realizado por <span class="badge text-bg-secondary">'. $user .'</span></div>
                        <div class="p-2">'.$title.'</div>                        
                    </div>
                </div>
                <div class="card-body">
                <h5 class="card-title">Descripcion:</h5>
                <hr>
                <div class="bg-light text-dark" style="height: 300px;">
                    <p class="card-text ">'.$text.'</p>                
                </div>

                </div>
                <div class="card-footer text-body-secondary">
                El evento se inició el '.$inicio.' y se espera terminar el '.$final.' 
                </div>
            </div>';
            $headers = "MIME-Version: 1.0" . "\r\n";
            $headers .= "Content-type:text/html;charset=UTF-8" . "\r\n";
            $headers .= 'From: jmbobadilla_nullpointer@jornadadigital.com' . "\r\n";

            // Enviar el correo
            if (mail($to, $subject, $message, $headers)) {
                echo 'Message has been sent';
            } else {
                echo 'Message could not be sent.';
            }

            //echo json_encode(array('success' => true, 'message' => 'Registro exitoso en insertSession'));
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
