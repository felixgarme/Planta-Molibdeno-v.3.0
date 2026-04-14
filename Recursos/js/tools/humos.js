

if (!window._activeHumos) {
    window._activeHumos = [];
}

window.humosx = function() {
    try {
        let app = window.app;
        if (!app || !window._activeHumos) return;

        console.log(`🧹 Eliminando ${window._activeHumos.length} sistemas de humo...`);

        window._activeHumos.forEach(item => {
            app.removeEventListener("beforeRender", item.animateFn);

            if (item.mesh) {
                app.scene.remove(item.mesh);
                
                if (item.mesh.geometry) item.mesh.geometry.dispose();
                if (item.mesh.material) item.mesh.material.dispose();
            }
        });

        window._activeHumos = [];
        console.log("✨ Todos los humos han sido eliminados.");

    } catch (e) {
        console.error("Error en humosx:", e);
    }
};

window.humo = function(
    objName,
    color = "#ffffff",
    size = 0.15,
    count = 40,
    alturaMax = 1.2,
    velocidad = 0.003,
    dispersion = 0.25,
    orientacion = "arriba"
){
    try {
        let v3d = window.v3d;
        let app = window.app;

        if (!v3d || !app) {
            console.error("❌ Verge3D no está listo.");
            return;
        }

        const scene = app.scene;

        const base = scene.getObjectByName(objName);
        if (!base) {
            console.error("❌ No se encontró:", objName);
            return;
        }

        console.log(`✔ Generando humo en ${objName} (${orientacion})`);

        const positions = new Float32Array(count * 3);
        const velocities = [];
        const baseX = base.position.x;
        const baseY = base.position.y + 0.05;
        const baseZ = base.position.z;

        const dir = (orientacion === "abajo") ? -1 : 1;

        const geometry = new v3d.BufferGeometry();
        geometry.setAttribute("position", new v3d.BufferAttribute(positions, 3));

        const material = new v3d.PointsMaterial({
            color: new v3d.Color(color),
            size: size,
            transparent: true,
            opacity: 0.9,
            depthWrite: false
        });

        const points = new v3d.Points(geometry, material);
        scene.add(points);

        function resetParticle(i) {
            const idx = i * 3;

            positions[idx]   = baseX;
            positions[idx+1] = baseY;
            positions[idx+2] = baseZ;

            velocities[i] = {
                y: dir * (velocidad + Math.random() * velocidad * 1.3)
            };
        }

        for (let i = 0; i < count; i++) resetParticle(i);
        geometry.attributes.position.needsUpdate = true;

        const animateFn = () => {

            for (let i = 0; i < count; i++) {

                const idx = i * 3;

                const alturaRelativa =
                    Math.abs((positions[idx+1] - baseY) / alturaMax);

                const factor = Math.min(Math.max(alturaRelativa, 0), 1);

                const disp = dispersion * factor;

                positions[idx+1] += velocities[i].y;

                positions[idx] += (Math.random()*disp*2 - disp) * 0.05;
                positions[idx+2] += (Math.random()*disp*2 - disp) * 0.05;

                const limite = baseY + (alturaMax * dir);

                if (
                    (dir === 1 && positions[idx+1] > limite) ||
                    (dir === -1 && positions[idx+1] < limite)
                ) {
                    resetParticle(i);
                }
            }

            geometry.attributes.position.needsUpdate = true;
        };

        app.addEventListener("beforeRender", animateFn);

        window._activeHumos.push({
            mesh: points,
            animateFn: animateFn
        });

        console.log(`🚀 Humo activado (${orientacion}) para ${objName}`);

    } catch (e) {
        console.error("❌ Error en humo():", e);
    }
};