window.barraControles = (function() {
    let barraContenedor;
    let historial = [];
    let indiceActual = -1;

    const iconos = {
        atrasar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
        adelantar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',
        recargar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
        mutear: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
    };

    async function cargarHistorial(url) {
        try {
            const respuesta = await fetch(url);
            historial = await respuesta.json();
            
            // Reiniciamos el índice
            indiceActual = -1; 
            
            // EJECUCIÓN AUTOMÁTICA DEL PRIMER PASO
            if (historial && historial.length > 0) {
                indiceActual = 0;
                ejecutarPasoActual();
            }

            actualizarEstadoBotones();
            actualizarIndicador();
        } catch (error) {
            console.error('Error al cargar el historial JSON:', error);
            historial = [];
            actualizarEstadoBotones();
            actualizarIndicador();
        }
    }

    function ejecutarEnVerge3D(nombreProcedimiento) {
        if (typeof v3d !== 'undefined' && v3d.puzzles && v3d.puzzles.procedures && typeof v3d.puzzles.procedures[nombreProcedimiento] === 'function') {
            v3d.puzzles.procedures[nombreProcedimiento]();
        }
    }

    function actualizarEstadoBotones() {
        if (!historial || historial.length === 0 || indiceActual >= historial.length - 1) {
            window.ocultarboton('adelantar');
        } else {
            window.mostrarboton('adelantar');
        }

        if (indiceActual <= 0) {
            window.ocultarboton('atrasar');
        } else {
            window.mostrarboton('atrasar');
        }
    }

    function actualizarIndicador() {
        if (!historial) return;
        
        const total = historial.length;
        const numeroActual = indiceActual >= 0 ? indiceActual + 1 : 0;
        
        if (typeof window.indicador === 'function') {
            window.indicador(numeroActual, total);
        }
    }

    function ejecutarPasoActual() {
        if (indiceActual >= 0 && indiceActual < historial.length) {
            const paso = historial[indiceActual];
            
            if (Array.isArray(paso)) {
                const accionV3D = paso[0];     
                const textoAvatar = paso[1];   
                const audioAvatar = paso[2];   

                if (accionV3D) ejecutarEnVerge3D(accionV3D);

                if (typeof window.avatar === 'function' && (textoAvatar || audioAvatar)) {
                    window.avatar(textoAvatar, audioAvatar);
                }
            } else if (typeof paso === 'string') {
                ejecutarEnVerge3D(paso);
            }
        }
    }

    function avanzarSecuencia() {
        if (indiceActual < historial.length - 1) {
            indiceActual++;
            ejecutarPasoActual();
            actualizarEstadoBotones();
            actualizarIndicador();
        }
    }

    // Mantenemos goToNextPage por si otras partes de tu app la llaman, 
    // pero ahora solo avanza la secuencia.
    if (typeof window.goToNextPage !== 'function') {
        window.goToNextPage = function() {
            avanzarSecuencia();
        };
    }

    function retrocederSecuencia() {
        if (indiceActual > 0) {
            indiceActual--;
            ejecutarPasoActual();
            actualizarEstadoBotones();
            actualizarIndicador();
        }
    }

    function saltarAPasoEspecifico(nombrePaso) {
        const nuevoIndice = historial.findIndex(paso => {
            if (Array.isArray(paso)) {
                return paso[0] === nombrePaso;
            }
            return paso === nombrePaso;
        });

        if (nuevoIndice !== -1) {
            indiceActual = nuevoIndice; 
            ejecutarPasoActual();       
            actualizarEstadoBotones();  
            actualizarIndicador();
        } else {
            console.warn(`El paso "${nombrePaso}" no se encontró en la lista actual.`);
        }
    }

    function inyectarEstilos() {
        if (document.getElementById('estilos-barra-mac')) return;
        const estilos = document.createElement('style');
        estilos.id = 'estilos-barra-mac';
        estilos.innerHTML = `
            :root { --color-azul: #031795; --shadow: 0 8px 20px rgba(29, 78, 216, 0.25); }
            .mac-dock-container { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%) translateY(50px); opacity: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(3, 23, 149, 0.15); border-radius: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(3, 23, 149, 0.08); display: flex; align-items: center; gap: 12px; padding: 10px 20px; z-index: 10000; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; }
            .mac-dock-btn { background: transparent; border: none; width: 46px; height: 46px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #031795; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s ease; padding: 0; position: relative; }
            .mac-dock-btn svg { width: 24px; height: 24px; }
            .mac-dock-btn:hover { background: #031795; color: #ffffff; transform: translateY(-8px) scale(1.15); box-shadow: 0 8px 15px rgba(3, 23, 149, 0.3); }
            .mac-dock-btn.btn-activo { background: #ff3b30; color: #ffffff; }
            .boton-oculto { opacity: 0 !important; transform: scale(0.5) !important; pointer-events: none !important; }
            .mac-dock-btn::after { content: attr(data-tooltip); position: absolute; top: -35px; background: #031795; color: #ffffff; font-size: 12px; padding: 4px 10px; border-radius: 6px; opacity: 0; white-space: nowrap; }
            .mac-dock-btn:hover::after { opacity: 1; }
        `;
        document.head.appendChild(estilos);
    }

    function crearBoton(id, iconoSvg, tooltip) {
        const btn = document.createElement('button');
        btn.className = 'mac-dock-btn';
        btn.id = `btn-dock-${id}`;
        btn.innerHTML = iconoSvg;
        btn.setAttribute('data-tooltip', tooltip);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (id === 'mutear') {
                btn.classList.toggle('btn-activo');
                ejecutarEnVerge3D(id);
            } else if (id === 'pause') {
                const estaPausado = btn.classList.toggle('en-pausa');
                btn.innerHTML = estaPausado ? iconos.play : iconos.pause;
                ejecutarEnVerge3D(id);
            } else if (id === 'adelantar') {
                avanzarSecuencia();
            } else if (id === 'atrasar') {
                if (typeof window.closehtml === 'function') window.closehtml();
                retrocederSecuencia();
            } else if (id === 'recargar') {
                ejecutarEnVerge3D('recargar');
                if (indiceActual >= 0) {
                    ejecutarPasoActual(); 
                }
                actualizarEstadoBotones();
            }
        });
        return btn;
    }

    function inicializar() {
        if (barraContenedor) return;
        inyectarEstilos();
        
        barraContenedor = document.createElement('div');
        barraContenedor.className = 'mac-dock-container';
        const botones = [
            { id: 'atrasar', icono: iconos.atrasar, texto: 'Atrasar' },
            { id: 'pause', icono: iconos.pause, texto: 'Pausar' },
            { id: 'adelantar', icono: iconos.adelantar, texto: 'Adelantar' },
            { id: 'recargar', icono: iconos.recargar, texto: 'Recargar' },
            { id: 'mutear', icono: iconos.mutear, texto: 'Mutear' }
        ];
        
        botones.forEach(b => barraContenedor.appendChild(crearBoton(b.id, b.icono, b.texto)));
        document.body.appendChild(barraContenedor);
    }

    return {
        mostrar: function() {
            inicializar();
            barraContenedor.style.display = 'flex';
            
            requestAnimationFrame(() => {
                barraContenedor.style.transform = 'translateX(-50%) translateY(0)';
                barraContenedor.style.opacity = '1';
            });
        },
        ocultar: function() {
            if (barraContenedor) {
                barraContenedor.style.transform = 'translateX(-50%) translateY(50px)';
                barraContenedor.style.opacity = '0';
                setTimeout(() => barraContenedor.style.display = 'none', 400);
            }
        },
        cargarDesdeURL: cargarHistorial,
        ejecutarSalto: saltarAPasoEspecifico 
    };
})();

// Las funciones globales se simplificaron al no tener que manejar excepciones
window.ocultarboton = function(id) {
    const btn = document.getElementById('btn-dock-' + id);
    if (btn) {
        btn.classList.add('boton-oculto');
        setTimeout(() => { if (btn.classList.contains('boton-oculto')) btn.style.display = 'none'; }, 300);
    }
};

window.mostrarboton = function(id) {
    const btn = document.getElementById('btn-dock-' + id);
    if (btn) {
        btn.style.display = 'flex';
        requestAnimationFrame(() => btn.classList.remove('boton-oculto'));
    }
};

window.lista = async function(url) {
    window.barraControles.mostrar();
    await window.barraControles.cargarDesdeURL(url);
};

window.paso = function(nombreDelPaso) {
    if (window.barraControles && typeof window.barraControles.ejecutarSalto === 'function') {
        window.barraControles.ejecutarSalto(nombreDelPaso);
    }
};