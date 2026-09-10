'use client';
import { useEffect, useRef, useState } from 'react';
import Image, { type ImageProps } from 'next/image';
import { useReducedMotion } from '@/lib/hooks/useReducedMotion';
import styles from './LiquidPhoto.module.css';

const VERTEX_SRC = `#version 300 es
out vec2 v_uv;
void main() {
  int id = gl_VertexID;
  float x = float((id << 1) & 2);
  float y = float(id & 2);
  vec2 pos = vec2(x, y);
  v_uv = pos;
  gl_Position = vec4(pos * 2.0 - 1.0, 0.0, 1.0);
}`;

// Domain-warp via a handful of summed sine waves rather than true noise
// (simplex/Perlin) -- fewer moving parts to get subtly wrong with no way
// to preview the render in this environment, and it reads as convincingly
// liquid at this scale (a photo settling into focus, not a full water
// simulation). u_progress is 0 at first paint (fully rippled) and eases
// to 1 as the photo scrolls into view (fully settled, zero displacement)
// -- amt = (1 - progress) so the shader is a no-op once settled.
const FRAGMENT_SRC = `#version 300 es
precision mediump float;
uniform sampler2D u_tex;
uniform float u_time;
uniform float u_progress;
uniform vec2 u_coverScale;
in vec2 v_uv;
out vec4 outColor;
void main() {
  vec2 tex = 0.5 + (v_uv - 0.5) * u_coverScale;
  float amt = 1.0 - u_progress;
  float wobble = amt * 0.045;
  tex.x += sin(tex.y * 9.0 + u_time * 0.6) * wobble;
  tex.y += cos(tex.x * 7.0 + u_time * 0.5) * wobble * 0.8;
  tex.x += sin(tex.y * 3.3 - u_time * 0.35) * wobble * 0.6;
  tex = clamp(tex, 0.0, 1.0);
  outColor = texture(u_tex, tex);
}`;

function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader | null {
  const shader = gl.createShader(type);
  if (!shader) return null;
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    gl.deleteShader(shader);
    return null;
  }
  return shader;
}

type Scene = {
  render: (time: number, progress: number) => void;
  dispose: () => void;
};

function buildScene(gl: WebGL2RenderingContext, source: TexImageSource, imgW: number, imgH: number): Scene | null {
  const vs = compile(gl, gl.VERTEX_SHADER, VERTEX_SRC);
  const fs = compile(gl, gl.FRAGMENT_SHADER, FRAGMENT_SRC);
  if (!vs || !fs) return null;

  const program = gl.createProgram();
  if (!program) return null;
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    gl.deleteProgram(program);
    return null;
  }

  const texture = gl.createTexture();
  if (!texture) {
    gl.deleteProgram(program);
    return null;
  }
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, source);

  const vao = gl.createVertexArray();
  gl.bindVertexArray(vao);

  const u_tex = gl.getUniformLocation(program, 'u_tex');
  const u_time = gl.getUniformLocation(program, 'u_time');
  const u_progress = gl.getUniformLocation(program, 'u_progress');
  const u_coverScale = gl.getUniformLocation(program, 'u_coverScale');

  gl.useProgram(program);
  gl.uniform1i(u_tex, 0);

  const imgAspect = imgW / imgH;

  return {
    render(time, progress) {
      const canvas = gl.canvas as HTMLCanvasElement;
      const w = canvas.width;
      const h = canvas.height;
      if (w === 0 || h === 0) return;
      const canvasAspect = w / h;
      const scaleX = imgAspect > canvasAspect ? canvasAspect / imgAspect : 1;
      const scaleY = imgAspect > canvasAspect ? 1 : imgAspect / canvasAspect;

      gl.viewport(0, 0, w, h);
      gl.useProgram(program);
      gl.bindVertexArray(vao);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.uniform1f(u_time, time);
      gl.uniform1f(u_progress, progress);
      gl.uniform2f(u_coverScale, scaleX, scaleY);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    },
    dispose() {
      gl.deleteTexture(texture);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}

/**
 * A photo that ripples into focus as it scrolls into view -- a lightweight
 * WebGL2 domain-warp of the photo's OWN real pixels (no added colour,
 * matches this site's "photography is the only colour on the page" rule).
 * Deliberately not a full 3D engine: one shader, one fullscreen triangle,
 * one texture -- the "efecto líquido en shaders 2D, sin motor 3D" scope.
 *
 * Strictly progressive enhancement, and defensively so: this environment
 * has no way to render a live preview before shipping, so the design
 * constraint is that ANY failure here (no WebGL2, a shader that fails to
 * compile, a thrown exception) must be invisible to the visitor. The
 * plain next/image <Image> below is ALWAYS rendered -- it is what LCP,
 * alt text, no-JS and no-WebGL visitors see -- and the canvas only
 * fades in (data-ready) after its first real frame has painted. Worst
 * case if something is wrong with the shader: the canvas simply never
 * appears and the photo looks exactly as it would without this component.
 */
type LiquidPhotoProps = ImageProps & {
  /** Applied to the canvas alongside its own styling, so a caller's
   * existing hover/focus scale rule for the plain <Image> (e.g.
   * `.card:hover .media`) also reaches this WebGL layer sitting on top
   * of it -- CSS Modules scope class names per file, so this is how the
   * two stay in visual lockstep without reaching across that boundary. */
  canvasClassName?: string;
};

export function LiquidPhoto({ canvasClassName, ...props }: LiquidPhotoProps) {
  const reducedMotion = useReducedMotion();
  const wrapRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (reducedMotion) return;
    const wrap = wrapRef.current;
    const img = imgRef.current;
    const canvas = canvasRef.current;
    if (!wrap || !img || !canvas) return;

    let raf = 0;
    let disposed = false;
    let io: IntersectionObserver | null = null;
    let ro: ResizeObserver | null = null;
    let scene: Scene | null = null;

    function boot() {
      try {
        if (!img!.naturalWidth || !img!.naturalHeight) return;
        const gl = canvas!.getContext('webgl2', { alpha: false, antialias: true });
        if (!gl) return;
        scene = buildScene(gl, img!, img!.naturalWidth, img!.naturalHeight);
        if (!scene) return;

        let progress = 0;
        let visible = false;
        let settled = false;

        io = new IntersectionObserver(
          (entries) => {
            for (const entry of entries) visible = entry.isIntersecting;
          },
          { threshold: 0 }
        );
        io.observe(wrap!);

        const resize = () => {
          const rect = wrap!.getBoundingClientRect();
          const dpr = Math.min(window.devicePixelRatio || 1, 2);
          canvas!.width = Math.max(1, Math.round(rect.width * dpr));
          canvas!.height = Math.max(1, Math.round(rect.height * dpr));
        };
        resize();
        ro = new ResizeObserver(resize);
        ro.observe(wrap!);

        const tick = (t: number) => {
          if (disposed || !scene) return;
          if (visible && progress < 1) {
            const rect = wrap!.getBoundingClientRect();
            const vh = window.innerHeight || 1;
            const raw = (vh - rect.top) / (vh * 0.55);
            progress = Math.max(progress, Math.min(1, raw));
          }
          scene.render(t / 1000, progress);
          if (!settled) {
            settled = true;
            setReady(true);
          }
          if (progress < 1) {
            raf = requestAnimationFrame(tick);
          }
        };
        raf = requestAnimationFrame(tick);
      } catch {
        // See the component doc comment: fail silent, plain image stands.
      }
    }

    if (img.complete) boot();
    else img.addEventListener('load', boot, { once: true });

    return () => {
      disposed = true;
      cancelAnimationFrame(raf);
      io?.disconnect();
      ro?.disconnect();
      scene?.dispose();
    };
  }, [reducedMotion]);

  return (
    <div ref={wrapRef} className={styles.wrap}>
      {/* eslint-disable-next-line jsx-a11y/alt-text -- `alt` is a required
          field of ImageProps (LiquidPhotoProps extends it), so every
          caller is already forced to pass one at the type level; the
          lint rule just can't see through the {...props} spread. */}
      <Image {...props} ref={imgRef} />
      <canvas
        ref={canvasRef}
        className={canvasClassName ? `${styles.canvas} ${canvasClassName}` : styles.canvas}
        data-ready={ready ? 'true' : 'false'}
        aria-hidden="true"
      />
    </div>
  );
}
