/**
 * Winzige Pub/Sub-Speicher für Scroll-Fortschritte (jeweils 0–1).
 *
 * Warum kein React-Context/State: Die Werte ändern sich bei jedem Frame. Ein
 * State-Update pro Frame würde den gesamten Teilbaum neu rendern. Hier
 * schreibt genau ein Producer und mehrere Consumer lesen imperativ – ohne
 * React-Render.
 */
type Listener = (progress: number) => void;

function createProgressStore() {
  const listeners = new Set<Listener>();
  let current = 0;

  return {
    get value() {
      return current;
    },

    set(progress: number) {
      if (progress === current) return;
      current = progress;
      for (const listener of listeners) listener(progress);
    },

    /** Registriert einen Listener und ruft ihn sofort mit dem aktuellen Wert auf. */
    subscribe(listener: Listener) {
      listeners.add(listener);
      listener(current);
      return () => {
        listeners.delete(listener);
      };
    },
  };
}

/**
 * Fortschritt innerhalb der Kino-Szene (der 500vh-Scrolltrack).
 * Steuert Videoposition, die drei Textstufen und den Farbwechsel der Navigation.
 */
export const sceneProgress = createProgressStore();
