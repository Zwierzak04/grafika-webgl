const canva = document.querySelector('#canva');

canva.width = 600;
canva.height = 600;

const gl = canva.getContext('webgl');

const vShaderValue = `
    precision mediump float;

    attribute vec3 position;
    attribute vec3 color;

    uniform mat4 world;
    uniform mat4 view;
    uniform mat4 proj;

    varying vec3 vColor;

    void main() {
        vColor = color;
        gl_Position = proj * view * world * vec4(position, 1.0);
    }
`;

const fShaderValue = `
    precision mediump float;

    uniform vec3 color;

    varying vec3 vColor;

    void main() {
        gl_FragColor = vec4(vColor, 1.0);
    }
`;

const bgColor = [0.2, 0.7, 0.5];

const mat4 = glMatrix.mat4;
const vec3 = glMatrix.vec3;
const quat = glMatrix.quat;

const defaultCube = {
    vertices: [
        -1.0,  1.0, -1.0,
        -1.0,  1.0,  1.0,
         1.0,  1.0,  1.0,
         1.0,  1.0, -1.0,
        -1.0, -1.0, -1.0,
        -1.0, -1.0,  1.0,
         1.0, -1.0,  1.0,
         1.0, -1.0, -1.0,
    ],
    indices: [
        // Top
        0, 1, 2,
        0, 2, 3,
        // Left
        5, 1, 4,
        4, 1, 0,
        // Right
        2, 6, 7,
        2, 7, 3,
        // Front
        6, 2, 5,
        1, 5, 2,
        // Back
        3, 7, 4,
        3, 4, 0,
        // Bottom
        5, 4, 6,
        6, 4, 7
    ],
    colors: [
        0.3, 0.3, 1.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 1.0,
        0.0, 1.0, 1.0,
        1.0, 0.0, 1.0,
        1.0, 0.0, 1.0,
        0.0, 1.0, 0.0,
        0.0, 1.0, 0.0
    ]
}

function generateCube(position, scale, rotation = null) {
    let vex = defaultCube.vertices.slice(); // kopiowanie
    let ind = defaultCube.indices.slice();
    let colors = defaultCube.colors.slice();

    if(!rotation) {
        rotation = [0,0,0];
    } 

    let rot = quat.create();
    quat.fromEuler(rot, rotation[0], rotation[1], rotation[2]);
    let transformation = mat4.create();
    mat4.fromRotationTranslationScale(transformation, rot, position, [scale,scale,scale]);
    
    vec3.forEach(vex, 3, 0, 0, vec3.transformMat4, transformation);

    return {
        vertices: vex,
        indices: ind,
        colors: colors
    };
}

const Triangle = function() {
    if(!gl) {
        console.error(':<');
        return;
    }

    console.log('yippe');

    gl.clearColor(...bgColor, 1);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    let vertexShader = gl.createShader(gl.VERTEX_SHADER);
    let fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

    gl.shaderSource(vertexShader, vShaderValue);
    gl.shaderSource(fragmentShader, fShaderValue);

    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);

    const program = gl.createProgram();
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    gl.linkProgram(program);

    if(!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling vertex shader', gl.getShaderInfoLog(vertexShader));
        return;
    }

    if(!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        console.error('Error compiling fragment shader', gl.getShaderInfoLog(fragmentShader));
        return;
    }

    if(!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        console.error('Error linking program', gl.getProgramInfoLog(program));
        return;
    }

    gl.detachShader(program, vertexShader);
    gl.detachShader(program, fragmentShader);

    gl.validateProgram(program);

    const cube = generateCube([0,0,0], 2, [45,45,45]);

    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.vertices), gl.STATIC_DRAW);

    let iBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, iBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cube.indices), gl.STATIC_DRAW);

    let pos = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer( // ehe :>
        pos,      // zmienna atrybutu
        3,        // liczba danych
        gl.FLOAT, // dokładność
        gl.FALSE, // normalizacja
        3 * Float32Array.BYTES_PER_ELEMENT, // rozmiar jednej danej
        0         // offset
    );
    gl.enableVertexAttribArray(pos);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cube.colors), gl.STATIC_DRAW);

    let colorAttrib = gl.getAttribLocation(program, 'color');
    gl.vertexAttribPointer(
        colorAttrib,
        3,
        gl.FLOAT,
        gl.FALSE,
        3 * Float32Array.BYTES_PER_ELEMENT,
        0
    );
    gl.enableVertexAttribArray(colorAttrib);

    gl.useProgram(program);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    let world = mat4.create();
    let view = mat4.create();
    let proj = mat4.create();

    let uWorld = gl.getUniformLocation(program, 'world');
    let uView = gl.getUniformLocation(program, 'view');
    let uProj = gl.getUniformLocation(program, 'proj');

    mat4.lookAt(view, [0,0,-10], [0,0,0], [0,1,0]);
    mat4.perspective(proj, glMatrix.glMatrix.toRadian(70), canva.width / canva.height, 0.1, 1000.0);

    gl.uniformMatrix4fv(uView, gl.FALSE, view);
    gl.uniformMatrix4fv(uProj, gl.FALSE, proj);
    gl.uniformMatrix4fv(uWorld, gl.FALSE, world);

    gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);

    document.querySelector("#changeColor").addEventListener('click', () => {
        let newColors = defaultCube.colors.slice();
        vec3.forEach(newColors, 3, 0, 0, (v) => {
            v[0] = Math.random();
            v[1] = Math.random();
            v[2] = Math.random();
        });

        gl.clearColor(...bgColor, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(newColors), gl.STATIC_DRAW);

        gl.drawElements(gl.TRIANGLES, cube.indices.length, gl.UNSIGNED_SHORT, 0);
    });
}