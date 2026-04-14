window.indicador = (function() {
    let contenedor, textoElt, barraContenedor, rellenoBarra, iconoPersona, iconoFinal;
    let inicializado = false;
    let porcentajeAnterior = -1;
    let timeoutAnimacion;

    const iconoCaminando = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M13.5 5.5c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zM9.8 8.9L7 23h2.1l1.8-8 2.1 2v6h2v-7.5l-2.1-2 .6-3C14.8 12 16.8 13 19 13v-2c-1.9 0-3.5-1-4.3-2.4l-1-1.6c-.4-.6-1-1-1.7-1-.3 0-.5.1-.8.1L6 8.3V13h2V9.6l1.8-.7"/></svg>';
    
    const iconoMeta = '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M14.4 6L14 4H5v17h2v-7h5.6l.4 2h7V6z"/></svg>';

    function inyectarEstilos() {
        if (document.getElementById('estilos-indicador-superior')) return;
        
        const estilos = document.createElement('style');
        estilos.id = 'estilos-indicador-superior';
        estilos.innerHTML = `
            #indicador-superior-wrapper {
                position: fixed;
                top: 0;
                left: 50%;
                transform: translateX(-50%);
                background: rgba(255, 255, 255, 0.85);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(3, 23, 149, 0.15);
                border-top: none;
                border-bottom-left-radius: 20px;
                border-bottom-right-radius: 20px;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                padding: 28px 24px 12px 24px; 
                display: flex;
                flex-direction: row; 
                align-items: center;
                gap: 20px; 
                z-index: 10005;
                font-family: sans-serif;
                transition: transform 0.4s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease;
                opacity: 1;
            }

            #indicador-superior-wrapper.oculto {
                transform: translate(-50%, -150%);
                opacity: 0;
            }

            .indicador-texto-numeros {
                font-weight: 700;
                font-size: 16px;
                color: #031795;
                letter-spacing: 1px;
                white-space: nowrap;
            }

            .indicador-barra-track {
                display: none;
                width: 250px;
                height: 6px;
                background: rgba(3, 23, 149, 0.1);
                border-radius: 4px;
                position: relative;
            }

            .indicador-barra-fill {
                height: 100%;
                background: #031795;
                border-radius: 4px;
                width: 0%;
                transition: width 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .indicador-icono-avatar {
                position: absolute;
                bottom: 10px; 
                left: 0%;
                transform: translateX(-50%);
                width: 28px; 
                height: 28px;
                color: #031795;
                transition: left 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
            }

            .indicador-icono-avatar svg {
                width: 100%;
                height: 100%;
            }

            @keyframes caminarAnimacion {
                0%, 100% { transform: translateY(0) rotate(0deg); }
                25% { transform: translateY(-4px) rotate(8deg); }
                50% { transform: translateY(0) rotate(0deg); }
                75% { transform: translateY(-4px) rotate(-8deg); }
            }

            .indicador-icono-meta {
                position: absolute;
                bottom: 4px; 
                right: -10px; 
                width: 20px;
                height: 20px;
                color: #ff3b30; 
            }

            @media (min-width: 768px) {
                .indicador-barra-track {
                    display: block;
                }
            }

            @media (max-width: 899px) and (orientation: landscape) {
                #indicador-superior-wrapper {
                    transform: translateX(-50%) scale(0.75);
                    transform-origin: top center;
                    padding: 24px 16px 10px 16px;
                }
                #indicador-superior-wrapper.oculto {
                    transform: translate(-50%, -150%) scale(0.75);
                }
                .indicador-barra-track {
                    display: block; 
                    width: 150px; 
                }
            }

            @media (max-width: 767px) {
                #indicador-superior-wrapper {
                    padding: 10px 24px 12px 24px; 
                }
            }
        `;
        document.head.appendChild(estilos);
    }

    function crearDOM() {
        contenedor = document.createElement('div');
        contenedor.id = 'indicador-superior-wrapper';

        textoElt = document.createElement('div');
        textoElt.className = 'indicador-texto-numeros';

        barraContenedor = document.createElement('div');
        barraContenedor.className = 'indicador-barra-track';

        rellenoBarra = document.createElement('div');
        rellenoBarra.className = 'indicador-barra-fill';

        iconoPersona = document.createElement('div');
        iconoPersona.className = 'indicador-icono-avatar';
        iconoPersona.innerHTML = iconoCaminando;

        iconoFinal = document.createElement('div');
        iconoFinal.className = 'indicador-icono-meta';
        iconoFinal.innerHTML = iconoMeta;

        barraContenedor.appendChild(rellenoBarra);
        barraContenedor.appendChild(iconoPersona);
        barraContenedor.appendChild(iconoFinal); 
        
        contenedor.appendChild(textoElt);
        contenedor.appendChild(barraContenedor);

        document.body.appendChild(contenedor);
        inicializado = true;
    }

    const actualizarIndicador = function(pasoActual, pasoTotal) {
        if (!inicializado) {
            inyectarEstilos();
            crearDOM();
        }

        if (contenedor.classList.contains('oculto')) {
            contenedor.classList.remove('oculto');
        }

        const actual = parseInt(pasoActual) || 0;
        const total = parseInt(pasoTotal) || 1;

        textoElt.textContent = `${actual} / ${total}`;

        let porcentaje = (actual / total) * 100;
        porcentaje = Math.max(0, Math.min(100, porcentaje)); 

        if (porcentaje !== porcentajeAnterior) {
            const svgIcono = iconoPersona.querySelector('svg');
            
            svgIcono.style.animation = 'caminarAnimacion 0.25s infinite ease-in-out';
            
            clearTimeout(timeoutAnimacion);
            
            timeoutAnimacion = setTimeout(() => {
                svgIcono.style.animation = 'none';
            }, 500); 

            porcentajeAnterior = porcentaje;
        }

        rellenoBarra.style.width = `${porcentaje}%`;
        iconoPersona.style.left = `${porcentaje}%`;
    };

    actualizarIndicador.ocultar = function() {
        if (inicializado && contenedor) {
            contenedor.classList.add('oculto');
        }
    };

    return actualizarIndicador;
})();