function updateFrustumCulling() {
    const cam = app.camera;
    const frustum = new v3d.Frustum();
    const camMatrix = new v3d.Matrix4().multiplyMatrices(
        cam.projectionMatrix,
        cam.matrixWorldInverse
    );
    frustum.setFromProjectionMatrix(camMatrix);

    const objetosIgnorados = [
        "LentesSeguridadHombre",
        "Box001",
        "Box002",
        "Object006",
        "Object005",
        "ProtectorAuditivoHombre",
        "Chaleco",
        "Object004",
        "Object002",
        "11_MascaraSiliconada",
		"Object0021",
        "stiker",
        "error1",
        "error2",
        "error3",
        
    ];

    app.scene.traverse(obj => {
        if (obj.isMesh) {
            if (objetosIgnorados.includes(obj.name)) {
                return; 
            }

            obj.frustumCulled = true;
            const boundingBox = new v3d.Box3().setFromObject(obj);
            obj.visible = frustum.intersectsBox(boundingBox);
        }
    });
}

app.addEventListener('afterRender', updateFrustumCulling);