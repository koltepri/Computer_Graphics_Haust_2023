/////////////////////////////////////////////////////////////////
//    Sýnidæmi í Tölvugrafík
//     Sýnir notkun hnútahnit og hnútalita fléttuð saman í sama
//     minnissvæðinu (buffers) í GPU
//
//    Hjálmtýr Hafsteinsson, september 2023
/////////////////////////////////////////////////////////////////
var canvas;
var gl;

var vPosition;
var locColor;

var colorTiles = [];
var bufferTiles;
var cars = [];

var nrOfLanes = 5;


window.onload = function init() {
    // --- BoilerPlate Start
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }
    
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 0.9, 0.9, 0.9, 1.0 );

    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );

    // -- Map Creation Code
    var verticesTiles = createBoxes();

    bufferTiles = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferTiles); // is this neccessary 
    gl.bufferData(gl.ARRAY_BUFFER,flatten(verticesTiles),gl.STATIC_DRAW);

    vPosition = gl.getAttribLocation(program,"vPosition");
    gl.enableVertexAttribArray(vPosition);
    
    // -- Car Creation 
    for(let i = 0; i < nrOfLanes; i++) {
      //let random_color = vec4(Math.random(),Math.random(),Math.random(),1.0)
      let random_color = vec4(0.0,0.0,0.0,1.0)
      let car = new Car(0.2,random_color,0.05,i);
      cars.push(car);
    }

    locColor = gl.getUniformLocation(program,"rcolor");

    render();
}


function render() {
    gl.clear( gl.COLOR_BUFFER_BIT );
    // -- Draw the Map
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferTiles);
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    for(let i = 0; i < 3+nrOfLanes; i++) {
      gl.uniform4fv(locColor,flatten(colorTiles[i]));
      gl.drawArrays( gl.TRIANGLE_FAN, i*4, 4);
    }
    // -- Initializing Car Buffer 
    var carVertices = []
    for(let i=0; i < nrOfLanes;i++){
      carVertices.push(cars[i].position);
    }
    bufferCars = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferCars);
    gl.bufferData(gl.ARRAY_BUFFER,carVertices,flat(Infinity),gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    // -- Drawing the cars
    for(let i=0; i < nrOfLanes;i++){
      gl.uniform4fv(locColor,flatten(cars[i].color));
      gl.drawArrays(gl.TRIANGLE_FAN,i*4,4);
    }
    
}

function createBoxes() {
  var totalSplits = 3 + nrOfLanes;
  var boxYSize = 2/totalSplits;
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
    if (i == 0 || i == totalSplits-2) { // upphafs og endapunktar
      colorTiles.push(vec4(1.0,1.0,0.0,1.0));
    }
    else if (i == totalSplits-1) { // stigasvaedi
      colorTiles.push(vec4(0.0,1.0,1.0,1.0)); 
    }
    else {  // akreinar
      var rnd = Math.random()/3
      colorTiles.push(vec4(0.0+rnd,0.0+rnd,1.0-rnd,1.0));
    }
  }
  return vertices
}

class Car{
  constructor(sizeX, color, speed, laneNr) {
    this.sizeX = sizeX; // sizeX < 0.5
    this.color = color; // vec4
    this.speed = speed;
    this.laneNr = laneNr; // 0<=i<=5 : hvada braut
    this.position = this.initialCoordinates();
  }
  initialCoordinates() {
    var coor = [];
    var boxYSize = 2/(3+nrOfLanes);
    let padding = 0.1
    let rnd = 0.5*Math.random()*(Math.round(Math.random()) * 2 - 1); // [-0.5,0.5] : X
    let p0 = vec2(rnd,-1 + boxYSize*this.laneNr+padding);
    let p1 = vec2(rnd+this.sizeX,-1 + boxYSize*this.laneNr+padding);
    let p2 = vec2(rnd+this.sizeX,-1+boxYSize*(this.laneNr+1)-padding);
    let p3 = vec2(rnd,-1+boxYSize*(this.laneNr+1)-padding);
    coor.push(p0,p1,p2,p3);
    return coor;
  }

}









