/*
 * Portal derivador Vigix (modelo por codigo exclusivo + subdominios)
 * ------------------------------------------------------------------
 * El cliente escribe el CODIGO EXCLUSIVO de su empresa (que es la etiqueta
 * de su subdominio, ej. "demo-asistencia") y lo derivamos directo a su
 * plataforma: https://<codigo>.vigix.com.ar/
 *
 * No hay lista de empresas ni archivo empresas.json: el destino se calcula
 * SOLO a partir del codigo. Asi el cliente NUNCA ve otras empresas ni puede
 * saber cuantas hay. Tampoco se maneja ninguna credencial aca: el login
 * (legajo + PIN) ocurre dentro de cada plataforma, contra su propio Firebase.
 *
 * CSP cerrada: sin estilos ni handlers inline. Todo se cablea por JS.
 */
(function () {
  "use strict";

  // --- Configuracion -------------------------------------------------------
  // Dominio base donde cuelgan los subdominios de cada empresa.
  var DOMINIO_BASE = "vigix.com.ar/fichadas";
  // Ruta a la que entra el cliente dentro de su plataforma.
  // "" = raiz del subdominio (su index.html). Si queres mandarlo directo a la
  // pantalla de fichada, pone "fichadas.html".
  var PATH_DESTINO = "";
  var LS_KEY = "vigix_portal_ultimo_codigo";

  var $codigo = document.getElementById("codigo");
  var $estado = document.getElementById("estado");
  var $form = document.getElementById("form-portal");
  var $ultima = document.getElementById("ultima");
  var $btnUltima = document.getElementById("btn-ultima");

  // --- helpers -------------------------------------------------------------

  // Normaliza lo que escribe el cliente a una etiqueta DNS valida:
  // minusculas, sin acentos, solo [a-z0-9-], sin guiones al borde.
  function limpiarCodigo(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim()
      .replace(/[^a-z0-9-]+/g, "-")
      .replace(/-+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  // Valida que sea una etiqueta de subdominio correcta (1-63 chars).
  function codigoValido(c) {
    return /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/.test(c);
  }

  function destino(codigo) {
    var base = "https://" + codigo + "." + DOMINIO_BASE + "/";
    return PATH_DESTINO ? base + PATH_DESTINO.replace(/^\/+/, "") : base;
  }

  function mostrarEstado(msg) {
    $estado.textContent = msg;
    $estado.hidden = false;
  }

  function limpiarEstado() {
    $estado.textContent = "";
    $estado.hidden = true;
  }

  function recordar(codigo) {
    try { window.localStorage.setItem(LS_KEY, codigo); } catch (e) { /* storage off */ }
  }

  function ultimoGuardado() {
    try { return window.localStorage.getItem(LS_KEY) || ""; } catch (e) { return ""; }
  }

  // --- navegacion ----------------------------------------------------------

  function entrar(codigoCrudo) {
    var codigo = limpiarCodigo(codigoCrudo);
    if (!codigo || !codigoValido(codigo)) {
      mostrarEstado("Revis\u00e1 el c\u00f3digo: us\u00e1 solo letras, n\u00fameros y guiones (ej. demo-asistencia).");
      return;
    }
    limpiarEstado();
    recordar(codigo);
    window.location.assign(destino(codigo));
  }

  // --- ultimo acceso -------------------------------------------------------

  function mostrarUltimo() {
    var cod = limpiarCodigo(ultimoGuardado());
    if (!cod || !codigoValido(cod)) return;
    $btnUltima.textContent = "Entrar a " + cod;
    $btnUltima.addEventListener("click", function () { entrar(cod); });
    $ultima.hidden = false;
  }

  // --- deep-link -----------------------------------------------------------
  // ?c=codigo  entra directo (util para dejar un acceso directo guardado).
  function paramCodigo() {
    try {
      var p = new URLSearchParams(window.location.search);
      return (p.get("c") || p.get("e") || "").trim();
    } catch (e) { return ""; }
  }

  // --- init ----------------------------------------------------------------

  var pedido = paramCodigo();
  if (pedido) {
    entrar(pedido);
    return;
  }

  mostrarUltimo();

  $form.addEventListener("submit", function (ev) {
    ev.preventDefault();
    entrar($codigo.value);
  });

  $codigo.addEventListener("input", limpiarEstado);
})();
