<?php
include('database.php');
$db = new database("localhost", "carga", "trabajo", "carga_trabajo");
$db->conectar();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    // Conexión a la base de datos
    $db->conectar();

    // Recopila datos del formulario
    $start = $_POST['start'];
    $cliente = $_POST['title'];
    $observaciones = $_POST['observaciones'];
    $color = $_POST['color'];


    // Consulta SQL para insertar una nueva factura
    $consulta = "INSERT INTO `atencion_clientes` (`start`, `title`, `Observaciones`,`color`) VALUES
    ('$start', '$cliente', '$observaciones','$color')";


    if ($db->ejecutarConsulta($consulta)) {
        echo "Factura guardada con éxito.";
    } else {
        echo "Error al guardar la factura: " . mysqli_error($conexion);
    }
}
?>
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" href="../Estaticos/faviconjd.png" type="image/png">

    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css">
    <link rel="stylesheet" href="../CSS/style.css">
    <link rel="stylesheet" href="../CSS/stylefooter.css">
    <link rel="stylesheet" href="../CSS/fullcalendar.min.css">

    <script src="../JavaScript/jquery.min.js"></script>
    <script src="../JavaScript/moment.min.js"></script>
    <script src="../JavaScript/fullcalendar.min.js"></script>
    <script src="../JavaScript/es.js"></script>

    <title>Calendario</title>
</head>

<body>
    <!--Menu lateral-->
    <div class="container-fluid">
        <div class="row">
            <div class="col-md-12 menu ">
                <div class="bottom-footer">
                    <p class="rainbow-text">JornadaDigital</p>
                </div>
                <a href="../index.php"><img class="rounded mx-auto d-block" src="../Estaticos/logojd.png" alt="Logo de la empresa"
                        class="Responsive image"></a>
                <ul class="list-group menu-list">
                    <li class="d-flex justify-content-center align-items-center"><a class="btn btn-warning col-md-12"
                            href="../index.php">Cargas de trabajo</a></li>
                    <li class="nav-item">
                        <div class="dropdown">
                            <button class="btn btn-warning col-md-12 dropdown-toggle" type="button" id="dropdownMenu2"
                                data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
                                <a href="#">Calendarios</a>
                            </button>
                            <div class="dropdown-menu" aria-labelledby="dropdownMenu2" id="dropdownMenuContent">
                                <a class="btn btn-warning col-md-12" href="fullcalendar.php">Calendario
                                    trabajos</a>
                                <a class="btn btn-warning col-md-12" href="fullcalendarclientes.php">Calendario
                                    clientes</a>
                            </div>
                        </div>
                    </li>
                    <li class="d-flex justify-content-center align-items-center"><a class="btn btn-warning col-md-12"
                            href="Lista_Tecnicos.php">Lista de técnicos</a></li>
                    <li class="d-flex justify-content-center align-items-center"><a class="btn btn-warning col-md-12"
                            href="lista_clientes.php">Lista de clientes</a></li>
                </ul>
                <div class="bottom-footer">
                    <div class="container">
                        <p>Desarrollado por: </p>
                        <p class="rainbow-text">NullPointer 💎 JMBobadilla</p>
                    </div>
                    <p>Uso exclusivo para : </p>
                    <p>© JornadaDigital, Todos los derechos reservados.</p>
                </div>
            </div>
        </div>
    </div>
    <!--Fin de menu lateral-->

    <!--Calendario-->
    <div class="content">
        <h1>Calendario</h1>
        <div id="fullcalendarJD"></div>
    </div>
    <!--Fin de calendario-->

    <!--Modal para mostrar detalle de las llamadas de los clientes-->
    <div class="modal fade" id="informacion_Llamada_cliente" tabindex="-1" role="dialog"
        aria-labelledby="exampleModalLabel" aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <!--Nombre del cliente-->
                    <div class="alert alert-secondary w-100" role="alert">
                      <h5 class="modal-title" id="tituloEvento"></h5>
                    </div>
                    <div class="alert alert-info w-100" role="alert">
                      <h5 class="modal-title" id="fecha"></h5>
                    </div>
                    <button type="button" class="close bg-danger" data-dismiss="modal" aria-label="Close">
                        <!--<span aria-hidden="true">&times;</span>-->
                        ❌
                    </button>
                </div>
                <div class="modal-body">
                    <h5 class="visually-hidden" id="id_Llamada"></h5>
                    <div class="alert alert-warning w-100" role="alert">
                      <h3>Descripcion:</h3><!--<pre class="fs-4" id="descripcion_Llamada"></pre>-->
                      <textarea class="w-100 fs-3 bg-light" rows="10" cols="30" id="descripcion_Llamada"></textarea>
                    </div>
                </div>
                <div class="modal-footer">
                    <button id="btndel" type="button" class="btn btn-danger">Eliminar ❌</button>
                </div>
            </div>
        </div>
    </div>
    <!--------------------------------------------------------------------------------------------->

    <!-- Modal (Agregar, modificar,eliminar) -->
    <div class="modal fade" id="nuevo_registro_Llamada" tabindex="-1" role="dialog" aria-labelledby="exampleModalLabel"
        aria-hidden="true">
        <div class="modal-dialog modal-xl" role="document">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title" id="tituloEvento">Agregar registro de llamada</h5>
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                        <!--<span aria-hidden="true">&times;</span>-->
                        ❌
                    </button>
                </div>
                <div class="modal-body">
                    <div id="descripcionEvento"></div>
                    <form action="fullcalendarclientes.php" method="POST">
                        Fecha:
                        <input type="datetime-local" id="txtFecha" name="start" /> <br><br>

                        Nombre:
                        <select name="title" id="listaClientes">
                            <?php
                            /*$resultado = $db->seleccionar("clientes", "nombre", "");
                            foreach ($resultado as $row) {
                                echo "<option value='" . $row["nombre"] . "' name='cliente'>" . $row["nombre"] . "</option>";
                            }*/
                            ?>
                            <option value='Alejandra' name='cliente'>Alejandra</option>
                            <option value='Guillermo' name='cliente'>Guillermo</option>
                            <option value='Jesus' name='cliente'>Jesus</option>
                        </select> <br><br>

                        Descripción:
                        <div class="col-md-12">
                            <textarea id="txtDescripcion" name="observaciones" class="form-control"
                                rows="10" style="white-space: pre-wrap;"></textarea>
                        </div><br>

                        Tipo de actividad:
                        <select name="color" id="txtColor">
                            <option value="#FF0000">Cobranza a clientes</option>
                            <option value="#00FF00">Atencion a clientes</option>
                            <option value="#FEA900">Cobranza y atencion a cliente</option>
                            <option value="#0096FE">Reporte diario Guillermo</option>
                            <option value="#DA33FF">Reporte diario Alejandra</option>
                            <option value="#468BBB">Reporte diario Jesus</option>
                        </select><br><br>

                        <button id="btnadd" type="submit" class="btn btn-success">Agregar ➕</button>
                    </form>

                </div>
            </div>
        </div>
    </div>
    <!--------------------------------------------------------------------------------------------->

    <!--Configuracion de la API de fullcalendar.js-->
    <script>
        $(document).ready(function () {
            $('#fullcalendarJD').fullCalendar({
                header: {
                    left: 'today, prev, next, BotonPreuba',
                    center: 'title',
                    right: 'month, basicWeek, basic day, agenndaWeek, agenda Day'
                },
                /*customButtons: {
                    BotonPreuba: {
                        text: "Boton personalizado",
                        click: function () {
                            alert("Mensaje de prueba");
                        }
                    }
                },*/
                dayClick: function (date, jsEvent, view) {
                    $("#nuevo_registro_Llamada").modal();
                    var formattedDate = moment(date).format("YYYY-MM-DDTHH:mm");
                    $('#txtFecha').val(formattedDate);
                },
                //events: 'http://localhost:8080/JD_Admistrativo2/Template/fetchBaseDatos/fetchfullcalendarclientes.php'
                events: 'http://ws4cjdg.com/JDigitalContable/Template/fetchBaseDatos/fetchfullcalendarclientes.php'
                , eventClick: function (calEvent, jsEvent, view) {
                    $('#id_Llamada').html(calEvent.id);
                    $('#tituloEvento').html(calEvent.title);
                        const options = { year: 'numeric', month: '2-digit', day: '2-digit' };
                    $('#fecha').html(new Date(calEvent.start).toLocaleDateString('es-MX', options) + " - a las " + (new Date(calEvent.start).getHours() - 12));
                    $('#descripcion_Llamada').html(calEvent.Observaciones);
                    $('#informacion_Llamada_cliente').modal();
                }
            });
        });
    </script>
    <!--Fin fullCalendar.js-->

    <!--Seccion de eventos de los botones tanto de EventClick y DayClick de fullcalendar.js-->
    <script>
        $(document).ready(function () {
            //Evento del boton del evento EventClick(), El boton es para eliminar una carga de trabajo ya existente
            $('#btndel').click(function () {
                var idEvento = $('#id_Llamada').text();

                // Realiza la solicitud AJAX para eliminar el evento
                $.ajax({
                    type: 'POST',
                    url: 'eliminar_evento_cliente.php', // Crea este archivo PHP
                    data: { id: idEvento },
                    success: function (response) {
                        alert(response); // Muestra la respuesta del servidor (éxito o error)
                        $('#fullcalendarJD').fullCalendar('removeEvents', idEvento); // Elimina el evento del calendario
                        $("#informacion_Llamada_cliente").modal('toggle'); // Cierra el modal
                    },
                    error: function () {
                        alert('Error al eliminar el evento.');
                    }
                });
            });
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////

            //Evento del boton del evento dayClick(), El boton es para agregar un nueva carga de trabajo
            var NuevoEvento;
            $('#btnadd').click(function () {
                recolectarDatosGUI();
                $('#fullcalendarJD').fullCalendar('renderEvent', NuevoEvento);
                $("#informacionCargaTrabajo").modal('toggle');
            });

            function recolectarDatosGUI() {
                NuevoEvento = {
                    id: $('#id').val(),
                    title: $('#listaClientes').val(),
                    cliente: $('#listaClientes').val(),
                    tecnico: $('#listaTecnicos').val(),
                    ciudad: $('#listaCiudades').val(),
                    start: $('#txtFecha').val(),
                    color: $('#txtColor').val(), Observacion: $('#txtDescripcion').val()
                };
            }
            ///////////////////////////////////////////////////////////////////////////////////////////////////////////
        });
    </script>
    <!--Fin de seccion de eventos-->

    <!--Importacion de bootstrap y fullCalendar-->
    <script src="https://cdn.jsdelivr.net/npm/popper.js@1.12.9/dist/umd/popper.min.js"></script>
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@4.0.0/dist/js/bootstrap.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/moment.js/2.29.1/moment.min.js"></script>
    <!--------------------------------------------------------------------------------------------->
</body>

</html>