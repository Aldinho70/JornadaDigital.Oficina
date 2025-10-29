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
    data.map( element => {
        $("#cont-porcent").text( `${Math.round(element.PROMEDIO)}%` )
    });
  });

  // Iniciamos el fullcalendar.js
  var calendarEl = document.getElementById("calendar");
  var calendar = new FullCalendar.Calendar(calendarEl, {
    /**Modo de la tabla */
    initialView: "dayGridMonth",
    /**Lenaguaje de la tabla ES/MX */
    locale: "es",
    height: "auto", // Ajusta la altura autom®¢ticamente
    contentHeight: "auto", // Evita que el contenido se corte
    expandRows: true, // Asegura que las filas se expandan completamente
    /**Eventos nativos de la tabla */
    dateClick: function (info) {
      initCreateEvent(info);
    },
    eventClick: function (info) {
      var getInfo = info.event;
      $("#modal-title-view").text(getInfo.extendedProps.type);
      $("#modal-body-view").html(`
            <div class="card">
                <div class="card-header">
                    <div class="d-flex">
                        <div class="p-2 flex-grow-1 ">Realizado por <span class="badge text-bg-secondary">${
                          getInfo.extendedProps.user
                        }</span></div>
                        <div class="p-2">${getInfo.title}</div>
                        <div class="p-2">${
                          getInfo.extendedProps.atendido == 0
                            ? '<a href="#" class="btn btn-danger">No finalizado</a>'
                            : '<a href="#" class="btn btn-success">Finalizado</a>'
                        }</div>
                    </div>
                </div>
                <div class="card-body">
                <h5 class="card-title">Descripcion:</h5>
                <hr>
                <div class="bg-light text-dark">
                    <p class="card-text ">${
                      getInfo.extendedProps.text
                    }</p>                
                </div>

                </div>
                <div class="card-footer text-body-secondary">
                El evento se inici√≥ el ${
                  getInfo.startStr
                } y se espera terminar el ${
        getInfo.endStr ? getInfo.endStr : getInfo.startStr
      }
                </div>
            </div>
            `);
      $("#modal-footer-view").html(`
            <button type="button" class="btn btn-danger" onClick="deleteEvent('${getInfo.id}');">Eliminar</button>
            <button type="button" class="btn btn-primary" onClick="updateEvent('${getInfo.id}');">Modificar</button>
            `);
      $("#modal-view").modal("show");
      imgParser();
    },

    /**Eventos registrados dentro del calendario se inserta mediante un link  */
    //   events: 'http://localhost/NullPointer.com/JornadaDigital.Oficina/php/conexion.php',
    events: "../php/conexion.php",
    //    events:'http://ws4cjdg.com/JornadaDigital.Oficina/php/conexion.php',
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

  // Definir la funci√≥n deleteEvent globalmente
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
                        <div class="p-2 flex-grow-1 ">Realizado por <span class="badge text-bg-secondary">${
                        info.user
                        }</span></div>
                        <div class="p-2">${info.title}</div>
                        <div class="p-2">${
                        info.atendido == 0
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
                El evento se inici√≥ el ${info.start} y se espera terminar el ${
        info.end ? info.start : info.start
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
        $('.card').each(function() {
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
        data.map( elemet => {
            $(`#cont-${elemet.Status.replaceAll(" ", "_")}`).text( elemet.Total );
        })
    }

    

    const view_status_events_modal = ( name_view ) => {
        $("#modal-body-events-status").empty();
        getDataQuery(`SELECT * FROM view_${name_view};`)
        .then((data) => {
            data.map( element => {
                $("#modal-body-events-status").append(`
                    <div class="card shadow-sm border-0">
                        <div class="card-header bg-info text-white d-flex justify-content-between align-items-center">
                            <span ><i class="bi bi-person-fill"></i>${element.user}</span>
                            <span class="small fs-4">Se espera atender en: <strong>${element.end}</strong></span>
                        </div>
                        <div class="card-body">
                            <h5 class="card-title text-info">${element.title}</h5>
                            <p class="card-text text-secondary">${element.text}</p>
                            <div class="d-flex justify-content-end">
                                <button type="button" class="btn btn-info" id="${element.id}" onClick="axios_select_red_byId(${element.id});">
                                    Ver detalles <i class="bi bi-arrow-right-circle"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                    <hr />
                `);
            });
            $("#modal-events-status").modal('show');
        });
    }
/* ------- */
