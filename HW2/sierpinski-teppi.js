"use strict";

var canvas;
var gl;

var points = [];

var NumTimesToSubdivide = 2;

window.onload = function init()
{
    canvas = document.getElementById( "gl-canvas" );

    gl = WebGLUtils.setupWebGL( canvas );
    if ( !gl ) { alert( "WebGL isn't available" ); }

    //
    //  Initialize our data for the Sierpinski Gasket
    //

    // First, initialize the corners of our gasket with three points.

    var vertices = [  //upprunalegi kassin
        vec2( -1, 1 ), //a
        vec2( 1,  1 ), //b
        vec2( 1, -1 ) //d
        vec2( -1, -1 ), //c
    ];

    divideRectangle( vertices[0], vertices[1], vertices[2],vertices[3],
                    NumTimesToSubdivide);

    //
    //  Configure WebGL
    //
    gl.viewport( 0, 0, canvas.width, canvas.height );
    gl.clearColor( 1.0, 1.0, 1.0, 1.0 );

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

    render();
};

function rectangle( a, b, c, d )
{
    points.push(a,b,c);
    points.push(a,c,d);
}

function divideRectangle( a, b, c, d, count )
{

    // check for end of recursion

    if ( count === 0 ) {
        rectangle( a, b, c, d );
    }
    else {

        //bisect the sides

        var ab1 = mix( a, b, 1/3 );
        var ab2 = mix( a, b, 2/3 );
        var ac1 = mix( a, c, 1/3 );
        var ac2 = mix( a, c, 2/3 );
        var bd1 = mix( b, d, 1/3 );
        var bd2 = mix( b, d, 2/3 );
        var cd1 = mix( c, d, 1/3 );
        var cd2 = mix( c, d, 2/3 );
        
        //hornlinur
        var ad1 = mix( a, d, 1/3);
        var ad2 = mix( a, d, 2/3);
        var bc1 = mix( b, c, 1/3);
        var bc2 = mix( b, c, 2/3);

        --count;

        // three new triangles
      divideRectangle(a,ab1,ad1,ac1,count);
      divideRectangle(ab1,ab2,bc1,ad1,count);
      divideRectangle(ab2,b,bd1,bc1,count);
      divideRectangle(ac1,ad1,bc2,ac2,count);
      divideRectangle(ac2,bc2,cd1,c,count);
      divideRectangle(bc2,ad2,cd2,cd1,count);
      divideRectangle(ad2,bd2,d,cd2,count);
      divideRectangle(bc1,bd1,bd2,ad2,count);
      
    }
}

function render()
{
    gl.clear( gl.COLOR_BUFFER_BIT );
    gl.drawArrays( gl.TRIANGLES, 0, points.length);
}

