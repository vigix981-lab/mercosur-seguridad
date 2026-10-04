// plan-nav.js — Oculta en el menú de navegación compartido los enlaces de
// funciones que el plan contratado NO incluye (elementos con data-plan-funcion).
// Script clásico, autohospedado (sin CDN) y CSP-safe (sin inline, sin unsafe-*,
// solo addEventListener y clases ya horneadas en styles.css).
//
// Lee /config/plan con el idToken del usuario autenticado. Según las Reglas,
// config/plan tiene .read = (auth != null), así que cualquier rol autenticado
// (vigilador/supervisor/admin) puede leerlo; .write solo lo hace el Worker SA.
//
// Esta capa es puramente VISUAL y ACOMPAÑA al candado DURO de las Reglas de
// Firebase (que ya rechazan la escritura si el plan no incluye la función).
//
// Política: aplicamos el ocultamiento SOLO cuando logramos leer el plan de forma
// definitiva. Si no hay token o no se pudo leer, no tocamos la nav (fail-open en
// lo visual) porque la seguridad real ya la garantizan las Reglas; así evitamos
// esconder opciones a un cliente legítimo por una sesión aún no restaurada.
(function () {
  'use strict';

  var URL_BASE = 'https://mercosur-seguridad-default-rtdb.firebaseio.com';

  // Getters de token que exponen los distintos módulos de cada página.
  var GETTERS = [
    'obtenerTokenRondas',
    'obtenerTokenVigilador',
    'obtenerTokenSupervisor'
  ];

  function aplicar(funciones) {
    try {
      var marcados = document.querySelectorAll('nav [data-plan-funcion]');
      for (var i = 0; i < marcados.length; i++) {
        var el = marcados[i];
        var f = el.getAttribute('data-plan-funcion');
        // Oculta si la función no está habilitada en el plan.
        el.classList.toggle('hidden', !funciones[f]);
      }
    } catch (_) {}
  }

  function esperar(ms) {
    return new Promise(function (r) { setTimeout(r, ms); });
  }

  function obtenerToken() {
    // Intenta cada getter disponible y devuelve el primer token válido.
    var cadena = Promise.resolve(null);
    GETTERS.forEach(function (nombre) {
      cadena = cadena.then(function (prev) {
        if (prev) return prev;
        var g = window[nombre];
        if (typeof g !== 'function') return null;
        return Promise.resolve().then(g).catch(function () { return null; });
      });
    });
    return cadena;
  }

  function cargar() {
    var token = null;
    // La sesión de Firebase se restaura de forma asíncrona tras cargar la
    // página: reintentamos unos segundos hasta tener un token, sin bloquear.
    var paso = Promise.resolve();
    for (var intento = 0; intento < 20; intento++) {
      paso = paso.then(function () {
        if (token) return null;
        return obtenerToken().then(function (t) {
          if (t) { token = t; return null; }
          return esperar(400);
        });
      });
    }

    paso.then(function () {
      if (!token) return; // Sin token: no tocamos la nav (fail-open visual).
      var url = URL_BASE + '/config/plan.json?ts=' + Date.now() +
                '&auth=' + encodeURIComponent(token);
      return fetch(url, { cache: 'no-store' }).then(function (res) {
        if (!res.ok) return; // No se pudo leer: no tocamos la nav.
        return res.json().then(function (p) {
          var funciones = (p && p.funciones && typeof p.funciones === 'object')
            ? p.funciones
            : {}; // Plan leído pero sin funciones: oculta las opcionales.
          aplicar(funciones);
        });
      });
    }).catch(function () {});
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', cargar);
  } else {
    cargar();
  }
})();
