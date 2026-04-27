let aladinReadyPromise = null;

/**
 * Returns a Promise that resolves to window.A once Aladin Lite v3 is fully ready.
 * The script is loaded via public/index.html to avoid webpack self.postMessage conflicts.
 * Here we only wait for window.A.init to settle.
 */
export function loadAladinScript() {
  if (aladinReadyPromise) return aladinReadyPromise;
  aladinReadyPromise = new Promise((resolve, reject) => {
    const wait = () => {
      if (window.A && window.A.init) {
        window.A.init.then(() => resolve(window.A)).catch(reject);
      } else {
        // Script is in index.html and loading — poll briefly
        setTimeout(wait, 50);
      }
    };
    wait();
  });
  return aladinReadyPromise;
}
