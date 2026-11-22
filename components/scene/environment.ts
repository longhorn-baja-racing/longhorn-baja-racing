import * as THREE from "three"

/*
  Ground and air around the car, both fully on the GPU:
  - terrain: a flat plane whose shader draws topographic contour lines of a
    procedural hillside, a soft contact shadow, and a slow survey pulse.
  - dust: a few hundred additive points that drift, and stream past when the car drives.
  `flow` is distance travelled; it slides the terrain and dust past the car.
*/

const NOISE = /* glsl */ `
  float hash(vec2 p) { p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }
`

export function createTerrain() {
  const uniforms = {
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uPulse: { value: 1 },
    uLine: { value: new THREE.Color(0xd2691e) },
    uOpacity: { value: 1 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    vertexShader: /* glsl */ `
      varying vec3 vWorld;
      void main() {
        vec4 w = modelMatrix * vec4(position, 1.0);
        vWorld = w.xyz;
        gl_Position = projectionMatrix * viewMatrix * w;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform float uTime, uFlow, uPulse, uOpacity;
      uniform vec3 uLine;
      varying vec3 vWorld;
      ${NOISE}
      float contour(float h, float spacing) {
        float k = h / spacing;
        float d = abs(fract(k - 0.5) - 0.5) / max(fwidth(k), 1e-4);
        return 1.0 - min(d, 1.0);
      }
      void main() {
        vec2 p = vWorld.xz;
        vec2 q = p * 0.32 + vec2(uFlow * 0.32, 0.0);
        float h = fbm(q) * 3.2 + fbm(q * 0.35 + 4.0) * 1.6;
        float minor = contour(h, 0.12);
        float major = contour(h, 0.6);
        float r = length(p * vec2(0.85, 1.0));
        float fade = smoothstep(10.0, 2.2, r);
        float shadow = smoothstep(0.55, 1.6, length(p * vec2(0.62, 1.05)));
        float pulseR = mod(uTime * 1.1, 12.0);
        float pulse = exp(-pow((r - pulseR) * 2.2, 2.0)) * smoothstep(12.0, 3.0, pulseR) * uPulse;
        float lines = (minor * 0.22 + major * 0.55) * (0.35 + 0.65 * shadow) + pulse * 0.35 * (minor + major);
        float alpha = lines * fade;
        float shade = (1.0 - shadow) * 0.55 * smoothstep(2.4, 0.4, r);
        vec3 col = uLine * (1.0 + pulse * 1.5);
        gl_FragColor = vec4(col * alpha, (alpha + shade) * uOpacity);
      }
    `,
  })
  // The shader outputs premultiplied color (black shadow, glowing lines).
  material.premultipliedAlpha = true
  const mesh = new THREE.Mesh(new THREE.PlaneGeometry(26, 26, 1, 1), material)
  mesh.rotation.x = -Math.PI / 2
  mesh.renderOrder = -1
  return { mesh, uniforms }
}

export function createDust(count: number) {
  const seeds = new Float32Array(count * 4)
  for (let i = 0; i < count; i++) {
    seeds[i * 4] = (Math.random() - 0.5) * 12
    seeds[i * 4 + 1] = Math.pow(Math.random(), 1.8) * 3.2
    seeds[i * 4 + 2] = (Math.random() - 0.5) * 9
    seeds[i * 4 + 3] = Math.random()
  }
  const geometry = new THREE.BufferGeometry()
  geometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array(count * 3), 3))
  geometry.setAttribute("seed", new THREE.BufferAttribute(seeds, 4))
  geometry.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20)
  const uniforms = {
    uTime: { value: 0 },
    uFlow: { value: 0 },
    uPixel: { value: 1 },
    uColor: { value: new THREE.Color(0xffb27a) },
    uOpacity: { value: 1 },
  }
  const material = new THREE.ShaderMaterial({
    uniforms,
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    vertexShader: /* glsl */ `
      attribute vec4 seed;
      uniform float uTime, uFlow, uPixel;
      varying float vAlpha;
      void main() {
        vec3 p = seed.xyz;
        p.x = mod(p.x - uFlow * (0.8 + seed.w * 0.6) + 6.0, 12.0) - 6.0;
        p.y += sin(uTime * 0.35 + seed.w * 6.283) * 0.12;
        p.z += cos(uTime * 0.27 + seed.w * 9.0) * 0.14;
        vec4 mv = modelViewMatrix * vec4(p, 1.0);
        gl_PointSize = max(1.0, uPixel * (0.006 + seed.w * 0.016) / -mv.z);
        float edge = smoothstep(6.0, 3.5, abs(p.x)) * smoothstep(4.5, 2.5, abs(p.z));
        vAlpha = edge * (0.25 + 0.75 * fract(seed.w * 7.31)) * (0.55 + 0.45 * sin(uTime * 0.8 + seed.w * 40.0));
        gl_Position = projectionMatrix * mv;
      }
    `,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor;
      uniform float uOpacity;
      varying float vAlpha;
      void main() {
        float d = length(gl_PointCoord - 0.5);
        float a = smoothstep(0.5, 0.0, d);
        gl_FragColor = vec4(uColor * a * vAlpha * 0.55 * uOpacity, 1.0);
      }
    `,
  })
  const points = new THREE.Points(geometry, material)
  return { points, uniforms }
}
