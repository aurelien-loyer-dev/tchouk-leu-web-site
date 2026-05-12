import { useEffect, useRef } from "react";

const VERT = `
attribute vec2 a_position;
void main() { gl_Position = vec4(a_position, 0.0, 1.0); }
`;

// Animated aurora shader — deep navy + blue accent matching the site palette
const FRAG = `
precision mediump float;
uniform float u_time;
uniform vec2  u_resolution;

float noise(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float smoothNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = noise(i);
  float b = noise(i + vec2(1.0, 0.0));
  float c = noise(i + vec2(0.0, 1.0));
  float d = noise(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}

float fbm(vec2 p) {
  float v = 0.0; float a = 0.5;
  for (int i = 0; i < 5; i++) {
    v += a * smoothNoise(p);
    p *= 2.0; a *= 0.5;
  }
  return v;
}

void main() {
  vec2 uv = gl_FragCoord.xy / u_resolution;
  uv.y = 1.0 - uv.y;
  float t = u_time * 0.12;

  vec2 p = uv * 2.5;
  float n1 = fbm(p + vec2(t * 0.4, t * 0.25));
  float n2 = fbm(p + vec2(-t * 0.3, t * 0.35) + vec2(n1 * 0.8));
  float n3 = fbm(p + vec2(t * 0.2, -t * 0.2) + vec2(n2 * 0.6));

  // Base dark navy
  vec3 base  = vec3(0.027, 0.043, 0.071);
  // Blue accent  #5B7D95 → (0.357, 0.490, 0.584)
  vec3 blue  = vec3(0.357, 0.490, 0.584);
  // Deep mid
  vec3 mid   = vec3(0.051, 0.082, 0.125);

  vec3 color = base;
  color = mix(color, mid,  smoothstep(0.30, 0.70, n1));
  color = mix(color, blue * 0.55, smoothstep(0.45, 0.75, n2) * 0.65);
  color = mix(color, blue * 0.25, smoothstep(0.50, 0.80, n3) * 0.40);

  // Subtle radial vignette
  float vig = 1.0 - smoothstep(0.3, 1.2, length(uv - 0.5) * 1.8);
  color *= mix(0.65, 1.0, vig);

  gl_FragColor = vec4(color, 1.0);
}
`;

function compileShader(gl: WebGLRenderingContext, type: number, src: string) {
  const shader = gl.createShader(type)!;
  gl.shaderSource(shader, src);
  gl.compileShader(shader);
  return shader;
}

export function ShaderBackground({ className }: { className?: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const gl = canvas.getContext("webgl");
    if (!gl) return;

    const vert = compileShader(gl, gl.VERTEX_SHADER, VERT);
    const frag = compileShader(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vert);
    gl.attachShader(prog, frag);
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);

    const loc = gl.getAttribLocation(prog, "a_position");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const uTime = gl.getUniformLocation(prog, "u_time");
    const uRes  = gl.getUniformLocation(prog, "u_resolution");

    let raf: number;
    const resize = () => {
      canvas.width  = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      gl.viewport(0, 0, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    const start = performance.now();
    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000);
      gl.uniform2f(uRes, canvas.width, canvas.height);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className={className}
      style={{ display: "block", width: "100%", height: "100%" }}
    />
  );
}
