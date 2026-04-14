(function() {
    let contenedorAlarma, oscilador, audioCtx, gainNode;
    let activo = false;
    let temporizador;

    const svgCampana = `<svg viewBox="0 0 24 24" width="24" height="24" fill="white"><path d="M12 22c1.1 0 2-.9 2-2h-4c0 1.1.9 2 2 2zm6-6v-5c0-3.07-1.63-5.64-4.5-6.32V4c0-.83-.67-1.5-1.5-1.5s-1.5.67-1.5 1.5v.68C7.64 5.36 6 7.92 6 11v5l-2 2v1h16v-1l-2-2z"/></svg>`;

    function detenerYLimpiar() {
        if (oscilador) {
            try { oscilador.stop(); } catch(e){}
            oscilador.disconnect();
            oscilador = null;
        }
        if (gainNode) {
            gainNode.disconnect();
            gainNode = null;
        }
        if (contenedorAlarma) {
            contenedorAlarma.style.opacity = '0';
            setTimeout(() => {
                if (contenedorAlarma && contenedorAlarma.parentNode) {
                    document.body.removeChild(contenedorAlarma);
                }
                contenedorAlarma = null;
                activo = false;
            }, 300);
        }
        if (temporizador) {
            clearTimeout(temporizador);
        }
    }

    function crearAudio(duracionSegundos, beepsPorSegundo) {
        if (!audioCtx) {
            audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        }
        
        oscilador = audioCtx.createOscillator();
        gainNode = audioCtx.createGain();

        oscilador.type = 'sine';
        oscilador.frequency.setValueAtTime(3000, audioCtx.currentTime); 
        
        gainNode.gain.setValueAtTime(0, audioCtx.currentTime);
        const totalPitidos = Math.floor(duracionSegundos * beepsPorSegundo); 
        const duracionPitido = 1 / beepsPorSegundo;
        
        for(let i = 0; i < totalPitidos; i++) {
            const tiempoBase = audioCtx.currentTime + (i * duracionPitido);
            gainNode.gain.setValueAtTime(0.5, tiempoBase);
            gainNode.gain.setValueAtTime(0, tiempoBase + (duracionPitido * 0.5)); 
        }

        oscilador.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        oscilador.start();
        
        oscilador.stop(audioCtx.currentTime + duracionSegundos);
    }

    function inicializarUI(valor, beepsPorSegundo) {
        const duracionAnimacion = (1 / beepsPorSegundo).toFixed(2);

        if (contenedorAlarma) {
            document.getElementById('icono-alarma-svg').style.animationDuration = `${duracionAnimacion}s`;
            return;
        }

        contenedorAlarma = document.createElement('div');
        contenedorAlarma.style.position = 'fixed';
        contenedorAlarma.style.bottom = '20px';
        contenedorAlarma.style.right = '20px';
        contenedorAlarma.style.zIndex = '2147483647'; 
        contenedorAlarma.style.display = 'flex';
        contenedorAlarma.style.alignItems = 'center';
        contenedorAlarma.style.transition = 'opacity 0.3s ease';
        contenedorAlarma.style.opacity = '0';
        
        const iconoAlarma = document.createElement('div');
        iconoAlarma.id = 'icono-alarma-svg';
        iconoAlarma.innerHTML = svgCampana;
        iconoAlarma.style.backgroundColor = '#d32f2f';
        iconoAlarma.style.width = '45px';
        iconoAlarma.style.height = '45px';
        iconoAlarma.style.borderRadius = '50%';
        iconoAlarma.style.display = 'flex';
        iconoAlarma.style.justifyContent = 'center';
        iconoAlarma.style.alignItems = 'center';
        iconoAlarma.style.cursor = 'pointer';
        iconoAlarma.style.boxShadow = '0 4px 15px rgba(0,0,0,0.3)';
        
        iconoAlarma.style.animation = `alarma-pulse-rapido ${duracionAnimacion}s infinite`;

        if (!document.getElementById('alarma-estilos-rapidos')) {
            const styleSheet = document.createElement("style");
            styleSheet.id = 'alarma-estilos-rapidos';
            styleSheet.innerText = `
                @keyframes alarma-pulse-rapido {
                    0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0.7); }
                    50% { transform: scale(1.15); box-shadow: 0 0 0 10px rgba(211, 47, 47, 0); }
                    100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(211, 47, 47, 0); }
                }
            `;
            document.head.appendChild(styleSheet);
        }

        iconoAlarma.onclick = detenerYLimpiar;

        contenedorAlarma.appendChild(iconoAlarma);
        document.body.appendChild(contenedorAlarma);

        void contenedorAlarma.offsetWidth;
        contenedorAlarma.style.opacity = '1';
    }

    const apiAlarma = function(valor, duracionSegundos = 3) {
        if (activo) detenerYLimpiar(); 
        activo = true;
        
        const beepsPorSegundo = Math.max(1, Math.min(15, valor / 5));
        
        inicializarUI(valor, beepsPorSegundo);
        
        try {
            crearAudio(duracionSegundos, beepsPorSegundo);
        } catch(e) {
            console.warn("Navegador bloqueó el audio.", e);
        }

        temporizador = setTimeout(() => {
            if (activo) detenerYLimpiar();
        }, duracionSegundos * 1000); 
    };

    try {
        window.top.alarma = apiAlarma; 
    } catch (e) {
        window.alarma = apiAlarma; 
    }
    window.alarma = apiAlarma;

})();