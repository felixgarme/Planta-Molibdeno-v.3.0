(function () {
    var STORAGE_KEY = 'quellaveco_login_usuario';
  
    var form = document.getElementById('login-form');
    var modal = document.getElementById('login-success-modal');
    var modalAceptar = document.getElementById('login-modal-aceptar');
    var modalBackdrop = modal && modal.querySelector('.login-modal__backdrop');
  
    function openSuccessModal() {
      if (!modal) return;
      modal.hidden = false;
      modal.setAttribute('aria-hidden', 'false');
      requestAnimationFrame(function () {
        modal.classList.add('is-open');
      });
      if (modalAceptar) modalAceptar.focus();
    }
  
    function closeSuccessModal() {
      if (!modal) return;
      modal.classList.remove('is-open');
      modal.setAttribute('aria-hidden', 'true');
      var done = false;
      var finish = function () {
        if (done) return;
        done = true;
        modal.hidden = true;
      };
      var onEnd = function (e) {
        if (e.target !== modal) return;
        modal.removeEventListener('transitionend', onEnd);
        finish();
      };
      modal.addEventListener('transitionend', onEnd);
      setTimeout(finish, 320);
    }
  
    if (modalAceptar) {
      modalAceptar.addEventListener('click', closeSuccessModal);
    }
    if (modalBackdrop) {
      modalBackdrop.addEventListener('click', closeSuccessModal);
    }
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && modal && modal.classList.contains('is-open')) {
        closeSuccessModal();
      }
    });
  
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
  
      openSuccessModal();
    });
  })();
  