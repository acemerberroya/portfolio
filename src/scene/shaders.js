// Land dots: round points, brighter where they face the camera, a scan line that
// sweeps the globe on every navigation, and a warm glow around home.
export const dotsVertex = /* glsl */ `
  uniform float uSize;
  uniform float uScan;
  uniform float uCenterY;
  uniform vec3 uHome;
  varying float vFacing;
  varying float vScan;
  varying float vHome;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 n = normalize(normalMatrix * normalize(position));
    vFacing = dot(n, normalize(-mv.xyz));
    vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
    vScan = 1.0 - smoothstep(0.0, 0.16, abs(wp.y - uCenterY - uScan));
    vHome = 1.0 - smoothstep(0.05, 0.16, distance(normalize(position), uHome));
    gl_PointSize = uSize * (0.7 + 0.3 * max(vFacing, 0.0)) * (1.0 + vHome * 0.6) / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
export const dotsFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uWarm;
  varying float vFacing;
  varying float vScan;
  varying float vHome;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    float a = smoothstep(0.5, 0.1, d);
    float front = smoothstep(-0.15, 0.25, vFacing);
    vec3 col = mix(uColor, uWarm, vHome);
    col = mix(col, vec3(1.0), vScan * 0.75);
    float alpha = a * (mix(0.14, 0.95, front) + vScan * 0.8);
    gl_FragColor = vec4(col, alpha);
  }
`;

// Fresnel rim used for the hologram shell and its outer halo.
export const fresnelVertex = /* glsl */ `
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
export const fresnelFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uPower;
  uniform float uIntensity;
  uniform float uInvert;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float f = abs(dot(normalize(vN), normalize(vV)));
    float rim = mix(pow(1.0 - f, uPower), pow(f, uPower), uInvert);
    gl_FragColor = vec4(uColor, rim * uIntensity);
  }
`;

// Projector beam: fades upward and toward its edges.
export const beamVertex = /* glsl */ `
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    vUv = uv;
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vN = normalize(normalMatrix * normal);
    vV = normalize(-mv.xyz);
    gl_Position = projectionMatrix * mv;
  }
`;
export const beamFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform float uTime;
  varying vec2 vUv;
  varying vec3 vN;
  varying vec3 vV;
  void main() {
    float edge = pow(abs(dot(normalize(vN), normalize(vV))), 1.5);
    float up = smoothstep(1.0, 0.0, vUv.y) * smoothstep(0.0, 0.08, vUv.y);
    float lines = 0.85 + 0.15 * sin(vUv.y * 60.0 - uTime * 3.0);
    gl_FragColor = vec4(uColor, edge * up * lines * 0.32);
  }
`;

// Rack LEDs: per-point random blink.
export const ledVertex = /* glsl */ `
  attribute float aSeed;
  uniform float uTime;
  varying float vOn;
  varying float vSeed;
  void main() {
    vSeed = aSeed;
    float t = floor(uTime * (0.6 + aSeed * 2.0) + aSeed * 40.0);
    vOn = step(0.35, fract(sin(t * 12.9898 + aSeed * 78.233) * 43758.5453));
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    gl_PointSize = 26.0 / -mv.z;
    gl_Position = projectionMatrix * mv;
  }
`;
export const ledFragment = /* glsl */ `
  varying float vOn;
  varying float vSeed;
  void main() {
    float d = length(gl_PointCoord - 0.5);
    if (d > 0.5) discard;
    vec3 col = vSeed > 0.86 ? vec3(1.0, 0.72, 0.3) : vec3(0.35, 1.0, 0.75);
    gl_FragColor = vec4(col, smoothstep(0.5, 0.0, d) * mix(0.12, 1.0, vOn));
  }
`;

// Jarvis hologram light trails (Euthenics room). Each strand carries a bright
// comet head that flows along it, dims on the far side, joins the same scan
// sweep the globe's dots use, and only appears once the staged reveal reaches
// its seed.
export const trailVertex = /* glsl */ `
  attribute float aT;
  attribute float aSeed;
  uniform float uTime;
  uniform float uScan;
  uniform float uCenterY;
  uniform float uReveal;
  varying float vGlow;
  varying float vScan;
  varying float vFront;
  varying float vShow;
  void main() {
    vec4 mv = modelViewMatrix * vec4(position, 1.0);
    vec3 wp = (modelMatrix * vec4(position, 1.0)).xyz;
    vec3 n = normalize(normalMatrix * normalize(position + vec3(1e-4)));
    vFront = smoothstep(-0.4, 0.5, dot(n, normalize(-mv.xyz)));
    vScan = 1.0 - smoothstep(0.0, 0.16, abs(wp.y - uCenterY - uScan));
    float f = fract(aT * 2.0 - uTime * (0.1 + aSeed * 0.28) + aSeed * 11.0);
    vGlow = pow(f, 6.0);
    vShow = step(aSeed, uReveal);
    gl_Position = projectionMatrix * mv;
  }
`;
export const trailFragment = /* glsl */ `
  uniform vec3 uColor;
  uniform vec3 uHot;
  uniform float uFlicker;
  uniform float uBase;
  varying float vGlow;
  varying float vScan;
  varying float vFront;
  varying float vShow;
  void main() {
    if (vShow < 0.5) discard;
    vec3 col = mix(uColor, uHot, clamp(vGlow * 0.9 + vScan * 0.8, 0.0, 1.0));
    float a = (uBase + (1.0 - uBase) * vGlow) * mix(0.2, 1.0, vFront) + vScan * 0.6;
    gl_FragColor = vec4(col, a * uFlicker);
  }
`;

// Door portal: a swirling sheet of light with scan lines; brightens on hover.
export const portalVertex = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
  }
`;
export const portalFragment = /* glsl */ `
  uniform float uTime;
  uniform float uHover;
  uniform vec3 uColor;
  uniform vec3 uEdge;
  varying vec2 vUv;
  void main() {
    vec2 p = (vUv - 0.5) * vec2(1.0, 2.1);
    float r = length(p);
    float ang = atan(p.y, p.x);
    float swirl = 0.5 + 0.5 * sin(ang * 5.0 + r * 16.0 - uTime * 1.5);
    float lines = 0.78 + 0.22 * sin(vUv.y * 140.0 - uTime * 5.0);
    float core = smoothstep(1.05, 0.0, r);
    float rim = smoothstep(0.38, 0.5, max(abs(vUv.x - 0.5), abs(vUv.y - 0.5)));
    vec3 col = mix(uEdge, uColor, core);
    float a = (0.12 + 0.3 * swirl * core + 0.35 * uHover * core + 0.35 * rim) * lines;
    gl_FragColor = vec4(col, a);
  }
`;
