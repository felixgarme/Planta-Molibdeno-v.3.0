(function () {
    var STORAGE_KEY = 'quellaveco_login_usuario';
    var VIDEO_READY_CLASS = 'video-ready';
  
    var loginContainer = document.getElementById('login-container');
    var loginVideo = document.getElementById('login-video');
    var form = document.getElementById('login-form');

    function markVideoReady() {
      if (!loginContainer) return;
      loginContainer.classList.add(VIDEO_READY_CLASS);
    }

    function setupVideoBackground() {
      if (!loginVideo) {
        markVideoReady();
        return;
      }

      var completed = false;
      var complete = function () {
        if (completed) return;
        completed = true;
        markVideoReady();
        loginVideo.removeEventListener('loadeddata', complete);
        loginVideo.removeEventListener('canplay', complete);
      };

      if (loginVideo.readyState >= 3) {
        complete();
      } else {
        loginVideo.addEventListener('loadeddata', complete, { once: true });
        loginVideo.addEventListener('canplay', complete, { once: true });
        // Evita que el fondo quede oscuro mucho tiempo en redes lentas.
        setTimeout(complete, 5000);
      }

      // En algunos navegadores autoplay puede necesitar un llamado explícito.
      var playPromise = loginVideo.play();
      if (playPromise && typeof playPromise.catch === 'function') {
        playPromise.catch(function () {
          complete();
        });
      }
    }

    setupVideoBackground();
  
    function resolveSiguienteHtml() {
      if (typeof window.siguientehtml === 'function') {
        return window.siguientehtml;
      }

      if (window.parent && typeof window.parent.siguientehtml === 'function') {
        return window.parent.siguientehtml.bind(window.parent);
      }

      return null;
    }
  
    if (!form) return;
  
    form.addEventListener('submit', function (e) {
      e.preventDefault();
  
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }
  
      var tipoInput = form.querySelector('input[name="tipo_documento"]:checked');
      var datosUsuario = {
        nombres: (form.elements.nombres && form.elements.nombres.value) || '',
        apellidos: (form.elements.apellidos && form.elements.apellidos.value) || '',
        tipoDocumento: tipoInput ? tipoInput.value : '',
        numeroDni: (form.elements.numero_dni && form.elements.numero_dni.value) || '',
        guardadoEn: new Date().toISOString()
      };
  
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(datosUsuario));
      } catch (err) {
        console.error('No se pudo guardar en localStorage:', err);
        return;
      }
  
      console.log('(objeto):', datosUsuario);
      console.log('(localStorage[' + JSON.stringify(STORAGE_KEY) + ']):', localStorage.getItem(STORAGE_KEY));
  
      var siguienteHtml = resolveSiguienteHtml();
      if (siguienteHtml) {
        siguienteHtml();
      } else {
        console.error('No se encontro la funcion window.siguientehtml()');
      }
    });
  })();
  