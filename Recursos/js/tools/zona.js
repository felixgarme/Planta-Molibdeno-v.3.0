/**
 * v3d-ondas3d-robusto.js
 * Uso:
 * crearOndas3d("polySurface1105");
 * eliminarOndas3d("polySurface1105"); // opcional: elimina solo las ondas de ese objeto
 * eliminarOndas3d(); // elimina todas las ondas
 */
(function () {
  if (window.__v3d_ondas3d_robusto_inited) return;
  window.__v3d_ondas3d_robusto_inited = true;

  // --- Config global ---
  const defaultOptions = {
    color: 0x00ff66,
    colorOculto: 0x006622,  
    opacidadVisible: 0.8,  // Aumentado un poco para que destaque más
    opacidadOculto: 0.2,   
    duracion: 5.2,     
    numOndas: 3,
    radioInicial: 0.2, 
    radioFinal: 2.5,   // Un poco más grande para asegurar visibilidad
    segmentos: 64,
    yOffset: 0.05      // Separación del suelo para evitar parpadeos (z-fighting)
  };

  let appRef = null;
  const gruposOndas = new Map();
  let rafId = null;

  function getApp() {
    if (appRef && appRef.scene) return appRef;
    if (window.app && window.app.scene) { appRef = window.app; return appRef; }
    if (window.v3d && v3d.apps && v3d.apps.size > 0) { appRef = Array.from(v3d.apps.values())[0]; return appRef; }
    return null;
  }

  function ensureAppReady(timeout = 8000) {
    return new Promise((resolve) => {
      const start = performance.now();
      (function check() {
        const app = getApp();
        if (app) return resolve(app);
        if (performance.now() - start > timeout) return resolve(null);
        setTimeout(check, 300);
      })();
    });
  }

  function crearRingGeometry(innerRadius, outerRadius, segments) {
    try {
      return new v3d.RingGeometry(innerRadius, outerRadius, segments);
    } catch (e) {
      console.error("[ondas3d] Error creando RingGeometry:", e);
      return null;
    }
  }

  async function crearOndas3d(nombreObjeto, opciones = {}) {
    const merged = Object.assign({}, defaultOptions, opciones);

    const app = await ensureAppReady();
    if (!app) {
      console.warn("[ondas3d] No se pudo encontrar la app de Verge3D en el tiempo esperado.");
      return;
    }

    if (gruposOndas.has(nombreObjeto)) {
      console.log(`[ondas3d] Ya existen ondas para "${nombreObjeto}", no se duplicarán.`);
      return;
    }

    const obj = await encontrarObjetoConReintentos(app.scene, nombreObjeto, 10, 500);
    if (!obj) {
      console.warn(`[ondas3d] Objeto "${nombreObjeto}" no encontrado en la escena.`);
      return;
    }

    const group = new v3d.Group();
    group.name = `ondas_group_${nombreObjeto}_${Date.now()}`;
    app.scene.add(group);

    const rings = [];
    
    // [CORRECCIÓN 1] Creamos una geometría base NORMALIZADA (Radio exterior = 1).
    // Así el "scale" que le pasemos será exactamente su tamaño en la escena.
    const geom = crearRingGeometry(0.9, 1.0, merged.segmentos);

    for (let i = 0; i < merged.numOndas; i++) {
      if (!geom) continue;

      const matVisible = new v3d.MeshBasicMaterial({
        color: merged.color,
        transparent: true,
        opacity: merged.opacidadVisible,
        side: v3d.DoubleSide,
        depthWrite: false,
        depthTest: true,
        depthFunc: v3d.LessEqualDepth
      });

      const matOculto = new v3d.MeshBasicMaterial({
        color: merged.colorOculto,
        transparent: true,
        opacity: merged.opacidadOculto,
        side: v3d.DoubleSide,
        depthWrite: false,
        depthTest: true,
        depthFunc: v3d.GreaterDepth 
      });

      const meshVisible = new v3d.Mesh(geom, matVisible);
      const meshOculto = new v3d.Mesh(geom, matOculto);
      
      meshVisible.rotation.x = -Math.PI / 2;
      meshOculto.rotation.x = -Math.PI / 2;
      
      // Separamos el inicio de cada onda uniformemente en base a la duración total
      const gap = merged.duracion / merged.numOndas;
      const userData = {
        startOffset: i * gap, 
        duracion: merged.duracion,
        radioInicial: merged.radioInicial,
        radioFinal: merged.radioFinal
      };
      
      meshVisible.userData = { ...userData, baseOpacity: merged.opacidadVisible };
      meshOculto.userData = { ...userData, baseOpacity: merged.opacidadOculto };

      meshVisible.renderOrder = 9998;
      meshOculto.renderOrder = 9999; 

      group.add(meshVisible);
      group.add(meshOculto);
      rings.push(meshVisible); 
      rings.push(meshOculto);  
    }

    gruposOndas.set(nombreObjeto, {
      group,
      targetObject: obj,
      createdAt: Date.now(),
      options: merged,
      rings
    });

    if (!rafId) startLoop(app);

    console.log(`[ondas3d] Grupo de ondas creado para "${nombreObjeto}".`);
    return group;
  }

  function encontrarObjetoConReintentos(scene, nombre, maxAttempts = 8, delayMs = 400) {
    return new Promise((resolve) => {
      let attempts = 0;
      (function intento() {
        attempts++;
        const found = scene.getObjectByName(nombre);
        if (found) return resolve(found);
        if (attempts >= maxAttempts) return resolve(null);
        setTimeout(intento, delayMs);
      })();
    });
  }

  function eliminarOndas3d(nombreObjeto) {
    const app = getApp();
    if (!app) return;

    if (typeof nombreObjeto === 'string') {
      const info = gruposOndas.get(nombreObjeto);
      if (!info) return;
      limpiarGrupo(info);
      gruposOndas.delete(nombreObjeto);
    } else {
      gruposOndas.forEach((info, key) => limpiarGrupo(info));
      gruposOndas.clear();
    }

    if (gruposOndas.size === 0 && rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  function limpiarGrupo(info) {
    try {
      if (info.group && info.group.parent) info.group.parent.remove(info.group);
      
      const disposedGeometries = new Set();
      if (info.rings && info.rings.length) {
        info.rings.forEach(r => {
          if (r.geometry && !disposedGeometries.has(r.geometry)) {
            r.geometry.dispose();
            disposedGeometries.add(r.geometry);
          }
          if (r.material) r.material.dispose();
        });
      }
    } catch (e) {
      console.error("[ondas3d] Error limpiando grupo:", e);
    }
  }

  function startLoop(app) {
    const clock = new v3d.Clock();

    function loop() {
      if (!getApp()) { rafId = null; return; }

      const now = clock.getElapsedTime();

      gruposOndas.forEach((info, nombre) => {
        const target = info.targetObject;
        if (!target) return;
        
        const worldPos = new v3d.Vector3();
        target.getWorldPosition(worldPos);

        const yOffset = info.options.yOffset || 0.05;
        info.group.position.set(worldPos.x, worldPos.y + yOffset, worldPos.z);

        info.rings.forEach((ring) => {
          const ud = ring.userData;
          
          // [CORRECCIÓN 2] Matemática del tiempo de progreso limpia (de 0.0 a 1.0)
          const t = now + ud.startOffset;
          let prog = (t % ud.duracion) / ud.duracion;
          
          // Curva de suavizado
          const ease = 1 - Math.pow(1 - prog, 2); 
          
          // Calculamos el radio exacto en esta etapa
          const currentRadius = ud.radioInicial + (ud.radioFinal - ud.radioInicial) * ease;
          
          // Como la geometría es de radio 1, la escala es exactamente el currentRadius
          ring.scale.set(currentRadius, currentRadius, currentRadius);
          
          // Desvanecer opacidad con el progreso
          if (ring.material && ring.material.transparent) {
            const baseOpacity = ud.baseOpacity || 0.5;
            ring.material.opacity = baseOpacity * (1 - prog);
          }
        });
      });

      rafId = requestAnimationFrame(loop);
    }

    rafId = requestAnimationFrame(loop);
  }

  window.crearOndas3d = crearOndas3d;
  window.eliminarOndas3d = eliminarOndas3d;

  console.log("%c[ondas3d-robusto] listo.", "color:#0bda8a;font-weight:700;");
})();