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

var grid = []; 


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
    
    createGrid(); // ma etta?

    // -- Car Creation 
    for(let i = 1; i < nrOfLanes+1; i++) {
      //let random_color = vec4(Math.random(),Math.random(),Math.random(),1.0)
      let random_color = vec4(0.0,0.0,0.0,1.0)
      let car = new Car(0.2,random_color,0.05,i);
      cars.push(car);
    }
    player = new Player();
    
    
    locColor = gl.getUniformLocation(program,"rcolor");

    // -- Event listener for keyboard
    window.addEventListener("keydown", function(e){
        switch( e.keyCode ) {
            case 37:	// vinstri ör
                player.move(Direction.LEFT);
                break;
            case 39:	// hægri ör
                player.move(Direction.RIGHT);
                break;
            case 38: // upp
                player.move(Direction.UP);
                break;
            case 40: // nidur
                player.move(Direction.DOWN);
                break;
            default:
                break;
        }
    } );

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
    // -- Initializing Player Buffer --> Drawing Player
    bufferPlayer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER,bufferPlayer);
    gl.bufferData(gl.ARRAY_BUFFER,flatten(player.currentVertices),gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,2,gl.FLOAT,false,0,0);
    gl.uniform4fv(locColor,flatten(vec4(1.0,0.0,0.0,1.0)));
    gl.drawArrays(gl.TRIANGLES,0,3);

    window.requestAnimFrame(render);

}

function createBoxes() {
  var vertices = [];
  var colors = [];
  var x0 = -1.0,
      x1 = 1.0
  for(let i = 0; i < totalSplits; i++) {
    let p0 = vec2(x0,-1 + boxYSize*i);
    let p1 = vec2(x1,-1+boxYSize*i);
    let p2 = vec2(x1,-1+boxYSize*(i+1));
    let p3 = vec2(x0,-1+boxYSize*(i+1));
    vertices.push(p0,p1,p2,p3);
    if (i == 0 || i == totalSplits-2) { // upphafs og endapunktar
      colorTiles.push(vec4(1.0,1.0,0.0,1.0));
    }
    else if (i == totalSplits-1) { // stigasvaedi
      colorTiles.push(vec4(0.0,1.0,1.0,1.0)); 
    }
    else {  // akreinar
      var rnd = Math.random()/3;
      colorTiles.push(vec4(0.0+rnd,0.0+rnd,1.0-rnd,1.0));
    }
  }
  return vertices;
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
    // mjög úreltuur kóði en virkar samt (gerdi þennan á undan Player grid dæminu)
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
    this.position = [0,4]; // breyta 1->0 seinns
    this.currentVertices = this.triangleVerticesFromCoordinate(0,4,Direction.UP); 
  }
  move(direction) { 
  // starting with instantanous moves, even if it trivializes the game
  // eins og stendur ma bara ekki fara utaf... þarf ad baeta vid vesen logic
    if (direction == Direction.UP) {
      this.position = [this.position[0]+1,this.position[1]];
      this.currentVertices = this.triangleVerticesFromCoordinate(
        this.position[0],this.position[1],direction);
    } 
    else if (direction == Direction.RIGHT) {
      this.position = [this.position[0],this.position[1]+1];
      this.currentVertices = this.triangleVerticesFromCoordinate(
        this.position[0],this.position[1],direction);
    } 
    else if (direction == Direction.LEFT) {
      this.position = [this.position[0],this.position[1]-1];
      this.currentVertices = this.triangleVerticesFromCoordinate(
        this.position[0],this.position[1],direction);
    } 
    else if (direction == Direction.DOWN) {
      this.position = [this.position[0]-1,this.position[1]];
      this.currentVertices = this.triangleVerticesFromCoordinate(
        this.position[0],this.position[1],direction);
    } 
    console.log(this.position)
  }
  triangleVerticesFromCoordinate(i,j,direction) {
    let rect = verticesFromCoordinates(i,j);
    if (direction = Direction.UP) {
      let p0 = rect[0];
      let p1 = rect[1];
      let p2 = mix(rect[2],rect[3],0.5);
      return [p0,p1,p2];
    } 
    else if (direction = Direction.RIGHT) {
      let p0 = rect[0];
      let p1 = rect[3];
      let p2 = mix(rect[1],rect[2],0.5);
      return [p0,p1,p2];
    } 
    else if (direction = Direction.LEFT) {
      let p0 = rect[1];
      let p1 = rect[2];
      let p2 = mix(rect[0],rect[3],0.5);
      return [p0,p1,p2];
    } 
    else if (direction = Direction.DOWN) {
      let p0 = rect[2];
      let p1 = rect[3];
      let p2 = mix(rect[0],rect[1],0.5)
      return [p0,p1,p2];
    } 
  }
}

function defineXCoordinates(x0,x1,coordinates,count){
  // hræðilega overengineered, hefði alveg matt gera þetta með höndunum.... 
  if (count == XSplit) {
    return [-1,...coordinates,1];
  }
  let midpoint = (x0+x1)/2;
  let leftCoordinates = [...coordinates]; 
  let rightCoordinates = [...coordinates]; 
  leftCoordinates.push(midpoint);
  rightCoordinates.push(midpoint);
  return defineXCoordinates(x0,midpoint,leftCoordinates,count+1).concat(
    defineXCoordinates(midpoint,x1,rightCoordinates,count+1));
}

function createGrid() {
  let gridX = [...new Set(defineXCoordinates(-1,1,[],0))].sort((a,b) => a-b); 
  var gridY = [];
  for(let i = 0; i < nrOfLanes+1; i++) {gridY.push(-1+boxYSize*i);}
  for(let i = 0; i < nrOfLanes+1; i++) { //column
    for (let j = 0; j < gridX.length-1; j++) { // row
      let p0 = vec2(gridX[j],gridY[i]);
      let p1 = vec2(gridX[j+1],gridY[i]);
      let p2 = vec2(gridX[j+1],gridY[i+1]);
      let p3 = vec2(gridX[j],gridY[i+1]);
      grid.push([p0,p1,p2,p3]);
    }
  }
}

function verticesFromCoordinates(i,j) { // row : column
  let j_max = Math.pow(XSplit,2)-2; // 7
  return grid[i*j_max+j+i] // skilar [p0,p1,p2,p3] fylki
  // s.s ekki hægt að nesta vec4 og vec2 almennt
}

const Direction = { // direction enum
  UP: 'up',
  DOWN: 'down',
  LEFT: 'left',
  RIGHT: 'right',
};

