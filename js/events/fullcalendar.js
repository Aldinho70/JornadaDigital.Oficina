$(function () {
    const params = new URLSearchParams(window.location.search);
    if (params.get("version") === "iframe") {
        $("#root-header").addClass("visually-hidden");
    }

    initQuill();
    $("#btnadd").attr("type", "button");

    getDataQuery("SELECT * FROM `view_status_events`;").then((data) => {
        updateStatusEvents(data);
    });

    getDataQuery("SELECT * FROM `view_promedio_terminados`;").then((data) => {
        data.forEach((element) => {
            $("#cont-porcent").text(`${Math.round(element.PROMEDIO)}%`);
        });
    });

    const calendarEl = document.getElementById("calendar");
    const calendar = new FullCalendar.Calendar(calendarEl, buildCalendarConfig());
    calendar.render();

    // Crear buscador
   setTimeout(() => {
    const toolbar = document.querySelector(".fc-toolbar-chunk");

    // Contenedor
    const wrapper = document.createElement("div");
    wrapper.className = "d-flex align-items-center ms-2";

    // Input
    const input = document.createElement("input");
    input.type = "text";
    input.id = "calendarSearch";
    input.className = "form-control form-control-sm me-2 fc-button";
    input.style.width = "180px";

    // Botón buscar
    const button = document.createElement("button");
    button.textContent = "Buscar";
    button.className = "fc-button fc-button-primary fc-button-active";

    button.addEventListener("click", function () {
        calendar.removeAllEvents();
        calendar.refetchEvents();
    });

    wrapper.appendChild(input);
    wrapper.appendChild(button);
    toolbar.appendChild(wrapper);

    }, 200);

    window.calendar = calendar;
    window.deleteEvent = deleteEvent;
    window.updateEvent = updateEvent;
    window.initCreateEvent = initCreateEvent;
    window.newEvent = newEvent;

    function buildCalendarConfig() {
        const storageViewKey = "jd.calendar.initialView";
        const persistedView = localStorage.getItem(storageViewKey);
        const eventEndpoint =
            window.CALENDAR_EVENTS_ENDPOINT ||
            "http://ws4cjdg.com/JDigitalReportsV2/src/api/routes/calendar/getEventsCalendar.php";

        const defaults = {
            initialView: persistedView || "dayGridMonth",
            locale: "es",
            timeZone: "local",
            firstDay: 1,
            height: "auto",
            contentHeight: "auto",
            expandRows: true,
            nowIndicator: true,
            navLinks: true,
            selectable: true,
            selectMirror: true,
            unselectAuto: true,
            dayMaxEvents: true,
            moreLinkClick: "popover",
            weekends: true,
            hiddenDays: [0],
            eventDisplay: "block",
            eventOrder: "start,-duration,allDay,title",
            displayEventEnd: true,
            fixedWeekCount: false,
            stickyHeaderDates: true,
            progressiveEventRendering: true,
            headerToolbar: {
                left: "prev,next today refreshEvents",
                center: "title",
                right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
            },
            buttonText: {
                today: "Hoy",
                month: "Mes",
                week: "Semana",
                day: "Dia",
                list: "Lista",
            },
            customButtons: {
                refreshEvents: {
                    text: "Actualizar",
                    click: function () {
                        calendar.refetchEvents();
                    }
                }
            },
            slotMinTime: "06:00:00",
            slotMaxTime: "22:00:00",
            slotDuration: "00:30:00",
            slotLabelInterval: "01:00",
            slotEventOverlap: true,
            businessHours: [
                { daysOfWeek: [1, 2, 3, 4, 5], startTime: "08:00", endTime: "18:00" },
                { daysOfWeek: [6], startTime: "08:00", endTime: "13:00" },
            ],
            dateClick: function (info) {
                initCreateEvent(info);
            },
            select: function (selectionInfo) {
                if (window.CALENDAR_QUICK_CREATE_ON_SELECT === true) {
                    initCreateEvent({ dateStr: selectionInfo.startStr.slice(0, 10) });
                }
            },
            eventClick: function (info) {
                openEventModal(info.event);
            },
            eventContent: function (info) {
                const title = info.event.title || "Sin titulo";
                const props = info.event.extendedProps || {};
                const user = props.user || "Sin responsable";
                const unidad = props.unidad;
                return {
                    html: `
                <div class="evento-card">
                    <div class="evento-header px-2" style="border-left: 15px solid ${info.backgroundColor};">
                        ${unidad ? `<strong>${unidad}</strong>` : `<strong class="text-light">No data</strong>`}
                    </div>
                    <div class="evento-body d-flex flex-column">
                        <small class="text-dark fs-6">${title}</small>
                        <small class="text-dark fs-6">${user}</small>
                    </div>
                </div>
                `,
                };
            },
            eventDidMount: function (info) {
                const props = info.event.extendedProps || {};
                const tooltip = [
                    info.event.title || "Sin titulo",
                    props.user ? `Responsable: ${props.user}` : "",
                    props.unidad ? `Unidad: ${props.unidad}` : "",
                ]
                    .filter(Boolean)
                    .join(" | ");
                info.el.setAttribute("title", tooltip);
            },
            datesSet: function (dateInfo) {
                localStorage.setItem(storageViewKey, dateInfo.view.type);
            },
            loading: function (isLoading) {
                $("#calendar").toggleClass("is-loading", isLoading);
            },
            events: {
                url: eventEndpoint,
                extraParams: function () {
                    return {
                        filter: document.getElementById("calendarSearch")?.value || ""
                    };
                },
                failure: function (error) {
                    console.error("Error cargando eventos:", error);
                },
            },
            
        };

        const externalConfig = window.CALENDAR_CONFIG || {};
        return $.extend(true, {}, defaults, externalConfig);
    }

    function openEventModal(event) {
        const props = event.extendedProps || {};
        const isDone = String(props.atendido) === "1" || event.backgroundColor === "#44eb0b";
        const estadoTexto = isDone ? "Finalizado" : "Pendiente";
        const estadoColor = isDone ? "success" : "danger";

        $("#modal-title-view").html(`
            <div class="d-flex align-items-baseline gap-2">
                <i class="bi bi-file-earmark-text-fill text-primary fs-4"></i>
                <span class="fw-bold text-uppercase">${props.type || "Reporte"}</span>
            </div>
        `);

        $("#modal-body-view").html(`
            <div class="p-4 bg-body shadow-sm rounded-4 border border-light-subtle">
                <div class="mb-4 pb-2 border-bottom border-secondary-subtle">
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <h5 class="mb-1 fw-semibold text-light">${event.title || "Sin titulo"}</h5>
                            <small class="text-muted">
                                <i class="bi bi-person-circle me-1"></i>
                                Realizado por <strong>${props.user || "N/A"}</strong>
                            </small>
                        </div>
                        <div>
                            <span class="badge bg-${estadoColor} px-3 py-2">
                                <i class="bi ${estadoColor === "success" ? "bi-check-circle" : "bi-x-circle"} me-1"></i>${estadoTexto}
                            </span>
                        </div>
                    </div>
                </div>

                <div class="mb-4">
                    <h6 class="fw-semibold text-secondary text-uppercase mb-2">
                        <i class="bi bi-info-circle me-1"></i>Descripcion del reporte
                    </h6>
                    <div class="p-3 bg-light rounded border-start border-4 border-primary-subtle">
                        <div class="text-dark">${props.text || "Sin descripcion"}</div>
                    </div>
                </div>

                <div class="mb-3">
                    <h6 class="fw-semibold text-secondary text-uppercase mb-2">
                        <i class="bi bi-calendar-event me-1"></i>Periodo del evento
                    </h6>
                    <div class="row">
                        <div class="col-md-6">
                            <div class="border rounded-3 p-2 bg-body-tertiary">
                                <small class="text-muted d-block mb-1">Inicio</small>
                                <span class="fw-semibold text-light">${event.startStr || "-"}</span>
                            </div>
                        </div>
                        <div class="col-md-6">
                            <div class="border rounded-3 p-2 bg-body-tertiary">
                                <small class="text-muted d-block mb-1">Fin estimado</small>
                                <span class="fw-semibold text-light">${event.endStr || event.startStr || "-"}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="text-end mt-4 pt-2 border-top border-light">
                    <small class="text-muted">
                        Ultima actualizacion: ${new Date().toLocaleString()}
                    </small>
                </div>
            </div>
        `);

        $("#modal-footer-view").html(`
            <div class="d-flex justify-content-end gap-2">
                <button type="button" class="btn btn-outline-danger" onClick="deleteEvent('${event.id}')">
                    <i class="bi bi-trash me-1"></i>Eliminar
                </button>
                <button type="button" class="btn btn-outline-primary" onClick="updateEvent('${event.id}')">
                    <i class="bi bi-pencil-square me-1"></i>Modificar
                </button>
            </div>
        `);

        $("#modal-view").modal("show");
        imgParser();
    }

    function newEvent() {
        const start = $("#start").val();
        const end = $("#end").val();
        const title = $("#title-description").val();
        const user = $("#user").val();
        const unidad = $("#unidad").val();
        const estatus = $("#estatus").val();
        const text = $("#text-parsed-quill").val();
        const editingId = $("#form-add-event").data("editing-id") || null;

        if (!start || !end || !title || !user || !unidad || !estatus || !text) {
            alert("Completa todos los campos obligatorios antes de guardar.");
            return;
        }

        if (new Date(end) < new Date(start)) {
            alert("La fecha de fin no puede ser menor que la fecha de inicio.");
            return;
        }

        const objeto = {
            id: Date.now().toString(),
            title: title,
            unidad: unidad,
            start: start,
            end: end,
            backgroundColor: estatus,
            extendedProps: {
                inicio: start,
                final: end,
                text: text,
                user: user,
                type: "Atencion a clientes",
                atendido: estatus === "#44eb0b" ? 1 : 0,
            },
        };

        const finishCreate = () => {
            const newCalendarEvent = calendar.addEvent(objeto);
            axios_NewEvent(objeto)
                .then(() => {
                    calendar.refetchEvents();
                })
                .catch(() => {
                    newCalendarEvent.remove();
                    alert("No fue posible guardar el evento en servidor.");
                });
        };

        if (editingId) {
            const currentEvent = calendar.getEventById(editingId);
            if (currentEvent) {
                currentEvent.remove();
            }
            axios_DeleteEvent({ id: editingId }).finally(() => {
                finishCreate();
            });
        } else {
            finishCreate();
        }

        clearForm("form-add-event");
        $("#form-add-event").removeData("editing-id");
        $("#modal-add").modal("toggle");
    }

    function deleteEvent(id) {
        const event = calendar.getEventById(id);
        if (event) {
            event.remove();
            axios_DeleteEvent({ id: id });
            alert("Evento eliminado del calendario.");
        }
        $("#modal-view").modal("toggle");
    }

    function updateEvent(id) {
        const event = calendar.getEventById(id);
        $("#modal-view").modal("toggle");

        if (!event) {
            return;
        }

        $("#text .ql-editor").html(event.extendedProps.text || "");
        $("#text-parsed-quill").text(event.extendedProps.text || "");
        $("#user").val(event.extendedProps.user || "");
        $("#start").val(event.extendedProps.inicio || event.startStr || "");
        $("#end").val(event.extendedProps.final || event.endStr || event.startStr || "");
        $("#title-description").val(event.title || "");
        $("#unidad").val(event.extendedProps.unidad || "");
        $("#estatus").val(event.backgroundColor || "");
        $("#form-add-event").data("editing-id", id);
        $("#modal-add").modal("show");
    }

    function initCreateEvent(info) {
        if (!$(".ql-toolbar").length) {
            initQuill();
        }
        clearForm("form-add-event");
        $("#form-add-event").removeData("editing-id");
        $("#modal-add").modal("show");
        $(".start-end").val(info.dateStr);
    }

    function initQuill() {
        if (window.jdQuillEditor) {
            return;
        }

        window.jdQuillEditor = new Quill("#text", {
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
        });

        window.jdQuillEditor.on("text-change", function () {
            $("#text-parsed-quill").text($("#text .ql-editor").html());
        });
    }

    function clearForm(formularioID) {
        $("#" + formularioID)
            .find("input:text, input:password, input:file, select, textarea")
            .val("");
        $("#" + formularioID)
            .find("input:radio, input:checkbox")
            .prop("checked", false)
            .prop("selected", false);
        $("#text .ql-editor").html("");
    }
});

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

function axios_NewEvent(objeto) {
    return axios.post("../php/newEvent.php", objeto);
}

function axios_DeleteEvent(objeto) {
    return axios.post("../php/deleteEvent.php", objeto);
}

function axios_select_red() {
    axios
        .get("../php/select_red.php")
        .then((response) => {
            response.data.forEach((element) => {
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
    $("#modal-events-status").modal("hide");
    axios
        .post("../php/select_red.php", { id: id })
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

function showEvent(info) {
    $("#modal-title-view").text(info.type);
    $("#modal-body-view").html(`
            <div class="card">
                <div class="card-header">
                    <div class="d-flex">
                        <div class="p-2 flex-grow-1 ">Realizado por <span class="badge text-bg-secondary">${info.user}</span></div>
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
                El evento se inicio el ${info.start} y se espera terminar el ${info.end ? info.end : info.start}
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
    $(".card").each(function () {
        const userNameSpan = $(this).find(".card-header span");
        if (userNameSpan.length) {
            const userName = userNameSpan.text().trim();
            if (user === "all" || userName.includes(user)) {
                $(this).show();
            } else {
                $(this).hide();
            }
        }
    });
}

const updateStatusEvents = (data) => {
    data.forEach((element) => {
        $(`#cont-${element.Status.replaceAll(" ", "_")}`).text(element.Total);
    });
};

const view_status_events_modal = (name_view) => {
    $("#modal-body-events-status").empty();

    getDataQuery(`SELECT * FROM view_${name_view};`).then((data) => {
        if (!data.length) {
            $("#modal-body-events-status").html(`
          <div class="text-center py-5 text-muted">
            <i class="bi bi-inbox fs-1 d-block mb-2"></i>
            <p class="fw-semibold mb-0">No hay reportes en esta categoria</p>
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
                ${element.text || "<em>Sin descripcion.</em>"}
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

window.imgParser = imgParser;
window.filterByUser = filterByUser;
window.view_status_events_modal = view_status_events_modal;
