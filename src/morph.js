// Timing of the hologram transformation (portfolio globe ⇄ Euthenics core),
// shared by the controller in App, the 3D hubs and the particle overlay.
//   accel  – the current hologram spins and surges faster and faster
//   burst  – the 3D hub hides; the overlay's particles compress, explode,
//            scatter, change colour and gather into the new hologram
//   reveal – the new 3D hologram appears as the overlay's particles fade; only
//            now does the setting (room light, platform, beam, panel, nav)
//            switch over. Until then only the particles change colour.
export const MORPH = {
  accel: 900,
  burst: 4900,
  reveal: 700,
  // Inside the burst (ms from its start):
  compress: [0, 600],
  explode: [600, 1250],
  scatter: [1250, 2250],
  recolor: [2250, 2750],
  gather: [2750, 4300],
};
