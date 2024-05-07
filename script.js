const canva = document.querySelector('#canva');

canva.width = window.innerWidth;
canva.height = window.innerHeight;

const gl = canva.getContext('webgl');

const vShaderValue = `
    precision mediump float;

    attribute vec2 position;
    attribute vec3 col;

    varying vec3 fragColor;

    void main() {
        fragColor = col;
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fShaderValue = `
    precision mediump float;

    varying vec3 fragColor;

    void main() {
        gl_FragColor = vec4(fragColor, 1.0);
    }
`;

const bgColor = [0.2, 0.7, 0.5];

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

    let vex = [
        0.0, 0.5,           1.0, 0.0, 0.0,
        -0.5, -0.5,         0.0, 1.0, 0.0,
        0.5, -0.5,          0.0, 0.0, 1.0
    ]

    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vex), gl.STATIC_DRAW);

    let cBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vex), gl.STATIC_DRAW);

    let pos = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer( // <-- pojebane
        pos,      // zmienna atrybutu
        2,        // liczba danych
        gl.FLOAT, // dokładność
        gl.FALSE, // normalizacja
        5 * Float32Array.BYTES_PER_ELEMENT, // rozmiar jednej danej
        0         // offset
    );
    gl.enableVertexAttribArray(pos);

    let col = gl.getAttribLocation(program, 'col');
    gl.vertexAttribPointer( // <-- pojebane
        col,        // zmienna atrybutu
        3,          // liczba danych
        gl.FLOAT,   // dokładność
        gl.FALSE,   // normalizacja
        5 * Float32Array.BYTES_PER_ELEMENT, // rozmiar jednej danej
        2 * Float32Array.BYTES_PER_ELEMENT  // offset
    );
    gl.enableVertexAttribArray(col);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLES, 0, 3);
}