// Where the hub (globe) currently sits on screen, in CSS pixels. The scene's
// camera rig writes it every frame; the intro reads it so its ball of data can
// land exactly on the globe. Plain module state: no re-renders.
export const hubScreen = { x: 0, y: 0, r: 0, ready: false };
