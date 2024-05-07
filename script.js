const canva = document.querySelector('#canva');

canva.width = 600;
canva.height = 600;

const gl = canva.getContext('webgl');

const vShaderValue = `
    precision mediump float;

    attribute vec2 position;

    void main() {
        gl_Position = vec4(position, 0.0, 1.0);
    }
`;

const fShaderValue = `
    precision mediump float;

    void main() {
        gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0);
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
        0, 0.0,
        0.0, 0.5,
        0.5, 0.1,
        0.25, -0.4,
        -0.25, -0.4,
        -0.5, 0.1,
        -0.0, 0.5
    ]

    let tBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, tBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vex), gl.STATIC_DRAW);

    let pos = gl.getAttribLocation(program, 'position');
    gl.vertexAttribPointer( // ehe :>
        pos,      // zmienna atrybutu
        2,        // liczba danych
        gl.FLOAT, // dokładność
        gl.FALSE, // normalizacja
        2 * Float32Array.BYTES_PER_ELEMENT, // rozmiar jednej danej
        0         // offset
    );
    gl.enableVertexAttribArray(pos);

    gl.useProgram(program);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 7);
}