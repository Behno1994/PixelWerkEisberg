/**
 * Winziger Pub/Sub-Speicher für den Scroll-Fortschritt der Seite (0–1).
 *
 * Warum kein React-Context/State: Der Wert ändert sich bei jedem Scroll-Frame.
 * Ein State-Update pro Frame würde den gesamten Teilbaum neu rendern. Hier
 * schreibt genau ein Producer (`ScrollBackdrop`) und mehrere Consumer lesen den
 * Wert imperativ – ohne React-Render.
 */
type Listener = (progress: number) => void;

const listeners = new Set<Listener>();
let current = 0;

export const scrollProgress = {
  get value() {
    return current;
  },

  set(progress: number) {
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
