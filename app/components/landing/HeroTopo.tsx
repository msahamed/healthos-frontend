"use client";

import { useEffect, useRef } from "react";
import * as THREE from "three";

export default function HeroTopo() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const host = canvas.parentElement as HTMLElement | null;
    if (!host) return;
    const hero =
      (canvas.closest(".hero") as HTMLElement | null) ?? host;

    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: false,
      });
    } catch {
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTime: { value: 0 },
      uRes: { value: new THREE.Vector2(1, 1) },
      uMouse: { value: new THREE.Vector2(-10, -10) },
      uPush: { value: 0 },
      uScroll: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      transparent: true,
      depthWrite: false,
      vertexShader: "void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }",
      fragmentShader: `
        precision highp float;
        uniform float uTime;
        uniform vec2  uRes;
        uniform vec2  uMouse;
        uniform float uPush;
        uniform float uScroll;

        float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
        float vnoise(vec2 p){
          vec2 i = floor(p), f = fract(p);
          vec2 u = f * f * (3.0 - 2.0 * f);
          return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x),
                     mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
        }
        float fbm(vec2 p){
          float v = 0.0, a = 0.55;
          for (int i = 0; i < 4; i++) {
            v += a * vnoise(p);
            p = p * 2.04 + vec2(13.7, 7.3);
            a *= 0.5;
          }
          return v;
        }

        void main(){
          vec2 uv = gl_FragCoord.xy / uRes;
          float aspect = uRes.x / uRes.y;
          vec2 p = vec2(uv.x * aspect, uv.y);

          float t = uTime * 0.045;
          float h = fbm(p * 1.7 + vec2(t, -t * 0.55 - uScroll));

          vec2 m = vec2(uMouse.x * aspect, uMouse.y);
          float d = distance(p, m);
          float bump = exp(-d * d * 10.0) * uPush;
          h += bump * 0.38;
          h += 0.05 * sin(d * 30.0 - uTime * 2.4) * exp(-d * 3.2) * uPush;

          float levels = 14.0;
          float lv = h * levels;
          float gMinor = min(fract(lv), 1.0 - fract(lv));
          float wMinor = fwidth(lv);
          float minor = 1.0 - smoothstep(0.0, wMinor * 1.6, gMinor);

          float lv4 = lv * 0.25;
          float gMajor = min(fract(lv4), 1.0 - fract(lv4));
          float wMajor = fwidth(lv4);
          float major = 1.0 - smoothstep(0.0, wMajor * 1.35, gMajor);

          float line = max(minor * 0.55, major);

          vec3 deep  = vec3(0.16, 0.42, 0.39);
          vec3 ridge = vec3(0.45, 0.78, 0.71);
          vec3 amber = vec3(0.965, 0.64, 0.16);
          float warm = clamp(bump * 2.6, 0.0, 1.0);
          vec3 col = mix(mix(deep, ridge, smoothstep(0.2, 0.9, h)), amber, warm);

          float alpha = line * (0.08 + 0.20 * h + 0.30 * warm);
          alpha += bump * 0.10;
          col = mix(col, amber, clamp(bump * 1.4, 0.0, 1.0) * 0.5);

          alpha *= 0.25 + 0.75 * smoothstep(0.05, 0.62, uv.x);
          alpha *= smoothstep(0.0, 0.07, uv.y) * smoothstep(1.0, 0.93, uv.y);

          gl_FragColor = vec4(col, alpha);
        }
      `,
    });
    (material as unknown as { extensions: { derivatives: boolean } }).extensions = {
      derivatives: true,
    };

    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), material);
    scene.add(mesh);

    let sizedW = 0;
    let sizedH = 0;
    const resize = () => {
      const w = host.clientWidth;
      const h = host.clientHeight;
      if (!w || !h) return;
      sizedW = w;
      sizedH = h;
      renderer.setSize(w, h, false);
      const db = renderer.getDrawingBufferSize(new THREE.Vector2());
      uniforms.uRes.value.copy(db);
    };
    resize();

    const ro =
      typeof ResizeObserver !== "undefined" ? new ResizeObserver(resize) : null;
    if (ro) ro.observe(host);
    else window.addEventListener("resize", resize);

    const target = { x: -10, y: -10, push: 0 };
    const onMove = (e: PointerEvent) => {
      const r = canvas.getBoundingClientRect();
      target.x = (e.clientX - r.left) / r.width;
      target.y = 1.0 - (e.clientY - r.top) / r.height;
      target.push = 1;
    };
    const onLeave = () => {
      target.push = 0;
    };
    hero.addEventListener("pointermove", onMove);
    hero.addEventListener("pointerleave", onLeave);

    let visible = true;
    const io =
      typeof IntersectionObserver !== "undefined"
        ? new IntersectionObserver((es) => {
            visible = es[0].isIntersecting;
          })
        : null;
    if (io) io.observe(hero);

    const clock = new THREE.Clock();
    let raf = 0;

    if (reduced) {
      const renderStatic = () => {
        if (host.clientWidth !== sizedW || host.clientHeight !== sizedH) resize();
        if (!sizedW || !sizedH) {
          raf = requestAnimationFrame(renderStatic);
          return;
        }
        uniforms.uTime.value = 8;
        renderer.render(scene, camera);
      };
      renderStatic();
    } else {
      const loop = () => {
        raf = requestAnimationFrame(loop);
        if (!visible || document.hidden) return;
        if (host.clientWidth !== sizedW || host.clientHeight !== sizedH) {
          resize();
          if (!sizedW || !sizedH) return;
        }
        uniforms.uTime.value = clock.getElapsedTime();
        uniforms.uScroll.value = window.scrollY * 0.0006;
        const m = uniforms.uMouse.value;
        m.x += (target.x - m.x) * 0.07;
        m.y += (target.y - m.y) * 0.07;
        uniforms.uPush.value += (target.push - uniforms.uPush.value) * 0.05;
        renderer.render(scene, camera);
      };
      loop();
    }

    return () => {
      cancelAnimationFrame(raf);
      hero.removeEventListener("pointermove", onMove);
      hero.removeEventListener("pointerleave", onLeave);
      if (ro) ro.disconnect();
      else window.removeEventListener("resize", resize);
      if (io) io.disconnect();
      mesh.geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  return (
    <div className="hero-topo-layer" aria-hidden="true">
      <canvas ref={canvasRef} className="hero-topo" />
    </div>
  );
}
