import { useEffect, useRef } from 'react'

// Flowing mesh gradient in the spirit of Stripe's hero, drawn with a tiny WebGL shader.
// Falls back to the CSS gradient on the wrapper when WebGL is unavailable, and draws a
// single still frame for visitors who prefer reduced motion.

const VERT = `attribute vec2 p;void main(){gl_Position=vec4(p,0.,1.);}`

const FRAG = `
precision mediump float;
uniform vec2 r;
uniform float t;
vec3 m289(vec3 x){return x-floor(x*(1./289.))*289.;}
vec2 m289(vec2 x){return x-floor(x*(1./289.))*289.;}
vec3 perm(vec3 x){return m289(((x*34.)+1.)*x);}
float snoise(vec2 v){
  const vec4 C=vec4(.211324865405187,.366025403784439,-.577350269189626,.024390243902439);
  vec2 i=floor(v+dot(v,C.yy));vec2 x0=v-i+dot(i,C.xx);
  vec2 i1=(x0.x>x0.y)?vec2(1.,0.):vec2(0.,1.);
  vec4 x12=x0.xyxy+C.xxzz;x12.xy-=i1;i=m289(i);
  vec3 p=perm(perm(i.y+vec3(0.,i1.y,1.))+i.x+vec3(0.,i1.x,1.));
  vec3 m=max(.5-vec3(dot(x0,x0),dot(x12.xy,x12.xy),dot(x12.zw,x12.zw)),0.);m=m*m;m=m*m;
  vec3 x=2.*fract(p*C.www)-1.;vec3 h=abs(x)-.5;vec3 ox=floor(x+.5);vec3 a0=x-ox;
  m*=1.79284291400159-.85373472095314*(a0*a0+h*h);
  vec3 g;g.x=a0.x*x0.x+h.x*x0.y;g.yz=a0.yz*x12.xz+h.yz*x12.yw;
  return 130.*dot(m,g);
}
void main(){
  vec2 uv=gl_FragCoord.xy/r;
  vec2 q=vec2(uv.x*r.x/r.y,uv.y)*.9;
  float s=t*.045;
  vec3 c0=vec3(.0,.72,.87);   // Taxlead cyan (#00b8de)
  vec3 c1=vec3(.12,.62,.88);  // deeper sky blue
  vec3 c2=vec3(.16,.96,.84);  // aqua-mint from the logo mark (#0affe0)
  vec3 c3=vec3(.33,.96,.56);  // logo green (#42fa94)
  vec3 c4=vec3(.82,.97,.28);  // logo lime-yellow (#c8ff00), softened
  vec3 col=c0;
  col=mix(col,c1,smoothstep(-.25,.55,snoise(q*vec2(.8,1.6)+vec2(s,-s*.6))));
  col=mix(col,c2,smoothstep(.0,.7,snoise(q*vec2(1.1,1.4)+vec2(-s*.8,s+3.))));
  col=mix(col,c3,smoothstep(.15,.85,snoise(q*vec2(.9,1.8)+vec2(s*.7+7.,-s*.4))));
  col=mix(col,c4,smoothstep(.35,.95,snoise(q*vec2(1.3,1.1)+vec2(-s*.5+11.,s*.8))));
  gl_FragColor=vec4(col,1.);
}`

export default function Gradient({ className = '' }) {
  const ref = useRef(null)

  useEffect(() => {
    const canvas = ref.current
    const gl = canvas.getContext('webgl', { antialias: false, premultipliedAlpha: false })
    if (!gl) return

    const shader = (type, src) => {
      const s = gl.createShader(type)
      gl.shaderSource(s, src)
      gl.compileShader(s)
      return s
    }
    const prog = gl.createProgram()
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT))
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG))
    gl.linkProgram(prog)
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return
    gl.useProgram(prog)

    gl.bindBuffer(gl.ARRAY_BUFFER, gl.createBuffer())
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW)
    const loc = gl.getAttribLocation(prog, 'p')
    gl.enableVertexAttribArray(loc)
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0)
    const uRes = gl.getUniformLocation(prog, 'r')
    const uTime = gl.getUniformLocation(prog, 't')

    // The gradient is soft, so half resolution looks identical and costs a quarter of the pixels.
    const resize = () => {
      const scale = Math.min(window.devicePixelRatio || 1, 2) * 0.5
      canvas.width = Math.max(1, Math.round(canvas.clientWidth * scale))
      canvas.height = Math.max(1, Math.round(canvas.clientHeight * scale))
      gl.viewport(0, 0, canvas.width, canvas.height)
      gl.uniform2f(uRes, canvas.width, canvas.height)
    }

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const start = performance.now() - 20000
    let raf = 0
    let visible = true

    const draw = () => {
      gl.uniform1f(uTime, (performance.now() - start) / 1000)
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4)
    }
    const loop = () => {
      draw()
      raf = visible && !reduced ? requestAnimationFrame(loop) : 0
    }

    resize()
    canvas.classList.add('ready')
    loop()

    const ro = new ResizeObserver(() => {
      resize()
      if (!raf) draw()
    })
    ro.observe(canvas)

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting
      if (visible && !raf && !reduced) loop()
    })
    io.observe(canvas)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      io.disconnect()
    }
  }, [])

  return <canvas ref={ref} className={`gradient-canvas ${className}`} aria-hidden="true" />
}
