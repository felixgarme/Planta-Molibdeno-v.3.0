/**
 * API DE ETIQUETAS PARA VERGE3D (Versión Extendida con Flechas Dinámicas y Responsive Preciso)
 * --------------------------------------------------------------
 * INFORMACIÓN DE USO:
 * - Las etiquetas ahora calculan su ancho y alto real.
 * - Se encogen matemáticamente lo exacto y necesario para que 
 * sus bordes no sobrepasen los límites de la pantalla.
 * * EJEMPLOS DE USO:
 * 1. Etiqueta normal:
 * etiquetas("Cubo", "Mi Título", "Descripción");
 *
 * 2. Etiqueta con Rayos X (Oclusión):
 * etiquetas("Motor", "Título", "Desc", true);
 *
 * 3. Etiqueta con Código JS al hacer clic:
 * etiquetas("Motor", "Título", "Desc", true, "alert('Hola')");
 *
 * 4. Etiqueta CON FLECHA hacia otro objeto:
 * etiquetas("Etiqueta_Anchor", "Motor V8", "Detalles...", true(x-ray), null(codigo js), "Motor_Pieza_Real");
 * * 5. Limpiar todo:
 * quitarEtiquetas();
 */

(function () {
  const CSS_PATH = "../../resources/css/etiquetas.css";

  const raycaster = new v3d.Raycaster();
  const vecPos = new v3d.Vector3();
  const vecTarget = new v3d.Vector3();
  const vecDir = new v3d.Vector3();
  const vecCam = new v3d.Vector3();
  const vecScreen = new v3d.Vector3();


  document.documentElement.style.setProperty("--arrow-color", "#000000");

  window.darck = function () {
    document.documentElement.style.setProperty("--arrow-color", "#ffffff");
    console.log("Flechas cambiadas a modo oscuro (Blanco)");
  };

  window.light = function () {
    document.documentElement.style.setProperty("--arrow-color", "#000000");
    console.log("Flechas cambiadas a modo claro (Negro)");
  };

  function importarCSS() {
    if (!document.querySelector(`link[href*="etiquetas.css"]`)) {
      const link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = CSS_PATH;
      document.head.appendChild(link);
    }

    if (!document.getElementById("css-etiquetas-flechas")) {
      const style = document.createElement("style");
      style.id = "css-etiquetas-flechas";

      style.innerHTML = `
                .annotation-line {
                    position: absolute;
                    height: 4.0px; 
                    background-color: var(--arrow-color, #000000); 
                    transform-origin: 0 50%;
                    pointer-events: none;
                    z-index: 0; 
                    box-shadow: 0 0 4px rgba(0,0,0,0.5);
                    transition: background-color 0.3s ease; 
                }

                .annotation-line::after {
                    content: '';
                    position: absolute;
                    right: -7px; 
                    top: -5px;   
                    
                    width: 10px; 
                    height: 10px; 
                    
                    border-radius: 50%;
                    
                    background-color: #000000; /* Relleno NEGRO */
                    border: 4px solid #ffffff; /* Borde BLANCO */
                    
                    box-shadow: 0 0 3px rgba(0,0,0,0.5);
                    z-index: 1;
                }

                .annotation-line.oculta {
                    opacity: 0.1;
                }
            `;
      document.head.appendChild(style);
    }
  }

  importarCSS();

  function esHijoDe(child, parent) {
    let curr = child;
    while (curr) {
      if (curr === parent) return true;
      curr = curr.parent;
    }
    return false;
  }

  /**
   * @param {string} id Nombre del objeto donde nace la etiqueta.
   * @param {string} t Título.
   * @param {string} [d] Descripción.
   * @param {boolean} [xray=false] Oclusión.
   * @param {string|function} [codigoJS=null] Click callback.
   * @param {string} [idObjetoDestino=null] (NUEVO) Nombre del objeto al que apunta la flecha.
   */
  window.etiquetas = (
    id,
    t,
    d,
    xray = false,
    codigoJS = null,
    idObjetoDestino = null
  ) => {
    const app = window.v3d?.apps?.[0];
    if (!app) return console.error("Verge3D no cargado"), null;

    const obj = app.scene.getObjectByName(id);
    if (!obj) return console.error(`Objeto Origen "${id}" no encontrado`), null;

    let targetObj = null;
    let elLine = null;

    if (idObjetoDestino) {
      targetObj = app.scene.getObjectByName(idObjetoDestino);
      if (!targetObj) {
        console.warn(
          `Objeto destino para flecha "${idObjetoDestino}" no encontrado.`
        );
      } else {
        elLine = document.createElement("div");
        elLine.className = "annotation-line";
        (app.container || document.body).appendChild(elLine);
      }
    }

    const el = document.createElement("div");
    el.className = "annotation";
    el.id = `tag-${id.replace(/\W/g, "_")}`;
    el.innerHTML = `
            <div class="annotation-content">
                <h3>${t}</h3>
                ${d ? `<p>${d}</p>` : ""}
            </div>
        `;

    if (!d || d.trim() === "") el.classList.add("sin-descripcion");

    (app.container || document.body).appendChild(el);

    el.onclick = (e) => {
      e.stopPropagation();
      if (codigoJS) {
        try {
          typeof codigoJS === "function" ? codigoJS() : eval(codigoJS);
        } catch (err) {
          console.error("Error JS etiqueta:", err);
        }
      }
      if (typeof cambio !== "undefined") cambio();
      const proc = v3d.puzzles?.procedures?.[id];
      if (proc) proc();
    };

    const update = () => {
      if (!el.isConnected) return;

      obj.updateMatrixWorld();
      app.camera.updateMatrixWorld();

      vecPos.setFromMatrixPosition(obj.matrixWorld);
      app.camera.getWorldPosition(vecCam);

      vecScreen.copy(vecPos).project(app.camera);

      const isInFront = vecScreen.z < 1;

      if (isInFront) {
        const cvs = app.renderer.domElement;
        const x = (vecScreen.x * 0.5 + 0.5) * cvs.clientWidth;
        const y = (-(vecScreen.y * 0.5) + 0.5) * cvs.clientHeight;

        let estaTapado = false;
        if (xray) {
          vecDir.subVectors(vecPos, vecCam).normalize();
          raycaster.set(vecCam, vecDir);
          const dist = vecCam.distanceTo(vecPos);
          const intersects = raycaster.intersectObjects(
            app.scene.children,
            true
          );

          for (let i = 0; i < intersects.length; i++) {
            if (intersects[i].distance >= dist - 0.1) break;
            if (
              !esHijoDe(intersects[i].object, obj) &&
              intersects[i].object.visible
            ) {
              estaTapado = true;
              break;
            }
          }
        }

        if (estaTapado) {
          el.classList.add("etiqueta-oculta");
          if (elLine) elLine.classList.add("oculta");
        } else {
          el.classList.remove("etiqueta-oculta");
          if (elLine) elLine.classList.remove("oculta");
        }

        el.style.display = "block";

        // --- INICIO LÓGICA RESPONSIVE PRECISA (Evita cortes físicos) ---
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        const PADDING = 10; // Píxeles de separación mínima con el borde
        let responsiveScale = 1.0;

        if (w > 0 && h > 0) {
            // Calculamos cuánto puede escalar antes de chocar con cada borde.
            // La etiqueta usa translate(-50%, -100%), por lo que:
            // - Ocupa w/2 hacia la izquierda y w/2 hacia la derecha.
            // - Ocupa 'h' hacia arriba.
            
            const scaleLeft = (x - PADDING) / (w / 2);
            const scaleRight = (cvs.clientWidth - x - PADDING) / (w / 2);
            const scaleTop = (y - PADDING) / h;
            
            // La escala segura es la más restrictiva (la menor)
            const safeScale = Math.min(1.0, scaleLeft, scaleRight, scaleTop);
            
            // Limitamos a un mínimo del 15% para que no se vuelva invisible
            responsiveScale = Math.max(0.15, safeScale);
        }
        // --- FIN LÓGICA RESPONSIVE PRECISA ---

        const hoverScale = el.matches(":hover") ? 1.05 : 1;
        const finalScale = hoverScale * responsiveScale;

        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0px) translate(-50%, -100%) scale(${finalScale.toFixed(3)})`;

        if (elLine && targetObj) {
          targetObj.updateMatrixWorld();
          vecTarget.setFromMatrixPosition(targetObj.matrixWorld);

          vecScreen.copy(vecTarget).project(app.camera);

          if (vecScreen.z >= 1) {
            elLine.style.display = "none";
          } else {
            elLine.style.display = "block";

            const tx = (vecScreen.x * 0.5 + 0.5) * cvs.clientWidth;
            const ty = (-(vecScreen.y * 0.5) + 0.5) * cvs.clientHeight;

            const deltaX = tx - x;
            const deltaY = ty - y;
            const length = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            const angle = Math.atan2(deltaY, deltaX) * (180 / Math.PI);

            elLine.style.width = `${length}px`;
            elLine.style.transform = `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg)`;
          }
        }
      } else {
        el.style.display = "none";
        if (elLine) elLine.style.display = "none";
      }
    };

    if (app.renderCallbacks) {
      app.renderCallbacks.push(update);
    } else {
      const loop = () => {
        update();
        requestAnimationFrame(loop);
      };
      requestAnimationFrame(loop);
    }

    console.log(
      `Etiqueta creada: ${id} ${
        targetObj ? "-> Flecha a: " + idObjetoDestino : ""
      }`
    );

    return {
      dom: el,
      domArrow: elLine,
      eliminar: () => {
        el.remove();
        if (elLine) elLine.remove();
        const i = app.renderCallbacks?.indexOf(update);
        if (i > -1) app.renderCallbacks.splice(i, 1);
      },
    };
  };

  window.quitarEtiquetas = () => {
    document.querySelectorAll(".annotation").forEach((e) => e.remove());
    document.querySelectorAll(".annotation-line").forEach((e) => e.remove());
  };
})();