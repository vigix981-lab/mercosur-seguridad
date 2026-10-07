/*
 * Portal derivador Vigix (Opcion B: codigo exclusivo + empresas.json oculto)
 * ------------------------------------------------------------------------
 * El cliente escribe SU codigo exclusivo (ej. "27822022") y lo derivamos a
 * la plataforma de su empresa en su subdominio, directo a fichadas.html.
 *
 * No hay lista visible de empresas: el JSON se consulta internamente y solo
 * se muestra el resultado de la busqueda. El cliente NUNCA ve otras empresas
 * ni puede saber cuantas hay.
 *
 * CSP cerrada: sin estilos ni handlers inline. Todo se cablea por JS.
 */
(function () {
  "use strict";

  var REGISTRY_URL = "empresas.json";
  var LS_KEY = "vigix_portal_ultimo_codigo";

  var $codigo = document.getElementById("codigo");
  var $estado = document.getElementById("estado");
  var $form = document.getElementById("form-portal");
  var $ultima = document.getElementById("ultima");
  var $btnUltima = document.getElementById("btn-ultima");

  var EMPRESAS = [];

  // --- helpers -------------------------------------------------------------

  function norm(s) {
    return (s || "")
      .toString()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .trim();
  }

  function urlSegura(u) {
    if (typeof u !== "string") return false;
    var v = u.trim();
    if (!v) return false;
    if (/^https?:\/\//i.test(v)) return true;
    if (/^\.{0,2}\//.test(v)) return true;
    return false;
  }

  function buscarPorCodigo(codigo) {
    var c = norm(codigo);
    for (var i = 0; i < EMPRESAS.length; i++) {
      if (norm(EMPRESAS[i].codigo) === c) return EMPRESAS[i];
    }
    return null;
  }

  function mostrarEstado(msg, tipo) {
    $estado.textContent = msg;
    $estado.className = "estado" + (tipo === "ok" ? " estado-ok" : "");
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

  function entrar(empresa) {
    if (!empresa || !urlSegura(empresa.url)) {
      mostrarEstado("Esa empresa no tiene una direccion valida configurada. Avisa al administrador.");
      return;
    }
    recordar(empresa.codigo);
    window.location.assign(empresa.url);
  }

  // --- ultimo acceso -------------------------------------------------------

  function mostrarUltimo() {
    var cod = ultimoGuardado();
    if (!cod) return;
    var e = buscarPorCodigo(cod);
    if (!e) return;
    $btnUltima.textContent = "Entrar a " + e.nombre;
    $btnUltima.addEventListener("click", function () { entrar(e); });
    $ultima.hidden = false;
  }

  // --- deep-link -----------------------------------------------------------
  // ?c=27822022  entra directo si existe el codigo.
  function paramCodigo() {
    try {
      var p = new URLSearchParams(window.location.search);
      return (p.get("c") || p.get("e") || "").trim();
    } catch (e) { return ""; }
  }

  // --- normalizar entradas del JSON ----------------------------------------

  function normalizarEntradas(data) {
    var arr = (data && data.empresas) || [];
    var out = [];
    for (var i = 0; i < arr.length; i++) {
      var e = arr[i] || {};
      var codigo = (e.codigo || "").toString().trim();
      var nombre = (e.nombre || "").toString().trim();
      var url = (e.url || "").toString().trim();
      if (!codigo || !nombre || !url) continue;
      if (e.activa === false) continue;
      if (!urlSegura(url)) continue;
      out.push({ codigo: codigo, nombre: nombre, url: url });
    }
    return out;
  }

  // --- init ----------------------------------------------------------------

  function init(data) {
    EMPRESAS = normalizarEntradas(data);

    // Deep-link: ?c=codigo deriva directo.
    var pedido = paramCodigo();
    if (pedido) {
      var e = buscarPorCodigo(pedido);
      if (e) { entrar(e); return; }
      mostrarEstado("No encontramos una empresa con ese codigo.");
    }

    mostrarUltimo();

    $form.addEventListener("submit", function (ev) {
      ev.preventDefault();
      var val = $codigo.value.trim();
      if (!val) {
        mostrarEstado("Escribi el codigo de acceso de tu empresa.");
        return;
      }
      var e = buscarPorCodigo(val);
      if (e) {
        entrar(e);
      } else {
        mostrarEstado("No encontramos una empresa con el codigo \u201c" + val + "\u201d. Revisa o pide el codigo a tu administrador.");
      }
    });

    $codigo.addEventListener("input", limpiarEstado);
  }

  fetch(REGISTRY_URL, { cache: "no-store" })
    .then(function (r) {
      if (!r.ok) throw new Error("HTTP " + r.status);
      return r.json();
    })
    .then(init)
    .catch(function () {
      mostrarEstado("No pudimos cargar la lista de empresas (empresas.json). Revisa que el archivo exista y sea JSON valido.");
    });
})();
