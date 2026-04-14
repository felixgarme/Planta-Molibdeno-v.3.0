
/**
 * ============================================================================
 * DOCK DE CONTROLES ESTILO macOS PARA VERGE3D / WEB
 * ============================================================================
 *
 * FUNCIONALIDADES PRINCIPALES:
 * - Interfaz flotante, responsive y con efecto blur (estilo macOS).
 * - Ejecuta automáticamente procedimientos de Verge3D (v3d.puzzles.procedures)
 * basados en el ID del botón presionado.
 * - Incluye botones con cambio de estado automático (Play/Pause, Mutear/Desmutear).
 *
 * ============================================================================
 * EJEMPLOS DE USO Y TODAS LAS COMBINACIONES POSIBLES:
 * ============================================================================
 *
 * 1. MOSTRAR / OCULTAR LA BARRA COMPLETA (El Dock principal):
 * ----------------------------------------------------------------------------
 * window.barraControles.mostrar();  // Inicializa (si no existe) y muestra el Dock con animación.
 * window.barraControles.ocultar();  // Oculta el Dock completo deslizándolo hacia abajo.
 *
 * 2. MOSTRAR / OCULTAR BOTONES INDIVIDUALES:
 * ----------------------------------------------------------------------------
 * El sistema te permite esconder o hacer aparecer cualquier botón de forma
 * independiente usando su ID. Aquí tienes TODAS las combinaciones posibles:
 *
 * [ID: atrasar]
 * window.ocultarboton('atrasar');
 * window.mostrarboton('atrasar');
 *
 * [ID: pause] (Controla el botón de Pausa/Reproducir)
 * window.ocultarboton('pause');
 * window.mostrarboton('pause');
 *
 * [ID: adelantar]
 * window.ocultarboton('adelantar');
 * window.mostrarboton('adelantar');
 *
 * [ID: recargar]
 * window.ocultarboton('recargar');
 * window.mostrarboton('recargar');
 *
 * [ID: mutear] (Controla el botón de sonido)
 * window.ocultarboton('mutear');
 * window.mostrarboton('mutear');
 *
 * [ID: continue] (El botón flotante especial que está arriba del Dock)
 * window.ocultarboton('continue');
 * window.mostrarboton('continue');
 *
 * 3. COMPORTAMIENTOS ESPECIALES (Ya programados y automáticos):
 * ----------------------------------------------------------------------------
 * - 'atrasar': Al presionarlo, intenta ejecutar la función externa `window.closehtml()` 
 * (debes tenerla definida en tu HTML) y automáticamente oculta el botón 'continue'.
 * - 'continue': Al presionarlo, se auto-oculta automáticamente.
 * - 'mutear': Al presionarlo, alterna su fondo a color rojo (indicando que está muteado) 
 * y cambia su tooltip.
 * - 'pause': Al presionarlo, cambia visualmente su icono entre 'Pausa' y 'Play', 
 * y actualiza su tooltip.
 *
 * ============================================================================
 */