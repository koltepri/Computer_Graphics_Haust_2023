
var gl;
var points;
var colorLoc;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var triangle_size = 0.1;
    var triangle_angle = Math.PI/3;
    points = []; // vandaddi semikommu...

    for(let i = 0; i < 100; i++) {
      p1Y = Math.random()*(Math.round(Math.random()) * 2 - 1);
      p1X = Math.random()*(Math.round(Math.random()) * 2 - 1);
      p2X = p1X + Math.cos(4*Math.PI/3) * triangle_size;
      p2Y = p1Y + Math.sin(4*Math.PI/3) * triangle_size;
      p3X = p1X + Math.cos(5*Math.PI/3) * triangle_size;
      p3Y = p1Y + Math.sin(5*Math.PI/3) * triangle_size;
      points.push(p1X,p1Y,p2X,p2Y,p3X,p3Y);
    }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.95, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    render();
};


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    for(let i = 0; i < 300; i+=3) {
      R = Math.random();
      G = Math.random();
      B = Math.random();
      color = vec4(R,G,B,1.0);
      gl.uniform4fv( colorLoc, color ); // vec4 not defined
      gl.drawArrays( gl.TRIANGLES, i, 3);
    }
}
