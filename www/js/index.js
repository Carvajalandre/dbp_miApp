(function () {
    "use strict";

    var API_BASE_URL = "https://685561e46a6ef0ed663253a9.mockapi.io";
    
    // Variables globales para el CRUD
    var usuarioSeleccionado = null;
    var restauranteSeleccionado = null;

    // Esperar a que el documento esté listo
    $(document).ready(function() {
        console.log("Documento listo");
        inicializarApp();
    });

    // Esperar a que Cordova esté listo
    document.addEventListener('deviceready', function() {
        console.log("Cordova listo");
        inicializarApp();
    }, false);

    function inicializarApp() {
        console.log("Inicializando aplicación...");
        
        // Configurar eventos de botones principales
        $("#btnBuscar").on("click", function() {
            console.log("Botón Buscar clickeado");
            buscarUsuario();
        });

        $("#btnCargar").on("click", function() {
            console.log("Botón Cargar clickeado");
            cargarLista();
        });

        // Eventos para CRUD de usuarios
        $("#btnCrearUsuario").on("click", function() {
            crearUsuarioDesdeFormulario();
        });

        $("#btnActualizarUsuario").on("click", function() {
            actualizarUsuarioDesdeFormulario();
        });

        $("#btnEliminarUsuario").on("click", function() {
            eliminarUsuarioSeleccionado();
        });

        $("#btnLimpiarUsuario").on("click", function() {
            limpiarFormularioUsuario();
        });

        $("#btnCargarUsuarios").on("click", function() {
            cargarListaUsuarios();
        });

        // Eventos para CRUD de restaurantes
        $("#btnCrearRestaurante").on("click", function() {
            crearRestauranteDesdeFormulario();
        });

        $("#btnActualizarRestaurante").on("click", function() {
            actualizarRestauranteDesdeFormulario();
        });

        $("#btnEliminarRestaurante").on("click", function() {
            eliminarRestauranteSeleccionado();
        });

        $("#btnLimpiarRestaurante").on("click", function() {
            limpiarFormularioRestaurante();
        });

        $("#btnCargarRestaurantes").on("click", function() {
            cargarListaRestaurantes();
        });

        console.log("Aplicación inicializada");
    }

    function buscarUsuario() {
        var usuario = $("#txtNombre").val();
        console.log("Buscando usuario:", usuario);

        if (!usuario) {
            $("#divResultado").html('<div class="error-message">Por favor, ingresa un nombre de usuario</div>');
            return;
        }

        // Mostrar mensaje de carga
        $("#divResultado").html('<div class="loading-message">Buscando usuario...</div>');

        $.ajax({
            url: API_BASE_URL + "/usuarios",
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                console.log("Datos recibidos:", data);
                
                // Buscar usuario localmente - adaptado para el esquema de MockAPI
                var usuarioEncontrado = null;
                for (var i = 0; i < data.length; i++) {
                    // Buscar por username o name
                    var nombreUsuario = data[i].username || data[i].name || "";
                    if (nombreUsuario.toLowerCase().indexOf(usuario.toLowerCase()) !== -1) {
                        usuarioEncontrado = data[i];
                        break;
                    }
                }

                if (usuarioEncontrado) {
                    usuarioSeleccionado = usuarioEncontrado;
                    var html = '<div class="welcome-message">';
                    html += '<h3>¡Usuario Encontrado!</h3>';
                    html += '<p><strong>Nombre:</strong> ' + (usuarioEncontrado.name || usuarioEncontrado.username || 'N/A') + '</p>';
                    html += '<p><strong>Email:</strong> ' + (usuarioEncontrado.email || 'N/A') + '</p>';
                    html += '<p><strong>ID:</strong> ' + usuarioEncontrado.id + '</p>';
                    html += '<button type="button" class="crud-btn" onclick="editarUsuarioDesdeBusqueda()">Editar Usuario</button>';
                    html += '</div>';
                    $("#divResultado").html(html);
                } else {
                    $("#divResultado").html('<div class="error-message">Usuario no encontrado. Intenta con otro nombre.</div>');
                }
            },
            error: function(xhr, status, error) {
                console.error("Error en búsqueda:", status, error);
                $("#divResultado").html('<div class="error-message">Error: ' + status + ' - ' + error + '</div>');
            }
        });
    }

    function cargarLista() {
        console.log("Cargando lista de restaurantes...");

        // Mostrar mensaje de carga
        $("#divLista").html('<div class="loading-message">Cargando restaurantes...</div>');

        $.ajax({
            url: API_BASE_URL + "/restaurantes",
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                console.log("Restaurantes recibidos:", data);
                
                if (data.length === 0) {
                    $("#divLista").html('<div class="error-message">No hay restaurantes disponibles</div>');
                    return;
                }
                
                var tabla = '<div style="overflow-x: auto;">';
                tabla += '<table class="restaurant-table">';
                tabla += '<thead><tr>';
                tabla += '<th>ID</th>';
                tabla += '<th>Nombre</th>';
                tabla += '<th>Dirección</th>';
                tabla += '<th>Teléfono</th>';
                tabla += '<th>Acciones</th>';
                tabla += '</tr></thead>';
                tabla += '<tbody>';

                for (var i = 0; i < data.length; i++) {
                    var restaurante = data[i];
                    tabla += '<tr>';
                    tabla += '<td><strong>' + (restaurante.id || "N/A") + '</strong></td>';
                    tabla += '<td>' + (restaurante.nombre || "N/A") + '</td>';
                    tabla += '<td>' + (restaurante.direccion || "N/A") + '</td>';
                    tabla += '<td>' + (restaurante.telefono || "N/A") + '</td>';
                    tabla += '<td>';
                    tabla += '<button type="button" class="crud-btn-small" onclick="editarRestauranteDesdeLista(\'' + restaurante.id + '\')">Editar</button> ';
                    tabla += '<button type="button" class="crud-btn-small-delete" onclick="eliminarRestaurante(\'' + restaurante.id + '\')">Eliminar</button>';
                    tabla += '</td>';
                    tabla += '</tr>';
                }

                tabla += '</tbody></table></div>';
                
                // Agregar resumen
                tabla += '<div class="summary-box">';
                tabla += '<strong>Total de restaurantes: ' + data.length + '</strong>';
                tabla += '</div>';
                
                $("#divLista").html(tabla);
            },
            error: function(xhr, status, error) {
                console.error("Error cargando restaurantes:", status, error);
                $("#divLista").html('<div class="error-message">Error: ' + status + ' - ' + error + '</div>');
            }
        });
    }

    // ===== FUNCIONES PARA GESTIÓN DE USUARIOS =====

    function cargarListaUsuarios() {
        console.log("Cargando lista de usuarios...");

        $("#divListaUsuarios").html('<div class="loading-message">Cargando usuarios...</div>');

        $.ajax({
            url: API_BASE_URL + "/usuarios",
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                console.log("Usuarios recibidos:", data);
                
                if (data.length === 0) {
                    $("#divListaUsuarios").html('<div class="error-message">No hay usuarios disponibles</div>');
                    return;
                }
                
                var tabla = '<div style="overflow-x: auto;">';
                tabla += '<table class="restaurant-table">';
                tabla += '<thead><tr>';
                tabla += '<th>ID</th>';
                tabla += '<th>Nombre</th>';
                tabla += '<th>Email</th>';
                tabla += '<th>Acciones</th>';
                tabla += '</tr></thead>';
                tabla += '<tbody>';

                for (var i = 0; i < data.length; i++) {
                    var usuario = data[i];
                    tabla += '<tr>';
                    tabla += '<td><strong>' + (usuario.id || "N/A") + '</strong></td>';
                    tabla += '<td>' + (usuario.name || usuario.username || "N/A") + '</td>';
                    tabla += '<td>' + (usuario.email || "N/A") + '</td>';
                    tabla += '<td>';
                    tabla += '<button type="button" class="crud-btn-small" onclick="seleccionarUsuarioParaEditar(\'' + usuario.id + '\')">Editar</button> ';
                    tabla += '<button type="button" class="crud-btn-small-delete" onclick="eliminarUsuario(\'' + usuario.id + '\')">Eliminar</button>';
                    tabla += '</td>';
                    tabla += '</tr>';
                }

                tabla += '</tbody></table></div>';
                
                // Agregar resumen
                tabla += '<div class="summary-box">';
                tabla += '<strong>Total de usuarios: ' + data.length + '</strong>';
                tabla += '</div>';
                
                $("#divListaUsuarios").html(tabla);
            },
            error: function(xhr, status, error) {
                console.error("Error cargando usuarios:", status, error);
                $("#divListaUsuarios").html('<div class="error-message">Error: ' + status + ' - ' + error + '</div>');
            }
        });
    }

    function crearUsuarioDesdeFormulario() {
        var nombre = $("#txtUsuarioNombre").val();
        var email = $("#txtUsuarioEmail").val();
        var password = $("#txtUsuarioPassword").val();

        if (!nombre || !email || !password) {
            alert("Por favor, completa todos los campos");
            return;
        }

        crearUsuario(nombre, email, password);
    }

    function actualizarUsuarioDesdeFormulario() {
        if (!usuarioSeleccionado) {
            alert("Primero selecciona un usuario para editar");
            return;
        }

        var nombre = $("#txtUsuarioNombre").val();
        var email = $("#txtUsuarioEmail").val();
        var password = $("#txtUsuarioPassword").val();

        if (!nombre || !email || !password) {
            alert("Por favor, completa todos los campos");
            return;
        }

        actualizarUsuario(usuarioSeleccionado.id, nombre, email, password);
    }

    function eliminarUsuarioSeleccionado() {
        if (!usuarioSeleccionado) {
            alert("Primero selecciona un usuario para eliminar");
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar el usuario: " + (usuarioSeleccionado.name || usuarioSeleccionado.username) + "?")) {
            eliminarUsuario(usuarioSeleccionado.id);
        }
    }

    // ===== FUNCIONES PARA GESTIÓN DE RESTAURANTES =====

    function cargarListaRestaurantes() {
        console.log("Cargando lista de restaurantes...");

        $("#divListaRestaurantes").html('<div class="loading-message">Cargando restaurantes...</div>');

        $.ajax({
            url: API_BASE_URL + "/restaurantes",
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                console.log("Restaurantes recibidos:", data);
                
                if (data.length === 0) {
                    $("#divListaRestaurantes").html('<div class="error-message">No hay restaurantes disponibles</div>');
                    return;
                }
                
                var tabla = '<div style="overflow-x: auto;">';
                tabla += '<table class="restaurant-table">';
                tabla += '<thead><tr>';
                tabla += '<th>ID</th>';
                tabla += '<th>Nombre</th>';
                tabla += '<th>Dirección</th>';
                tabla += '<th>Teléfono</th>';
                tabla += '<th>Acciones</th>';
                tabla += '</tr></thead>';
                tabla += '<tbody>';

                for (var i = 0; i < data.length; i++) {
                    var restaurante = data[i];
                    tabla += '<tr>';
                    tabla += '<td><strong>' + (restaurante.id || "N/A") + '</strong></td>';
                    tabla += '<td>' + (restaurante.nombre || "N/A") + '</td>';
                    tabla += '<td>' + (restaurante.direccion || "N/A") + '</td>';
                    tabla += '<td>' + (restaurante.telefono || "N/A") + '</td>';
                    tabla += '<td>';
                    tabla += '<button type="button" class="crud-btn-small" onclick="seleccionarRestauranteParaEditar(\'' + restaurante.id + '\')">Editar</button> ';
                    tabla += '<button type="button" class="crud-btn-small-delete" onclick="eliminarRestaurante(\'' + restaurante.id + '\')">Eliminar</button>';
                    tabla += '</td>';
                    tabla += '</tr>';
                }

                tabla += '</tbody></table></div>';
                
                // Agregar resumen
                tabla += '<div class="summary-box">';
                tabla += '<strong>Total de restaurantes: ' + data.length + '</strong>';
                tabla += '</div>';
                
                $("#divListaRestaurantes").html(tabla);
            },
            error: function(xhr, status, error) {
                console.error("Error cargando restaurantes:", status, error);
                $("#divListaRestaurantes").html('<div class="error-message">Error: ' + status + ' - ' + error + '</div>');
            }
        });
    }

    function crearRestauranteDesdeFormulario() {
        var nombre = $("#txtRestauranteNombre").val();
        var direccion = $("#txtRestauranteDireccion").val();
        var telefono = $("#txtRestauranteTelefono").val();

        if (!nombre || !direccion || !telefono) {
            alert("Por favor, completa todos los campos");
            return;
        }

        crearRestaurante(nombre, direccion, telefono);
    }

    function actualizarRestauranteDesdeFormulario() {
        if (!restauranteSeleccionado) {
            alert("Primero selecciona un restaurante para editar");
            return;
        }

        var nombre = $("#txtRestauranteNombre").val();
        var direccion = $("#txtRestauranteDireccion").val();
        var telefono = $("#txtRestauranteTelefono").val();

        if (!nombre || !direccion || !telefono) {
            alert("Por favor, completa todos los campos");
            return;
        }

        actualizarRestaurante(restauranteSeleccionado.id, nombre, direccion, telefono);
    }

    function eliminarRestauranteSeleccionado() {
        if (!restauranteSeleccionado) {
            alert("Primero selecciona un restaurante para eliminar");
            return;
        }

        if (confirm("¿Estás seguro de que quieres eliminar el restaurante: " + restauranteSeleccionado.nombre + "?")) {
            eliminarRestaurante(restauranteSeleccionado.id);
        }
    }

    // ===== FUNCIONES GLOBALES CRUD =====

    window.crearUsuario = function(nombre, email, password) {
        $.ajax({
            url: API_BASE_URL + "/usuarios",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            timeout: 15000,
            data: JSON.stringify({
                username: nombre,
                name: nombre,
                email: email,
                password: password
            }),
            success: function(data) {
                console.log("Usuario creado:", data);
                alert("Usuario creado exitosamente con ID: " + data.id);
                limpiarFormularioUsuario();
                cargarListaUsuarios(); // Recargar la lista
            },
            error: function(xhr, status, error) {
                console.error("Error creando usuario:", status, error);
                alert("Error al crear usuario: " + status);
            }
        });
    };

    window.actualizarUsuario = function(id, nombre, email, password) {
        $.ajax({
            url: API_BASE_URL + "/usuarios/" + id,
            type: "PUT",
            dataType: "json",
            contentType: "application/json",
            timeout: 15000,
            data: JSON.stringify({
                username: nombre,
                name: nombre,
                email: email,
                password: password
            }),
            success: function(data) {
                console.log("Usuario actualizado:", data);
                alert("Usuario actualizado exitosamente");
                usuarioSeleccionado = null;
                limpiarFormularioUsuario();
                cargarListaUsuarios(); // Recargar la lista
            },
            error: function(xhr, status, error) {
                console.error("Error actualizando usuario:", status, error);
                alert("Error al actualizar usuario: " + status);
            }
        });
    };

    window.eliminarUsuario = function(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este usuario?")) {
            $.ajax({
                url: API_BASE_URL + "/usuarios/" + id,
                type: "DELETE",
                timeout: 15000,
                success: function() {
                    console.log("Usuario eliminado");
                    alert("Usuario eliminado exitosamente");
                    usuarioSeleccionado = null;
                    limpiarFormularioUsuario();
                    cargarListaUsuarios(); // Recargar la lista
                },
                error: function(xhr, status, error) {
                    console.error("Error eliminando usuario:", status, error);
                    alert("Error al eliminar usuario: " + status);
                }
            });
        }
    };

    window.crearRestaurante = function(nombre, direccion, telefono) {
        $.ajax({
            url: API_BASE_URL + "/restaurantes",
            type: "POST",
            dataType: "json",
            contentType: "application/json",
            timeout: 15000,
            data: JSON.stringify({
                nombre: nombre,
                direccion: direccion,
                telefono: telefono,
                descripcion: ""
            }),
            success: function(data) {
                console.log("Restaurante creado:", data);
                alert("Restaurante creado exitosamente con ID: " + data.id);
                limpiarFormularioRestaurante();
                cargarListaRestaurantes(); // Recargar la lista
            },
            error: function(xhr, status, error) {
                console.error("Error creando restaurante:", status, error);
                alert("Error al crear restaurante: " + status);
            }
        });
    };

    window.actualizarRestaurante = function(id, nombre, direccion, telefono) {
        $.ajax({
            url: API_BASE_URL + "/restaurantes/" + id,
            type: "PUT",
            dataType: "json",
            contentType: "application/json",
            timeout: 15000,
            data: JSON.stringify({
                nombre: nombre,
                direccion: direccion,
                telefono: telefono,
                descripcion: ""
            }),
            success: function(data) {
                console.log("Restaurante actualizado:", data);
                alert("Restaurante actualizado exitosamente");
                restauranteSeleccionado = null;
                limpiarFormularioRestaurante();
                cargarListaRestaurantes(); // Recargar la lista
            },
            error: function(xhr, status, error) {
                console.error("Error actualizando restaurante:", status, error);
                alert("Error al actualizar restaurante: " + status);
            }
        });
    };

    window.eliminarRestaurante = function(id) {
        if (confirm("¿Estás seguro de que quieres eliminar este restaurante?")) {
            $.ajax({
                url: API_BASE_URL + "/restaurantes/" + id,
                type: "DELETE",
                timeout: 15000,
                success: function() {
                    console.log("Restaurante eliminado");
                    alert("Restaurante eliminado exitosamente");
                    restauranteSeleccionado = null;
                    limpiarFormularioRestaurante();
                    cargarListaRestaurantes(); // Recargar la lista
                },
                error: function(xhr, status, error) {
                    console.error("Error eliminando restaurante:", status, error);
                    alert("Error al eliminar restaurante: " + status);
                }
            });
        }
    };

    // ===== FUNCIONES DE SELECCIÓN Y NAVEGACIÓN =====

    window.editarUsuarioDesdeBusqueda = function() {
        if (usuarioSeleccionado) {
            // Navegar a la página de gestión de usuarios
            $.mobile.changePage("#pagefour", { transition: "slide" });
            
            // Llenar el formulario con los datos del usuario
            setTimeout(function() {
                $("#txtUsuarioNombre").val(usuarioSeleccionado.name || usuarioSeleccionado.username);
                $("#txtUsuarioEmail").val(usuarioSeleccionado.email);
                $("#txtUsuarioPassword").val(usuarioSeleccionado.password);
                $("#btnCrearUsuario").hide();
                $("#btnActualizarUsuario").show();
                $("#btnEliminarUsuario").show();
            }, 500);
        }
    };

    window.seleccionarUsuarioParaEditar = function(id) {
        $.ajax({
            url: API_BASE_URL + "/usuarios/" + id,
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                usuarioSeleccionado = data;
                $("#txtUsuarioNombre").val(data.name || data.username);
                $("#txtUsuarioEmail").val(data.email);
                $("#txtUsuarioPassword").val(data.password);
                $("#btnCrearUsuario").hide();
                $("#btnActualizarUsuario").show();
                $("#btnEliminarUsuario").show();
            },
            error: function(xhr, status, error) {
                console.error("Error obteniendo usuario:", status, error);
                alert("Error al obtener usuario: " + status);
            }
        });
    };

    window.editarRestauranteDesdeLista = function(id) {
        // Navegar a la página de gestión de restaurantes
        $.mobile.changePage("#pagefive", { transition: "slide" });
        
        // Seleccionar el restaurante después de la navegación
        setTimeout(function() {
            seleccionarRestauranteParaEditar(id);
        }, 500);
    };

    window.seleccionarRestauranteParaEditar = function(id) {
        $.ajax({
            url: API_BASE_URL + "/restaurantes/" + id,
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                restauranteSeleccionado = data;
                $("#txtRestauranteNombre").val(data.nombre);
                $("#txtRestauranteDireccion").val(data.direccion);
                $("#txtRestauranteTelefono").val(data.telefono);
                $("#btnCrearRestaurante").hide();
                $("#btnActualizarRestaurante").show();
                $("#btnEliminarRestaurante").show();
            },
            error: function(xhr, status, error) {
                console.error("Error obteniendo restaurante:", status, error);
                alert("Error al obtener restaurante: " + status);
            }
        });
    };

    // ===== FUNCIONES AUXILIARES =====

    function limpiarFormularioUsuario() {
        $("#txtUsuarioNombre").val("");
        $("#txtUsuarioEmail").val("");
        $("#txtUsuarioPassword").val("");
        $("#btnCrearUsuario").show();
        $("#btnActualizarUsuario").hide();
        $("#btnEliminarUsuario").hide();
    }

    function limpiarFormularioRestaurante() {
        $("#txtRestauranteNombre").val("");
        $("#txtRestauranteDireccion").val("");
        $("#txtRestauranteTelefono").val("");
        $("#btnCrearRestaurante").show();
        $("#btnActualizarRestaurante").hide();
        $("#btnEliminarRestaurante").hide();
    }

    window.testAPI = function() {
        console.log("Probando API...");
        $.ajax({
            url: API_BASE_URL + "/usuarios",
            type: "GET",
            dataType: "json",
            timeout: 15000,
            success: function(data) {
                console.log("API funcionando:", data);
                alert("API OK! " + data.length + " usuarios encontrados");
            },
            error: function(xhr, status, error) {
                console.error("API error:", status, error);
                alert("Error API: " + status);
            }
        });
    };

})();