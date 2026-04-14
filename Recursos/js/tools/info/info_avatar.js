/**
 * ============================================================================
 * MÓDULO DE AVATAR ANIMADO E INTERACTIVO (VERGE3D / WEB)
 * ============================================================================
 *
 * FUNCIONALIDADES PRINCIPALES:
 * - UI Flotante y Responsive: Muestra un avatar circular (video animado o imagen fija) 
 * junto a una burbuja de texto. Se adapta automáticamente a pantallas de móviles 
 * (vertical/horizontal) y PC.
 * - Sincronización Multimedia: Reproduce un archivo de audio al mismo tiempo que el 
 * video del avatar, auto-ocultándose al terminar. Si no hay audio, se oculta tras 4s.
 * - Integración con Verge3D: Intercepta llamadas a `v3d.puzzles.procedures` para 
 * construir un historial de navegación automático y permitir acciones de 
 * retroceder, repetir y omitir (adelantar).
 * - Rendimiento Dinámico: Permite alternar entre video (alto/medio rendimiento) e 
 * imagen (bajo rendimiento) mediante comandos de Verge3D.
 * - Silencio Global (Mute): Gestiona el muteado global de medios guardando la 
 * preferencia en el localStorage.
 * - Formateo Dinámico de Texto (Iconos/Teclas): Convierte texto entre corchetes `[]` 
 * o paréntesis `()` en botones visuales animados dentro de la burbuja.
 *
 * ============================================================================
 * EJEMPLOS DE USO Y COMBINACIONES POSIBLES:
 * ============================================================================
 *
 * 1. INVOCACIÓN BÁSICA (Mensaje + Audio):
 * ----------------------------------------------------------------------------
 * window.avatar('¡Hola! Bienvenido a la experiencia.', 'ruta/al/audio.mp3');
 * * 2. SOLO TEXTO (Sin audio, dura 4 segundos y desaparece):
 * ----------------------------------------------------------------------------
 * window.avatar('Iniciando carga del sistema...', null);
 *
 * 3. USAR ICONOS Y BOTONES EN EL TEXTO:
 * ----------------------------------------------------------------------------
 * - Botones Cuadrados: Usa corchetes []. Ideal para teclas del teclado.
 * - Botones Circulares: Usa paréntesis (). Ideal para botones de mando/interfaz.
 * - Direcciones automáticas: 'ARRIBA', 'ABAJO', 'IZQUIERDA', 'DERECHA' se 
 * convierten automáticamente en iconos de flechas.
 * * window.avatar('Presiona [ENTER] para aceptar.');
 * window.avatar('Mueve el objeto usando [ARRIBA] o [ABAJO].');
 * window.avatar('Pulsa el botón (A) de tu mando para saltar.');
 *
 * 4. CONTROLAR EL HISTORIAL Y LA PAUSA:
 * ----------------------------------------------------------------------------
 * Parámetros de la función principal:
 * window.avatar(mensaje, urlAudio, permitirPausa, guardarHistorial)
 * * - Si NO quieres que este paso se guarde en el historial de navegación:
 * window.avatar('Alerta temporal de error', 'error.mp3', true, false);
 *
 * 5. COMANDOS DE VERGE3D INTEGRADOS AUTOMÁTICAMENTE:
 * ----------------------------------------------------------------------------
 * El sistema "escucha" si desde Verge3D ejecutas estos procedimientos:
 * - v3d.puzzles.procedures["pause"]()   -> Pausa/Reproduce el audio y video.
 * - v3d.puzzles.procedures["atrasar"]() -> Vuelve al paso anterior en el historial.
 * - v3d.puzzles.procedures["adelantar"]() -> Omite el audio actual y salta al siguiente.
 * - v3d.puzzles.procedures["recargar"]() -> Repite la animación/audio de la pantalla actual.
 * - v3d.puzzles.procedures["mutear"]()  -> Silencia o desilencia globalmente.
 * - v3d.puzzles.procedures["bajorendimiento"]() -> Cambia el avatar a imagen estática.
 * - v3d.puzzles.procedures["altorendimiento"]() -> Cambia el avatar a video.
 *
 * ============================================================================
 */
