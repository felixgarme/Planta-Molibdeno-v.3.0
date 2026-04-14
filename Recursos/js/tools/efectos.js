(function() {
    if (!document.getElementById('estilos-efecto-tutorial')) {
        const estilo = document.createElement('style');
        estilo.id = 'estilos-efecto-tutorial';
        estilo.innerHTML = `
            #overlay-tutorial-api {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background-color: rgba(0, 0, 0, 0.65);
                backdrop-filter: blur(3px);
                z-index: 10000;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                opacity: 0;
                transition: opacity 0.5s ease;
                cursor: pointer;
                font-family: "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
            }
            .icono-tutorial-animado {
                animation: tutorialDeslizar 2s infinite ease-in-out;
                filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));
                margin-bottom: 20px;
            }
            .texto-tutorial-api {
                color: #ffffff;
                font-size: 22px;
                font-weight: 600;
                text-align: center;
                text-shadow: 0 2px 4px rgba(0,0,0,0.8);
                padding: 0 20px;
                animation: tutorialLatido 2s infinite ease-in-out;
            }
            .texto-secundario-api {
                color: #cccccc;
                font-size: 14px;
                font-weight: 400;
                margin-top: 10px;
                opacity: 0.8;
            }
            
            /* Guía de Joystick (Solo Móviles) */
            .tutorial-joystick-guia {
                position: absolute;
                bottom: 40px;
                left: 20px;
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: none;
            }
            .icono-joystick-guia {
                animation: tutorialReboteDiagonal 1.5s infinite ease-in-out;
                filter: drop-shadow(0px 4px 8px rgba(0,0,0,0.5));
                margin-bottom: 5px;
            }
            
            /* Guía de Teclado (Solo PC) */
            .tutorial-teclado-guia {
                position: absolute;
                bottom: 40px;
                left: 30px;
                display: flex;
                flex-direction: column;
                align-items: center;
                pointer-events: none;
            }
            .contenedor-teclas {
                display: flex;
                gap: 20px;
                margin-bottom: 12px;
                align-items: center;
            }
            .columna-teclas {
                display: flex;
                flex-direction: column;
                gap: 6px;
                align-items: center;
            }
            .tecla-tutorial {
                width: 36px;
                height: 36px;
                border: 2px solid #ffffff;
                border-radius: 6px;
                display: flex;
                justify-content: center;
                align-items: center;
                color: #ffffff;
                font-weight: bold;
                font-size: 16px;
                background-color: rgba(0,0,0,0.4);
                box-shadow: 0 4px 6px rgba(0,0,0,0.5);
            }
            .texto-guia-esquina {
                color: #ffffff;
                font-size: 15px;
                font-weight: 600;
                text-align: center;
                text-shadow: 0 1px 3px rgba(0,0,0,0.8);
            }

            /* Animaciones */
            @keyframes tutorialDeslizar {
                0%   { transform: translateX(-40px); }
                50%  { transform: translateX(40px); }
                100% { transform: translateX(-40px); }
            }
            @keyframes tutorialLatido {
                0%, 100% { transform: scale(1); opacity: 0.9; }
                50% { transform: scale(1.05); opacity: 1; }
            }
            @keyframes tutorialReboteDiagonal {
                0%, 100% { transform: translate(0, 0); }
                50% { transform: translate(-10px, 10px); }
            }
            @keyframes tutorialPulsarTecla {
                0%, 100% { transform: scale(1) translateY(0); background-color: rgba(0,0,0,0.4); color: #ffffff; }
                50% { transform: scale(0.9) translateY(2px); background-color: rgba(255,255,255,0.9); color: #000000; box-shadow: 0 1px 2px rgba(0,0,0,0.5); }
            }

            /* Clases para alternar la pulsación */
            .anim-tecla-1 { animation: tutorialPulsarTecla 2s infinite ease-in-out; }
            .anim-tecla-2 { animation: tutorialPulsarTecla 2s infinite ease-in-out 1s; } /* Retraso para que pulsen alternadas */
        `;
        document.head.appendChild(estilo);
    }

    // Icono del ratón para PC (Centro)
    const svgRatonPC = `
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12l3-3v6z" fill="#ffffff" stroke="none"/>
            <path d="M22 12l-3-3v6z" fill="#ffffff" stroke="none"/>
            <rect x="7" y="3" width="10" height="18" rx="5"/>
            <path d="M12 7v4"/>
        </svg>
    `;

    // Icono de mano táctil deslizando (Centro)
    const svgManoTactil = `
        <svg width="100" height="100" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M2 12l3-3v6z" fill="#ffffff" stroke="none"/>
            <path d="M22 12l-3-3v6z" fill="#ffffff" stroke="none"/>
            <path d="M8 13v-8.5a1.5 1.5 0 0 1 3 0v7.5"/>
            <path d="M11 11.5v-2a1.5 1.5 0 1 1 3 0v2"/>
            <path d="M14 10.5v-1a1.5 1.5 0 1 1 3 0v4"/>
            <path d="M17 11.5v-1a1.5 1.5 0 1 1 3 0v4.5a6 6 0 0 1-6 6h-2a6 6 0 0 1-6-6v-5a1.5 1.5 0 0 1 3 0v3"/>
        </svg>
    `;

    // Flecha curvada para Joystick móvil
    const svgFlechaCurvadaAbajoIzquierda = `
        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 5 C 18 14, 14 18, 5 18"></path>
            <polyline points="11 18 5 18 5 12"></polyline>
        </svg>
    `;

    window.efecto = function(tipo) {
        if (tipo === "tutorial") {
            
            if (document.getElementById('overlay-tutorial-api')) return;

            // Detección estricta
            const esTactil = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0) || (navigator.msMaxTouchPoints > 0);
            const esCelular = esTactil && window.innerWidth < 1024;

            const overlay = document.createElement('div');
            overlay.id = 'overlay-tutorial-api';

            // --- CONTENIDO CENTRAL ---
            const icono = document.createElement('div');
            icono.className = 'icono-tutorial-animado';
            icono.innerHTML = esCelular ? svgManoTactil : svgRatonPC;

            const textoPrincipal = document.createElement('div');
            textoPrincipal.className = 'texto-tutorial-api';
            textoPrincipal.innerText = esCelular ? "Desliza para explorar" : "Haz clic y arrastra para explorar";

            const textoSecundario = document.createElement('div');
            textoSecundario.className = 'texto-secundario-api';
            textoSecundario.innerText = esCelular ? "(Toca la pantalla para continuar)" : "(Haz clic para continuar)";

            overlay.appendChild(icono);
            overlay.appendChild(textoPrincipal);
            overlay.appendChild(textoSecundario);

            // --- GUÍAS ESQUINA INFERIOR IZQUIERDA ---
            if (esCelular) {
                // Interfaz para Celular (Joystick)
                const guiaJoystick = document.createElement('div');
                guiaJoystick.className = 'tutorial-joystick-guia';

                const iconoFlecha = document.createElement('div');
                iconoFlecha.className = 'icono-joystick-guia';
                iconoFlecha.innerHTML = svgFlechaCurvadaAbajoIzquierda;

                const textoGuia = document.createElement('div');
                textoGuia.className = 'texto-guia-esquina';
                textoGuia.innerText = "Joystick para moverse";

                guiaJoystick.appendChild(iconoFlecha);
                guiaJoystick.appendChild(textoGuia);
                overlay.appendChild(guiaJoystick);
            } else {
                // Interfaz para PC (Teclado)
                const guiaTeclado = document.createElement('div');
                guiaTeclado.className = 'tutorial-teclado-guia';
                
                // HTML estructurado para las teclas animadas
                guiaTeclado.innerHTML = `
                    <div class="contenedor-teclas">
                        <div class="columna-teclas">
                            <div class="tecla-tutorial anim-tecla-1">W</div>
                            <div class="tecla-tutorial anim-tecla-2">S</div>
                        </div>
                        <span class="texto-guia-esquina" style="font-weight: normal;">o</span>
                        <div class="columna-teclas">
                            <div class="tecla-tutorial anim-tecla-1">↑</div>
                            <div class="tecla-tutorial anim-tecla-2">↓</div>
                        </div>
                    </div>
                    <div class="texto-guia-esquina">Usa el teclado para moverte</div>
                `;
                overlay.appendChild(guiaTeclado);
            }

            document.body.appendChild(overlay);

            requestAnimationFrame(() => {
                overlay.style.opacity = '1';
            });

            // Función de cierre y ejecución Verge3D
            const cerrarTutorial = (e) => {
                e.preventDefault();

                // Llamada a la función de Verge3D
                if (typeof v3d !== 'undefined' && v3d.puzzles && v3d.puzzles.procedures) {
                    if (typeof v3d.puzzles.procedures["tutorial"] === 'function') {
                        v3d.puzzles.procedures["tutorial"]();
                    }
                } else {
                    try { v3d.puzzles.procedures["tutorial"](); } catch(err) { console.warn("Verge3D no está listo", err); }
                }

                // --- NUEVO CÓDIGO AGREGADO: Llamada a window.pasosiguiente() ---
                if (typeof window.pasosiguiente === 'function') {
                    window.pasosiguiente();
                } else {
                    try { window.pasosiguiente(); } catch(err) { console.warn("window.pasosiguiente no está listo o definido", err); }
                }
                // ---------------------------------------------------------------

                overlay.style.opacity = '0';
                
                setTimeout(() => {
                    if (document.body.contains(overlay)) {
                        document.body.removeChild(overlay);
                    }
                }, 500);

                overlay.removeEventListener('mousedown', cerrarTutorial);
                overlay.removeEventListener('touchstart', cerrarTutorial);
            };

            overlay.addEventListener('mousedown', cerrarTutorial);
            overlay.addEventListener('touchstart', cerrarTutorial);
        }
    };

})();