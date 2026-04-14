if (!window._activePoints) {
    window._activePoints = [];
}

window.deletepoint = function() {
    try {
        let app = window.app;
        if (!app || !window._activePoints) return;

        console.log(`🧹 Eliminando ${window._activePoints.length} puntos de info...`);

        window._activePoints.forEach(item => {
            app.removeEventListener("beforeRender", item.animateFn);

            if (item.mesh) {
                app.scene.remove(item.mesh);
                
                if (item.mesh.geometry) item.mesh.geometry.dispose();
                if (item.mesh.material) {
                    if (item.mesh.material.map) item.mesh.material.map.dispose();
                    item.mesh.material.dispose();
                }
            }
        });

        window._activePoints = [];
        console.log("✨ Todos los puntos de info eliminados.");

    } catch (e) {
        console.error("❌ Error en deletepoint:", e);
    }
};

// Añadimos un parámetro para saber si es móvil y escalar la textura
function createInfoTexture(v3d, isMobile = false) {
    const canvas = document.createElement('canvas');
    
    // Aumentamos la resolución del canvas en móvil (512x512) para que no se vea pixelado al hacerlo más grande en 3D
    const size = isMobile ? 512 : 256;
    const center = size / 2;
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // --- EFECTO RESALTADO: Resplandor (Glow) ---
    ctx.shadowColor = 'rgba(3, 23, 149, 0.9)'; // Color azul con opacidad
    ctx.shadowBlur = isMobile ? 50 : 25; // Intensidad del resplandor adaptada al tamaño
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;

    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    // Radio adaptado para dar espacio al resplandor sin que se corte en los bordes
    ctx.arc(center, center, isMobile ? 200 : 100, 0, Math.PI * 2); 
    ctx.fill();

    // Desactivar la sombra para los elementos internos (borde y texto)
    ctx.shadowBlur = 0;

    ctx.strokeStyle = '#031795';
    ctx.lineWidth = isMobile ? 12 : 6;
    ctx.stroke();

    ctx.fillStyle = '#031795';
    // Fuente más grande en móvil
    ctx.font = isMobile ? 'bold 220px Arial, sans-serif' : 'bold 110px Arial, sans-serif'; 
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    // Ajuste de posición (Y) para centrar la letra dependiendo de la resolución
    ctx.fillText('i', center, center + (isMobile ? 16 : 8));

    const texture = new v3d.CanvasTexture(canvas);
    return texture;
}

window.point = function(procedureName, objName, heightOffset = 0.5) {
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
            console.error("❌ No se encontró el objeto base:", objName);
            return;
        }

        // --- DETECCIÓN DE MÓVIL ---
        // Evalúa a true si detecta un dispositivo táctil común o si la pantalla es menor/igual a 768px
        const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth <= 768;

        // --- TAMAÑO ADAPTATIVO EN EL ESPACIO 3D ---
        // Radio original de 0.288 para escritorio, aumentado a 0.45 para móvil
        const radius = isMobile ? 0.45 : 0.288;
        const geometry = new v3d.CircleGeometry(radius, 32); 
        
        const texture = createInfoTexture(v3d, isMobile);
        
        const material = new v3d.MeshBasicMaterial({ 
            map: texture, 
            transparent: true, 
            side: v3d.DoubleSide
        });

        const mesh = new v3d.Mesh(geometry, material);
        
        mesh.position.set(
            base.position.x,
            base.position.y + heightOffset,
            base.position.z
        );

        mesh.userData = { procedureId: procedureName };

        scene.add(mesh);

        const randomOffset = Math.random() * 100;

        const animateFn = () => {
            mesh.rotation.y += 0.03;
            
            // --- EFECTO RESALTADO: Animación de Pulso ---
            const time = (Date.now() * 0.004) + randomOffset;
            const scale = 1 + Math.sin(time) * 0.15; // Crece y se encoge un 15%
            mesh.scale.set(scale, scale, scale);
        };

        app.addEventListener("beforeRender", animateFn);

        window._activePoints.push({
            mesh: mesh,
            animateFn: animateFn
        });

        console.log(`ℹ️ Punto de info '${procedureName}' creado en '${objName}' (Modo Móvil: ${isMobile})`);

    } catch (e) {
        console.error("❌ Error en point():", e);
    }
};

if (!window._infoClickSetup) {
    window.addEventListener('pointerdown', (event) => {
        let v3d = window.v3d;
        let app = window.app;
        if (!v3d || !app || !window._activePoints || window._activePoints.length === 0) return;

        const rect = app.renderer.domElement.getBoundingClientRect();
        const mouse = new v3d.Vector2();
        
        // Soporte tanto para ratón de PC como toques en pantalla
        const clientX = event.clientX || (event.touches && event.touches[0].clientX);
        const clientY = event.clientY || (event.touches && event.touches[0].clientY);

        if (clientX === undefined || clientY === undefined) return;
        
        mouse.x = ((clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((clientY - rect.top) / rect.height) * 2 + 1;

        const raycaster = new v3d.Raycaster();
        raycaster.setFromCamera(mouse, app.camera);

        const meshes = window._activePoints.map(p => p.mesh);
        const intersects = raycaster.intersectObjects(meshes);

        if (intersects.length > 0) {
            const clickedMesh = intersects[0].object;
            const procName = clickedMesh.userData.procedureId;

            console.log(`🖱️ Interacción detectada en info point. Ejecutando puzzle: ${procName}`);

            if (v3d.puzzles && v3d.puzzles.procedures && v3d.puzzles.procedures[procName]) {
                v3d.puzzles.procedures[procName]();
            } else {
                console.warn(`⚠️ El procedimiento '${procName}' no existe en los Puzzles.`);
            }
        }
    });

    window._infoClickSetup = true;
}