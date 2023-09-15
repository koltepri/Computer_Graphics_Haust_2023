/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun hnútahnit og hnútalita fléttuð saman í sama
//     minnissvæðinu (buffers) í GPU
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;
var nrOfLanes = 5;

var colorTiles = [];
var vPosition;
var locColor;

var bufferTiles;


window.onload = function init() {
    // --- BoilerPlate
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

    //  Load shaders and initialize attribute buffers
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    // --- 
    var verticesTiles = createBoxes();

    bufferTiles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferTiles);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(verticesTiles),gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program,"vPosition");
    //gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.enableVertexAttribArray(vPosition);
    /*
    var bufferTilesColor = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, bufferTilesColor);
    gl.bufferData(gl.ARRAY_BUFFER, flatten(colorTiles),gl.STATIC_DRAW);

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray(vColor);
    */
    locColor = gl.getUniformLocation(program,"rcolor");
    render();

}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    for(let i = 0; i < 3+nrOfLanes; i++) {
      gl.bindBuffer(gl.ARRAY_BUFFER,bufferTiles);
      gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
      gl.uniform4fv(locColor,flatten(colorTiles[i]));
      gl.drawArrays( gl.TRIANGLE_FAN, i*4, 4);
    }
}

function createBoxes() {
  var totalSplits = 3 + nrOfLanes;
  var boxYSize = 1/totalSplits;
  var vertices = [];
  var colors = [];
  var x0 = -1.0,
      x1 = 1.0
  for(let i = 0; i < totalSplits; i++) {
    let p0 = vec2(x0,-1 + boxYSize*i);
    let p1 = vec2(x1,-1+boxYSize*i);
    let p2 = vec2(x1,-1+boxYSize*(i+1))
    let p3 = vec2(x0,-1+boxYSize*(i+1))
    vertices.push(p0,p1,p2,p3)
    if (i == 0 || i == totalSplits-1) { // upphafs og endapunktar
      colorTiles.push(vec4(1.0,1.0,0.0,1.0));
    }
    else if (i == totalSplits) { // stigasvaedi
      colorTiles.push(vec4(0.0,1.0,1.0,1.0)); 
    }
    else {  // akreinar
      colorTiles.push(vec4(0.0,0.0,1.0,1.0));
    }
  }
  return vertices
}










