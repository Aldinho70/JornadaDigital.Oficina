$(function () {
    /**Inicializamos QUill.js */
    initQuill();

    //   axios_select_red();
    //   axios_select_memo();
    //   axios_select_ale();
    //   axios_select_JD();
    getDataQuery("SELECT * FROM `view_status_events`;").then((data) => {
        updateStatusEvents(data);
    });

    getDataQuery("SELECT * FROM `view_promedio_terminados`;").then((data) => {
        data.map(element => {
            $("#cont-porcent").text(`${Math.round(element.PROMEDIO)}%`)
        });
    });

    // Iniciamos el fullcalendar.js
    var calendarEl = document.getElementById("calendar");
    var calendar = new FullCalendar.Calendar(calendarEl, {
        /**Modo de la tabla */
        initialView: "dayGridMonth",
        /**Lenaguaje de la tabla ES/MX */
        locale: "es",
        height: "auto", // Ajusta la altura autom��ticamente
        contentHeight: "auto", // Evita que el contenido se corte
        expandRows: true, // Asegura que las filas se expandan completamente
        useHTML: true,
        hiddenDays: [0],
        /**Eventos nativos de la tabla */
        dateClick: function (info) {
            initCreateEvent(info);
        },
        eventClick: function (info) {
            const e = info.event;
            const atendido = e.extendedProps.atendido == 1;
            const estadoTexto = ( info.event.backgroundColor  == '#44eb0b' ) ? "Finalizado" : "Pendiente" ;
            const estadoColor = ( info.event.backgroundColor  == '#44eb0b' ) ? "success" : "danger" ;
            console.log( info.event.backgroundColor );
            

            $("#modal-title-view").html(`
                <div class="d-flex align-items-baseline gap-2">
                <i class="bi bi-file-earmark-text-fill text-primary fs-4"></i>
                <span class="fw-bold text-uppercase">${e.extendedProps.type}</span>
                </div>
            `);

            $("#modal-body-view").html(`
                <div class="p-4 bg-body shadow-sm rounded-4 border border-light-subtle">

                <!-- Encabezado -->
                <div class="mb-4 pb-2 border-bottom border-secondary-subtle">
                    <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <h5 class="mb-1 fw-semibold text-ligth">${e.title}</h5>
                        <small class="text-muted">
                        <i class="bi bi-person-circle me-1"></i>
                        Realizado por <strong>${e.extendedProps.user}</strong>
                        </small>
                    </div>
                    <div>
                        <span class="badge bg-${estadoColor} px-3 py-2">
                        <i class="bi ${(estadoColor == 'success') ? 'bi-check-circle' : 'bi-x-circle'} me-1"></i>${estadoTexto}
                        </span>
                    </div>
                    </div>
                </div>

                <!-- Cuerpo / Descripción -->
                <div class="mb-4">
                    <h6 class="fw-semibold text-secondary text-uppercase mb-2">
                    <i class="bi bi-info-circle me-1"></i>Descripción del reporte
                    </h6>
                    <div class="p-3 bg-light rounded border-start border-4 border-primary-subtle">
                    <div class="text-dark">${e.extendedProps.text}</div>
                    </div>
                </div>

                <!-- Fechas -->
                <div class="mb-3">
                    <h6 class="fw-semibold text-secondary text-uppercase mb-2">
                    <i class="bi bi-calendar-event me-1"></i>Periodo del evento
                    </h6>
                    <div class="row">
                    <div class="col-md-6">
                        <div class="border rounded-3 p-2 bg-body-tertiary">
                        <small class="text-muted d-block mb-1">Inicio</small>
                        <span class="fw-semibold text-light">${e.startStr}</span>
                        </div>
                    </div>
                    <div class="col-md-6">
                        <div class="border rounded-3 p-2 bg-body-tertiary">
                        <small class="text-muted d-block mb-1">Fin estimado</small>
                        <span class="fw-semibold text-light">${e.endStr || e.startStr}</span>
                        </div>
                    </div>
                    </div>
                </div>

                <!-- Pie -->
                <div class="text-end mt-4 pt-2 border-top border-light">
                    <small class="text-muted">
                    Última actualización: ${new Date().toLocaleString()}
                    </small>
                </div>

                </div>
            `);

            $("#modal-footer-view").html(`
                <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-danger" onClick="deleteEvent('${e.id}')">
                    <i class="bi bi-trash me-1"></i>Eliminar
                </button>
                <button type="button" class="btn btn-outline-primary" onClick="updateEvent('${e.id}')">
                    <i class="bi bi-pencil-square me-1"></i>Modificar
                </button>
                </div>
            `);

            $("#modal-view").modal("show");
            imgParser();
        },
        eventContent: function (info) {
            const { title, extendedProps } = info.event;
            const user = extendedProps.user;
            const atendido = extendedProps.atendido;
            const unidad = extendedProps.unidad;


            // Definimos el color de la franja (verde o rojo)
            const estadoColor = atendido == 1 ? 'var(--bs-success)' : 'var(--bs-danger)';

            // Retornamos HTML personalizado
            return {
                html: `
                <div class="evento-card">
                    
                    <div class="evento-header px-2" style="border-left: 15px solid ${info.backgroundColor};">
                        ${ unidad 
                            ? `<strong>${unidad}</strong>`
                            : `<strong class="text-light">No data</strong>`
                        }
                    </div>
                    <div class="evento-body d-flex flex-column">
                        <small class="text-dark fs-6">${title}</small>
                        <small class="text-dark fs-6">${user}</small>
                    </div>
                </div>
                `
            };
        },
        events: "../php/conexion.php",
    });

    //Objeto del calendario con el
    calendar.render();

    window.deleteEvent = deleteEvent;
    window.updateEvent = updateEvent;
    window.initCreateEvent = initCreateEvent;
    window.newEvent = newEvent;

    //EJEMPLO DE COMO DECLARAR UNA FUNCION ANONIMA DENTRO DE LA VARIABLE DE INICIALIZACION DE FULLCALENDAR
    // calendar.on('dateClick', function (info) {
    //     console.log('Usando una funcion con JQuery para FullCalendar clicked on ' + info.dateStr);
    // });

    // Definir la función deleteEvent globalmente
    //////////////////////////////////////////////////////////

    /* Metodos CRUD de fullcalendar */
    function newEvent() {
        var objeto = {
            id: Date.now().toString(),
            title: $("#title-description").val(),
            unidad: $("#unidad").val(),
            start: $("#start").val(),
            end: $("#end").val(),
            backgroundColor: $("#estatus").val(),
            extendedProps: {
                inicio: $("#start").val(),
                final: $("#end").val(),
                text: $("#text-parsed-quill").val(),
                user: $("#user").val(),
                type: $("#type").val(),
                atendido: false,
            },
        }; //console.log(objeto);
        if (objeto) {
            axios_NewEvent(objeto);
            calendar.addEvent(objeto);
            clearForm("form-add-event");
            $("#modal-add").modal("toggle");
        } else {
            alert("Error no se agrego en el evento");
        }
    }

    function deleteEvent(id) {
        var objeto = { id: id };
        var event = calendar.getEventById(id);
        console.log(event);
        if (event) {
            event.remove();
            axios_DeleteEvent(objeto);
            alert("Eliminado del calendario");
        }
        //Cerrar el modal una vez este se elimine
        $("#modal-view").modal("toggle");
    }

    function updateEvent(id) {
        var objeto = { id: id };
        $("#modal-view").modal("toggle");
        var event = calendar.getEventById(id);
        console.log(event);
        if (event) {
            $("#text .ql-editor").html(event.extendedProps.text);
            $("#user").val(event.extendedProps.user);
            $("#start").val(event.extendedProps.inicio); //startStr :"2024-07-01"
            $("#end").val(event.extendedProps.final);
            $("#type").val(event.extendedProps.type);
            $("#title-description").val(event.title);
        }

        //event.remove();
        axios_DeleteEvent(objeto);
        //Cerrar el modal una vez este se elimine
        $("#modal-add").modal("show");
    }
    /* ---------------------------- */

    /**Init modal newEvent */
    function initCreateEvent(info) {
        if (!$(".ql-toolbar").length) {
            initQuill();
        }
        clearForm("form-add-event");
        $("#modal-add").modal("show");
        $(".start-end").val(info.dateStr);
    }

    /**Init de Quill.js Editor de texto */
    function initQuill() {
        const quill = new Quill("#text", {
            theme: "snow",
            modules: {
                toolbar: [
                    [{ header: [1, 2, 3, false] }],
                    ["bold", "italic", "underline"],
                    ["link", "image"],
                    [{ list: "ordered" }, { list: "bullet" }],
                    ["clean"],
                ],
            },
        }).on("text-change", function () {
            $("#text-parsed-quill").text($("#text .ql-editor").html());
        });
    }
    ///////////////////////////////////////////////////////////

    // Meodos de utileria para fullcalendar y Quill
    function clearForm(formularioID) {
        $("#" + formularioID)
            .find("input:text, input:password, input:file, select")
            .val("");
        $("#" + formularioID)
            .find("input:radio, input:checkbox")
            .prop("checked", false)
            .prop("selected", false);
        $("#text .ql-editor").html("");
    }

    function imgParser() {
        $(".bg-light img").each(function () {
            if ($(this).width() !== 100 || $(this).height() !== 300) {
                $(this).css({
                    width: "200px",
                    height: "200px",
                });
            }
        });
        $(".bg-light img").addClass("rounded mx-auto d-block");
    }
    ///////////////////////////////////////////////////////////
});

/* AXIOS para Query en php y database */
function axios_NewEvent(objeto) {
    axios
        .post("../php/newEvent.php", objeto)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error("Error al subir insertSession.php:", error);
        });
}

function axios_DeleteEvent(objeto) {
    axios
        .post("../php/deleteEvent.php", objeto)
        .then((response) => {
            console.log(response);
        })
        .catch((error) => {
            console.error("Error al subir insertSession.php:", error);
        });
}

function axios_select_red() {
    axios
        .get("../php/select_red.php")
        .then((response) => {
            response.data.forEach((element) => {
                // console.log( element.title );
                $("#body-pendientes").append(`
                    <div class="alert alert-light" role="alert">
                        <div class="d-flex align-items-center">
                            <span class="badge text-bg-info">${element.user}</span>:
                            ${element.title} 
                            <button type="button" class="btn btn-primary ms-auto " id="${element.id}" onClick="axios_select_red_byId(${element.id});">Ver detalles</button>
                        </div>
                    </div>
                    `);
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

function axios_select_memo() {
    const objeto = {
        sql: "SELECT * FROM `data` WHERE backgroundColor = 'red' AND user = 'Guillermo';",
    };
    axios
        .post("../php/query.php", objeto)
        .then((response) => {
            response.data.forEach((element) => {
                // console.log( element.title );
                $("#body-pendientes-guillermo").append(`
                    <div class="alert alert-light" role="alert">
                        <div class="d-flex align-items-center">
                            ${element.title} 
                            <button type="button" class="btn btn-primary ms-auto " id="${element.id}" onClick="axios_select_red_byId(${element.id});">Ver detalles</button>
                        </div>
                    </div>
                    `);
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

function axios_select_ale() {
    const objeto = {
        sql: "SELECT * FROM `data` WHERE backgroundColor = 'red' AND user = 'Alejandra';",
    };
    axios
        .post("../php/query.php", objeto)
        .then((response) => {
            response.data.forEach((element) => {
                // console.log( element.title );
                $("#body-pendientes-alejandra").append(`
                    <div class="alert alert-light" role="alert">
                        <div class="d-flex align-items-center">
                            ${element.title} 
                            <button type="button" class="btn btn-primary ms-auto " id="${element.id}" onClick="axios_select_red_byId(${element.id});">Ver detalles</button>
                        </div>
                    </div>
                    `);
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

function axios_select_JD() {
    const objeto = {
        sql: "SELECT * FROM `data` WHERE backgroundColor = 'red' AND user = 'Jesus';",
    };
    axios
        .post("../php/query.php", objeto)
        .then((response) => {
            response.data.forEach((element) => {
                // console.log( element.title );
                $("#body-pendientes-JD").append(`
                    <div class="alert alert-light" role="alert">
                        <div class="d-flex align-items-center">
                            ${element.title} 
                            <button type="button" class="btn btn-primary ms-auto " id="${element.id}" onClick="axios_select_red_byId(${element.id});">Ver detalles</button>
                        </div>
                    </div>
                    `);
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

function axios_select_red_byId(id) {
    $("#modal-events-status").modal('hide');
    const objeto = {
        id: id,
    };
    axios
        .post("../php/select_red.php", objeto)
        .then((response) => {
            response.data.forEach((element) => {
                showEvent(element);
            });
        })
        .catch((error) => {
            console.log(error);
        });
}

const getDataQuery = async (SQL) => {
    return await axios
        .post("../php/query.php", { SQL: SQL })
        .then((response) => {
            return response.data;
        })
        .catch((error) => {
            return error;
        });
};
/* -------------------------------- */

/* Eventos del DOM */
function showEvent(info) {
    $("#modal-title-view").text(info.type);
    $("#modal-body-view").html(`
            <div class="card">
                <div class="card-header">
                    <div class="d-flex">
                        <div class="p-2 flex-grow-1 ">Realizado por <span class="badge text-bg-secondary">${info.user
        }</span></div>
                        <div class="p-2">${info.title}</div>
                        <div class="p-2">${info.atendido == 0
            ? '<a href="#" class="btn btn-danger">No finalizado</a>'
            : '<a href="#" class="btn btn-success">Finalizado</a>'
        }</div>
                    </div>
                </div>
                <div class="card-body">
                <h5 class="card-title">Descripcion:</h5>
                <hr>
                <div class="bg-light text-dark">
                    <p class="card-text ">${info.text}</p>                
                </div>

                </div>
                <div class="card-footer text-body-secondary">
                El evento se inició el ${info.start} y se espera terminar el ${info.end ? info.start : info.start
        }
                </div>
            </div>
            `);
    $("#modal-footer-view").html(`
            <button type="button" class="btn btn-danger" onClick="deleteEvent('${info.id}');">Eliminar</button>
            <button type="button" class="btn btn-primary" onClick="updateEvent('${info.id}');">Modificar</button>
            `);
    $("#modal-view").modal("show");
    imgParser();
}

function filterByUser(user) {
    // Selecciona todas las tarjetas (cards)
    $('.card').each(function () {
        // Busca el 'span' que contiene el nombre del usuario dentro de la cabecera de la tarjeta
        let userNameSpan = $(this).find('.card-header span');

        // Verifica si el 'span' existe antes de acceder a su texto
        if (userNameSpan.length) {
            let userName = userNameSpan.text().trim();

            // Si el filtro seleccionado es "Ver todos" (user = 'all'), muestra todas las tarjetas
            if (user === 'all') {
                $(this).show();
            } else {
                // Si el nombre del usuario coincide con el filtro seleccionado, muestra la tarjeta
                if (userName.includes(user)) {
                    $(this).show();
                } else {
                    // Si no coincide, oculta la tarjeta
                    $(this).hide();
                }
            }
        }
    });
}


/* --------------- */

/* Jquery  */
const updateStatusEvents = (data) => {
    data.map(elemet => {
        $(`#cont-${elemet.Status.replaceAll(" ", "_")}`).text(elemet.Total);
    })
}



const view_status_events_modal = (name_view) => {
  $("#modal-body-events-status").empty();

  getDataQuery(`SELECT * FROM view_${name_view};`)
    .then((data) => {
      if (!data.length) {
        $("#modal-body-events-status").html(`
          <div class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            <p class="fw-semibold mb-0">No hay reportes en esta categoría</p>
          </div>
        `);
        return;
      }

      data.forEach((element) => {
        $("#modal-body-events-status").append(`
          <div class="card shadow-sm border-0 mb-3 rounded-4 report-card">
            <div class="card-header bg-gradient d-flex justify-content-between align-items-center rounded-top-4"
                 style="background: linear-gradient(90deg, #0099ff, #00c6ff);">
              <div class="d-flex align-items-center gap-2">
                <div class="avatar bg-white text-dark fw-bold rounded-circle d-flex justify-content-center align-items-center" style="width:35px; height:35px;">
                  ${element.user.charAt(0).toUpperCase()}
                </div>
                <div>
                  <span class="fw-semibold text-white">${element.user}</span><br>
                  <small class="text-light opacity-75">Responsable</small>
                </div>
              </div>
              <div class="text-end">
                <small class="text-white-50 d-block">Fecha estimada</small>
                <span class="badge bg-light text-dark px-3 py-2 shadow-sm">${element.end}</span>
              </div>
            </div>

            <div class="card-body bg-secondary">
              <h5 class="card-title text-white mb-2">${element.title}</h5>
              <p class="card-text text-secondary mb-3" style="white-space: pre-line;">
                ${element.text || "<em>Sin descripción.</em>"}
              </p>
              <div class="d-flex justify-content-between align-items-center">
                <span class="badge rounded-pill text-bg-secondary px-3 py-2">
                  ${element.type || "General"}
                </span>
                <button type="button" class="btn btn-outline-warning btn-sm fw-semibold"
                        id="${element.id}" onClick="axios_select_red_byId(${element.id});">
                  Ver detalles <i class="bi bi-arrow-right-circle ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        `);
      });

      $("#modal-events-status").modal("show");
    });
};

/* ------- */
