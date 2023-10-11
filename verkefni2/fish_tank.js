var canvas;
var gl;

var NumVertices  = 24;

var points = [];
var colors = []; // all black 

var xAxis = 0;
var yAxis = 1;
var zAxis = 2;

var axis = 0;
var theta = [ 0, 0, 0 ];

var movement = false;     // Do we rotate?
var spinX = 0;
var spinY = 0;
var origX;
var origY;

var matrixLoc;

var fish_vertices = [];
var fish_colors = [];

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );
    
    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    fish_cage();
    fish = new Fish();   

    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );
    
    gl.enable(gl.DEPTH_TEST);

    //
    //  Load shaders and initialize attribute buffers
    //
    var program = initShaders( gl, "vertex-shader", "fragment-shader" );
    gl.useProgram( program );
    
    var cBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, cBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(colors), gl.STATIC_DRAW );

    var vColor = gl.getAttribLocation( program, "vColor" );
    gl.vertexAttribPointer( vColor, 4, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vColor );

    var vBuffer = gl.createBuffer();
    gl.bindBuffer( gl.ARRAY_BUFFER, vBuffer );
    gl.bufferData( gl.ARRAY_BUFFER, flatten(points), gl.STATIC_DRAW );

    var vPosition = gl.getAttribLocation( program, "vPosition" );
    gl.vertexAttribPointer( vPosition, 3, gl.FLOAT, false, 0, 0 );
    gl.enableVertexAttribArray( vPosition );


    matrixLoc = gl.getUniformLocation( program, "rotation" );

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
      points.push( vertices[indices[i]] );
      colors.push( [0.0,0.0,0.0,1.0] );
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT );

    var mv = mat4();
    mv = mult( mv, rotateX(spinX) );
    mv = mult( mv, rotateY(spinY) );
    
    gl.uniformMatrix4fv(matrixLoc, false, flatten(mv));

    for( let i = 0; i < NumVertices; i++ ) {
      gl.drawArrays( gl.LINE_LOOP, i*4, 4);
    }
    
    var fishBuffer = gl.createBuffer();
    gl.bindBuffer( gl. ARRAY_BUFFER, fishBuffer);
    gl.bufferData( gl. ARRAY_BUFFER, flatten(fish_vertices),gl.STATIC_DRAW);
    gl.vertexAttribPointer(vPosition,3,gl.FLOAT,false,0,0);
    requestAnimFrame( render );
}

class Fish {
  constructor() {
    this.pos= vec3(0.0,0.0,0.0) // point of the head, used to define the rest of the vertices
    this.dir= vec3(0.1,0.0,0.1)
    this.color = vec4(0.0,0.0,1.0,1.0);
    this.vertices = initialize_fish_vertices()
  }
  initialize_fish_vertices() {
    head = [
      vec3(this.pos),
      vec3(this.pos[0]-0.2,this.pos[1],this.pos[2]+0.2),
      vec3(this.pos[0]-0.2,this.pos[1],this.pos[2]-0.2)
    ];
    body = [
      vec3(head[1]-0.3,this.pos[1],this.pos[2]),
      vec3(head[1]),
      vec3(head[2])
    ];
    tail = [
      vec3(body[0]),
      vec3(body[0]-0.1,body[1],body[0]+0.1),
      vec3(body[0]-0.1,body[1],body[0]-0.1)
    ]:
    fins_x_pos = vec3(mix(body[0],this.pos,0.3)),
    fins1 = [
      fins_x_pos,
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]+0.1,fins_x_pos[2]+0.1),
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]+0.1,fins_x_pos[2]-0.1)
    ];
    fins1 = [
      fins_x_pos,
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]-0.1,fins_x_pos[2]+0.1),
      vec3(fins_x_pos[0]-0.1,fins_x_pos[1]-0.1,fins_x_pos[2]-0.1)
    ];
    fish_vertices = [head,body,tail,fins1,fins2];
  }
}
