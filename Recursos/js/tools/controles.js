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
        volumenNormal: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z"/></svg>',
        volumenMute: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>'
    };

    async function cargarHistorial(url) {
        try {
            const respuesta = await fetch(url);
            historial = await respuesta.json();
            indiceActual = -1; 
            actualizarEstadoBotones();
            actualizarIndicador();
            
            // --- REPRODUCIR AUTOMATICAMENTE EL PRIMER ELEMENTO ---
            if (historial && historial.length > 0) {
                avanzarSecuencia();
            }
            // -----------------------------------------------------

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

    function aplicarEstadoBotonNavegacion(id, habilitado) {
        const btn = document.getElementById('btn-dock-' + id);
        if (!btn) return;
        btn.style.display = 'flex';
        btn.classList.remove('boton-oculto');
        btn.disabled = !habilitado;
    }

    function actualizarEstadoBotones() {
        const hayHistorial = historial && historial.length > 0;
        const puedeAdelantar = hayHistorial && indiceActual < historial.length - 1;
        const puedeAtrasar = hayHistorial && indiceActual > 0;

        aplicarEstadoBotonNavegacion('adelantar', puedeAdelantar);
        aplicarEstadoBotonNavegacion('atrasar', puedeAtrasar);
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

    if (typeof window.goToNextPage !== 'function') {
        window.goToNextPage = function() {
            avanzarSecuencia();
        };
    }

    // --- NUEVA FUNCIONALIDAD AGREGADA ---
    if (typeof window.pasosiguiente !== 'function') {
        window.pasosiguiente = function() {
            avanzarSecuencia();
        };
    }
    // ------------------------------------

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

        :root { --color-azul: #031795; --shadow: 0 8px 20px rgba(29, 78, 216, 0.25); --dock-gap: 11px; } /* Ajustado 20% */
        @keyframes subtlePulse {
            0% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0.4); }
            70% { box-shadow: 0 0 0 10px rgba(0, 102, 204, 0); }
            100% { box-shadow: 0 0 0 0 rgba(0, 102, 204, 0); }
        }
        .mac-dock-container { position: fixed; bottom: 24px; left: 50%; transform: translate(-50%, 50px); opacity: 0; background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(3, 23, 149, 0.15); border-radius: 24px; box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(3, 23, 149, 0.08); display: flex; align-items: center; gap: var(--dock-gap); padding: 8px 16px; width: max-content; max-width: calc(100vw - 32px); box-sizing: border-box; z-index: 10000; transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease; background: var(--color-blanco, #ffffff); /* Ajustado 20% */
    border-radius: 50px;
    box-shadow: 0px 4px 15px rgba(0, 0, 0, 0.2);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(0, 102, 204, 0.1);}
        .mac-dock-left,
        .mac-dock-center { display: flex; align-items: center; flex-shrink: 0; position: relative; z-index: 6; }
        .mac-dock-center { gap: 8px; } /* Ajustado */
        .mac-dock-right { display: flex; align-items: center; flex-shrink: 0; position: relative; z-index: 1; }
        .mac-dock-btn { background: transparent; border: none; width: 44px; height: 44px; border-radius: 50%; display: flex; justify-content: center; align-items: center; cursor: pointer; color: #031795; transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s ease; padding: 0; position: relative; border: 1px solid #a8acc369; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);} /* Ajustado 20% */
        .mac-dock-btn svg { width: 22px; height: 22px; } /* Ajustado 20% */
        .mac-dock-btn:hover:not(:disabled) { background: #031795; color: #ffffff; transform: translateY(-8px) scale(1.15); box-shadow: 0 8px 15px rgba(3, 23, 149, 0.3); background-color: #0066cc !important;  }
        .mac-dock-btn:disabled { opacity: 0.38; cursor: not-allowed; }
        .mac-dock-btn:disabled:hover { background: transparent; color: #031795; transform: none; box-shadow: none; }
        .mac-dock-btn.btn-activo { background: #ff3b30; color: #ffffff; }
        .boton-oculto { opacity: 0 !important; transform: scale(0.5) !important; pointer-events: none !important; }
        .mac-dock-btn.mac-dock-has-tooltip::after { content: attr(data-tooltip); position: absolute; top: -35px; left: 50%; transform: translateX(-50%); background: #031795; color: #ffffff; font-size: 12px; font-family: 'AASMART Sans', system-ui, -apple-system, 'Segoe UI', sans-serif; font-weight: 600; padding: 4px 10px; border-radius: 6px; opacity: 0; white-space: nowrap; pointer-events: none; z-index: 20; }
        .mac-dock-btn.mac-dock-has-tooltip:hover:not(:disabled)::after { opacity: 1; }
        .mac-dock-volume-wrap > .mac-dock-btn::after { content: none !important; display: none !important; }
        .mac-dock-volume-wrap { position: relative; display: flex; align-items: center; justify-content: center; flex-shrink: 0; z-index: 1; }
        .mac-dock-volume-wrap:hover,
        .mac-dock-volume-wrap:focus-within { z-index: 50; }
        .mac-dock-volume-popover { position: absolute; bottom: calc(100% + 10px); left: 50%; transform: translateX(-50%) translateY(4px); padding: 14px 12px 12px; background: rgba(255, 255, 255, 0.96); backdrop-filter: blur(12px); -webkit-backdrop-filter: blur(12px); border: 1px solid rgba(3, 23, 149, 0.15); border-radius: 16px; box-shadow: 0 10px 28px rgba(0, 0, 0, 0.12); opacity: 0; visibility: hidden; pointer-events: none; transition: opacity 0.2s ease, transform 0.2s ease, visibility 0.2s; z-index: 2; }
        .mac-dock-volume-wrap:hover .mac-dock-volume-popover,
        .mac-dock-volume-wrap:focus-within .mac-dock-volume-popover { opacity: 1; visibility: visible; pointer-events: auto; transform: translateX(-50%) translateY(0); }
        .mac-dock-volume-slider { width: 22px; height: 86px; margin: 0; padding: 0; cursor: pointer; accent-color: #031795; -webkit-appearance: slider-vertical; } /* Ajustado 20% */
        .mac-dock-volume-slider::-webkit-slider-thumb { cursor: pointer; }
        .mac-dock-volume-slider::-webkit-slider-runnable-track { cursor: pointer; }
        .mac-dock-btn.play-pause-btn::before {
            content: '';
            position: absolute;
            top: -2px;
            right: -2px;
            width: 12px;
            height: 12px;
            border-radius: 50%;
            background: #28a745;
            opacity: 0;
            transition: opacity 0.3s ease;
            pointer-events: none;
            z-index: 22;
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.95);
        }
        .mac-dock-btn.play-pause-btn.audio-reproduciendo::before {
            opacity: 1;
        }
        .mac-dock-btn.play-pause-btn.audio-reproduciendo:not(:hover):not(:disabled) {
            animation: subtlePulse 2s ease-out infinite;
        }
        .mac-dock-btn.play-pause-btn:not(.audio-reproduciendo),
        .mac-dock-btn.play-pause-btn:hover:not(:disabled),
        .mac-dock-btn.play-pause-btn:disabled {
            animation: none;
        }
    #btn-dock-pause { color: #fff; background: #031795; width: 56px; height: 56px; border-radius: 50%; } /* Ajustado 20% */
        `;
        document.head.appendChild(estilos);
    }

    function sincronizarIndicadorReproduccionPauseDock() {
        const btn = document.getElementById('btn-dock-pause');
        if (!btn) return;
        const reproduciendo = typeof window.isAvatarAudioPlaying === 'function' && window.isAvatarAudioPlaying();
        btn.classList.toggle('audio-reproduciendo', reproduciendo);
        if (reproduciendo) {
            btn.classList.remove('en-pausa');
            btn.innerHTML = iconos.pause;
        } else {
            btn.classList.add('en-pausa');
            btn.innerHTML = iconos.play;
        }
    }

    function crearBoton(id, iconoSvg, tooltip) {
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mac-dock-btn mac-dock-has-tooltip' + (id === 'pause' ? ' play-pause-btn' : '');
        btn.id = `btn-dock-${id}`;
        btn.innerHTML = iconoSvg;
        btn.setAttribute('data-tooltip', tooltip);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            if (id === 'pause') {
                ejecutarEnVerge3D(id);
                sincronizarIndicadorReproduccionPauseDock();
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

    function leerEstadoAudio() {
        if (typeof window.getAvatarAudioState === 'function') {
            return window.getAvatarAudioState();
        }
        return { volume: 1, muted: false };
    }

    function crearControlVolumen() {
        const wrap = document.createElement('div');
        wrap.className = 'mac-dock-volume-wrap';

        const popover = document.createElement('div');
        popover.className = 'mac-dock-volume-popover';
        popover.setAttribute('role', 'group');

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.className = 'mac-dock-volume-slider';
        slider.min = '0';
        slider.max = '100';
        slider.step = '1';
        slider.setAttribute('aria-label', 'Volumen');
        slider.setAttribute('orient', 'vertical');

        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mac-dock-btn';
        btn.id = 'btn-dock-mutear';

        function sincronizarVolumenUI() {
            const st = leerEstadoAudio();
            const silenciado = st.muted === true || st.volume === 0;
            btn.innerHTML = silenciado ? iconos.volumenMute : iconos.volumenNormal;
            btn.classList.toggle('btn-activo', silenciado);
            if (document.activeElement !== slider) {
                slider.value = String(Math.round((typeof st.volume === 'number' ? st.volume : 1) * 100));
            }
        }

        slider.addEventListener('input', () => {
            const v = parseInt(slider.value, 10);
            const norm = Number.isFinite(v) ? Math.max(0, Math.min(1, v / 100)) : 0;
            if (typeof window.avatarAudioSetVolume === 'function') {
                window.avatarAudioSetVolume(norm);
            }
        });

        slider.addEventListener('click', (e) => e.stopPropagation());

        btn.addEventListener('click', (e) => {
            e.preventDefault();
            ejecutarEnVerge3D('mutear');
        });

        window.addEventListener('avatar-audio-state', sincronizarVolumenUI);

        popover.appendChild(slider);
        wrap.appendChild(popover);
        wrap.appendChild(btn);
        sincronizarVolumenUI();
        return wrap;
    }

    function inicializar() {
        if (barraContenedor) return;
        inyectarEstilos();
        
        barraContenedor = document.createElement('div');
        barraContenedor.className = 'mac-dock-container';
        const colIzq = document.createElement('div');
        colIzq.className = 'mac-dock-left';
        const colCentro = document.createElement('div');
        colCentro.className = 'mac-dock-center';
        const colDer = document.createElement('div');
        colDer.className = 'mac-dock-right';

        colIzq.appendChild(crearBoton('recargar', iconos.recargar, 'Volver a reproducir'));
        colCentro.appendChild(crearBoton('atrasar', iconos.atrasar, 'Atrás'));
        colCentro.appendChild(crearBoton('pause', iconos.pause, 'Pausar'));
        colCentro.appendChild(crearBoton('adelantar', iconos.adelantar, 'Siguiente'));
        colDer.appendChild(crearControlVolumen());

        barraContenedor.append(colIzq, colCentro, colDer);
        document.body.appendChild(barraContenedor);
        actualizarEstadoBotones();
        window.addEventListener('avatar-audio-playback', sincronizarIndicadorReproduccionPauseDock);
        sincronizarIndicadorReproduccionPauseDock();
    }

    return {
        mostrar: function() {
            inicializar();
            barraContenedor.style.display = 'flex';
            
            requestAnimationFrame(() => {
                barraContenedor.style.transform = 'translate(-50%, 0)';
                barraContenedor.style.opacity = '1';
            });
        },
        ocultar: function() {
            if (barraContenedor) {
                barraContenedor.style.transform = 'translate(-50%, 50px)';
                barraContenedor.style.opacity = '0';
                setTimeout(() => barraContenedor.style.display = 'none', 400);
            }
        },
        cargarDesdeURL: cargarHistorial,
        ejecutarSalto: saltarAPasoEspecifico,
        sincronizarBotonesNavegacion: actualizarEstadoBotones,
        sincronizarIndicadorReproduccionPause: sincronizarIndicadorReproduccionPauseDock
    };
})();

window.ocultarboton = function(id) {
    if (id === 'atrasar' || id === 'adelantar') return;
    const btn = document.getElementById('btn-dock-' + id);
    if (btn) {
        btn.classList.add('boton-oculto');
        setTimeout(() => { if (btn.classList.contains('boton-oculto')) btn.style.display = 'none'; }, 300);
    }
};

window.mostrarboton = function(id) {
    if (id === 'atrasar' || id === 'adelantar') {
        if (window.barraControles && typeof window.barraControles.sincronizarBotonesNavegacion === 'function') {
            window.barraControles.sincronizarBotonesNavegacion();
        }
        return;
    }
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