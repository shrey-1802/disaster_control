/**
 * DISISTA CONTROL — Global Application Controller & Real-Time Simulation
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Render Navigation Header if placeholder exists
  const navPlaceholder = document.getElementById('navbar-mount');
  if (navPlaceholder) {
    const activePage = navPlaceholder.dataset.active || 'dashboard';
    navPlaceholder.innerHTML = window.UI.renderNavbar(activePage);
  }

  // 2. Start Real-Time Simulation Engine
  initSimulationTicker();
});

function initSimulationTicker() {
  // Periodic ticker to simulate convoy telemetry updates
  setInterval(() => {
    if (!window.disasterStore) return;
    const state = window.disasterStore.getState();

    // Check if there are active convoys
    let updated = false;
    state.convoys.forEach(cv => {
      if (cv.status === 'on_route' || cv.status === 'delayed' || cv.status === 'rerouted') {
        if (cv.etaMinutes > 1) {
          cv.etaMinutes = Math.max(1, cv.etaMinutes - 1);
          updated = true;
        }
      }
    });

    if (updated) {
      window.disasterStore.notify();
    }
  }, 45000); // every 45s
}
