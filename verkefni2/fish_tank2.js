
var canvas;
var gl;

var cage_vertices = [] 
var cage_vertices_length = 24;

var colorLoc;
var matrixLoc;

var vPosition;

var OGfish;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    fish_cage(); // define cage vertices
    OGfish = new Fish();   

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );


    vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.enableVertexAttribArray( vPosition );

    matrixLoc = gl.getUniformLocation( program, "rotation" );
    colorLoc = gl.getUniformLocation(program,"rcolor");

    //event listeners for mouse
    canvas.addEventListener("mousedown", function(e){
        movement = true;
        origX = e.offsetX;
        origY = e.offsetY;
        e.preventDefault();         // Disable drag and drop
    } );

    canvas.addEventListener("mouseup", function(e){
        movement = false;
    } );

    canvas.addEventListener("mousemove", function(e){
        if(movement) {
          spinY = ( spinY + (origX - e.offsetX) ) % 360;
            spinX = ( spinX + (origY - e.offsetY) ) % 360;
            origX = e.offsetX;
            origY = e.offsetY;
        }
    } );
    
    render();
}

function fish_cage()
{
    quad( 1, 0, 3, 2 );
    quad( 2, 3, 7, 6 );
    quad( 3, 0, 4, 7 );
    quad( 6, 5, 1, 2 );
    quad( 4, 5, 6, 7 );
    quad( 5, 4, 0, 1 );
}

function quad(a, b, c, d) 
{
    var vertices = [
        vec3( -0.5, -0.5,  0.5 ),//0
        vec3( -0.5,  0.5,  0.5 ),//1
        vec3(  0.5,  0.5,  0.5 ),//2
        vec3(  0.5, -0.5,  0.5 ),//3
        vec3( -0.5, -0.5, -0.5 ),//4
        vec3( -0.5,  0.5, -0.5 ),//5
        vec3(  0.5,  0.5, -0.5 ),//6
        vec3(  0.5, -0.5, -0.5 ) //7
    ];

    var indices = [ a, b, c, d];

    for ( var i = 0; i < indices.length; ++i ) {
      fish_cage.push( vertices[indices[i]] );
    }
}


class Fish {
  constructor() {
    this.pos= vec3(0.0,0.0,0.0) // point of the head, used to define the rest of the vertices
    this.dir= vec3(0.1,0.0,0.1)
    this.color = vec4(0.0,0.0,1.0,1.0);
    this.vertices = this.initialize_fish_vertices()
  }
  initialize_fish_vertices() {
    let head = [
      vec3(this.pos),
      vec3(this.pos[0]-0.2,this.pos[1],this.pos[2]+0.2),
      vec3(this.pos[0]-0.2,this.pos[1],this.pos[2]-0.2)
    ];
    let body = [
      vec3(head[1][0]-0.3,this.pos[1],this.pos[2]),
      vec3(head[1]),
      vec3(head[2])
    ];
    let tail = [
      vec3(body[0]),
      vec3(body[0][0]-0.1,body[1][1],body[0][0]+0.1),
      vec3(body[0][0]-0.1,body[1][1],body[0][0]-0.1)
    ];
    let fins_x_pos = vec3(mix(body[0],this.pos,0.3));
    let fins1 = [
      fins_x_pos,
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]+0.1,fins_x_pos[2]+0.1),
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]+0.1,fins_x_pos[2]-0.1)
    ];
    let fins2 = [
      fins_x_pos,
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]-0.1,fins_x_pos[2]+0.1),
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]-0.1,fins_x_pos[2]-0.1)
    ];
    fish_vertices = [head,body,tail,fins1,fins2];
  }
}
function renderBox() {
    var boxBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, boxBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, flatten(cage_vertices), 
      gl.STATIC_DRAW );
    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    let boxColor = vec4(0.0,0.0,0.0,1.0) //black
    gl.uniform4fv(colorLoc,flatten(boxColor))
    gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,0,0);
    for( let i = 0; i < cage_vertices_length; i++ ) {
      gl.drawArrays( gl.LINE_LOOP, i*4, 4);
    }
}

function renderFish() {
    var fishBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, fishBuffer);
    gl.bufferData( gl.ARRAY_BUFFER, 
      flatten(fish_vertices),gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,0,0);
    gl.uniform4fv(locColor, flatten(OGfish.color))
    gl.drawArrays( gl.TRIANGLES, 0, 15 ); // hardcoded for now
}
function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );
    renderBox();
    renderFish();
    requestAnimFrame( render );
}