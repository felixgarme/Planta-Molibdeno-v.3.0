(() => {
  const imageA = document.getElementById("formatoSecuenciaA");
  const imageB = document.getElementById("formatoSecuenciaB");
  const stepLabelEl = document.getElementById("imageStepLabel");
  const restartBtn = document.getElementById("btnReiniciarSecuencia");
  if (!imageA || !imageB) return;

  const totalFrames = 14;
  const frameDelayMs = 1500;
  const framePaths = Array.from({ length: totalFrames }, (_, i) => `../Recursos/img/M1/formatoIngreso/${i + 1}.png`);
  let index = 0;
  let activeImage = imageA;
  let nextImage = imageB;
  let timerId = null;

  // Preload all frames so sequence changes stay smooth.
  framePaths.forEach((path) => {
    const preloadImg = new Image();
    preloadImg.src = path;
  });

  const updateFrame = (nextIndex) => {
    index = nextIndex;
    nextImage.src = framePaths[index];
    nextImage.classList.add("is-active");
    activeImage.classList.remove("is-active");

    const temp = activeImage;
    activeImage = nextImage;
    nextImage = temp;

    if (stepLabelEl) {
      stepLabelEl.textContent = `Paso ${index + 1} de ${totalFrames}`;
    }
  };

  const scheduleNextFrame = () => {
    if (index >= totalFrames - 1) {
      if (restartBtn) restartBtn.classList.add("is-visible");
      return;
    }
    timerId = window.setTimeout(() => {
      updateFrame(index + 1);
      scheduleNextFrame();
    }, frameDelayMs);
  };

  const resetSequence = () => {
    if (timerId) {
      window.clearTimeout(timerId);
      timerId = null;
    }
    index = 0;
    activeImage = imageA;
    nextImage = imageB;
    imageA.src = framePaths[0];
    imageB.src = framePaths[0];
    imageA.classList.add("is-active");
    imageB.classList.remove("is-active");
    if (stepLabelEl) stepLabelEl.textContent = `Paso 1 de ${totalFrames}`;
    if (restartBtn) restartBtn.classList.remove("is-visible");
    scheduleNextFrame();
  };

  if (restartBtn) {
    restartBtn.addEventListener("click", resetSequence);
  }

  scheduleNextFrame();
})();
