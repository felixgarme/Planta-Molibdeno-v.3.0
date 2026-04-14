window.indicadorCentro = (function() {
    let contenedor, textoPrincipal, textoSecundario;
    let inicializado = false;
    let timeoutOcultar;

    function inyectarEstilos() {
        if (document.getElementById('estilos-indicador-centro')) return;
        
        const estilos = document.createElement('style');
        estilos.id = 'estilos-indicador-centro';
        estilos.innerHTML = `
            #indicador-centro-wrapper {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%) scale(0.5);
                background: linear-gradient(145deg, rgba(15, 23, 42, 0.85), rgba(30, 41, 59, 0.9));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.2);
                border-radius: 24px;
                padding: 36px 56px;
                color: #ffffff;
                text-align: center;
                font-family: system-ui, -apple-system, sans-serif;
                z-index: 10020;
                pointer-events: none;
                box-shadow: 0 0 40px rgba(165, 180, 252, 0.35), 
                            inset 0 0 20px rgba(255, 255, 255, 0.15);
                
                opacity: 0;
                visibility: hidden;
                
                transition: transform 0.6s cubic-bezier(0.34, 1.56, 0.64, 1), 
                            opacity 0.4s ease, 
                            visibility 0.4s ease;
            }

            #indicador-centro-wrapper.mostrar {
                opacity: 1;
                visibility: visible;
                transform: translate(-50%, -50%) scale(1);
            }

            .indicador-centro-titulo {
                font-size: 38px;
                font-weight: 900;
                margin: 0;
                letter-spacing: -1px;
                background: linear-gradient(135deg, #ffffff 0%, #ffd700 50%, #ff8c00 100%);
                -webkit-background-clip: text;
                -webkit-text-fill-color: transparent;
                text-shadow: 0px 4px 15px rgba(255, 215, 0, 0.3);
            }

            .indicador-centro-subtitulo {
                font-size: 18px;
                font-weight: 600;
                color: rgba(255, 255, 255, 0.9);
                margin: 12px 0 0 0;
                letter-spacing: 0.5px;
                text-transform: uppercase;
            }

            .particula-confeti {
                position: fixed;
                top: 50%;
                left: 50%;
                pointer-events: none;
                z-index: 10015; /* Detrás del cuadro de texto, pero encima de la app */
                opacity: 0;
                animation: animacionExplosion var(--duracion) cubic-bezier(0.25, 0.46, 0.45, 0.94) forwards;
            }

            @keyframes animacionExplosion {
                0% { transform: translate(-50%, -50%) rotate(0deg) scale(0.5); opacity: 1; }
                10% { opacity: 1; }
                100% { transform: translate(calc(-50% + var(--tx)), calc(-50% + var(--ty))) rotate(var(--rot)) scale(1); opacity: 0; }
            }
        `;
        document.head.appendChild(estilos);
    }

    function crearDOM() {
        contenedor = document.createElement('div');
        contenedor.id = 'indicador-centro-wrapper';

        textoPrincipal = document.createElement('h2');
        textoPrincipal.className = 'indicador-centro-titulo';

        textoSecundario = document.createElement('p');
        textoSecundario.className = 'indicador-centro-subtitulo';

        contenedor.appendChild(textoPrincipal);
        contenedor.appendChild(textoSecundario);

        document.body.appendChild(contenedor);
        inicializado = true;
    }

    function dispararConfeti() {
        const colores = ['#FFC700', '#FF0000', '#2E3192', '#41BBC7', '#10B981', '#9D4EDD', '#FF69B4'];
        const cantidadParticulas = 80;

        const contenedorFuegos = document.createElement('div');
        document.body.appendChild(contenedorFuegos);

        for (let i = 0; i < cantidadParticulas; i++) {
            const pieza = document.createElement('div');
            pieza.className = 'particula-confeti';
            pieza.style.backgroundColor = colores[Math.floor(Math.random() * colores.length)];
            
            const angulo = Math.random() * Math.PI * 2;
            const distancia = 80 + Math.random() * 250;
            
            const tx = Math.cos(angulo) * distancia + 'px';
            const ty = Math.sin(angulo) * distancia + (Math.random() * 100 + 50) + 'px';
            const rot = Math.random() * 720 + 'deg';
            const duracion = 1 + Math.random() * 1.5 + 's';

            pieza.style.setProperty('--tx', tx);
            pieza.style.setProperty('--ty', ty);
            pieza.style.setProperty('--rot', rot);
            pieza.style.setProperty('--duracion', duracion);

            if (Math.random() > 0.5) {
                pieza.style.borderRadius = '50%';
                pieza.style.width = Math.random() * 8 + 6 + 'px';
                pieza.style.height = pieza.style.width;
            } else {
                pieza.style.width = Math.random() * 12 + 6 + 'px';
                pieza.style.height = Math.random() * 18 + 10 + 'px';
            }

            contenedorFuegos.appendChild(pieza);
        }

        setTimeout(() => {
            if (contenedorFuegos.parentNode) {
                contenedorFuegos.parentNode.removeChild(contenedorFuegos);
            }
        }, 2500);
    }

    return function(actual, total, mensaje = "puntos completados", duracion = 3000) {
        if (!inicializado) {
            inyectarEstilos();
            crearDOM();
        }

        textoPrincipal.textContent = `${actual} de ${total}`;
        textoSecundario.textContent = mensaje;

        contenedor.classList.remove('mostrar');
        void contenedor.offsetWidth; 
        
        contenedor.classList.add('mostrar');

        dispararConfeti();

        if (timeoutOcultar) {
            clearTimeout(timeoutOcultar);
        }

        timeoutOcultar = setTimeout(() => {
            contenedor.classList.remove('mostrar');
        }, duracion);
    };
})();