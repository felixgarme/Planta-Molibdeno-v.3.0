(function () {
  if (window.__v3d_camino_inited) return;
  window.__v3d_camino_inited = true;

  const VELOCIDAD = 0.08;
  const VELOCIDAD_AUTO = 0.2;
  const VELOCIDAD_JOYSTICK = 0.08;

  let nodosCamino = [];
  let distanciasAcumuladas = [];
  let distanciaTotal = 0;
  let distanciaActual = 0;
  let distanciaObjetivo = 0;
  let eventoTecladoAgregado = false;
  let rafId = null;
  let joystickEjeY = 0;
  let teclasActivasUI = {};
  let autoMoviendo = false;
  let teclasMoviendo = { adelante: false, atras: false };
  let tiempoAnterior = null;
  
  let joystickEscalaActual = 1;

  const esMovil =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    ) ||
    (navigator.maxTouchPoints > 0 && window.innerWidth <= 1366) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);

  function getApp() {
    if (window.app && window.app.scene) return window.app;
    if (window.v3d && v3d.apps && v3d.apps.size > 0)
      return Array.from(v3d.apps.values())[0];
    return null;
  }

  function prepararUI() {
    let container = document.getElementById("camino-ui-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "camino-ui-container";
      container.style.cssText =
        "position:fixed;bottom:30px;left:30px;z-index:9999;display:flex;flex-direction:column;gap:10px;pointer-events:none;";
      document.body.appendChild(container);
    }
    return container;
  }

  function mostrarTeclaUI(tecla) {
    if (esMovil || teclasActivasUI[tecla]) return;
    const container = prepararUI();
    const el = document.createElement("div");
    el.innerText = tecla;

    el.style.cssText =
      "width:50px;height:50px;background:#E5EFF9;color:#031795;display:flex;align-items:center;justify-content:center;font-family:sans-serif;font-size:24px;font-weight:bold;border-radius:8px;border:0.5px solid #6B8BDE;box-shadow:0 4px 6px rgba(107,139,222,0.2);";

    container.appendChild(el);
    teclasActivasUI[tecla] = el;
  }

  function ocultarTeclaUI(tecla) {
    if (teclasActivasUI[tecla]) {
      const container = document.getElementById("camino-ui-container");
      if (container) container.removeChild(teclasActivasUI[tecla]);
      delete teclasActivasUI[tecla];
    }
  }

  function crearJoystickUI() {
    if (!esMovil || document.getElementById("camino-joystick-base")) return;
    const container = prepararUI();
    container.style.pointerEvents = "auto";

    const base = document.createElement("div");
    base.id = "camino-joystick-base";

    base.style.cssText =
      `width:120px;height:120px;background:rgb(229 239 249 / 38%);border-radius:50%;position:relative;border:0.5px solid #6B8BDE;touch-action:none;box-shadow:0 4px 8px rgba(107,139,222,0.3); transition: transform 0.3s ease; transform-origin: bottom left; transform: scale(${joystickEscalaActual});`;

    const knob = document.createElement("div");

    knob.style.cssText =
      "width:50px;height:50px;background:#031795;border-radius:50%;position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);box-shadow:0 2px 6px rgba(3,23,149,0.4);pointer-events:none;";

    base.appendChild(knob);
    container.appendChild(base);

    let arrastrando = false;
    let centroY = 0;

    const actualizarKnob = (clienteY) => {
      let dy = clienteY - centroY;
      const maxDist = 35;
      if (dy > maxDist) dy = maxDist;
      if (dy < -maxDist) dy = -maxDist;
      joystickEjeY = dy / maxDist;
      knob.style.transform = `translate(-50%, calc(-50% + ${dy}px))`;
    };

    base.addEventListener("touchstart", (e) => {
      if (autoMoviendo) return;
      arrastrando = true;
      const rect = base.getBoundingClientRect();
      centroY = rect.top + rect.height / 2;
      actualizarKnob(e.touches[0].clientY);
      e.preventDefault();
    });

    base.addEventListener("touchmove", (e) => {
      if (!arrastrando || autoMoviendo) return;
      actualizarKnob(e.touches[0].clientY);
      e.preventDefault();
    });

    base.addEventListener("touchend", (e) => {
      arrastrando = false;
      joystickEjeY = 0;
      knob.style.transform = `translate(-50%, -50%)`;
      e.preventDefault();
    });
  }

  function obtenerDireccion(app) {
    let index = 0;
    for (let i = 0; i < distanciasAcumuladas.length - 1; i++) {
      if (
        distanciaActual >= distanciasAcumuladas[i] &&
        distanciaActual <= distanciasAcumuladas[i + 1]
      ) {
        index = i;
        break;
      }
    }
    if (distanciaActual >= distanciaTotal)
      index = distanciasAcumuladas.length - 2;
    if (index < 0) index = 0;

    const nodoA = nodosCamino[index];
    const nodoB = nodosCamino[index + 1];
    if (!nodoA || !nodoB) return 1;

    const posA = new v3d.Vector3();
    nodoA.getWorldPosition(posA);
    const posB = new v3d.Vector3();
    nodoB.getWorldPosition(posB);

    const pathDir = new v3d.Vector3().subVectors(posB, posA).normalize();
    const camDir = new v3d.Vector3();
    app.camera.getWorldDirection(camDir);

    return camDir.dot(pathDir) >= 0 ? 1 : -1;
  }

  function mapearTecla(key) {
    if (key === "ArrowUp") return "▲";
    if (key === "ArrowDown") return "▼";
    if (key.toLowerCase() === "w") return "W";
    if (key.toLowerCase() === "s") return "S";
    return null;
  }

  window.camino = function (nombresObjetos, objetivoIrA) {
    const app = getApp();
    if (!app) return;

    if (esMovil) {
      crearJoystickUI();
    }

    nodosCamino = nombresObjetos
      .map((nombre) => app.scene.getObjectByName(nombre))
      .filter((obj) => obj !== undefined);

    if (nodosCamino.length < 2) return;

    distanciasAcumuladas = [0];
    distanciaTotal = 0;

    for (let i = 0; i < nodosCamino.length - 1; i++) {
      const posA = new v3d.Vector3();
      nodosCamino[i].getWorldPosition(posA);
      const posB = new v3d.Vector3();
      nodosCamino[i + 1].getWorldPosition(posB);

      const dist = posA.distanceTo(posB);
      distanciaTotal += dist;
      distanciasAcumuladas.push(distanciaTotal);
    }

    if (!rafId) {
      distanciaActual = 0;
      autoMoviendo = false;
      tiempoAnterior = null; 
    }

    if (objetivoIrA) {
      const indexObj = nodosCamino.findIndex((n) => n.name === objetivoIrA);
      if (indexObj !== -1) {
        distanciaObjetivo = distanciasAcumuladas[indexObj];
        autoMoviendo = true;
      }
    }

    if (!eventoTecladoAgregado && !esMovil) {
      window.addEventListener("keydown", (e) => {
        if (autoMoviendo) return;
        const icono = mapearTecla(e.key);

        if (icono === "▲" || icono === "W") {
          teclasMoviendo.adelante = true;
          mostrarTeclaUI(icono);
          e.preventDefault();
        } else if (icono === "▼" || icono === "S") {
          teclasMoviendo.atras = true;
          mostrarTeclaUI(icono);
          e.preventDefault();
        }
      });

      window.addEventListener("keyup", (e) => {
        const icono = mapearTecla(e.key);
        if (icono === "▲" || icono === "W") teclasMoviendo.adelante = false;
        if (icono === "▼" || icono === "S") teclasMoviendo.atras = false;
        if (icono) ocultarTeclaUI(icono);
      });

      eventoTecladoAgregado = true;
    }

    if (!rafId) {
      iniciarLoop(app);
    }
  };

  window.joystick = function (valor = 3) {
    valor = Math.max(1.2, Math.min(8, valor));
    
    joystickEscalaActual = valor / 3;
    
    const base = document.getElementById("camino-joystick-base");
    if (base) {
      base.style.transform = `scale(${joystickEscalaActual})`;
    }
  };

  function iniciarLoop(app) {
    const cam = app.camera;
    const controls = app.controls;

    function loop(timestamp) {
      if (!tiempoAnterior) tiempoAnterior = timestamp;
      let dt = (timestamp - tiempoAnterior) / 1000;
      tiempoAnterior = timestamp;

      if (dt > 0.1 || dt <= 0) dt = 0.016;
      const factorFps = dt * 60;

      let movimientoFotograma = 0;
      const sentido = obtenerDireccion(app);

      if (autoMoviendo) {
        const diff = distanciaObjetivo - distanciaActual;
        const pasoReal = VELOCIDAD_AUTO * factorFps;

        if (Math.abs(diff) <= pasoReal) {
          distanciaActual = distanciaObjetivo;
          autoMoviendo = false;
        } else {
          movimientoFotograma = Math.sign(diff) * pasoReal;
        }
      } else {
        if (teclasMoviendo.adelante)
          movimientoFotograma += VELOCIDAD * factorFps * sentido;
        if (teclasMoviendo.atras)
          movimientoFotograma -= VELOCIDAD * factorFps * sentido;
        
        if (esMovil && joystickEjeY !== 0) {
          movimientoFotograma +=
            -joystickEjeY * VELOCIDAD_JOYSTICK * factorFps * sentido;
        }
      }

      distanciaActual += movimientoFotograma;
      distanciaActual = Math.max(0, Math.min(distanciaTotal, distanciaActual));

      let index = 0;
      for (let i = 0; i < distanciasAcumuladas.length - 1; i++) {
        if (
          distanciaActual >= distanciasAcumuladas[i] &&
          distanciaActual <= distanciasAcumuladas[i + 1]
        ) {
          index = i;
          break;
        }
      }

      if (distanciaActual >= distanciaTotal)
        index = distanciasAcumuladas.length - 2;
      if (index < 0) index = 0;

      const d0 = distanciasAcumuladas[index];
      const d1 = distanciasAcumuladas[index + 1];
      const longitudSegmento = d1 - d0;
      const progresoSegmento =
        longitudSegmento > 0 ? (distanciaActual - d0) / longitudSegmento : 0;

      const nodoA = nodosCamino[index];
      const nodoB = nodosCamino[index + 1];

      if (nodoA && nodoB && cam) {
        const posA = new v3d.Vector3();
        nodoA.getWorldPosition(posA);
        const posB = new v3d.Vector3();
        nodoB.getWorldPosition(posB);

        const nuevaPosicion = new v3d.Vector3()
          .copy(posA)
          .lerp(posB, progresoSegmento);

        if (controls && controls.target) {
          const delta = new v3d.Vector3().subVectors(
            nuevaPosicion,
            cam.position,
          );
          controls.target.add(delta);
        }

        cam.position.copy(nuevaPosicion);

        if (controls && typeof controls.update === "function") {
          controls.update();
        }
      }

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
  }
})();