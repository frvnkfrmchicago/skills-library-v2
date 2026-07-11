import { useRef, useEffect, useCallback } from 'react';
import './HeroBackdropWebGL.css';

const VS = `
attribute vec2 a_position;
varying vec2 vUv;
void main(){
  vUv = a_position * 0.5 + 0.5;
  gl_Position = vec4(a_position, 0.0, 1.0);
}
`;

const FS = `
precision highp float;
varying vec2 vUv;
uniform vec2 uRes;
uniform float uTime;
uniform vec2 uMouse;
uniform float uScroll;

float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453);}
float noise(vec2 p){
  vec2 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);
  return mix(mix(hash(i),hash(i+vec2(1,0)),f.x),mix(hash(i+vec2(0,1)),hash(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p){float v=0.0,a=0.5;for(int i=0;i<6;i++){v+=a*noise(p);p*=2.02;a*=0.48;}return v;}
vec3 softLight(vec3 b,vec3 a){return mix(2.0*a*b+b*b*(1.0-2.0*a),sqrt(b)*(2.0*a-1.0)+2.0*b*(1.0-a),step(0.5,a));}

void main(){
  vec2 uv=vUv;
  vec2 px=(uv*uRes-0.5*uRes)/min(uRes.x,uRes.y);
  vec2 m=(uMouse-0.5)*vec2(uRes.x/uRes.y,1.0);
  float md=length(px-m);
  float lens=smoothstep(0.65,0.0,md);
  uv+=(px-m)*lens*0.04;

  float t=uTime*0.07;
  vec2 p=px;
  vec2 warp=vec2(fbm(p*1.6+vec2(0.0,t)),fbm(p*1.6+vec2(2.0,-t)));
  p+=(warp-0.5)*0.9;
  float field=fbm(p*2.2+vec2(t,-t));
  float ridges=abs(field*2.0-1.0);
  ridges=pow(1.0-ridges,2.4);

  vec3 deep=vec3(0.055,0.058,0.071);
  vec3 blue=vec3(0.639,0.827,0.902);
  vec3 salmon=vec3(0.878,0.549,0.549);

  float scroll=clamp(uScroll,0.0,1.0);
  float phase=smoothstep(0.0,1.0,scroll);

  vec2 bPos=vec2(-0.28,-0.12)+vec2(0.09*sin(t*2.0),0.07*cos(t*1.6));
  vec2 sPos=vec2(0.24,0.10)+vec2(0.07*cos(t*2.1),0.09*sin(t*1.4));
  float bGlow=smoothstep(0.95,0.0,length(p-bPos))*(0.85+0.4*(1.0-phase));
  float sGlow=smoothstep(0.95,0.0,length(p-sPos))*(0.8+0.45*phase);

  vec3 col=deep;
  col+=blue*bGlow*0.38;
  col+=salmon*sGlow*0.32;

  float streak=pow(smoothstep(0.0,1.0,fbm(vec2(p.x*4.5,p.y*0.5)+t*0.5)),5.8)*0.24;
  vec3 ridgeCol=mix(blue,salmon,phase)*ridges*0.24;
  col+=ridgeCol+vec3(streak);

  float v=smoothstep(1.15,0.18,length(px));
  col=mix(deep,col,v);
  col=softLight(col,vec3(0.52+0.16*ridges));
  col=pow(col,vec3(0.97));

  gl_FragColor=vec4(col,1.0);
}
`;

type Props = { scrollProgress: number; reducedMotion: boolean };

export default function HeroBackdropWebGL({ scrollProgress, reducedMotion }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouse = useRef({ x: 0.5, y: 0.5 });
  const rafId = useRef(0);
  const uniforms = useRef<Record<string, WebGLUniformLocation | null>>({});

  const init = useCallback(() => {
    const cvs = canvasRef.current;
    if (!cvs) return () => {};
    const gl = cvs.getContext('webgl', { alpha: false, antialias: false });
    if (!gl) return () => {};

    function compile(type: number, src: string) {
      const s = gl!.createShader(type)!;
      gl!.shaderSource(s, src);
      gl!.compileShader(s);
      return s;
    }

    const prog = gl.createProgram()!;
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, 'a_position');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    const u = uniforms.current;
    u.uRes = gl.getUniformLocation(prog, 'uRes');
    u.uTime = gl.getUniformLocation(prog, 'uTime');
    u.uMouse = gl.getUniformLocation(prog, 'uMouse');
    u.uScroll = gl.getUniformLocation(prog, 'uScroll');

    const onMove = (e: PointerEvent) => {
      mouse.current.x = e.clientX / window.innerWidth;
      mouse.current.y = 1 - e.clientY / window.innerHeight;
    };
    window.addEventListener('pointermove', onMove);

    let t0 = performance.now();
    const draw = () => {
      const t = (performance.now() - t0) / 1000;
      const dpr = Math.min(window.devicePixelRatio, 1.5);
      cvs.width = window.innerWidth * dpr;
      cvs.height = window.innerHeight * dpr;
      cvs.style.width = `${window.innerWidth}px`;
      cvs.style.height = `${window.innerHeight}px`;
      gl!.viewport(0, 0, cvs.width, cvs.height);
      gl!.uniform2f(u.uRes, cvs.width, cvs.height);
      gl!.uniform1f(u.uTime, t);
      gl!.uniform2f(u.uMouse, mouse.current.x, mouse.current.y);
      gl!.uniform1f(u.uScroll, scrollProgress);
      gl!.drawArrays(gl!.TRIANGLE_STRIP, 0, 4);
      rafId.current = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(rafId.current);
      window.removeEventListener('pointermove', onMove);
    };
  }, [scrollProgress]);

  useEffect(() => {
    if (reducedMotion) return;
    const cleanup = init();
    return cleanup;
  }, [init, reducedMotion]);

  if (reducedMotion) {
    return <div className="heroBackdrop heroBackdrop--fallback" />;
  }

  return (
    <div className="heroBackdrop">
      <canvas ref={canvasRef} className="heroBackdrop__canvas" />
      <div className="heroBackdrop__veil" />
      <div className="heroBackdrop__grain" />
    </div>
  );
}
