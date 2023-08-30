
var gl;
var points;

window.onload = function init()
{
    var canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    var triangle_size = 0.3;
    var triangle_angle = Math.pi/3;
    points = []

    for(let i = 0; i < 100; i++) {
      p1X = Math.random() * -1.0;
      p1Y = Math.random() * -1.0;
      p2X = p1X + Math.cos(4*Math.pi/3) * triangle_size;
      p2Y = p1Y + Math.sin(4*Math.pi/3) * triangle_size;
      p3X = p1X + Math.cos(5*Math.pi/3) * triangle_size;
      p3Y = p1Y + Math.sin(5*Math.pi/3) * triangle_size;
      points.push(p1X,p1Y,p2X,p2Y,p3X,p3Y);
    }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    //  Load shaders and initialize attribute buffers
    
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    // Load the data into the GPU
    
    var bufferId = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferId );
    gl.bufferData( gl.ARRAY_BUFFER,flatten(points), gl.STATIC_DRAW );

    // Associate out shader variables with our data buffer
    
    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );

    colorLoc = gl.getUniformLocation( program, "fColor" );

    render();
};


function render() {
    for(let i = 0; i < 2; i++) {
      gl.clear( gl.COLOR_BUFFER_BIT );
      random_color = [];
      for(let i = 0; i < 4; i++) {
        random_color.push(Math.random());
      }
      gl.uniform4fv( colorLoc, vec4(random_color)); // vona etta virki
      gl.drawArrays( gl.POINTS, i, 1);
    }
}
