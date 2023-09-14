/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun hnútahnit og hnútalita fléttuð saman í sama
//     minnissvæðinu (buffers) í GPU
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var colorTiles = []

window.onload = function init() {
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    verticesTiles = createBoxes(5);

    bufferTiles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferTiles);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(verticesTiles),gl.STATIC_DRAW)

    locPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( locPosition );
    locColor = gl.getUniformLocation( program, "rcolor" );
    
    render();

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.bindBuffer( gl.ARRAY_BUFFER, bufferTiles);
    gl.vertexAttribPointer( locPosition, 2, gl.FLOAT, false, 0, 0 );
    gl.uniform4fv( locColor, flatten(colorA) );
    gl.drawArrays( gl.TRIANGLES, 0, 3 );
}

function createBoxes(nrOfLanes) {
  var totalSplits = 3 + nrOfLanes;
  var boxYSize = 1/totalSplits;
  var vertices = [];
  var colors = [];
  var x0 = -1,
      x1 = 1
  for(let i = 0; i < totalSplits -1 ; i++) {
    let p0 = vec2(x0,-1 + boxYSize*i);
    let p1 = vec2(x1,-1+boxYSize*i);
    let p2 = vec2(x1,-1+boxYSize*(i+1))
    let p3 = vec2(x0,-1+boxYSize*(i+1))
    vertices.push(p0,p1,p2,p3)
    if (i == 0 || i == totalSplits-1) { // upphafs og endapunktar
        colors.push(vec4(1.0,1.0,1.0,1.0));
    }
    else if (i == totalSplits) { // stigasvaedi
      colors.push(vec4(0.0,1.0,1.0,1.0)); 
    }
    else {  // akreinar
      colors.push(vec4(0.0,0.0,1.0,1.0));
    }
  }
  return vertices
}










