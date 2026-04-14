import("./info/info_avatar.js");
window.avatar = (function() {

    let contenedor, envolturaVideo;
    let videoEl, imagenEl, audioEl, burbujaTexto;

    let temporizadorRespaldo; 
    let isGlobalMuted = false;
    let mantenerVisible = false;

    function accionMutear() {
        isGlobalMuted = !isGlobalMuted; 
        localStorage.setItem('avatarGlobalMute', isGlobalMuted); 
        aplicarSilencioGlobal();
    }

    function accionRepetir() {
        if (contenedor && contenedor.style.opacity === '0') {
            return;
        }
        if (audioEl) { audioEl.currentTime = 0; audioEl.play(); }
        if (videoEl && videoEl.style.display !== 'none') videoEl.play();
    }

    function accionPausa() {
        if (contenedor && contenedor.style.opacity === '0' && audioEl && audioEl.paused) {
            return;
        }

        if (audioEl && audioEl.paused) {
            audioEl.play(); 
            if (videoEl && videoEl.style.display !== 'none') videoEl.play(); 
        } else if (audioEl) {
            audioEl.pause(); 
            if (videoEl && videoEl.style.display !== 'none') videoEl.pause(); 
        }
    }

    function accionOmitir() {
        if (audioEl) { audioEl.pause(); audioEl.currentTime = 0; }
        if (videoEl && videoEl.style.display !== 'none') videoEl.pause();
        ocultarAvatar();
    }

    function aplicarSilencioGlobal() {
        if (audioEl) audioEl.muted = isGlobalMuted;
        document.querySelectorAll('audio, video').forEach(media => {
            if (media === videoEl) {
                media.muted = true; 
            } else if (media !== audioEl) {
                media.muted = isGlobalMuted;
            }
        });
    }

    function usarImagen() {
        if (videoEl && imagenEl) {
            videoEl.style.display = 'none';
            imagenEl.style.display = 'block';
            if (!videoEl.paused) videoEl.pause();
        }
    }

    function usarVideo() {
        if (videoEl && imagenEl) {
            videoEl.style.display = 'block';
            imagenEl.style.display = 'none';
        }
    }

    function interceptarYRegistrarProcedimientos() {
        if (typeof v3d !== 'undefined' && v3d.puzzles) {
            if (!v3d.puzzles.procedures) v3d.puzzles.procedures = {};

            const misControles = {
                "pause": accionPausa,
                "adelantar": accionOmitir,
                "recargar": accionRepetir,
                "mutear": accionMutear
            };

            for (let c in misControles) {
                if (!v3d.puzzles.procedures[c] || !v3d.puzzles.procedures[c].esControlAvatar) {
                    v3d.puzzles.procedures[c] = misControles[c];
                    v3d.puzzles.procedures[c].esControlAvatar = true;
                }
            }

            for (let nombreProc in v3d.puzzles.procedures) {
                if (typeof v3d.puzzles.procedures[nombreProc] === 'function' && !v3d.puzzles.procedures[nombreProc].esInterceptado) {
                    const funcOriginal = v3d.puzzles.procedures[nombreProc];
                    
                    v3d.puzzles.procedures[nombreProc] = function(...args) {
                        if (nombreProc === "bajorendimiento") usarImagen();
                        if (nombreProc === "mediorendimiento" || nombreProc === "altorendimiento") usarVideo();

                        return funcOriginal.apply(this, args);
                    };
                    
                    v3d.puzzles.procedures[nombreProc].esInterceptado = true;
                    if (funcOriginal.esControlAvatar) {
                        v3d.puzzles.procedures[nombreProc].esControlAvatar = true;
                    }
                }
            }
        }
        setTimeout(interceptarYRegistrarProcedimientos, 1000);
    }
    
    interceptarYRegistrarProcedimientos();

    function aplicarEstilosResponsivos() {
        if (!contenedor) return;
        
        const esMovil = window.innerWidth <= 950;
        const esHechado = window.innerWidth > window.innerHeight;
        const estaVisible = contenedor.style.opacity === '1';

        if (esMovil && esHechado) {
            contenedor.style.top = '16vh';
            contenedor.style.left = '5vh';
            contenedor.style.maxWidth = '40vw';
            envolturaVideo.style.width = '70px'; envolturaVideo.style.height = '70px';
            burbujaTexto.style.fontSize = '9.6px'; burbujaTexto.style.padding = '18px 24px';
            burbujaTexto.style.margin = 'auto'; burbujaTexto.style.maxWidth = 'calc(40vw - 80px)';
            contenedor.style.transform = estaVisible ? 'translateX(0px)' : 'translateX(-120%)';
        } else if (esMovil && !esHechado) {
            contenedor.style.top = '4vh';
            contenedor.style.left = '2vh';
            contenedor.style.maxWidth = '90vw';
            envolturaVideo.style.width = '100px'; envolturaVideo.style.height = '100px';
            burbujaTexto.style.fontSize = '12.8px'; burbujaTexto.style.padding = '18px 24px';
            burbujaTexto.style.marginLeft = '1rem'; burbujaTexto.style.maxWidth = 'calc(90vw - 120px)';
            contenedor.style.transform = estaVisible ? 'translateX(0px)' : 'translateX(-120%)';
        } else {
            contenedor.style.top = '88%';
            contenedor.style.left = '30px';
            contenedor.style.maxWidth = 'none';
            envolturaVideo.style.width = '160px'; envolturaVideo.style.height = '160px';
            burbujaTexto.style.fontSize = '1rem'; burbujaTexto.style.padding = '18px 24px';
            burbujaTexto.style.marginLeft = '25px'; burbujaTexto.style.maxWidth = '75%';
            contenedor.style.transform = estaVisible ? 'translateY(-50%) translateX(0px)' : 'translateY(-50%) translateX(-120px)';
        }
    }

    function ocultarAvatar() {
        contenedor.style.opacity = '0';
        aplicarEstilosResponsivos(); 
    }

    function mostrarAvatar() {
        contenedor.style.opacity = '1';
        aplicarEstilosResponsivos(); 
    }

    function inicializarUI() {
        if (contenedor) return;

        if (!document.getElementById('estilos-animacion-teclas')) {
            const estiloAnimacion = document.createElement('style');
            estiloAnimacion.id = 'estilos-animacion-teclas';
            estiloAnimacion.innerHTML = `
                @keyframes avatarPresionarTecla { 0%, 80%, 100% { transform: scale(1) translateY(0); } 90% { transform: scale(0.85) translateY(2px); } }
                .tecla-animada { animation: avatarPresionarTecla 2.5s infinite ease-in-out; transform-origin: center center; display: inline-flex !important; }
            `;
            document.head.appendChild(estiloAnimacion);
        }

        contenedor = document.createElement('div');
        contenedor.style.position = 'fixed'; contenedor.style.zIndex = '9999';
        contenedor.style.display = 'flex'; contenedor.style.flexDirection = 'row'; contenedor.style.alignItems = 'center';
        contenedor.style.fontFamily = '"AASMART Sans", sans-serif'; contenedor.style.pointerEvents = 'none'; 
        contenedor.style.opacity = '0'; contenedor.style.transition = 'all 0.7s cubic-bezier(0.34, 1.56, 0.64, 1)'; 

        envolturaVideo = document.createElement('div');
        envolturaVideo.style.position = 'relative'; envolturaVideo.style.flexShrink = '0'; envolturaVideo.style.pointerEvents = 'auto'; 
        envolturaVideo.style.borderRadius = '50%'; envolturaVideo.style.boxShadow = '0 10px 30px rgba(0,0,0,0.2)';
        envolturaVideo.style.overflow = 'hidden';
        envolturaVideo.style.border = '5px solid #ffffff'; envolturaVideo.style.boxSizing = 'border-box'; envolturaVideo.style.backgroundColor = '#ffffff';

        videoEl = document.createElement('video');
        videoEl.src = new URL('../../video/avatarA.mp4', import.meta.url).href;
        videoEl.style.width = '100%'; videoEl.style.height = '100%';
        videoEl.style.objectFit = 'cover'; videoEl.style.borderRadius = '50%'; 
        videoEl.muted = true;
        videoEl.loop = true;
        videoEl.autoplay = true;
        videoEl.playsInline = true;

        imagenEl = document.createElement('img');
        imagenEl.src = new URL('../../img/avatar.png', import.meta.url).href;
        imagenEl.style.width = '100%'; imagenEl.style.height = '100%';
        imagenEl.style.objectFit = 'cover'; imagenEl.style.borderRadius = '50%'; imagenEl.style.display = 'none';

        envolturaVideo.appendChild(videoEl); envolturaVideo.appendChild(imagenEl);
        
        audioEl = document.createElement('audio');

        audioEl.onended = () => {
            if (mantenerVisible) return;
            ocultarAvatar();
            
            // Llama a pasosiguiente() medio segundo (500ms) después de terminar el audio
            setTimeout(() => {
                if (typeof window.pasosiguiente === 'function') {
                    window.pasosiguiente();
                }
            }, 500);
        };

        burbujaTexto = document.createElement('div');
        burbujaTexto.style.background = '#ffff';
        burbujaTexto.style.color = '#031795';
        burbujaTexto.style.border = '1px solid rgba(255, 255, 255, 0.3)';
        burbujaTexto.style.padding = '18px 24px';
        burbujaTexto.style.marginLeft = '20px';
        burbujaTexto.style.fontFamily = '"AA Smart Sans", sans-serif'; burbujaTexto.style.borderRadius = '24px 24px 24px 4px';
        burbujaTexto.style.boxShadow = '0 8px 32px rgba(35, 45, 193, 0.168), 0 2px 8px rgba(31, 38, 135, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.5)'; burbujaTexto.style.textAlign = 'left';
        burbujaTexto.style.fontWeight = '400'; burbujaTexto.style.lineHeight = '1.4';
        burbujaTexto.style.fontSize = '1rem';
        contenedor.appendChild(envolturaVideo); contenedor.appendChild(burbujaTexto); document.body.appendChild(contenedor);
        window.addEventListener('resize', aplicarEstilosResponsivos); aplicarEstilosResponsivos();
    }

    function formatearTextoConIconos(texto) {
        const crearIcono = (contenido, tipo) => {
            let interior = contenido.toUpperCase().trim();
            if (interior === 'ARRIBA') interior = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg>';
            else if (interior === 'ABAJO') interior = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 5v14M19 12l-7 7-7-7"/></svg>';
            else if (interior === 'IZQUIERDA') interior = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M19 12H5M12 19l-7-7 7-7"/></svg>';
            else if (interior === 'DERECHA') interior = '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>';

            if (tipo === 'cuadrado') {
                return `<span class="tecla-animada" style="display: inline-flex; justify-content: center; align-items: center; min-width: 26px; height: 26px; padding: 0 6px; background: #e2e8f0; color: #0f172a; border-radius: 6px; border: 1px solid #cbd5e1; border-bottom: 3px solid #94a3b8; font-weight: 800; font-family: ui-monospace, monospace; font-size: 14px; margin: 0 3px; box-sizing: border-box; vertical-align: bottom; text-transform: uppercase;">${interior}</span>`;
            } else {
                return `<span class="tecla-animada" style="display: inline-flex; justify-content: center; align-items: center; min-width: 26px; height: 26px; padding: 0 6px; background: #ffffff; color: #0f172a; border-radius: 50%; border: 1px solid #cbd5e1; font-weight: 800; font-family: ui-monospace, monospace; font-size: 14px; margin: 0 3px; box-sizing: border-box; vertical-align: bottom; text-transform: uppercase;">${interior}</span>`;
            }
        };

        let resultado = texto.replace(/\[([^\]]+)\]/g, (match, contenido) => crearIcono(contenido, 'cuadrado'));
        return resultado.replace(/\(([^)]{1,15})\)/g, (match, contenido) => crearIcono(contenido, 'circulo'));
    }

    return function(mensaje, urlAudio, esPersistente = false) {
        inicializarUI();
        if (temporizadorRespaldo) clearTimeout(temporizadorRespaldo);
        mantenerVisible = Boolean(esPersistente);

        burbujaTexto.innerHTML = formatearTextoConIconos(mensaje);
        aplicarSilencioGlobal(); 
        
        setTimeout(() => { mostrarAvatar(); }, 50);

        if (urlAudio) {
            audioEl.src = urlAudio;
            if (videoEl.style.display !== 'none') videoEl.play().catch(e => console.log("Video bloqueado", e));
            
            audioEl.play().catch(e => console.log("Audio bloqueado por falta de interacción del usuario", e));
        } else {
            if (videoEl.style.display !== 'none') videoEl.play().catch(e => console.log("Video bloqueado", e));
            if (!mantenerVisible) {
                temporizadorRespaldo = setTimeout(() => { 
                    ocultarAvatar(); 
                }, 4000);
            }
        }
    };
})();