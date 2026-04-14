var THREE = v3d;

function onMouseClick(event) {
    if (!app || !app.scene || !app.renderer || !app.camera) return;

    // Obtener coordenadas 
    var rect = app.renderer.domElement.getBoundingClientRect();
    var mouse = new THREE.Vector2(
        ((event.clientX - rect.left) / rect.width) * 2 - 1,
        -((event.clientY - rect.top) / rect.height) * 2 + 1
    );

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, app.camera);

    // Simplificado: intersectObjects puede buscar de forma recursiva en la escena
    // El 'true' final significa que la búsqueda es recursiva (buscará en todos los hijos)
    var intersects = raycaster.intersectObjects(app.scene.children, true);

    if (intersects.length > 0) {
        var object = intersects[0].object;
        var objectName = object.name;
        
        console.log(`Hiciste clic en: ${objectName}`);

        // --- INICIO DE LA MODIFICACIÓN ---
        
        // Comprobar si los puzzles de Verge3D están listos y
        // si existe un procedimiento con el nombre del objeto clickeado.
        if (v3d.puzzles && v3d.puzzles.procedures && typeof v3d.puzzles.procedures[objectName] === 'function') {
            
            // Si existe, ejecutarlo
            console.log(`Ejecutando procedimiento de Puzzles: "${objectName}"`);
            v3d.puzzles.procedures[objectName]();

        } else {
            // Opcional: Avisar si se hizo clic en un objeto que no tiene un procedimiento asociado
            console.log(`No se encontró un procedimiento de Puzzles llamado: "${objectName}"`);
        }
        
        // --- FIN DE LA MODIFICACIÓN ---
    }
}

// Registrar el evento de clic
app.renderer.domElement.addEventListener('click', onMouseClick, false);