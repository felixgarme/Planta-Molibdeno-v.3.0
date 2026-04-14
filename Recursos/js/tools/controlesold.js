import("./info/controles.js");

window.barraControles = (function() {
    let barraContenedor;

    const iconos = {
        atrasar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/></svg>',
        pause: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/></svg>',
        play: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>',
        adelantar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/></svg>',
        recargar: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/></svg>',
        mutear: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z"/></svg>',
        continue: '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M8 5v14l11-7z"/></svg>'
    };

    function ejecutarEnVerge3D(nombreProcedimiento) {
        if (typeof v3d !== 'undefined' && v3d.puzzles && v3d.puzzles.procedures && typeof v3d.puzzles.procedures[nombreProcedimiento] === 'function') {
            v3d.puzzles.procedures[nombreProcedimiento]();
        }
    }

    function inyectarEstilos() {
        if (document.getElementById('estilos-barra-mac')) return;

        const estilos = document.createElement('style');
        estilos.id = 'estilos-barra-mac';
        estilos.innerHTML = `
            .mac-dock-container {
                position: fixed;
                bottom: 24px;
                left: 50%;
                transform: translateX(-50%) translateY(50px);
                opacity: 0;
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(3, 23, 149, 0.15);
                border-radius: 24px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1), 0 1px 3px rgba(3, 23, 149, 0.08);
                display: flex;
                align-items: center;
                gap: 12px;
                padding: 10px 20px;
                z-index: 10000;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
            }

            .mac-dock-btn {
                background: transparent;
                border: none;
                width: 46px;
                height: 46px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                color: #031795;
                transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, transform 0.3s ease;
                padding: 0;
                position: relative;
            }

            .mac-dock-btn svg { width: 24px; height: 24px; }

            .mac-dock-btn:hover {
                background: #031795;
                color: #ffffff;
                transform: translateY(-8px) scale(1.15);
                box-shadow: 0 8px 15px rgba(3, 23, 149, 0.3);
            }

            .mac-dock-btn:active { transform: translateY(-4px) scale(1.05); }

            .mac-dock-btn.btn-activo {
                background: #ff3b30; 
                color: #ffffff;
                box-shadow: inset 0 3px 6px rgba(0,0,0,0.2);
                transform: translateY(0) scale(1);
            }

            .boton-oculto {
                opacity: 0 !important;
                transform: scale(0.5) !important;
                pointer-events: none !important;
            }

            .btn-continuar-flotante {
                position: absolute;
                bottom: calc(100% + 15px);
                left: 50%;
                transform: translateX(-50%);
                background: #031795;
                color: #ffffff;
                width: auto; 
                height: 56px;
                padding: 0 24px;
                border-radius: 28px;
                font-family: sans-serif;
                font-weight: bold;
                font-size: 16px;
                display: flex;
                gap: 8px; /* Separación entre ícono y texto */
                border: 3px solid #ffffff;
                box-shadow: 0 8px 20px rgba(3, 23, 149, 0.4);
                z-index: 10001;
                transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease, background 0.3s ease;
            }

            .btn-continuar-flotante.boton-oculto {
                transform: translateX(-50%) scale(0.5) !important;
            }

            .btn-continuar-flotante svg { width: 24px; height: 24px; }

            .btn-continuar-flotante:hover {
                transform: translateX(-50%) scale(1.1);
                background: #051ea8;
                box-shadow: 0 12px 25px rgba(3, 23, 149, 0.5);
            }

            .btn-continuar-flotante:active { transform: translateX(-50%) scale(1.05); }

            .mac-dock-btn::after {
                content: attr(data-tooltip);
                position: absolute;
                top: -35px;
                background: #031795;
                color: #ffffff;
                font-family: sans-serif;
                font-size: 12px;
                padding: 4px 10px;
                border-radius: 6px;
                opacity: 0;
                pointer-events: none;
                transition: opacity 0.2s ease, transform 0.2s ease;
                transform: translateY(10px);
                white-space: nowrap;
                font-weight: 600;
            }
            .mac-dock-btn:hover::after { opacity: 1; transform: translateY(0); }

            @media (max-width: 600px) {
                .mac-dock-container { width: auto; max-width: 95%; bottom: 12px; padding: 6px 14px; justify-content: center; gap: 6px; border-radius: 20px; }
                .mac-dock-btn { width: 38px; height: 38px; }
                .mac-dock-btn svg { width: 18px; height: 18px; }
                .mac-dock-btn:hover { transform: translateY(-4px) scale(1.1); }
                .mac-dock-btn::after { display: none; }
                
                .btn-continuar-flotante { height: 48px; bottom: calc(100% + 10px); padding: 0 18px; font-size: 14px; }
                .btn-continuar-flotante svg { width: 20px; height: 20px; }
                .btn-continuar-flotante:hover { transform: translateX(-50%) scale(1.05); }
            }

            @media (max-width: 950px) and (orientation: landscape) {
                .mac-dock-container { width: auto; bottom: 5px; padding: 4px 12px; gap: 8px; border-radius: 16px; }
                .mac-dock-btn { width: 34px; height: 34px; }
                .mac-dock-btn svg { width: 16px; height: 16px; }
                .mac-dock-btn:hover { transform: translateY(-2px) scale(1.1); }
                .mac-dock-btn::after { display: none; }

                .btn-continuar-flotante { height: 42px; bottom: calc(100% + 5px); border-width: 2px; padding: 0 16px; font-size: 13px; }
                .btn-continuar-flotante svg { width: 18px; height: 18px; }
                .btn-continuar-flotante:hover { transform: translateX(-50%) scale(1.05); }
            }
        `;
        document.head.appendChild(estilos);
    }

    function crearBoton(id, iconoSvg, tooltip, accion, esEspecial = false) {
        const btn = document.createElement('button');
        btn.className = 'mac-dock-btn';
        if (esEspecial) btn.classList.add('btn-continuar-flotante');
        
        btn.id = `btn-dock-${id}`;
        
        if (id === 'continue') {
            btn.innerHTML = iconoSvg + '<span>Continuar</span>';
        } else {
            btn.innerHTML = iconoSvg;
        }
        
        btn.setAttribute('data-tooltip', tooltip);
        
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();

            if (id === 'mutear') {
                btn.classList.toggle('btn-activo');
                const estaMuteado = btn.classList.contains('btn-activo');
                btn.setAttribute('data-tooltip', estaMuteado ? 'Desmutear' : 'Mutear');
                
            } else if (id === 'pause') {
                const estaPausado = btn.classList.toggle('en-pausa');
                btn.innerHTML = estaPausado ? iconos.play : iconos.pause;
                btn.setAttribute('data-tooltip', estaPausado ? 'Reproducir' : 'Pausar');
                
            } else if (id === 'continue') {
                window.ocultarboton('continue');
                
            } else if (id === 'atrasar') {
                if (typeof window.closehtml === 'function') {
                    window.closehtml();
                }
                window.ocultarboton('continue');
            }

            accion(id);
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
            { id: 'mutear', icono: iconos.mutear, texto: 'Mutear' },
            { id: 'continue', icono: iconos.continue, texto: 'Continuar', especial: true }
        ];

        botones.forEach(b => {
            const botonDOM = crearBoton(b.id, b.icono, b.texto, ejecutarEnVerge3D, b.especial);
            barraContenedor.appendChild(botonDOM);
        });

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
        }
    };
})();

window.ocultarboton = function(id) {
    const btn = document.getElementById('btn-dock-' + id);
    if (btn) {
        btn.classList.add('boton-oculto');
        
        setTimeout(() => {
            if (btn.classList.contains('boton-oculto')) {
                btn.style.display = 'none';
            }
        }, 300);
    }
};

window.mostrarboton = function(id) {
    const btn = document.getElementById('btn-dock-' + id);
    if (btn) {
        btn.style.display = 'flex';
        requestAnimationFrame(() => {
            btn.classList.remove('boton-oculto');
        });
    }
};