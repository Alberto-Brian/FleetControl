const EVENT = 'fleetcontrol:data-changed';

export function notifyDataChanged() {
  window.dispatchEvent(new CustomEvent(EVENT));
}

export function onDataChanged(cb: () => void): () => void {
  window.addEventListener(EVENT, cb);
  return () => window.removeEventListener(EVENT, cb);
}
