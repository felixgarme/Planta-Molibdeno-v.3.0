window.pregunta = (function() {
    let fondoOscuro, cajaModal, elementoTexto, contenedorBotones, btnOpcion1, btnOpcion2;
    let modalAbierto = false;

    const esPC = window.matchMedia('(pointer: fine)').matches;

    const generarIcono = (direccion) => {
        const svg = direccion === 'izq' 
            ? '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none"><polyline points="15 18 9 12 15 6"></polyline></svg>'
            : '<svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="3" fill="none"><polyline points="9 18 15 12 9 6"></polyline></svg>';
        
        if (!esPC) return svg;

        return `
            <span style="
                display: flex;
                align-items: center;
                justify-content: center;
                width: 28px;
                height: 28px;
                background: white;
                border: 1px solid #7ea4d9;
                border-radius: 6px;
                margin: ${direccion === 'izq' ? '0 12px 0 0' : '0 0 0 12px'};
                box-shadow: 0 2px 0 #7ea4d9;
                color: #002080;
            ">
                ${svg}
            </span>
        `;
    };

    function inicializarUI() {
        if (fondoOscuro) return;

        fondoOscuro = document.createElement('div');
        Object.assign(fondoOscuro.style, {
            position: 'fixed',
            top: '0', left: '0',
            width: '100vw', height: '100vh',
            backgroundColor: 'rgba(0, 0, 0, 0.6)',
            backdropFilter: 'blur(4px)',
            zIndex: '10000',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            opacity: '0',
            transition: 'opacity 0.3s ease',
            pointerEvents: 'none',
            fontFamily: '"Segoe UI", Roboto, sans-serif'
        });

        cajaModal = document.createElement('div');
        Object.assign(cajaModal.style, {
            textAlign: 'center',
            maxWidth: '500px',
            width: '90%',
            transform: 'scale(0.9)',
            transition: 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        });

        elementoTexto = document.createElement('h3');
        Object.assign(elementoTexto.style, {
            marginBottom: '40px',
            color: '#ffffff',
            fontSize: '32px',
            fontWeight: '600',
            textShadow: '0 2px 10px rgba(0,0,0,0.5)'
        });

        contenedorBotones = document.createElement('div');
        Object.assign(contenedorBotones.style, {
            display: 'flex',
            gap: '25px',
            justifyContent: 'center'
        });

        const estilizarBoton = (btn) => {
            Object.assign(btn.style, {
                padding: esPC ? '8px 25px 8px 12px' : '12px 35px',
                border: '1.5px solid #7ea4d9',
                borderRadius: '50px',
                fontSize: '20px',
                fontWeight: '600',
                cursor: 'pointer',
                backgroundColor: '#e3edfb',
                color: '#002080',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.2)',
                minWidth: '140px'
            });
            
            if (btn === btnOpcion2 && esPC) {
                btn.style.padding = '8px 12px 8px 25px';
            }

            btn.onmouseenter = () => {
                btn.style.backgroundColor = '#ffffff';
                btn.style.transform = 'translateY(-3px)';
            };
            btn.onmouseleave = () => {
                btn.style.backgroundColor = '#e3edfb';
                btn.style.transform = 'translateY(0)';
            };
        };

        btnOpcion1 = document.createElement('button');
        btnOpcion2 = document.createElement('button');
        estilizarBoton(btnOpcion1);
        estilizarBoton(btnOpcion2);

        contenedorBotones.appendChild(btnOpcion1);
        contenedorBotones.appendChild(btnOpcion2);
        cajaModal.appendChild(elementoTexto);
        cajaModal.appendChild(contenedorBotones);
        fondoOscuro.appendChild(cajaModal);
        document.body.appendChild(fondoOscuro);

        document.addEventListener('keydown', (e) => {
            if (!modalAbierto) return;
            if (e.key === 'ArrowLeft') btnOpcion1.click();
            if (e.key === 'ArrowRight') btnOpcion2.click();
        });
    }

    function ocultarModal() {
        fondoOscuro.style.opacity = '0';
        cajaModal.style.transform = 'scale(0.9)';
        fondoOscuro.style.pointerEvents = 'none';
        modalAbierto = false;
    }

    function ejecutarProcedimientoV3D(nombreProcedimiento) {
        if (typeof v3d !== 'undefined' && v3d.puzzles?.procedures?.[nombreProcedimiento]) {
            v3d.puzzles.procedures[nombreProcedimiento]();
        }
    }

    return function(idPregunta, pregunta, textoOpcion1, textoOpcion2) {
        inicializarUI();
        elementoTexto.textContent = pregunta;
        
        btnOpcion1.innerHTML = generarIcono('izq') + `<span>${textoOpcion1}</span>`;
        btnOpcion2.innerHTML = `<span>${textoOpcion2}</span>` + generarIcono('der');

        fondoOscuro.style.pointerEvents = 'auto';
        modalAbierto = true;
        
        setTimeout(() => {
            fondoOscuro.style.opacity = '1';
            cajaModal.style.transform = 'scale(1)';
        }, 10);

        btnOpcion1.onclick = () => { ocultarModal(); ejecutarProcedimientoV3D(idPregunta + "1"); };
        btnOpcion2.onclick = () => { ocultarModal(); ejecutarProcedimientoV3D(idPregunta + "2"); };
    };
})();