const servicios = [
  { id: 1, nombre: "Cambio de aceite",       categoria: "Motor",       descripcion: "Aceite sintético y cambio de filtro.",          precio: 35,  icono: "bi-droplet-half" },
  { id: 2, nombre: "Alineación y balanceo",  categoria: "Suspensión",  descripcion: "Mejora la estabilidad y el desgaste de llantas.", precio: 25,  icono: "bi-record-circle" },
  { id: 3, nombre: "Revisión de frenos",     categoria: "Seguridad",   descripcion: "Inspección y cambio de pastillas y discos.",     precio: 40,  icono: "bi-disc" },
  { id: 4, nombre: "Cambio de batería",      categoria: "Eléctrico",   descripcion: "Diagnóstico y reemplazo de batería.",            precio: 30,  icono: "bi-battery-charging" },
  { id: 5, nombre: "Diagnóstico con scanner",categoria: "Eléctrico",   descripcion: "Lectura de códigos de falla del vehículo.",      precio: 20,  icono: "bi-cpu" },
  { id: 6, nombre: "Afinamiento de motor",   categoria: "Motor",       descripcion: "Bujías, filtros y calibración general.",         precio: 80,  icono: "bi-gear-wide-connected" },
  { id: 7, nombre: "Revisión de suspensión", categoria: "Suspensión",  descripcion: "Amortiguadores, rótulas y terminales.",          precio: 45,  icono: "bi-arrows-vertical" },
  { id: 8, nombre: "Aire acondicionado",     categoria: "Confort",     descripcion: "Carga de gas y limpieza del sistema.",           precio: 50,  icono: "bi-snow" }
];

// Elementos del catálogo
const contenedorCatalogo = document.getElementById("catalogo");
const contenedorFiltros  = document.getElementById("filtros");

// Muestra las tarjetas de servicio.
function renderServicios(lista) {
  if (lista.length === 0) {
    contenedorCatalogo.innerHTML = `<p class="text-center text-muted">No hay servicios en esta categoría.</p>`;
    return;
  }

  contenedorCatalogo.innerHTML = lista.map(s => `
    <div class="col-12 col-md-6 col-lg-3">
      <div class="card card-servicio h-100 shadow-sm text-center">
        <div class="card-body">
          <i class="bi ${s.icono} icono"></i>
          <h5 class="card-title mt-2">${s.nombre}</h5>
          <span class="badge text-bg-secondary mb-2">${s.categoria}</span>
          <p class="card-text">${s.descripcion}</p>
          <span class="fw-bold">Desde $${s.precio}</span>
        </div>
      </div>
    </div>
  `).join("");
}

// Crea un filtro por categoría.
function renderFiltros() {
  // Evita repetir categorías.
  const categorias = ["Todos", ...new Set(servicios.map(s => s.categoria))];

  contenedorFiltros.innerHTML = "";
  categorias.forEach((cat, indice) => {
    const boton = document.createElement("button");
    boton.type = "button";
    boton.textContent = cat;
    boton.className = "btn btn-outline-dark btn-sm btn-filtro me-2 mb-2";
    if (indice === 0) boton.classList.add("active");

    boton.addEventListener("click", () => {
      contenedorFiltros.querySelectorAll(".btn-filtro")
        .forEach(b => b.classList.remove("active"));
      boton.classList.add("active");

      const filtrados = (cat === "Todos")
        ? servicios
        : servicios.filter(s => s.categoria === cat);
      renderServicios(filtrados);
    });

    contenedorFiltros.appendChild(boton);
  });
}

// Anima los datos destacados.
function animarContadores() {
  document.querySelectorAll(".numero").forEach(el => {
    const meta = Number(el.dataset.meta);
    const paso = Math.max(1, Math.ceil(meta / 60));
    let actual = 0;

    const intervalo = setInterval(() => {
      actual += paso;
      if (actual >= meta) {
        actual = meta;
        clearInterval(intervalo);
      }
      el.textContent = "+" + actual;
    }, 25);
  });
}

/* Solicitudes */

const CLAVE_STORAGE = "solicitudes";

const ESTADOS = ["Pendiente", "En revisión", "En proceso", "Finalizado", "Cancelado"];

const COLOR_ESTADO = {
  "Pendiente": "warning",
  "En revisión": "info",
  "En proceso": "primary",
  "Finalizado": "success",
  "Cancelado": "danger"
};

const formSolicitud = document.getElementById("formSolicitud");
const tablaSolicitudes = document.getElementById("tablaSolicitudes");

let solicitudes = cargarSolicitudes();

// Guarda y carga las solicitudes del navegador.
function cargarSolicitudes() {
  try {
    const guardadas = JSON.parse(localStorage.getItem(CLAVE_STORAGE)) || [];
    return guardadas.map(s => ({ ...s, usuario: s.usuario || "sin-asignar" }));
  } catch (error) {
    return [];
  }
}

function guardarSolicitudes() {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(solicitudes));
}

function generarId() {
  return solicitudes.length === 0 ? 1 : Math.max(...solicitudes.map(s => s.id)) + 1;
}

// Da formato a las fechas.
function formatoISO(fecha) {
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

function formatoFecha(iso) {
  return iso.split("-").reverse().join("/");
}

// Muestra texto sin interpretarlo como HTML.
function escaparHTML(texto) {
  const div = document.createElement("div");
  div.textContent = texto;
  return div.innerHTML;
}

// Reglas para revisar el formulario.
const validadores = {
  clienteDestino: d => {
    if (!esAdmin()) return "";
    const destinoValido = usuarios.some(u =>
      u.usuario === d.clienteDestino && u.activo && (u.rol === "Cliente" || u.usuario === sesionActual.usuario)
    );
    if (!destinoValido) return "Selecciona tu cuenta o un cliente activo.";
    return "";
  },
  nombre: d => {
    if (!d.nombre) return "El nombre es obligatorio.";
    if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ ]{3,60}$/.test(d.nombre)) return "Solo letras y espacios (mínimo 3 caracteres).";
    return "";
  },
  email: d => {
    if (!d.email) return "El correo es obligatorio.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return "Ingresa un correo válido (ej: nombre@dominio.com).";
    return "";
  },
  telefono: d => {
    if (!d.telefono) return "El teléfono es obligatorio.";
    if (!/^(09\d{8}|0[2-7]\d{7})$/.test(d.telefono)) return "Teléfono inválido. Celular: 10 dígitos (09XXXXXXXX).";
    return "";
  },
  placa: d => {
    if (!d.placa) return "La placa es obligatoria.";
    if (!/^[A-Z]{3}-\d{3,4}$/.test(d.placa)) return "Formato inválido. Usa 3 letras, guion y 3 o 4 números (ABC-1234).";
    return "";
  },
  marca: d => {
    if (!d.marca) return "La marca es obligatoria.";
    if (d.marca.length < 2) return "La marca debe tener al menos 2 caracteres.";
    return "";
  },
  modelo: d => (d.modelo ? "" : "El modelo es obligatorio."),
  anio: d => {
    if (d.anio === "") return "El año es obligatorio.";
    const anio = Number(d.anio);
    const maximo = new Date().getFullYear() + 1;
    if (!Number.isInteger(anio) || anio < 1980 || anio > maximo) return `El año debe estar entre 1980 y ${maximo}.`;
    return "";
  },
  kilometraje: d => {
    if (d.kilometraje === "") return "El kilometraje es obligatorio.";
    const km = Number(d.kilometraje);
    if (!Number.isInteger(km) || km < 0 || km > 999999) return "El kilometraje debe ser un entero entre 0 y 999999.";
    return "";
  },
  servicio: d => {
    if (!servicios.some(s => String(s.id) === d.servicio)) return "Selecciona un tipo de servicio.";
    return "";
  },
  fecha: d => {
    if (!d.fecha) return "Selecciona una fecha.";
    const fecha = new Date(d.fecha + "T00:00:00");
    if (isNaN(fecha)) return "Fecha inválida.";

    const original = solicitudEnEdicion();
    if (original && original.fecha === d.fecha) return "";

    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const limite = new Date(hoy);
    limite.setDate(limite.getDate() + 90);

    if (fecha < hoy) return "La fecha no puede estar en el pasado.";
    if (fecha > limite) return "Solo se puede agendar hasta con 90 días de anticipación.";
    if (fecha.getDay() === 0) return "No atendemos los domingos.";
    return "";
  },
  hora: d => {
    if (!d.hora) return "Selecciona una hora.";

    const original = solicitudEnEdicion();
    if (original && original.fecha === d.fecha && original.hora === d.hora) return "";
    const [h, m] = d.hora.split(":").map(Number);
    const minutos = h * 60 + m;

    const esSabado = d.fecha && new Date(d.fecha + "T00:00:00").getDay() === 6;
    const tope = esSabado ? 12 * 60 : 17 * 60;
    if (minutos < 8 * 60 || minutos > tope) {
      return `Horario de agendamiento: 08:00 a ${esSabado ? "12:00" : "17:00"}.`;
    }

    const ahora = new Date();
    if (d.fecha === formatoISO(ahora) && minutos <= ahora.getHours() * 60 + ahora.getMinutes()) {
      return "La hora debe ser posterior a la hora actual.";
    }
    return "";
  },
  prioridad: d => (d.prioridad ? "" : "Selecciona la prioridad."),
  observaciones: d => (d.observaciones.length > 300 ? "Máximo 300 caracteres." : ""),
  terminos: d => (d.terminos ? "" : "Debes confirmar que los datos son correctos.")
};

function obtenerDatosFormulario() {
  const campos = formSolicitud.elements;
  return {
    nombre: campos["nombre"].value.trim(),
    email: campos["email"].value.trim(),
    telefono: campos["telefono"].value.trim(),
    placa: campos["placa"].value.trim().toUpperCase(),
    marca: campos["marca"].value.trim(),
    modelo: campos["modelo"].value.trim(),
    anio: campos["anio"].value.trim(),
    kilometraje: campos["kilometraje"].value.trim(),
    servicio: campos["servicio"].value,
    fecha: campos["fecha"].value,
    hora: campos["hora"].value,
    prioridad: campos["prioridad"].value,
    extras: [...formSolicitud.querySelectorAll('input[name="extras"]:checked')].map(c => c.value),
    observaciones: campos["observaciones"].value.trim(),
    terminos: campos["terminos"].checked,
    clienteDestino: campos["clienteDestino"].value
  };
}

function mostrarError(campo, mensaje) {
  const feedback = formSolicitud.querySelector(`[data-error-for="${campo}"]`);
  formSolicitud.querySelectorAll(`[name="${campo}"]`)
    .forEach(control => control.classList.toggle("is-invalid", Boolean(mensaje)));
  if (feedback) {
    feedback.textContent = mensaje;
    feedback.classList.toggle("d-block", Boolean(mensaje));
  }
}

function validarCampo(campo) {
  const mensaje = validadores[campo](obtenerDatosFormulario());
  mostrarError(campo, mensaje);
  return mensaje;
}

function validarFormulario() {
  const errores = {};
  for (const campo of Object.keys(validadores)) {
    const mensaje = validarCampo(campo);
    if (mensaje) errores[campo] = mensaje;
  }
  return errores;
}

function limpiarErrores() {
  Object.keys(validadores).forEach(campo => mostrarError(campo, ""));
}

function renderTablaSolicitudes() {
  if (!tablaSolicitudes) return;

  const propias = solicitudes.filter(s => sesionActual && s.usuario === sesionActual.usuario);

  if (propias.length === 0) {
    tablaSolicitudes.innerHTML = `<tr><td colspan="8" class="text-center text-muted">Aún no tienes mantenimientos registrados.</td></tr>`;
    return;
  }

  tablaSolicitudes.innerHTML = propias.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escaparHTML(s.nombre)}</td>
      <td>${escaparHTML(s.placa)}</td>
      <td>${escaparHTML(s.servicio)}</td>
      <td>${formatoFecha(s.fecha)}</td>
      <td>${s.hora}</td>
      <td>${s.prioridad}</td>
      <td><span class="badge text-bg-${COLOR_ESTADO[s.estado]}">${s.estado}</span></td>
    </tr>
  `).join("");
}

function registrarSolicitud(datos) {
  const servicioElegido = servicios.find(s => String(s.id) === datos.servicio);

  const nueva = {
    id: generarId(),
    usuario: esAdmin() ? datos.clienteDestino : sesionActual.usuario,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    placa: datos.placa,
    marca: datos.marca,
    modelo: datos.modelo,
    anio: Number(datos.anio),
    kilometraje: Number(datos.kilometraje),
    servicioId: servicioElegido.id,
    servicio: servicioElegido.nombre,
    fecha: datos.fecha,
    hora: datos.hora,
    prioridad: datos.prioridad,
    extras: datos.extras,
    observaciones: datos.observaciones,
    estado: "Pendiente",
    fechaRegistro: new Date().toISOString()
  };

  solicitudes.push(nueva);
  guardarSolicitudes();
  return nueva;
}

function manejarEnvio(evento) {
  evento.preventDefault();

  if (!sesionActual) {
    avisarSinSesion();
    return;
  }

  const errores = validarFormulario();
  const campos = Object.keys(errores);

  if (campos.length > 0) {
    const lista = campos.map(c => `<li>${errores[c]}</li>`).join("");
    Swal.fire({
      icon: "error",
      title: "Revisa el formulario",
      html: `<ul class="text-start">${lista}</ul>`
    });
    const primero = formSolicitud.querySelector(`[name="${campos[0]}"]`);
    if (primero) primero.focus();
    return;
  }

  const datos = obtenerDatosFormulario();

  if (idEnEdicion !== null) {
    if (!esAdmin()) {
      denegarAccion();
      return;
    }
    const idEditado = idEnEdicion;
    actualizarSolicitud(idEditado, datos);
    salirModoEdicion();
    formSolicitud.reset();
    refrescarVistas();
    Swal.fire({
      icon: "success",
      title: "Cambios guardados",
      text: `La solicitud N.º ${idEditado} fue actualizada.`
    });
    return;
  }

  const nueva = registrarSolicitud(datos);
  formSolicitud.reset();
  refrescarVistas();

  Swal.fire({
    icon: "success",
    title: "¡Solicitud registrada!",
    text: `Tu solicitud N.º ${nueva.id} quedó en estado "${nueva.estado}".`
  });
}

function initFormulario() {
  const select = formSolicitud.elements["servicio"];
  select.innerHTML =
    `<option value="">Selecciona un servicio</option>` +
    servicios.map(s => `<option value="${s.id}">${s.nombre} - desde $${s.precio}</option>`).join("");

  formSolicitud.elements["fecha"].min = formatoISO(new Date());

  formSolicitud.addEventListener("submit", manejarEnvio);

  // Validar al salir de un campo
  formSolicitud.addEventListener("focusout", e => {
    if (e.target.name in validadores) validarCampo(e.target.name);
  });

  formSolicitud.addEventListener("input", e => {
    if (e.target.name === "placa") e.target.value = e.target.value.toUpperCase();
    if (e.target.classList.contains("is-invalid")) validarCampo(e.target.name);
  });

  formSolicitud.addEventListener("change", e => {
    if (e.target.name in validadores) validarCampo(e.target.name);
    if (e.target.name === "fecha" && formSolicitud.elements["hora"].value) validarCampo("hora");
  });

  // Espera a que el navegador limpie el formulario antes de rellenar los datos.
  formSolicitud.addEventListener("reset", () => setTimeout(() => {
    limpiarErrores();
    salirModoEdicion();
    prepararFormulario();
  }, 0));
}

/* Acceso y permisos */

const CLAVE_SESION = "sesionActual";
const CLAVE_EDICION = "solicitudEnEdicion";

// Cuentas de ejemplo
const usuarios = [
  { usuario: "admin", password: "Admin123", rol: "Administrador", nombre: "Julian Cando", email: "julian.cando.777@gmail.com", telefono: "0988639915", activo: true },
  { usuario: "cliente", password: "Cliente123", rol: "Cliente",       nombre: "Marco Cando",   email: "marco@correo.com",    telefono: "0987654321", activo: true },
  { usuario: "miguel", password: "Miguel123", rol: "Cliente",       nombre: "Miguel Vasconez",  email: "miguel@correo.com",    telefono: "0988475247", activo: true },
  { usuario: "pedro", password: "Pedro123", rol: "Cliente",       nombre: "Pedro Ramírez",  email: "pedro@correo.com",    telefono: "0965432109", activo: false }

];

let sesionActual = cargarSesion();
let idEnEdicion = null;

const formLogin = document.getElementById("formLogin");
const vistaLogin = document.getElementById("vistaLogin");
const vistaPerfil = document.getElementById("vistaPerfil");
const datosPerfil = document.getElementById("datosPerfil");
const nombreBienvenida = document.getElementById("nombreBienvenida");
const credencialesPrueba = document.getElementById("credencialesPrueba");
const avisoSinSesion = document.getElementById("avisoSinSesion");
const itemLogin = document.getElementById("itemLogin");
const itemUsuario = document.getElementById("itemUsuario");
const textoUsuario = document.getElementById("textoUsuario");
const btnCerrarSesion = document.getElementById("btnCerrarSesion");
const btnCerrarSesionPerfil = document.getElementById("btnCerrarSesionPerfil");
const enlaceAdmin = document.getElementById("enlaceAdmin");
const grupoClienteDestino = document.getElementById("grupoClienteDestino");
const avisoEdicion = document.getElementById("avisoEdicion");
const idEdicionTexto = document.getElementById("idEdicionTexto");
const btnGuardar = document.getElementById("btnGuardar");
const btnCancelarEdicion = document.getElementById("btnCancelarEdicion");
const seccionMisMantenimientos = document.getElementById("mis-mantenimientos");
const seccionAdmin = document.getElementById("administracion");
const tablaAdmin = document.getElementById("tablaAdmin");
const buscadorAdmin = document.getElementById("buscadorAdmin");
const filtroEstado = document.getElementById("filtroEstado");
const resumenEstados = document.getElementById("resumenEstados");

function cargarSesion() {
  const guardado = sessionStorage.getItem(CLAVE_SESION);
  if (!guardado) return null;

  return usuarios.find(u => u.usuario === guardado && u.activo) || null;
}

function esAdmin() {
  return sesionActual !== null && sesionActual.rol === "Administrador";
}

function solicitudEnEdicion() {
  if (idEnEdicion === null) return null;
  return solicitudes.find(s => s.id === idEnEdicion) || null;
}

function avisarSinSesion() {
  Swal.fire({
    icon: "info",
    title: "Inicia sesión",
    text: "Necesitas iniciar sesión para continuar."
  }).then(() => window.location.assign("login.html"));
}

function denegarAccion() {
  return Swal.fire({
    icon: "error",
    title: "Acceso denegado",
    text: "No puedes ingresar a este módulo porque no eres administrador."
  });
}

function verificarAccesoAdmin() {
  if (!sesionActual) {
    avisarSinSesion();
    return false;
  }
  if (!esAdmin()) {
    denegarAccion();
    return false;
  }
  return true;
}

function iniciarSesion(evento) {
  evento.preventDefault();

  const usuario = document.getElementById("loginUsuario").value.trim().toLowerCase();
  const password = document.getElementById("loginPassword").value;

  if (!usuario || !password) {
    Swal.fire({ icon: "warning", title: "Campos incompletos", text: "Ingresa tu usuario y tu contraseña." });
    return;
  }

  const encontrado = usuarios.find(u => u.usuario === usuario && u.password === password);

  if (!encontrado) {
    Swal.fire({ icon: "error", title: "Acceso inválido", text: "Usuario o contraseña incorrectos." });
    return;
  }
  if (!encontrado.activo) {
    Swal.fire({ icon: "error", title: "Cuenta deshabilitada", text: "Tu cuenta está deshabilitada. Contacta al taller." });
    return;
  }

  sesionActual = encontrado;
  sessionStorage.setItem(CLAVE_SESION, encontrado.usuario);
  formLogin.reset();
  Swal.fire({
    icon: "success",
    title: `¡Bienvenido, ${encontrado.nombre}!`,
    text: "Has iniciado sesión correctamente."
  }).then(() => window.location.replace("solicitudes.html"));
}

function cerrarSesion() {
  sesionActual = null;
  sessionStorage.removeItem(CLAVE_SESION);

  if (formLogin) {
    formLogin.reset();
  }
  if (formSolicitud) {
    salirModoEdicion();
    formSolicitud.reset();
  }
  actualizarInterfaz();
  Swal.fire({ toast: true, position: "top-end", icon: "info", title: "Sesión cerrada", showConfirmButton: false, timer: 1800 });
}

function actualizarInterfaz() {
  const logueado = sesionActual !== null;

  document.querySelectorAll("[data-solo-sesion]").forEach(el => el.classList.toggle("d-none", !logueado));
  if (itemLogin) itemLogin.classList.toggle("d-none", logueado);
  if (itemUsuario) itemUsuario.classList.toggle("d-none", !logueado);
  if (textoUsuario && logueado) textoUsuario.textContent = `${sesionActual.nombre} (${sesionActual.rol})`;

  if (vistaLogin) vistaLogin.classList.toggle("d-none", logueado);
  if (vistaPerfil) vistaPerfil.classList.toggle("d-none", !logueado);
  if (logueado && (nombreBienvenida || datosPerfil)) renderPerfil();

  if (avisoSinSesion) avisoSinSesion.classList.toggle("d-none", logueado);
  if (formSolicitud) formSolicitud.classList.toggle("d-none", !logueado);
  if (seccionMisMantenimientos) seccionMisMantenimientos.classList.toggle("d-none", !logueado);
  if (seccionAdmin) seccionAdmin.classList.toggle("d-none", !esAdmin());
  if (grupoClienteDestino) grupoClienteDestino.classList.toggle("d-none", !esAdmin());
  document.querySelectorAll("[data-admin]").forEach(el => el.classList.toggle("d-none", !esAdmin()));

  if (formSolicitud && logueado) prepararFormulario();
  refrescarVistas();
}

function renderPerfil() {
  const u = sesionActual;
  if (nombreBienvenida) nombreBienvenida.textContent = u.nombre;
  if (!datosPerfil) return;

  const filas = [
    ["Nombre", u.nombre],
    ["Usuario", u.usuario],
    ["Correo", u.email],
    ["Teléfono", u.telefono],
    ["Rol", u.rol],
    ["Cuenta", u.activo ? "Activa" : "Deshabilitada"]
  ];
  datosPerfil.innerHTML = filas
    .map(([etiqueta, valor]) => `<dt class="col-5">${etiqueta}</dt><dd class="col-7">${escaparHTML(valor)}</dd>`)
    .join("");
}

// Completa los datos de la cuenta seleccionada.
function rellenarDatosCliente(usuario) {
  const campos = formSolicitud.elements;
  campos["nombre"].value = usuario ? usuario.nombre : "";
  campos["email"].value = usuario ? usuario.email : "";
  campos["telefono"].value = usuario ? usuario.telefono : "";
  ["nombre", "email", "telefono"].forEach(nombre => { campos[nombre].readOnly = true; });
}

function prepararFormulario() {
  if (!sesionActual || !formSolicitud) return;
  const campos = formSolicitud.elements;

  if (esAdmin()) {
    campos["clienteDestino"].innerHTML =
      `<option value="">Selecciona un cliente</option>` +
      usuarios
        .filter(u => u.activo && (u.rol === "Cliente" || u.usuario === sesionActual.usuario))
        .map(u => `<option value="${u.usuario}">${u.nombre} (${u.rol})</option>`).join("");
    campos["clienteDestino"].value = sesionActual.usuario;
  }

  const dueno = esAdmin()
    ? usuarios.find(u => u.usuario === campos["clienteDestino"].value)
    : sesionActual;
  rellenarDatosCliente(dueno);
}

function refrescarVistas() {
  if (tablaSolicitudes) renderTablaSolicitudes();
  if (resumenEstados) renderResumen();
  if (tablaAdmin) renderTablaAdmin();
}

function renderResumen() {
  if (!resumenEstados) return;

  if (!esAdmin()) {
    resumenEstados.innerHTML = "";
    return;
  }
  resumenEstados.innerHTML = ESTADOS.map(estado => {
    const cantidad = solicitudes.filter(s => s.estado === estado).length;
    return `
      <div class="col-6 col-md">
        <div class="card text-center border-${COLOR_ESTADO[estado]}">
          <div class="card-body py-2">
            <div class="fs-3 fw-bold">${cantidad}</div>
            <small>${estado}</small>
          </div>
        </div>
      </div>`;
  }).join("");
}

function renderTablaAdmin() {
  if (!tablaAdmin || !buscadorAdmin || !filtroEstado) return;

  if (!esAdmin()) {
    tablaAdmin.innerHTML = "";
    return;
  }

  const texto = buscadorAdmin.value.trim().toLowerCase();
  const estado = filtroEstado.value;

  const visibles = solicitudes.filter(s => {
    const coincideTexto = [s.nombre, s.placa, s.servicio, s.usuario].some(campo => campo.toLowerCase().includes(texto));
    const coincideEstado = estado === "" || s.estado === estado;
    return coincideTexto && coincideEstado;
  });

  if (visibles.length === 0) {
    tablaAdmin.innerHTML = `<tr><td colspan="7" class="text-center text-muted">No hay solicitudes que coincidan.</td></tr>`;
    return;
  }

  tablaAdmin.innerHTML = visibles.map(s => `
    <tr>
      <td>${s.id}</td>
      <td>${escaparHTML(s.nombre)}<br><small class="text-muted">@${escaparHTML(s.usuario)}</small></td>
      <td>${escaparHTML(s.placa)}<br><small class="text-muted">${escaparHTML(s.marca)} ${escaparHTML(s.modelo)}</small></td>
      <td>${escaparHTML(s.servicio)}</td>
      <td>${formatoFecha(s.fecha)}<br><small class="text-muted">${s.hora}</small></td>
      <td>
        <select class="form-select form-select-sm select-estado" data-id="${s.id}">
          ${ESTADOS.map(e => `<option value="${e}" ${e === s.estado ? "selected" : ""}>${e}</option>`).join("")}
        </select>
      </td>
      <td class="text-end text-nowrap">
        <button type="button" class="btn btn-sm btn-outline-primary btn-editar" data-id="${s.id}" title="Editar">
          <i class="bi bi-pencil-square"></i>
        </button>
        <button type="button" class="btn btn-sm btn-outline-danger btn-eliminar" data-id="${s.id}" title="Eliminar">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>
  `).join("");
}

function cambiarEstado(id, nuevoEstado) {
  if (!esAdmin()) { denegarAccion(); return; }
  if (!ESTADOS.includes(nuevoEstado)) return;

  const solicitud = solicitudes.find(s => s.id === id);
  if (!solicitud) return;

  solicitud.estado = nuevoEstado;
  guardarSolicitudes();
  refrescarVistas();

  Swal.fire({
    toast: true, position: "top-end", icon: "success",
    title: `Solicitud N.º ${id}: ${nuevoEstado}`,
    showConfirmButton: false, timer: 1800
  });
}

function eliminarSolicitud(id) {
  if (!esAdmin()) { denegarAccion(); return; }

  const solicitud = solicitudes.find(s => s.id === id);
  if (!solicitud) return;

  Swal.fire({
    icon: "warning",
    title: "¿Eliminar solicitud?",
    text: `Se eliminará la solicitud N.º ${id} (placa ${solicitud.placa}). Esta acción no se puede deshacer.`,
    showCancelButton: true,
    confirmButtonText: "Sí, eliminar",
    cancelButtonText: "Cancelar",
    confirmButtonColor: "#dc3545"
  }).then(resultado => {
    if (!resultado.isConfirmed) return;

    solicitudes = solicitudes.filter(s => s.id !== id);
    guardarSolicitudes();

    if (idEnEdicion === id) {
      salirModoEdicion();
      formSolicitud.reset();
    }
    refrescarVistas();
    Swal.fire({ icon: "success", title: "Solicitud eliminada", timer: 1500, showConfirmButton: false });
  });
}

function editarSolicitud(id) {
  if (!esAdmin()) { denegarAccion(); return; }

  const s = solicitudes.find(x => x.id === id);
  if (!s) return;
  if (!formSolicitud) {
    sessionStorage.setItem(CLAVE_EDICION, String(id));
    window.location.assign("solicitudes.html");
    return;
  }

  const campos = formSolicitud.elements;
  idEnEdicion = id;
  limpiarErrores();

  campos["clienteDestino"].value = s.usuario;
  campos["nombre"].value = s.nombre;
  campos["email"].value = s.email;
  campos["telefono"].value = s.telefono;
  campos["placa"].value = s.placa;
  campos["marca"].value = s.marca;
  campos["modelo"].value = s.modelo;
  campos["anio"].value = s.anio;
  campos["kilometraje"].value = s.kilometraje;
  campos["servicio"].value = String(s.servicioId);
  campos["fecha"].value = s.fecha;
  campos["hora"].value = s.hora;
  campos["prioridad"].value = s.prioridad;
  formSolicitud.querySelectorAll('input[name="extras"]').forEach(c => { c.checked = s.extras.includes(c.value); });
  campos["observaciones"].value = s.observaciones;
  campos["terminos"].checked = true;

  idEdicionTexto.textContent = id;
  avisoEdicion.classList.remove("d-none");
  btnCancelarEdicion.classList.remove("d-none");
  btnGuardar.innerHTML = `<i class="bi bi-save-fill"></i> Guardar cambios`;

  document.getElementById("solicitud").scrollIntoView({ behavior: "smooth" });
}

function actualizarSolicitud(id, datos) {
  const solicitud = solicitudes.find(s => s.id === id);
  const servicioElegido = servicios.find(s => String(s.id) === datos.servicio);

  Object.assign(solicitud, {
    usuario: datos.clienteDestino,
    nombre: datos.nombre,
    email: datos.email,
    telefono: datos.telefono,
    placa: datos.placa,
    marca: datos.marca,
    modelo: datos.modelo,
    anio: Number(datos.anio),
    kilometraje: Number(datos.kilometraje),
    servicioId: servicioElegido.id,
    servicio: servicioElegido.nombre,
    fecha: datos.fecha,
    hora: datos.hora,
    prioridad: datos.prioridad,
    extras: datos.extras,
    observaciones: datos.observaciones,
    fechaModificacion: new Date().toISOString()
  });
  guardarSolicitudes();
}

function salirModoEdicion() {
  idEnEdicion = null;
  avisoEdicion.classList.add("d-none");
  btnCancelarEdicion.classList.add("d-none");
  btnGuardar.innerHTML = `<i class="bi bi-send-fill"></i> Registrar solicitud`;
}

function cancelarEdicion() {
  salirModoEdicion();
  formSolicitud.reset();
}

function controlarHash() {
  if (window.location.hash === "#administracion" && !esAdmin()) {
    history.replaceState(null, "", window.location.pathname + window.location.search);
    verificarAccesoAdmin();
  }
}

function initLogin() {
  if (!formLogin) return;
  if (sesionActual) {
    window.location.replace("solicitudes.html");
    return;
  }

  if (credencialesPrueba) credencialesPrueba.innerHTML = usuarios.map(u => `
    <tr>
      <td>${u.usuario}</td>
      <td>${u.password}</td>
      <td>${u.rol}</td>
      <td>${u.activo ? "Activa" : "Deshabilitada"}</td>
    </tr>`).join("");

  formLogin.addEventListener("submit", iniciarSesion);
  if (btnCerrarSesionPerfil) btnCerrarSesionPerfil.addEventListener("click", cerrarSesion);
  actualizarInterfaz();
}

function initSolicitudes() {
  if (!formSolicitud) return;
  if (!sesionActual) {
    window.location.replace("login.html");
    return;
  }

  initFormulario();
  if (btnCancelarEdicion) btnCancelarEdicion.addEventListener("click", cancelarEdicion);
  initPanelAdmin();

  formSolicitud.elements["clienteDestino"].addEventListener("change", evento => {
    rellenarDatosCliente(usuarios.find(u => u.usuario === evento.target.value));
  });

  actualizarInterfaz();
  const idPendiente = Number(sessionStorage.getItem(CLAVE_EDICION));
  if (idPendiente) {
    sessionStorage.removeItem(CLAVE_EDICION);
    editarSolicitud(idPendiente);
  }
}

function initPanelAdmin() {
  if (filtroEstado) {
    filtroEstado.innerHTML =
      `<option value="">Todos los estados</option>` +
      ESTADOS.map(e => `<option value="${e}">${e}</option>`).join("");
    filtroEstado.addEventListener("change", renderTablaAdmin);
  }
  if (buscadorAdmin) buscadorAdmin.addEventListener("input", renderTablaAdmin);

  if (tablaAdmin) {
    tablaAdmin.addEventListener("click", evento => {
      const boton = evento.target.closest("button[data-id]");
      if (!boton) return;
      const id = Number(boton.dataset.id);
      if (boton.classList.contains("btn-editar")) editarSolicitud(id);
      if (boton.classList.contains("btn-eliminar")) eliminarSolicitud(id);
    });
    tablaAdmin.addEventListener("change", evento => {
      if (evento.target.classList.contains("select-estado")) {
        cambiarEstado(Number(evento.target.dataset.id), evento.target.value);
      }
    });
  }
}

function initAdministracion() {
  if (!seccionAdmin || formSolicitud) return;
  if (!sesionActual) {
    avisarSinSesion();
    return;
  }
  if (!esAdmin()) {
    denegarAccion().then(() => window.location.replace("index.html"));
    return;
  }

  initPanelAdmin();
  actualizarInterfaz();
}

document.addEventListener("DOMContentLoaded", () => {
  if (btnCerrarSesion) btnCerrarSesion.addEventListener("click", cerrarSesion);
  if (enlaceAdmin) window.addEventListener("hashchange", controlarHash);

  if (contenedorCatalogo && contenedorFiltros) {
    renderFiltros();
    renderServicios(servicios);
    animarContadores();
  }

  if (itemLogin && !formLogin && !formSolicitud) actualizarInterfaz();

  initLogin();
  initSolicitudes();
  initAdministracion();
  controlarHash();
});