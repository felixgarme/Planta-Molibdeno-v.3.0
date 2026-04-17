(() => {
  const track = document.getElementById("carouselTrack");
  const btnPrev = document.getElementById("btnCarouselPrev");
  const btnNext = document.getElementById("btnCarouselNext");
  const stepLabel = document.getElementById("carouselStepLabel");
  const btnContinuar = document.getElementById("btnContinuarSeccion");
  const slides = document.querySelectorAll(".carousel-slide");
  const sections = [
    document.querySelector(".hero-layout"),
    document.querySelector(".instructions-layout"),
    document.querySelector(".respiratoria-layout"),
  ];
  const ex2Root = document.querySelector(".ex2-fitcheck");

  if (!track || !btnPrev || !btnNext || !btnContinuar) return;

  const SECTION_NAMES = ["Modelo 3D", "Instrucciones", "Uso de equipo de protección respiratoria"];
  let index = 0;
  const totalSlides = slides.length;
  const visited = Array.from({ length: totalSlides }, (_, i) => i === 0);

  const updateContinuarState = () => {
    const allSeen = visited.every(Boolean);
    btnContinuar.disabled = !allSeen;
    btnContinuar.classList.toggle("btn-continuar-locked", !allSeen);
    btnContinuar.setAttribute(
      "aria-label",
      allSeen ? "Continuar" : "Continuar (se habilita al revisar todas las secciones con Siguiente y Atrás)"
    );
  };

  const setSlide = (nextIndex) => {
    index = Math.max(0, Math.min(totalSlides - 1, nextIndex));
    visited[index] = true;

    track.style.transform = `translateX(${-index * 100}%)`;

    sections.forEach((sec, j) => {
      if (!sec) return;
      const hidden = j !== index;
      sec.setAttribute("aria-hidden", hidden ? "true" : "false");
    });

    slides.forEach((el, j) => {
      el.inert = j !== index;
    });

    btnPrev.disabled = index === 0;
    btnNext.disabled = index === totalSlides - 1;

    if (stepLabel) {
      stepLabel.textContent = `Sección ${index + 1} de ${totalSlides} · ${SECTION_NAMES[index]}`;
    }

    updateContinuarState();
  };

  btnPrev.addEventListener("click", () => setSlide(index - 1));
  btnNext.addEventListener("click", () => setSlide(index + 1));

  const normalizePath = (value) =>
    String(value || "")
      .replace(/\\/g, "/")
      .replace(/^\.?\//, "/")
      .replace(/\/{2,}/g, "/")
      .toLowerCase();

  const findCurrentPageIndex = (pages) => {
    const currentPath = normalizePath(window.location.pathname);
    let currentIndex = pages.findIndex((page) => currentPath.endsWith(normalizePath(page)));

    if (currentIndex !== -1) return currentIndex;

    const currentFile = currentPath.split("/").pop();
    if (!currentFile) return -1;

    currentIndex = pages.findIndex((page) => {
      const pageFile = normalizePath(page).split("/").pop();
      return pageFile === currentFile;
    });

    return currentIndex;
  };

  btnContinuar.addEventListener("click", async () => {
    if (btnContinuar.disabled) return;

    // Flujo principal dentro de la app: avanzar el iframe activo
    // usando la secuencia central definida por index.html + html.json.
    if (window.parent && typeof window.parent.siguientehtml === "function") {
      window.parent.siguientehtml();
      return;
    }

    try {
      const response = await fetch("../Recursos/list/html.json", { cache: "no-store" });
      if (!response.ok) throw new Error("No se pudo leer la lista de paginas.");

      const pages = await response.json();
      if (!Array.isArray(pages) || pages.length === 0) return;

      const currentIndex = findCurrentPageIndex(pages);
      const nextPage = pages[currentIndex + 1];

      if (nextPage) {
        const normalizedNextPage = `/${String(nextPage)
          .replace(/\\/g, "/")
          .replace(/^\.?\//, "")
          .replace(/^\/+/, "")}`;
        window.location.href = `${window.location.origin}${normalizedNextPage}`;
      }
    } catch (error) {
      console.error("No se pudo continuar al siguiente contenido:", error);
    }
  });

  setSlide(0);

  if (ex2Root) {
    const tabBtns = Array.from(ex2Root.querySelectorAll(".tab-btn"));
    const pos = ex2Root.querySelector("#card-pos");
    const neg = ex2Root.querySelector("#card-neg");

    const resetTabClasses = () => {
      tabBtns.forEach((b) => {
        b.className = "tab-btn";
        b.setAttribute("aria-selected", "false");
      });
    };

    const applyFilter = (type) => {
      if (!pos || !neg) return;
      if (type === "all") {
        pos.classList.remove("hidden");
        neg.classList.remove("hidden");
      } else if (type === "pos") {
        pos.classList.remove("hidden");
        neg.classList.add("hidden");
      } else {
        pos.classList.add("hidden");
        neg.classList.remove("hidden");
      }
    };

    tabBtns.forEach((btn) => {
      btn.addEventListener("click", () => {
        const type = btn.dataset.ex2Tab;
        if (!type) return;
        resetTabClasses();
        btn.setAttribute("aria-selected", "true");
        if (type === "all") btn.classList.add("active-all");
        if (type === "pos") btn.classList.add("active-pos");
        if (type === "neg") btn.classList.add("active-neg");
        applyFilter(type);
      });
    });

    applyFilter("all");
    const defaultBtn = tabBtns.find((b) => b.dataset.ex2Tab === "all");
    if (defaultBtn) {
      resetTabClasses();
      defaultBtn.classList.add("active-all");
      defaultBtn.setAttribute("aria-selected", "true");
    }
  }
})();
