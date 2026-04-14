/**
 * ============================================================================
 * MÓDULO DE TARJETAS MULTIMEDIA (HTML / VIDEO / IMÁGENES) PARA VERGE3D
 * ============================================================================
 *
 * FUNCIONALIDADES PRINCIPALES:
 * - Visor Flotante Universal: Carga dinámicamente archivos HTML (en iframes), 
 * videos (mp4/webm) o imágenes flotantes en el lado derecho de la pantalla.
 * - Diseño Responsivo: Se adapta automáticamente a pantallas de móviles y PC, 
 * calculando "zonas seguras" para no desbordar la pantalla.
 * - Botón "Continuar" Global: Muestra un botón animado en la parte inferior 
 * (que también se puede activar presionando la tecla 'Enter') para cerrar 
 * la tarjeta actual.
 * - Integración Automática con Verge3D: Al cerrar una tarjeta, el sistema 
 * busca y ejecuta automáticamente un procedimiento de Verge3D (puzzle) que 
 * tenga EXACTAMENTE el mismo nombre que el archivo cargado (sin la extensión).
 *
 * ============================================================================
 * EJEMPLOS DE USO Y COMBINACIONES POSIBLES:
 * ============================================================================
 *
 * 1. CARGAR CONTENIDO BÁSICO:
 * ----------------------------------------------------------------------------
 * Parámetros: window.html(url_del_archivo, fondo_transparente)
 *
 * - Cargar un minijuego o interfaz en HTML (Fondo negro por defecto):
 * window.html('juego_memoria.html');
 *
 * - Cargar un Video (Fondo negro por defecto, con controles automáticos):
 * window.html('assets/tutorial.mp4');
 *
 * - Cargar una Imagen (Se adapta sola sin fondo negro):
 * window.html('imagenes/esquema.png');
 *
 * 2. CARGAR CONTENIDO CON FONDO TRANSPARENTE:
 * ----------------------------------------------------------------------------
 * Muy útil para iframes o videos que tienen canal alfa y quieres que floten 
 * sobre el escenario 3D sin un recuadro negro.
 * * window.html('interfaz_flotante.html', true);
 * window.html('holograma.webm', true);
 *
 * 3. CERRAR LAS TARJETAS MANUALMENTE:
 * ----------------------------------------------------------------------------
 * Si necesitas forzar el cierre desde otro script sin pulsar el botón:
 * window.closehtml();
 *
 * 4. COMPORTAMIENTOS ESPECIALES Y VERGE3D:
 * ----------------------------------------------------------------------------
 * - PROCEDIMIENTOS AUTOMÁTICOS: Si cargas `window.html('info_motor.html')`, 
 * al cerrarlo se ejecutará automáticamente `v3d.puzzles.procedures['info_motor']()`.
 * - CIERRE DESDE VERGE3D: El script crea automáticamente el procedimiento 
 * `v3d.puzzles.procedures["continue"]`. Si lo llamas desde los Puzzles, 
 * cerrará la ventana activa.
 * - BOTÓN CONTINUAR (Dock): Si la función `window.mostrarboton('continue')` 
 * (de tu otro script del Dock) existe, se llamará automáticamente al abrir una tarjeta.
 *
 * ============================================================================
 */
