import("./info/info_html.js");
(function() {
    let contenedorGlobal = null;
    let botonGlobal = null;
    let tarjetasAbiertas = [];
    let lightboxOverlay = null;
    let lightboxImg = null;

    function cerrarLightbox() {
        if (!lightboxOverlay || !lightboxOverlay.classList.contains('is-open')) return;
        lightboxOverlay.classList.remove('is-open');
        if (lightboxImg) lightboxImg.removeAttribute('src');
        document.body.style.overflow = '';
    }

    function abrirLightbox(src) {
        if (!lightboxOverlay) {
            const estiloId = 'estilos-html-tool-lightbox';
            if (!document.getElementById(estiloId)) {
                const s = document.createElement('style');
                s.id = estiloId;
                s.textContent = `
                    #html-tool-lightbox { display: none; position: fixed; inset: 0; z-index: 10100; align-items: center; justify-content: center; padding: max(16px, 3vw); box-sizing: border-box; background: rgba(0,0,0,0.88); cursor: zoom-out; }
                    #html-tool-lightbox.is-open { display: flex; }
                    #html-tool-lightbox-panel { position: relative; max-width: 95vw; max-height: 90vh; margin: auto; cursor: default; }
                    #html-tool-lightbox-panel img { max-width: 95vw; max-height: 90vh; width: auto; height: auto; object-fit: contain; display: block; border-radius: 8px; box-shadow: 0 12px 40px rgba(0,0,0,0.45); }
                    #html-tool-lightbox-close { position: fixed; top: max(16px, 2vh); right: max(16px, 2vw); z-index: 10101; width: 44px; height: 44px; border: none; border-radius: 50%; cursor: pointer; background: rgba(255,255,255,0.95); color: #031795; font-size: 24px; line-height: 1; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 16px rgba(0,0,0,0.25); transition: transform 0.2s ease, background 0.2s ease; }
                    #html-tool-lightbox-close:hover { transform: scale(1.06); background: #fff; }
                `;
                document.head.appendChild(s);
            }

            lightboxOverlay = document.createElement('div');
            lightboxOverlay.id = 'html-tool-lightbox';
            lightboxOverlay.setAttribute('role', 'dialog');
            lightboxOverlay.setAttribute('aria-modal', 'true');
            lightboxOverlay.setAttribute('aria-label', 'Vista ampliada de imagen');

            const panel = document.createElement('div');
            panel.id = 'html-tool-lightbox-panel';
            panel.addEventListener('click', (e) => e.stopPropagation());

            lightboxImg = document.createElement('img');
            lightboxImg.alt = '';

            const btnCerrar = document.createElement('button');
            btnCerrar.id = 'html-tool-lightbox-close';
            btnCerrar.type = 'button';
            btnCerrar.setAttribute('aria-label', 'Cerrar vista ampliada');
            btnCerrar.innerHTML = '&times;';

            lightboxOverlay.addEventListener('click', cerrarLightbox);
            btnCerrar.addEventListener('click', (e) => {
                e.stopPropagation();
                cerrarLightbox();
            });

            panel.appendChild(lightboxImg);
            lightboxOverlay.appendChild(btnCerrar);
            lightboxOverlay.appendChild(panel);
            document.body.appendChild(lightboxOverlay);

            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && lightboxOverlay && lightboxOverlay.classList.contains('is-open')) {
                    e.preventDefault();
                    cerrarLightbox();
                }
            });
        }

        lightboxImg.src = src;
        lightboxImg.alt = '';
        lightboxOverlay.classList.add('is-open');
        document.body.style.overflow = 'hidden';
    }

    window.v3d = window.v3d || {};
    window.v3d.puzzles = window.v3d.puzzles || {};
    window.v3d.puzzles.procedures = window.v3d.puzzles.procedures || {};

    function accionContinuar() {
        tarjetasAbiertas.forEach(item => {
            const nombre = item.nombreArchivo;
            if (typeof v3d !== 'undefined' && v3d.puzzles && v3d.puzzles.procedures) {
                if (typeof v3d.puzzles.procedures[nombre] === 'function') {
                    v3d.puzzles.procedures[nombre]();
                }
            }
        });
        
        window.closehtml();
    }

    function manejarResize() {
        if (!contenedorGlobal) return;
        const esMovil = window.innerWidth <= 768;

        contenedorGlobal.style.right = esMovil ? '15px' : '30px';
        contenedorGlobal.style.left = 'auto'; 
        contenedorGlobal.style.top = '45%'; 
        contenedorGlobal.style.transform = 'translateY(-50%)'; 
        contenedorGlobal.style.width = 'auto'; 
        
        const zonaSegura = esMovil ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)';
        contenedorGlobal.style.maxHeight = zonaSegura; 
        
        contenedorGlobal.style.alignItems = 'flex-end';

        if (botonGlobal) {
            botonGlobal.style.bottom = esMovil ? '35px' : '55px';
            botonGlobal.style.padding = esMovil ? '12px 24px' : '14px 36px';
            botonGlobal.style.fontSize = esMovil ? '15px' : '17px';

            const textoEnter = botonGlobal.querySelector('kbd');
            if (textoEnter) {
                textoEnter.style.display = esMovil ? 'none' : 'flex';
            }
        }

        actualizarTamanos();
    }

    function inicializarUI() {
        if (contenedorGlobal) return;

        if (!document.getElementById('estilos-animacion-btn')) {
            const estilosAnimacion = document.createElement('style');
            estilosAnimacion.id = 'estilos-animacion-btn';
            estilosAnimacion.innerHTML = `
                @keyframes botonAparecerBounce {
                    0% { opacity: 0; transform: translateX(-50%) translateY(30px) scale(0.8); }
                    60% { opacity: 1; transform: translateX(-50%) translateY(-5px) scale(1.05); }
                    100% { opacity: 1; transform: translateX(-50%) translateY(0) scale(1); }
                }
                .btn-animado-entrada {
                    animation: botonAparecerBounce 0.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
                }
            `;
            document.head.appendChild(estilosAnimacion);
        }
        
        contenedorGlobal = document.createElement('div');
        contenedorGlobal.style.position = 'fixed';
        contenedorGlobal.style.zIndex = '10000';
        contenedorGlobal.style.display = 'flex';
        contenedorGlobal.style.flexDirection = 'column';
        contenedorGlobal.style.gap = '15px'; 
        contenedorGlobal.style.overflowY = 'auto';
        contenedorGlobal.style.pointerEvents = 'none';
        contenedorGlobal.style.msOverflowStyle = 'none';
        contenedorGlobal.style.scrollbarWidth = 'none';
        document.body.appendChild(contenedorGlobal);

        botonGlobal = document.createElement('button');
        
        botonGlobal.innerHTML = `
            Continuar 
            <kbd style="position: absolute; bottom: -35px; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 6px; font-family: 'Segoe UI', sans-serif; font-size: 11px; color: #031795; font-weight: 700; text-transform: uppercase; white-space: nowrap; transition: opacity 0.3s ease;">
                <span style="display: inline-flex; justify-content: center; align-items: center; width: 24px; height: 24px; background: #ffffff; border: 1px solid #cbd5e1; border-bottom: 3px solid #cbd5e1; border-radius: 4px; margin-right: 2px;">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#031795" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M9 10l-5 5 5 5M20 4v7a4 4 0 01-4 4H4"/></svg>
                </span>
                Enter
            </kbd>`;
        
        botonGlobal.style.position = 'fixed';
        botonGlobal.style.left = '50%';
        botonGlobal.style.transform = 'translateX(-50%) translateY(0)';
        
        botonGlobal.style.backgroundColor = '#E5EFF9';
        botonGlobal.style.color = '#031795';
        botonGlobal.style.border = '2px solid #031795';
        
        botonGlobal.style.borderRadius = '50px';
        botonGlobal.style.cursor = 'pointer';
        botonGlobal.style.fontWeight = '800';
        botonGlobal.style.letterSpacing = '0.5px';
        botonGlobal.style.zIndex = '10005'; 
        botonGlobal.style.overflow = 'visible'; 
        botonGlobal.style.boxShadow = '0 10px 20px -5px rgba(3, 23, 149, 0.2)';
        botonGlobal.style.transition = 'background-color 0.3s ease, transform 0.4s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s ease';
        botonGlobal.style.display = 'none';
        botonGlobal.style.alignItems = 'center';
        botonGlobal.style.justifyContent = 'center';
        botonGlobal.style.whiteSpace = 'nowrap'; 

        botonGlobal.onmouseenter = () => {
            botonGlobal.style.backgroundColor = '#d2e4f5';
            botonGlobal.style.transform = 'translateX(-50%) translateY(-6px) scale(1.05)';
            botonGlobal.style.boxShadow = '0 15px 25px -5px rgba(3, 23, 149, 0.35)';
        };
        botonGlobal.onmouseleave = () => {
            botonGlobal.style.backgroundColor = '#E5EFF9';
            botonGlobal.style.transform = 'translateX(-50%) translateY(0) scale(1)';
            botonGlobal.style.boxShadow = '0 10px 20px -5px rgba(3, 23, 149, 0.2)';
        };

        botonGlobal.onclick = accionContinuar;

        document.body.appendChild(botonGlobal);

        document.addEventListener('keydown', (e) => {
            const lbAbierto = lightboxOverlay && lightboxOverlay.classList.contains('is-open');
            if (e.key === 'Enter' && !lbAbierto && botonGlobal && botonGlobal.style.display !== 'none') {
                e.preventDefault();
                accionContinuar();
            }
        });

        window.addEventListener('resize', manejarResize);
        manejarResize();
    }

    function actualizarTamanos() {
        if (!contenedorGlobal) return;
        
        const tarjetas = contenedorGlobal.children;
        const cantidad = tarjetas.length;
        const esMovil = window.innerWidth <= 768;
        const zonaSegura = esMovil ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)';

        for (let i = 0; i < cantidad; i++) {
            tarjetas[i].style.width = 'fit-content'; 
            tarjetas[i].style.maxWidth = esMovil ? '90vw' : '40vw';

            const iframe = tarjetas[i].querySelector('iframe');
            if (iframe) {
                // Modificación para asegurar un cuadrado perfecto
                const tamaño = esMovil ? `min(90vw, ${zonaSegura})` : `min(40vw, ${zonaSegura})`;
                iframe.style.width = tamaño;
                iframe.style.height = tamaño;
                iframe.style.aspectRatio = '1 / 1';
                iframe.style.maxHeight = 'none';
                iframe.style.minHeight = 'none';
                iframe.style.maxWidth = '100%';
            }
        }
        
        if (cantidad > 0) {
            if (botonGlobal.style.display !== 'none') {
                botonGlobal.style.display = 'none';
                botonGlobal.classList.remove('btn-animado-entrada');
                void botonGlobal.offsetWidth;
                botonGlobal.classList.add('btn-animado-entrada');
            }
        } else {
            botonGlobal.style.display = 'none';
            botonGlobal.classList.remove('btn-animado-entrada');
        }
    }

    window.html = function(url, transparente = false) {
        window.closehtml();
        if (contenedorGlobal) {
            Array.from(contenedorGlobal.children).forEach(child => {
                child.style.display = 'none';
            });
        }
        
        try {
            if (typeof mostrarboton === 'function') {
                mostrarboton('continue');
            }
        } catch (error) {
            
        }

        inicializarUI();

        const nombreArchivo = url.split('/').pop().split('.')[0];
        const esVideo = url.match(/\.(mp4|webm|ogg)$/i);
        const esHtml = url.match(/\.(html|htm)$/i);
        const esImagen = !esVideo && !esHtml;
        const esMovil = window.innerWidth <= 768;
        const zonaSegura = esMovil ? 'calc(100vh - 140px)' : 'calc(100vh - 180px)';

        const tarjeta = document.createElement('div');
        tarjeta.style.position = 'relative';
        tarjeta.style.backgroundColor = (transparente || esImagen) ? 'transparent' : '#000';
        tarjeta.style.boxShadow = (transparente || esImagen) ? 'none' : '0 15px 35px rgba(0,0,0,0.4)';
        tarjeta.style.borderRadius = '16px';
        tarjeta.style.overflow = 'hidden';
        tarjeta.style.pointerEvents = 'auto';
        tarjeta.style.opacity = '0';
        tarjeta.style.transform = 'translateX(100px)';
        tarjeta.style.transition = 'all 0.5s cubic-bezier(0.25, 1, 0.5, 1)';
        tarjeta.style.display = 'flex';
        tarjeta.style.flexDirection = 'column';

        let mediaEl;
        
        if (esHtml) {
            mediaEl = document.createElement('iframe');
            mediaEl.src = url;
            mediaEl.style.width = '100%';
            mediaEl.style.aspectRatio = '1 / 1';
            mediaEl.style.border = 'none';
            mediaEl.style.display = 'block';
            if (transparente) {
                mediaEl.style.backgroundColor = 'transparent';
                mediaEl.allowTransparency = "true";
            }
        } else if (esVideo) {
            mediaEl = document.createElement('video');
            mediaEl.src = url;
            mediaEl.controls = true;
            mediaEl.autoplay = true;
            mediaEl.muted = true;
            mediaEl.style.width = '100%';
            mediaEl.style.height = 'auto';
            mediaEl.style.maxHeight = zonaSegura; 
            mediaEl.style.display = 'block';
            if (transparente) mediaEl.style.backgroundColor = 'transparent';
        } else {
            mediaEl = document.createElement('img');
            mediaEl.src = url;
            mediaEl.style.width = 'auto'; 
            mediaEl.style.height = 'auto';
            mediaEl.style.maxWidth = '100%'; 
            mediaEl.style.maxHeight = zonaSegura;
            mediaEl.style.objectFit = 'contain';
            mediaEl.style.display = 'block';
            mediaEl.style.cursor = 'pointer';
            mediaEl.setAttribute('role', 'button');
            mediaEl.setAttribute('tabindex', '0');
            mediaEl.setAttribute('aria-label', 'Ampliar imagen');

            mediaEl.addEventListener('click', (e) => {
                e.stopPropagation();
                abrirLightbox(url);
            });
            mediaEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    abrirLightbox(url);
                }
            });

            if (!transparente) {
                mediaEl.style.background = '#F5F7FA';
                mediaEl.style.border = '1px solid #6B8BDE';
                mediaEl.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.05)';
                mediaEl.style.borderRadius = '16px';
            }
        }

        const cerrarTarjeta = () => {
            tarjeta.style.opacity = '0';
            tarjeta.style.transform = 'translateX(100px)';
            
            setTimeout(() => {
                if (tarjeta.parentNode) {
                    contenedorGlobal.removeChild(tarjeta);
                    actualizarTamanos(); 
                }
            }, 300); 
        };

        tarjetasAbiertas.push({ cerrar: cerrarTarjeta, nombreArchivo: nombreArchivo });

        tarjeta.appendChild(mediaEl);
        contenedorGlobal.appendChild(tarjeta);

        actualizarTamanos();

        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                tarjeta.style.opacity = '1';
                tarjeta.style.transform = 'translate(0, 0)';
            });
        });
    };

    window.closehtml = function() {
        cerrarLightbox();
        if (tarjetasAbiertas.length === 0) {
            if (botonGlobal) {
                botonGlobal.style.display = 'none';
                botonGlobal.classList.remove('btn-animado-entrada');
            }
            return;
        }

        const funcionesCierre = tarjetasAbiertas.map(item => item.cerrar);
        tarjetasAbiertas = []; 
        
        if (botonGlobal) {
            botonGlobal.style.display = 'none';
            botonGlobal.classList.remove('btn-animado-entrada');
        }

        funcionesCierre.forEach(cerrarFunc => {
            cerrarFunc();
        });
    };

    window.v3d.puzzles.procedures["continue"] = accionContinuar;

})();