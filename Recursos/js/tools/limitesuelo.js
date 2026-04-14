app.controls.addEventListener("change", function () {
    var raycaster = new v3d.Raycaster();
    var downVector = new v3d.Vector3(0, -1, 0);
    var terreno = app.scene.getObjectByName("suelo");

    if (!terreno) return;

    raycaster.set(app.camera.position, downVector);
    var intersects = raycaster.intersectObject(terreno, true);

    if (intersects.length > 0) {
        var groundY = intersects[0].point.y + 0.3;
        if (app.camera.position.y < groundY) {

            app.camera.position.y = v3d.MathUtils.lerp(app.camera.position.y, groundY, 0.3);
            app.camera.updateMatrixWorld();
        }
    } else {
        var newHeight = app.camera.position.y + 2;
        app.camera.position.y = v3d.MathUtils.lerp(app.camera.position.y, newHeight, 0.3);
        app.camera.updateMatrixWorld();
    }

});