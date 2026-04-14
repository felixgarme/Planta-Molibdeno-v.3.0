// // LLAMAR:
// ocultar('ID_Objeto');       // Oculta suavemente (Fade Out)
// mostrar('ID_Objeto');       // Muestra suavemente (Fade In)

// // CERRAR (RESTAURAR TODO):
// aparecerObj();              // Hace visible todo lo que se ocultó


/**
 * API DE VISIBILIDAD ANIMADA PARA VERGE3D
 * ---------------------------------------
 * Animaciones de transparencia con requestAnimationFrame.
 *
 * Ejemplos:
 * ocultar("pSphere1");
 * mostrar("pSphere1");
 * aparecerObj();
 */

(function () {
  const objetosOcultados = new Set();
  const duracion = 400; // ms (velocidad de animación)

  // Obtener instancia de la app
  function getApp() {
    const app = window.v3d?.apps?.[0];
    if (!app) {
      console.error("Verge3D no cargado.");
      return null;
    }
    return app;
  }

  // Buscar objeto
  function getObj(name, app) {
    const obj = app.scene.getObjectByName(name);
    if (!obj) {
      console.warn(`Objeto "${name}" no encontrado.`);
      return null;
    }
    return obj;
  }

  // Forzar materiales del objeto a ser transparentes
  function prepararMateriales(obj) {
    obj.traverse((n) => {
      if (n.material) {
        const mats = Array.isArray(n.material) ? n.material : [n.material];
        mats.forEach((m) => {
          m.transparent = true;
          if (m.opacity === undefined) m.opacity = 1;
        });
      }
    });
  }

  // Animación interna (fade)
  function animar(obj, from, to, onEnd) {
    const start = performance.now();

    function tick(now) {
      const t = Math.min((now - start) / duracion, 1);
      const value = from + (to - from) * t;

      obj.traverse((n) => {
        if (n.material) {
          const mats = Array.isArray(n.material) ? n.material : [n.material];
          mats.forEach((m) => {
            m.opacity = value;
          });
        }
      });

      if (t < 1) {
        requestAnimationFrame(tick);
      } else {
        onEnd && onEnd();
      }
    }

    requestAnimationFrame(tick);
  }

  // OCULTAR con animación
  window.ocultar = function (id) {
    const app = getApp();
    if (!app) return;

    const items = Array.isArray(id) ? id : [id];

    items.forEach((name) => {
      const obj = getObj(name, app);
      if (!obj) return;

      prepararMateriales(obj);

      objetosOcultados.add(obj);

      animar(obj, 1, 0, () => {
        obj.visible = false;
        console.log(`Ocultado (fade-out): ${name}`);
      });
    });
  };

  // MOSTRAR con animación
  window.mostrar = function (id) {
    const app = getApp();
    if (!app) return;

    const items = Array.isArray(id) ? id : [id];

    items.forEach((name) => {
      const obj = getObj(name, app);
      if (!obj) return;

      prepararMateriales(obj);

      obj.visible = true;
      objetosOcultados.delete(obj);

      animar(obj, 0, 1, () => {
        console.log(`Aparecido (fade-in): ${name}`);
      });
    });
  };

  // Reaparecer todos los ocultos con animación
  window.aparecerObj = function () {
    const app = getApp();
    if (!app) return;

    objetosOcultados.forEach((obj) => {
      prepararMateriales(obj);
      obj.visible = true;
      animar(obj, 0, 1);
      console.log(`Aparecido (fade-in): ${obj.name}`);
    });

    objetosOcultados.clear();
    console.log("Todos los objetos han aparecido con animación.");
  };
})();