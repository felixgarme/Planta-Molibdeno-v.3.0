(function () {
  if (window.__v3d_flechas_inited) return;
  window.__v3d_flechas_inited = true;

  function getApp() {
    if (window.app && window.app.scene) return window.app;
    if (window.v3d && v3d.apps && v3d.apps.size > 0) return Array.from(v3d.apps.values())[0];
    return null;
  }

  const shape = new v3d.Shape();
  shape.moveTo(0, -0.15);
  shape.lineTo(0.5, -0.15);
  shape.lineTo(0.5, -0.3);
  shape.lineTo(1, 0);
  shape.lineTo(0.5, 0.3);
  shape.lineTo(0.5, 0.15);
  shape.lineTo(0, 0.15);
  shape.lineTo(0, -0.15);

  const geometriaFlecha = new v3d.ShapeGeometry(shape);
  geometriaFlecha.center();
  geometriaFlecha.rotateX(-Math.PI / 2);

  const materialFlecha = new v3d.MeshBasicMaterial({
    color: 0x031795,
    side: v3d.DoubleSide,
    transparent: true,
    opacity: 0.4
  });

  let flechasAnimadas = [];
  
  // NUEVO: Variable para controlar si las flechas deben moverse o no
  let moverFlechas = true; 

  function animar() {
    requestAnimationFrame(animar);

    // NUEVO: Escuchar/Interceptar los procedimientos de Verge3D de forma segura
    if (window.v3d && window.v3d.puzzles && window.v3d.puzzles.procedures) {
      const procs = window.v3d.puzzles.procedures;
      
      // Hook para bajo rendimiento
      if (procs["bajorendimiento"] && !procs["_hooked_bajo"]) {
        const origBajo = procs["bajorendimiento"];
        procs["bajorendimiento"] = function(...args) {
          moverFlechas = false; // Detiene el movimiento
          if (origBajo) return origBajo.apply(this, args);
        };
        procs["_hooked_bajo"] = true;
      }
      
      // Hook para medio rendimiento
      if (procs["mediorendimiento"] && !procs["_hooked_medio"]) {
        const origMedio = procs["mediorendimiento"];
        procs["mediorendimiento"] = function(...args) {
          moverFlechas = true; // Reanuda el movimiento
          if (origMedio) return origMedio.apply(this, args);
        };
        procs["_hooked_medio"] = true;
      }

      // Hook para alto rendimiento
      if (procs["altorendimiento"] && !procs["_hooked_alto"]) {
        const origAlto = procs["altorendimiento"];
        procs["altorendimiento"] = function(...args) {
          moverFlechas = true; // Reanuda el movimiento
          if (origAlto) return origAlto.apply(this, args);
        };
        procs["_hooked_alto"] = true;
      }
    }

    // NUEVO: Si está en bajo rendimiento, salimos antes de mover las flechas
    // pero el loop de `requestAnimationFrame` sigue vivo por si se reactiva.
    if (!moverFlechas) return;

    const velocidad = 0.04;
    
    for (let i = 0; i < flechasAnimadas.length; i++) {
      const f = flechasAnimadas[i];
      f.progreso += velocidad;
      
      if (f.progreso > f.distancia) {
        f.progreso = 0;
      }
      
      f.mesh.position.copy(f.origen).addScaledVector(f.direccion, f.progreso);
    }
  }
  
  animar();

  window.caminoflecha = function (nombresObjetos) {
    const app = getApp();
    if (!app) return;

    const nombreGrupo = 'grupoFlechasVerdes';
    const grupoViejo = app.scene.getObjectByName(nombreGrupo);
    if (grupoViejo) {
      app.scene.remove(grupoViejo);
    }
    
    flechasAnimadas = [];

    const grupoFlechas = new v3d.Group();
    grupoFlechas.name = nombreGrupo;
    app.scene.add(grupoFlechas);

    const nodosCamino = nombresObjetos
      .map(nombre => app.scene.getObjectByName(nombre))
      .filter(obj => obj !== undefined);

    if (nodosCamino.length < 2) return;

    for (let i = 0; i < nodosCamino.length - 1; i++) {
      const posA = new v3d.Vector3();
      nodosCamino[i].getWorldPosition(posA);
      posA.y -= 1.2;

      const posB = new v3d.Vector3();
      nodosCamino[i + 1].getWorldPosition(posB);
      posB.y -= 1.2;

      const distancia = posA.distanceTo(posB);
      const direccion = new v3d.Vector3().subVectors(posB, posA).normalize();

      const cantidadFlechas = Math.max(3, Math.floor(distancia / 1.2));
      const espacio = distancia / cantidadFlechas;

      const quaternion = new v3d.Quaternion();
      const ejeX = new v3d.Vector3(1, 0, 0);
      quaternion.setFromUnitVectors(ejeX, direccion);

      for (let j = 0; j < cantidadFlechas; j++) {
        const mesh = new v3d.Mesh(geometriaFlecha, materialFlecha);
        mesh.quaternion.copy(quaternion);

        const progresoInicial = j * espacio;
        mesh.position.copy(posA).addScaledVector(direccion, progresoInicial);

        grupoFlechas.add(mesh);

        flechasAnimadas.push({
          mesh: mesh,
          origen: posA,
          direccion: direccion,
          distancia: distancia,
          progreso: progresoInicial
        });
      }
    }
  };
})();