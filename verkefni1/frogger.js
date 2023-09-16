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
var player;

var nrOfLanes = 5;
var totalSplits = 3 + nrOfLanes;
var XSplit = 3; // X movement defined, iterations
var boxYSize = 2/totalSplits;


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
    for(let i = 1; i < nrOfLanes+1; i++) {
      //let random_color = vec4(Math.random(),Math.random(),Math.random(),1.0)
      let random_color = vec4(0.0,0.0,0.0,1.0)
      let car = new Car(0.2,random_color,0.05,i);
      cars.push(car);
    }
    player = new Player();
    
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
    let bufferData = new Float32Array(carVertices.flat(Infinity));
    bufferCars = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferCars);
    gl.bufferData(gl.ARRAY_BUFFER,bufferData,gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    // -- Drawing the cars
    for(let i=0; i < nrOfLanes;i++){
      gl.uniform4fv(locColor,flatten(cars[i].color));
      gl.drawArrays(gl.TRIANGLE_FAN,i*4,4);
    }
    // -- Initializing Player Buffer-->Drawing Player
    bufferPlayer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferPlayer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(player.position),gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.uniform4fv(locColor,flatten(vec4(0.5,0.5,0.5,1.0)));
    gl.drawArrays(gl.TRIANGLE,0,3);
}

function createBoxes() {
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
    let padding = 0.03;
    let rnd = 0.5*Math.random()*(Math.round(Math.random()) * 2 - 1); // [-0.5,0.5] : X
    let p0 = vec2(rnd,-1 + boxYSize*this.laneNr+padding);
    let p1 = vec2(rnd+this.sizeX,-1 + boxYSize*this.laneNr+padding);
    let p2 = vec2(rnd+this.sizeX,-1+boxYSize*(this.laneNr+1)-padding);
    let p3 = vec2(rnd,-1+boxYSize*(this.laneNr+1)-padding);
    coor.push(p0,p1,p2,p3);
    return coor;
  }
}

class Player {
  constructor() {
    this.position = this.initialPosition();
  }
  initialPosition() {
    var grid = [...new Set(defineXCoordinates(-1,1,[],0))].sort((a,b) => a-b);
    var XCoor = [];
    var padding = 0.05;
    for(let i = 0; i < grid.length-1; i++) {
      XCoor.push(add(grid[i],grid[i+1]));
    }
    let middle = Math.floor(XCoor.length / 2);
    let p0 = vec2(grid[middle]+padding,-1+padding);
    let p1 = vec2(grid[middle]+1-padding,-1+padding);
    let p2 = vec2(XCoor[middle],-1-padding+boxYSize);
    return [p0,p1,p2];
  }
}

function defineXCoordinates(x0,x1,coordinates,count){
  if (count == XSplit) {
    return coordinates;
  }
  console.log(coordinates);
  let midpoint = add(x0,x1);
  let leftCoordinates = [...coordinates]; 
  let rightCoordinates = [...coordinates]; 
  leftCoordinates.push(midpoint);
  rightCoordinates.push(midpoint);
  return defineXCoordinates(x0,midpoint,leftCoordinates,count+1).concat(
    defineXCoordinates(midpoint,x1,rightCoordinates,count+1));
}








