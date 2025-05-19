// Save this as FluidCursorEffect.tsx in your components directory
import React, { useEffect, useRef } from 'react';

interface FluidCursorEffectProps {
    zIndex?: number;
}

interface PointerPrototype {
    id: number;
    texcoordX: number;
    texcoordY: number;
    prevTexcoordX: number;
    prevTexcoordY: number;
    deltaX: number;
    deltaY: number;
    down: boolean;
    moved: boolean;
    color: Color;
}

interface Color {
    r: number;
    g: number;
    b: number;
}

interface Resolution {
    width: number;
    height: number;
}

interface Config {
    SIM_RESOLUTION: number;
    DYE_RESOLUTION: number;
    CAPTURE_RESOLUTION: number;
    DENSITY_DISSIPATION: number;
    VELOCITY_DISSIPATION: number;
    PRESSURE: number;
    PRESSURE_ITERATIONS: number;
    CURL: number;
    SPLAT_RADIUS: number;
    SPLAT_FORCE: number;
    SHADING: boolean;
    COLOR_UPDATE_SPEED: number;
    PAUSED: boolean;
    BACK_COLOR: { r: number; g: number; b: number };
    TRANSPARENT: boolean;
}

interface TextureFormat {
    internalFormat: number;
    format: number;
}

interface ExtensionFormats {
    formatRGBA: TextureFormat;
    formatRG: TextureFormat;
    formatR: TextureFormat;
    halfFloatTexType: number;
    supportLinearFiltering: boolean;
}

interface WebGLContext {
    gl: WebGLRenderingContext;
    ext: ExtensionFormats;
}

interface FBO {
    texture: WebGLTexture;
    fbo: WebGLFramebuffer;
    width: number;
    height: number;
    texelSizeX: number;
    texelSizeY: number;
    attach(id: number): number;
}

interface DoubleFBO {
    width: number;
    height: number;
    texelSizeX: number;
    texelSizeY: number;
    read: FBO;
    write: FBO;
    swap(): void;
}

interface MaterialUniforms {
    [key: string]: WebGLUniformLocation | null;
}

interface ProgramClass {
    uniforms: MaterialUniforms;
    program: WebGLProgram;
    bind(): void;
}

const FluidCursorEffect: React.FC<FluidCursorEffectProps> = ({ zIndex = -1 }) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);

    useEffect(() => {
        if (!canvasRef.current) return;

        // Initialize the fluid simulation
        const cleanup = initFluid();

        function initFluid(): () => void {
            // Canvas setup
            const canvas = canvasRef.current;
            if (!canvas) return () => {};

            resizeCanvas();

            // Configuration options with amber/purple theme
            let config: Config = {
                SIM_RESOLUTION: 128,
                DYE_RESOLUTION: 1440,
                CAPTURE_RESOLUTION: 512,
                DENSITY_DISSIPATION: 3.5,
                VELOCITY_DISSIPATION: 2,
                PRESSURE: 0.1,
                PRESSURE_ITERATIONS: 20,
                CURL: 10,
                SPLAT_RADIUS: 0.3,
                SPLAT_FORCE: 6000,
                SHADING: true,
                COLOR_UPDATE_SPEED: 10,
                PAUSED: false,
                BACK_COLOR: { r: 0, g: 0, b: 0 },
                TRANSPARENT: true,
            };

            // Pointer prototype for tracking mouse/touch movements
            function pointerPrototype(): PointerPrototype {
                return {
                    id: -1,
                    texcoordX: 0,
                    texcoordY: 0,
                    prevTexcoordX: 0,
                    prevTexcoordY: 0,
                    deltaX: 0,
                    deltaY: 0,
                    down: false,
                    moved: false,
                    color: { r: 30, g: 0, b: 300 } // Amber/purple theme
                };
            }

            let pointers: PointerPrototype[] = [];
            pointers.push(pointerPrototype());

            // Setup WebGL context
            const webGLContext = getWebGLContext(canvas);
            if (!webGLContext) return () => {};
            const { gl, ext } = webGLContext;

            if (!ext.supportLinearFiltering) {
                config.DYE_RESOLUTION = 512;
                config.SHADING = false;
            }

            // Get WebGL context with appropriate parameters
            function getWebGLContext(canvas: HTMLCanvasElement): WebGLContext | null {
                const params: WebGLContextAttributes = {
                    alpha: true,
                    depth: false,
                    stencil: false,
                    antialias: false,
                    preserveDrawingBuffer: false
                };

                let gl = canvas.getContext('webgl2', params) as WebGL2RenderingContext;
                const isWebGL2 = !!gl;
                if (!isWebGL2) {
                    // @ts-ignore
                    gl = (canvas.getContext('webgl', params) ||
                        canvas.getContext('experimental-webgl', params)) as WebGLRenderingContext;
                }

                if (!gl) return null;

                let halfFloat: any;
                let supportLinearFiltering: any;
                if (isWebGL2) {
                    gl.getExtension('EXT_color_buffer_float');
                    supportLinearFiltering = gl.getExtension('OES_texture_float_linear');
                } else {
                    halfFloat = gl.getExtension('OES_texture_half_float');
                    supportLinearFiltering = gl.getExtension('OES_texture_half_float_linear');
                }

                gl.clearColor(0.0, 0.0, 0.0, 1.0);

                const halfFloatTexType = isWebGL2 ? gl.HALF_FLOAT : halfFloat.HALF_FLOAT_OES;
                let formatRGBA: TextureFormat;
                let formatRG: TextureFormat;
                let formatR: TextureFormat;

                if (isWebGL2) {
                    formatRGBA = getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, halfFloatTexType);
                    formatRG = getSupportedFormat(gl, gl.RG16F, gl.RG, halfFloatTexType);
                    formatR = getSupportedFormat(gl, gl.R16F, gl.RED, halfFloatTexType);
                } else {
                    formatRGBA = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                    formatRG = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                    formatR = getSupportedFormat(gl, gl.RGBA, gl.RGBA, halfFloatTexType);
                }

                if (!formatRGBA || !formatRG || !formatR) return null;

                return {
                    gl,
                    ext: {
                        formatRGBA,
                        formatRG,
                        formatR,
                        halfFloatTexType,
                        supportLinearFiltering: !!supportLinearFiltering
                    }
                };
            }

            // Helper function to get supported WebGL formats
            function getSupportedFormat(
                gl: WebGLRenderingContext,
                internalFormat: number,
                format: number,
                type: number
            ): TextureFormat | null {
                if (!supportRenderTextureFormat(gl, internalFormat, format, type)) {
                    switch (internalFormat) {
                        // @ts-ignore
                        case gl.R16F:
                            // @ts-ignore
                            return getSupportedFormat(gl, gl.RG16F, gl.RG, type);
                        // @ts-ignore
                        case gl.RG16F:
                            // @ts-ignore
                            return getSupportedFormat(gl, gl.RGBA16F, gl.RGBA, type);
                        default:
                            return null;
                    }
                }

                return {
                    internalFormat,
                    format
                };
            }

            // Check if texture format is supported
            function supportRenderTextureFormat(
                gl: WebGLRenderingContext,
                internalFormat: number,
                format: number,
                type: number
            ): boolean {
                let texture = gl.createTexture();
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, 4, 4, 0, format, type, null);

                let fbo = gl.createFramebuffer();
                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

                let status = gl.checkFramebufferStatus(gl.FRAMEBUFFER);
                return status === gl.FRAMEBUFFER_COMPLETE;
            }

            // Material class for shader programs
            class Material {
                vertexShader: WebGLShader;
                fragmentShaderSource: string;
                programs: Record<number, WebGLProgram>;
                activeProgram: WebGLProgram | null;
                uniforms: MaterialUniforms;

                constructor(vertexShader: WebGLShader, fragmentShaderSource: string) {
                    this.vertexShader = vertexShader;
                    this.fragmentShaderSource = fragmentShaderSource;
                    this.programs = {};
                    this.activeProgram = null;
                    this.uniforms = {};
                }

                setKeywords(keywords: string[]): void {
                    let hash = 0;
                    for (let i = 0; i < keywords.length; i++)
                        hash += hashCode(keywords[i]);

                    let program = this.programs[hash];
                    if (program == null) {
                        let fragmentShader = compileShader(gl.FRAGMENT_SHADER, this.fragmentShaderSource, keywords);
                        program = createProgram(this.vertexShader, fragmentShader);
                        this.programs[hash] = program;
                    }

                    if (program === this.activeProgram) return;

                    this.uniforms = getUniforms(program);
                    this.activeProgram = program;
                }

                bind(): void {
                    if (this.activeProgram) {
                        gl.useProgram(this.activeProgram);
                    }
                }
            }

            // Program class for shader programs
            class Program implements ProgramClass {
                uniforms: MaterialUniforms;
                program: WebGLProgram;

                constructor(vertexShader: WebGLShader, fragmentShader: WebGLShader) {
                    this.uniforms = {};
                    const program = createProgram(vertexShader, fragmentShader);
                    if (!program) throw new Error("Failed to create program");
                    this.program = program;
                    this.uniforms = getUniforms(this.program);
                }

                bind(): void {
                    gl.useProgram(this.program);
                }
            }

            // Create WebGL program
            function createProgram(vertexShader: WebGLShader, fragmentShader: WebGLShader): WebGLProgram | null {
                let program = gl.createProgram();
                if (!program) return null;

                gl.attachShader(program, vertexShader);
                gl.attachShader(program, fragmentShader);
                gl.linkProgram(program);

                if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                    console.trace(gl.getProgramInfoLog(program));
                    return null;
                }

                return program;
            }

            // Get uniforms from program
            function getUniforms(program: WebGLProgram): MaterialUniforms {
                let uniforms: MaterialUniforms = {};
                let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
                for (let i = 0; i < uniformCount; i++) {
                    const uniformInfo = gl.getActiveUniform(program, i);
                    if (!uniformInfo) continue;
                    let uniformName = uniformInfo.name;
                    uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
                }
                return uniforms;
            }

            // Compile shader
            function compileShader(type: number, source: string, keywords: string[] | null = null): WebGLShader {
                source = addKeywords(source, keywords);

                const shader = gl.createShader(type);
                if (!shader) throw new Error("Failed to create shader");

                gl.shaderSource(shader, source);
                gl.compileShader(shader);

                if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                    console.trace(gl.getShaderInfoLog(shader));
                }

                return shader;
            }

            // Add keywords to shader source
            function addKeywords(source: string, keywords: string[] | null): string {
                if (keywords == null) return source;
                let keywordsString = '';
                keywords.forEach(keyword => {
                    keywordsString += '#define ' + keyword + '\n';
                });

                return keywordsString + source;
            }

            // Shader sources
            const baseVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;

        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            vL = vUv - vec2(texelSize.x, 0.0);
            vR = vUv + vec2(texelSize.x, 0.0);
            vT = vUv + vec2(0.0, texelSize.y);
            vB = vUv - vec2(0.0, texelSize.y);
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `);

            const blurVertexShader = compileShader(gl.VERTEX_SHADER, `
        precision highp float;

        attribute vec2 aPosition;
        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        uniform vec2 texelSize;

        void main () {
            vUv = aPosition * 0.5 + 0.5;
            float offset = 1.33333333;
            vL = vUv - texelSize * offset;
            vR = vUv + texelSize * offset;
            gl_Position = vec4(aPosition, 0.0, 1.0);
        }
      `);

            const blurShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        uniform sampler2D uTexture;

        void main () {
            vec4 sum = texture2D(uTexture, vUv) * 0.29411764;
            sum += texture2D(uTexture, vL) * 0.35294117;
            sum += texture2D(uTexture, vR) * 0.35294117;
            gl_FragColor = sum;
        }
      `);

            const copyShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        uniform sampler2D uTexture;

        void main () {
            gl_FragColor = texture2D(uTexture, vUv);
        }
      `);

            const clearShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        uniform sampler2D uTexture;
        uniform float value;

        void main () {
            gl_FragColor = value * texture2D(uTexture, vUv);
        }
      `);

            const colorShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;

        uniform vec4 color;

        void main () {
            gl_FragColor = color;
        }
      `);

            const displayShaderSource = `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uTexture;
        uniform sampler2D uDithering;
        uniform vec2 ditherScale;
        uniform vec2 texelSize;

        vec3 linearToGamma (vec3 color) {
            color = max(color, vec3(0));
            return max(1.055 * pow(color, vec3(0.416666667)) - 0.055, vec3(0));
        }

        void main () {
            vec3 c = texture2D(uTexture, vUv).rgb;

        #ifdef SHADING
            vec3 lc = texture2D(uTexture, vL).rgb;
            vec3 rc = texture2D(uTexture, vR).rgb;
            vec3 tc = texture2D(uTexture, vT).rgb;
            vec3 bc = texture2D(uTexture, vB).rgb;

            float dx = length(rc) - length(lc);
            float dy = length(tc) - length(bc);

            vec3 n = normalize(vec3(dx, dy, length(texelSize)));
            vec3 l = vec3(0.0, 0.0, 1.0);

            float diffuse = clamp(dot(n, l) + 0.7, 0.7, 1.0);
            c *= diffuse;
        #endif

            float a = max(c.r, max(c.g, c.b));
            gl_FragColor = vec4(c, a);
        }
      `;

            const splatShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uTarget;
        uniform float aspectRatio;
        uniform vec3 color;
        uniform vec2 point;
        uniform float radius;

        void main () {
            vec2 p = vUv - point.xy;
            p.x *= aspectRatio;
            vec3 splat = exp(-dot(p, p) / radius) * color;
            vec3 base = texture2D(uTarget, vUv).xyz;
            gl_FragColor = vec4(base + splat, 1.0);
        }
      `);

            const advectionShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        uniform sampler2D uVelocity;
        uniform sampler2D uSource;
        uniform vec2 texelSize;
        uniform vec2 dyeTexelSize;
        uniform float dt;
        uniform float dissipation;

        vec4 bilerp (sampler2D sam, vec2 uv, vec2 tsize) {
            vec2 st = uv / tsize - 0.5;

            vec2 iuv = floor(st);
            vec2 fuv = fract(st);

            vec4 a = texture2D(sam, (iuv + vec2(0.5, 0.5)) * tsize);
            vec4 b = texture2D(sam, (iuv + vec2(1.5, 0.5)) * tsize);
            vec4 c = texture2D(sam, (iuv + vec2(0.5, 1.5)) * tsize);
            vec4 d = texture2D(sam, (iuv + vec2(1.5, 1.5)) * tsize);

            return mix(mix(a, b, fuv.x), mix(c, d, fuv.x), fuv.y);
        }

        void main () {
        #ifdef MANUAL_FILTERING
            vec2 coord = vUv - dt * bilerp(uVelocity, vUv, texelSize).xy * texelSize;
            vec4 result = bilerp(uSource, coord, dyeTexelSize);
        #else
            vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
            vec4 result = texture2D(uSource, coord);
        #endif
            float decay = 1.0 + dissipation * dt;
            gl_FragColor = result / decay;
        }`,
                ext.supportLinearFiltering ? null : ['MANUAL_FILTERING']
            );

            const divergenceShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).x;
            float R = texture2D(uVelocity, vR).x;
            float T = texture2D(uVelocity, vT).y;
            float B = texture2D(uVelocity, vB).y;

            vec2 C = texture2D(uVelocity, vUv).xy;
            if (vL.x < 0.0) { L = -C.x; }
            if (vR.x > 1.0) { R = -C.x; }
            if (vT.y > 1.0) { T = -C.y; }
            if (vB.y < 0.0) { B = -C.y; }

            float div = 0.5 * (R - L + T - B);
            gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
        }
      `);

            const curlShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uVelocity, vL).y;
            float R = texture2D(uVelocity, vR).y;
            float T = texture2D(uVelocity, vT).x;
            float B = texture2D(uVelocity, vB).x;
            float vorticity = R - L - T + B;
            gl_FragColor = vec4(0.5 * vorticity, 0.0, 0.0, 1.0);
        }
      `);

            const vorticityShader = compileShader(gl.FRAGMENT_SHADER, `
        precision highp float;
        precision highp sampler2D;

        varying vec2 vUv;
        varying vec2 vL;
        varying vec2 vR;
        varying vec2 vT;
        varying vec2 vB;
        uniform sampler2D uVelocity;
        uniform sampler2D uCurl;
        uniform float curl;
        uniform float dt;

        void main () {
            float L = texture2D(uCurl, vL).x;
            float R = texture2D(uCurl, vR).x;
            float T = texture2D(uCurl, vT).x;
            float B = texture2D(uCurl, vB).x;
            float C = texture2D(uCurl, vUv).x;

            vec2 force = 0.5 * vec2(abs(T) - abs(B), abs(R) - abs(L));
            force /= length(force) + 0.0001;
            force *= curl * C;
            force.y *= -1.0;

            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity += force * dt;
            velocity = min(max(velocity, -1000.0), 1000.0);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `);

            const pressureShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uDivergence;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            float C = texture2D(uPressure, vUv).x;
            float divergence = texture2D(uDivergence, vUv).x;
            float pressure = (L + R + B + T - divergence) * 0.25;
            gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
        }
      `);

            const gradientSubtractShader = compileShader(gl.FRAGMENT_SHADER, `
        precision mediump float;
        precision mediump sampler2D;

        varying highp vec2 vUv;
        varying highp vec2 vL;
        varying highp vec2 vR;
        varying highp vec2 vT;
        varying highp vec2 vB;
        uniform sampler2D uPressure;
        uniform sampler2D uVelocity;

        void main () {
            float L = texture2D(uPressure, vL).x;
            float R = texture2D(uPressure, vR).x;
            float T = texture2D(uPressure, vT).x;
            float B = texture2D(uPressure, vB).x;
            vec2 velocity = texture2D(uVelocity, vUv).xy;
            velocity.xy -= vec2(R - L, T - B);
            gl_FragColor = vec4(velocity, 0.0, 1.0);
        }
      `);

            // Blit function to render
            const blit = (() => {
                const buffer = gl.createBuffer();
                gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
                gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, -1, 1, 1, 1, 1, -1]), gl.STATIC_DRAW);

                const indexBuffer = gl.createBuffer();
                gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array([0, 1, 2, 0, 2, 3]), gl.STATIC_DRAW);

                gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
                gl.enableVertexAttribArray(0);

                return (target: FBO | null = null, clear: boolean = false) => {
                    if (target == null) {
                        gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
                    } else {
                        gl.viewport(0, 0, target.width, target.height);
                        gl.bindFramebuffer(gl.FRAMEBUFFER, target.fbo);
                    }
                    if (clear) {
                        gl.clearColor(0.0, 0.0, 0.0, 1.0);
                        gl.clear(gl.COLOR_BUFFER_BIT);
                    }
                    gl.drawElements(gl.TRIANGLES, 6, gl.UNSIGNED_SHORT, 0);
                };
            })();

            // Initialize variables
            let dye: DoubleFBO;
            let velocity: DoubleFBO;
            let divergence: FBO;
            let curl: FBO;
            let pressure: DoubleFBO;

            // Create shader programs
            const blurProgram = new Program(blurVertexShader, blurShader);
            const copyProgram = new Program(baseVertexShader, copyShader);
            const clearProgram = new Program(baseVertexShader, clearShader);
            const colorProgram = new Program(baseVertexShader, colorShader);
            const splatProgram = new Program(baseVertexShader, splatShader);
            const advectionProgram = new Program(baseVertexShader, advectionShader);
            const divergenceProgram = new Program(baseVertexShader, divergenceShader);
            const curlProgram = new Program(baseVertexShader, curlShader);
            const vorticityProgram = new Program(baseVertexShader, vorticityShader);
            const pressureProgram = new Program(baseVertexShader, pressureShader);
            const gradienSubtractProgram = new Program(baseVertexShader, gradientSubtractShader);

            const displayMaterial = new Material(baseVertexShader, displayShaderSource);

            // Initialize framebuffers
            function initFramebuffers(): void {
                let simRes = getResolution(config.SIM_RESOLUTION);
                let dyeRes = getResolution(config.DYE_RESOLUTION);

                const texType = ext.halfFloatTexType;
                const rgba = ext.formatRGBA;
                const rg = ext.formatRG;
                const r = ext.formatR;
                const filtering = ext.supportLinearFiltering ? gl.LINEAR : gl.NEAREST;

                gl.disable(gl.BLEND);

                if (typeof dye === 'undefined')
                    dye = createDoubleFBO(dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);
                else
                    dye = resizeDoubleFBO(dye, dyeRes.width, dyeRes.height, rgba.internalFormat, rgba.format, texType, filtering);

                if (typeof velocity === 'undefined')
                    velocity = createDoubleFBO(simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);
                else
                    velocity = resizeDoubleFBO(velocity, simRes.width, simRes.height, rg.internalFormat, rg.format, texType, filtering);

                divergence = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
                curl = createFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
                pressure = createDoubleFBO(simRes.width, simRes.height, r.internalFormat, r.format, texType, gl.NEAREST);
            }

            // Create FBO (Framebuffer Object)
            function createFBO(
                w: number,
                h: number,
                internalFormat: number,
                format: number,
                type: number,
                param: number
            ): FBO {
                gl.activeTexture(gl.TEXTURE0);
                const texture = gl.createTexture();
                if (!texture) throw new Error("Failed to create texture");

                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, param);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, param);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texImage2D(gl.TEXTURE_2D, 0, internalFormat, w, h, 0, format, type, null);

                const fbo = gl.createFramebuffer();
                if (!fbo) throw new Error("Failed to create framebuffer");

                gl.bindFramebuffer(gl.FRAMEBUFFER, fbo);
                gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
                gl.viewport(0, 0, w, h);
                gl.clear(gl.COLOR_BUFFER_BIT);

                const texelSizeX = 1.0 / w;
                const texelSizeY = 1.0 / h;

                return {
                    texture,
                    fbo,
                    width: w,
                    height: h,
                    texelSizeX,
                    texelSizeY,
                    attach(id: number): number {
                        gl.activeTexture(gl.TEXTURE0 + id);
                        gl.bindTexture(gl.TEXTURE_2D, texture);
                        return id;
                    }
                };
            }

            // Create double FBO for ping-pong rendering
            function createDoubleFBO(
                w: number,
                h: number,
                internalFormat: number,
                format: number,
                type: number,
                param: number
            ): DoubleFBO {
                let fbo1 = createFBO(w, h, internalFormat, format, type, param);
                let fbo2 = createFBO(w, h, internalFormat, format, type, param);

                return {
                    width: w,
                    height: h,
                    texelSizeX: fbo1.texelSizeX,
                    texelSizeY: fbo1.texelSizeY,
                    get read(): FBO {
                        return fbo1;
                    },
                    set read(value: FBO) {
                        fbo1 = value;
                    },
                    get write(): FBO {
                        return fbo2;
                    },
                    set write(value: FBO) {
                        fbo2 = value;
                    },
                    swap(): void {
                        const temp = fbo1;
                        fbo1 = fbo2;
                        fbo2 = temp;
                    }
                };
            }

            // Resize FBO
            function resizeFBO(
                target: FBO,
                w: number,
                h: number,
                internalFormat: number,
                format: number,
                type: number,
                param: number
            ): FBO {
                const newFBO = createFBO(w, h, internalFormat, format, type, param);
                copyProgram.bind();
                gl.uniform1i(copyProgram.uniforms.uTexture, target.attach(0));
                blit(newFBO);
                return newFBO;
            }

            // Resize double FBO
            function resizeDoubleFBO(
                target: DoubleFBO,
                w: number,
                h: number,
                internalFormat: number,
                format: number,
                type: number,
                param: number
            ): DoubleFBO {
                if (target.width === w && target.height === h)
                    return target;
                target.read = resizeFBO(target.read, w, h, internalFormat, format, type, param);
                target.write = createFBO(w, h, internalFormat, format, type, param);
                target.width = w;
                target.height = h;
                target.texelSizeX = 1.0 / w;
                target.texelSizeY = 1.0 / h;
                return target;
            }

            // Update shader keywords
            function updateKeywords(): void {
                let displayKeywords: string[] = [];
                if (config.SHADING) displayKeywords.push("SHADING");
                displayMaterial.setKeywords(displayKeywords);
            }

            // Initialize
            updateKeywords();
            initFramebuffers();

            let lastUpdateTime = Date.now();
            let colorUpdateTimer = 0.0;
            let animationFrameId: number;

            // Main update loop
            function update(): void {
                const dt = calcDeltaTime();
                if (resizeCanvas())
                    initFramebuffers();
                updateColors(dt);
                applyInputs();
                step(dt);
                render(null);
                animationFrameId = requestAnimationFrame(update);
            }

            // Calculate delta time
            function calcDeltaTime(): number {
                const now = Date.now();
                let dt = (now - lastUpdateTime) / 1000;
                dt = Math.min(dt, 0.016666);
                lastUpdateTime = now;
                return dt;
            }

            // Resize canvas
            function resizeCanvas(): boolean {
                if (!canvas) return false;

                const width = scaleByPixelRatio(canvas.clientWidth);
                const height = scaleByPixelRatio(canvas.clientHeight);
                if (canvas.width !== width || canvas.height !== height) {
                    canvas.width = width;
                    canvas.height = height;
                    return true;
                }
                return false;
            }

            // Update colors
            function updateColors(dt: number): void {
                colorUpdateTimer += dt * config.COLOR_UPDATE_SPEED;
                if (colorUpdateTimer >= 1) {
                    colorUpdateTimer = wrap(colorUpdateTimer, 0, 1);
                    pointers.forEach(p => {
                        p.color = generateColor();
                    });
                }
            }

            // Apply inputs
            function applyInputs(): void {
                pointers.forEach(p => {
                    if (p.moved) {
                        p.moved = false;
                        splatPointer(p);
                    }
                });
            }

            // Simulation step
            function step(dt: number): void {
                gl.disable(gl.BLEND);

                curlProgram.bind();
                gl.uniform2f(curlProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl.uniform1i(curlProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(curl);

                vorticityProgram.bind();
                gl.uniform2f(vorticityProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl.uniform1i(vorticityProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl.uniform1i(vorticityProgram.uniforms.uCurl, curl.attach(1));
                gl.uniform1f(vorticityProgram.uniforms.curl, config.CURL);
                gl.uniform1f(vorticityProgram.uniforms.dt, dt);
                blit(velocity.write);
                velocity.swap();

                divergenceProgram.bind();
                gl.uniform2f(divergenceProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl.uniform1i(divergenceProgram.uniforms.uVelocity, velocity.read.attach(0));
                blit(divergence);

                clearProgram.bind();
                gl.uniform1i(clearProgram.uniforms.uTexture, pressure.read.attach(0));
                gl.uniform1f(clearProgram.uniforms.value, config.PRESSURE);
                blit(pressure.write);
                pressure.swap();

                pressureProgram.bind();
                gl.uniform2f(pressureProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl.uniform1i(pressureProgram.uniforms.uDivergence, divergence.attach(0));
                for (let i = 0; i < config.PRESSURE_ITERATIONS; i++) {
                    gl.uniform1i(pressureProgram.uniforms.uPressure, pressure.read.attach(1));
                    blit(pressure.write);
                    pressure.swap();
                }

                gradienSubtractProgram.bind();
                gl.uniform2f(gradienSubtractProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                gl.uniform1i(gradienSubtractProgram.uniforms.uPressure, pressure.read.attach(0));
                gl.uniform1i(gradienSubtractProgram.uniforms.uVelocity, velocity.read.attach(1));
                blit(velocity.write);
                velocity.swap();

                advectionProgram.bind();
                gl.uniform2f(advectionProgram.uniforms.texelSize, velocity.texelSizeX, velocity.texelSizeY);
                if (!ext.supportLinearFiltering)
                    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, velocity.texelSizeX, velocity.texelSizeY);
                let velocityId = velocity.read.attach(0);
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocityId);
                gl.uniform1i(advectionProgram.uniforms.uSource, velocityId);
                gl.uniform1f(advectionProgram.uniforms.dt, dt);
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.VELOCITY_DISSIPATION);
                blit(velocity.write);
                velocity.swap();

                if (!ext.supportLinearFiltering)
                    gl.uniform2f(advectionProgram.uniforms.dyeTexelSize, dye.texelSizeX, dye.texelSizeY);
                gl.uniform1i(advectionProgram.uniforms.uVelocity, velocity.read.attach(0));
                gl.uniform1i(advectionProgram.uniforms.uSource, dye.read.attach(1));
                gl.uniform1f(advectionProgram.uniforms.dissipation, config.DENSITY_DISSIPATION);
                blit(dye.write);
                dye.swap();
            }

            // Render
            function render(target: FBO | null): void {
                gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                gl.enable(gl.BLEND);
                drawDisplay(target);
            }

            // Draw to display
            function drawDisplay(target: FBO | null): void {
                const width = target == null ? gl.drawingBufferWidth : target.width;
                const height = target == null ? gl.drawingBufferHeight : target.height;

                displayMaterial.bind();
                if (config.SHADING)
                    gl.uniform2f(displayMaterial.uniforms.texelSize, 1.0 / width, 1.0 / height);
                gl.uniform1i(displayMaterial.uniforms.uTexture, dye.read.attach(0));
                blit(target);
            }

            // Splat pointer
            function splatPointer(pointer: PointerPrototype): void {
                const dx = pointer.deltaX * config.SPLAT_FORCE;
                const dy = pointer.deltaY * config.SPLAT_FORCE;
                splat(pointer.texcoordX, pointer.texcoordY, dx, dy, pointer.color);
            }

            // Click splat
            function clickSplat(pointer: PointerPrototype): void {
                const color = generateColor();
                color.r *= 10.0;
                color.g *= 10.0;
                color.b *= 10.0;
                const dx = 10 * (Math.random() - 0.5);
                const dy = 30 * (Math.random() - 0.5);
                splat(pointer.texcoordX, pointer.texcoordY, dx, dy, color);
            }

            // Splat
            function splat(x: number, y: number, dx: number, dy: number, color: Color): void {
                splatProgram.bind();
                gl.uniform1i(splatProgram.uniforms.uTarget, velocity.read.attach(0));
                gl.uniform1f(splatProgram.uniforms.aspectRatio, canvas ? canvas.width / canvas.height : 1);
                gl.uniform2f(splatProgram.uniforms.point, x, y);
                gl.uniform3f(splatProgram.uniforms.color, dx, dy, 0.0);
                gl.uniform1f(splatProgram.uniforms.radius, correctRadius(config.SPLAT_RADIUS / 100.0));
                blit(velocity.write);
                velocity.swap();

                gl.uniform1i(splatProgram.uniforms.uTarget, dye.read.attach(0));
                gl.uniform3f(splatProgram.uniforms.color, color.r, color.g, color.b);
                blit(dye.write);
                dye.swap();
            }

            // Correct radius
            function correctRadius(radius: number): number {
                if (!canvas) return radius;

                let aspectRatio = canvas.width / canvas.height;
                if (aspectRatio > 1)
                    radius *= aspectRatio;
                return radius;
            }

            // Event handler types
            type MouseEventHandler = (e: MouseEvent) => void;
            type TouchEventHandler = (e: TouchEvent) => void;

            // Mouse and touch event handlers
            const handleMouseDown: MouseEventHandler = (e) => {
                if (!canvas) return;

                let pointer = pointers[0];
                let posX = scaleByPixelRatio(e.clientX);
                let posY = scaleByPixelRatio(e.clientY);
                updatePointerDownData(pointer, -1, posX, posY);
                clickSplat(pointer);
            };

            const handleMouseMove: MouseEventHandler = (e) => {
                let pointer = pointers[0];
                let posX = scaleByPixelRatio(e.clientX);
                let posY = scaleByPixelRatio(e.clientY);
                updatePointerMoveData(pointer, posX, posY, pointer.color);
            };

            const handleTouchStart: TouchEventHandler = (e) => {
                const touches = e.targetTouches;
                let pointer = pointers[0];
                for (let i = 0; i < touches.length; i++) {
                    let posX = scaleByPixelRatio(touches[i].clientX);
                    let posY = scaleByPixelRatio(touches[i].clientY);
                    updatePointerDownData(pointer, touches[i].identifier, posX, posY);
                }
            };

            const handleTouchMove: TouchEventHandler = (e) => {
                const touches = e.targetTouches;
                let pointer = pointers[0];
                for (let i = 0; i < touches.length; i++) {
                    let posX = scaleByPixelRatio(touches[i].clientX);
                    let posY = scaleByPixelRatio(touches[i].clientY);
                    updatePointerMoveData(pointer, posX, posY, pointer.color);
                }
            };

            const handleTouchEnd: TouchEventHandler = (e) => {
                const touches = e.changedTouches;
                let pointer = pointers[0];

                for (let i = 0; i < touches.length; i++) {
                    updatePointerUpData(pointer);
                }
            };

            window.addEventListener('mousedown', handleMouseDown);
            window.addEventListener('mousemove', handleMouseMove);
            window.addEventListener('touchstart', handleTouchStart);
            window.addEventListener('touchmove', handleTouchMove, false);
            window.addEventListener('touchend', handleTouchEnd);

            // Update pointer down data
            function updatePointerDownData(pointer: PointerPrototype, id: number, posX: number, posY: number): void {
                if (!canvas) return;

                pointer.id = id;
                pointer.down = true;
                pointer.moved = false;
                pointer.texcoordX = posX / canvas.width;
                pointer.texcoordY = 1.0 - posY / canvas.height;
                pointer.prevTexcoordX = pointer.texcoordX;
                pointer.prevTexcoordY = pointer.texcoordY;
                pointer.deltaX = 0;
                pointer.deltaY = 0;
                pointer.color = generateColor();
            }

            // Update pointer move data
            function updatePointerMoveData(
                pointer: PointerPrototype,
                posX: number,
                posY: number,
                color: Color
            ): void {
                if (!canvas) return;

                pointer.prevTexcoordX = pointer.texcoordX;
                pointer.prevTexcoordY = pointer.texcoordY;
                pointer.texcoordX = posX / canvas.width;
                pointer.texcoordY = 1.0 - posY / canvas.height;
                pointer.deltaX = correctDeltaX(pointer.texcoordX - pointer.prevTexcoordX);
                pointer.deltaY = correctDeltaY(pointer.texcoordY - pointer.prevTexcoordY);
                pointer.moved = Math.abs(pointer.deltaX) > 0 || Math.abs(pointer.deltaY) > 0;
                pointer.color = color;
            }

            // Update pointer up data
            function updatePointerUpData(pointer: PointerPrototype): void {
                pointer.down = false;
            }

            // Correct delta X
            function correctDeltaX(delta: number): number {
                if (!canvas) return delta;

                let aspectRatio = canvas.width / canvas.height;
                if (aspectRatio < 1) delta *= aspectRatio;
                return delta;
            }

            // Correct delta Y
            function correctDeltaY(delta: number): number {
                if (!canvas) return delta;

                let aspectRatio = canvas.width / canvas.height;
                if (aspectRatio > 1) delta /= aspectRatio;
                return delta;
            }

            // Generate color in amber/purple theme
            function generateColor(): Color {
                // Use amber and purple hues to match the theme
                const hue = Math.random() < 0.5 ?
                    0.1 + Math.random() * 0.05 :  // Amber range (0.10-0.15)
                    0.7 + Math.random() * 0.15;   // Purple range (0.7-0.85)

                let c = HSVtoRGB(hue, 1.0, 1.0);
                c.r *= 0.15;
                c.g *= 0.15;
                c.b *= 0.15;
                return c;
            }

            // HSV to RGB conversion
            function HSVtoRGB(h: number, s: number, v: number): Color {
                let r: number, g: number, b: number;
                const i = Math.floor(h * 6);
                const f = h * 6 - i;
                const p = v * (1 - s);
                const q = v * (1 - f * s);
                const t = v * (1 - (1 - f) * s);

                switch (i % 6) {
                    case 0: r = v; g = t; b = p; break;
                    case 1: r = q; g = v; b = p; break;
                    case 2: r = p; g = v; b = t; break;
                    case 3: r = p; g = q; b = v; break;
                    case 4: r = t; g = p; b = v; break;
                    case 5: r = v; g = p; b = q; break;
                    default: r = 0; g = 0; b = 0; break;
                }

                return {
                    r,
                    g,
                    b
                };
            }

            // Wrap value between min and max
            function wrap(value: number, min: number, max: number): number {
                const range = max - min;
                if (range === 0) return min;
                return (value - min) % range + min;
            }

            // Get resolution
            function getResolution(resolution: number): Resolution {
                if (!gl) return { width: resolution, height: resolution };

                let aspectRatio = gl.drawingBufferWidth / gl.drawingBufferHeight;
                if (aspectRatio < 1)
                    aspectRatio = 1.0 / aspectRatio;

                let min = Math.round(resolution);
                let max = Math.round(resolution * aspectRatio);

                if (gl.drawingBufferWidth > gl.drawingBufferHeight)
                    return { width: max, height: min };
                else
                    return { width: min, height: max };
            }

            // Scale by pixel ratio
            function scaleByPixelRatio(input: number): number {
                let pixelRatio = window.devicePixelRatio || 1;
                return Math.floor(input * pixelRatio);
            }

            // Hash code function
            function hashCode(s: string): number {
                if (s.length === 0) return 0;
                let hash = 0;
                for (let i = 0; i < s.length; i++) {
                    hash = (hash << 5) - hash + s.charCodeAt(i);
                    hash |= 0; // Convert to 32bit integer
                }
                return hash;
            }

            // Start the animation
            update();

            // Cleanup function for React
            return () => {
                cancelAnimationFrame(animationFrameId);
                window.removeEventListener('mousedown', handleMouseDown);
                window.removeEventListener('mousemove', handleMouseMove);
                window.removeEventListener('touchstart', handleTouchStart);
                window.removeEventListener('touchmove', handleTouchMove);
                window.removeEventListener('touchend', handleTouchEnd);
            };
        }

        // Function to resize canvas
        function resizeCanvas(): void {
            if (!canvasRef.current) return;

            const canvas = canvasRef.current;
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        }

        // Window resize handler
        window.addEventListener('resize', resizeCanvas);

        // Cleanup
        return () => {
            window.removeEventListener('resize', resizeCanvas);
            cleanup();
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex
            }}
        />
    );
};

export default FluidCursorEffect;
