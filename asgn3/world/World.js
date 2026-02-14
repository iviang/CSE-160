// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                       //use color

    } else if (u_whichTexture == -1) {                  //use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {                   //use texture0 = uv grid
      gl_FragColor = texture2D(u_Sampler0, v_UV);       

    } else if (u_whichTexture == 1) {                   //use texture1 = sky
      gl_FragColor = texture2D(u_Sampler1, v_UV);       
    } else if (u_whichTexture == 2) {                   //use texture2 = grass
      gl_FragColor = texture2D(u_Sampler2, v_UV);       
    } else if (u_whichTexture == 3) {                   //use texture3 = dirt
      gl_FragColor = texture2D(u_Sampler3, v_UV);       
    } else {                                            //error push Redish
      gl_FragColor = vec4(1,.2,.2,1);
    }
  
  }`


// Global Variables
let canvas;
let camera; //
let gl;
let a_Position;
let a_UV; // 
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;
let u_Sampler3;

let walls = [];


let u_whichTexture;

let g_mouseRotX = 0;
let g_mouseRotY = 0;
 
function setupWebGL(){
  // Retrieve <canvas> element
  canvas = document.getElementById('webgl');

  // Get the rendering context for WebGL
  // gl = getWebGLContext(canvas);

  gl = canvas.getContext("webgl", { preserveDrawingBuffer: true});

  if (!gl) {
    console.log('Failed to get the rendering context for WebGL');
    return;
  }

  gl.enable(gl.DEPTH_TEST);

}

function connectVariablesToGLSL(){
  // Initialize shaders
  if (!initShaders(gl, VSHADER_SOURCE, FSHADER_SOURCE)) {
    console.log('Failed to intialize shaders.');
    return;
  }

  // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
    return;
  }

  // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  //get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage lcoation of u_ModelMatrix');
    return;
  }

  //get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage lcoation of u_GlobalRotateMatrix');
    return;
  }
  
  //
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }

  //get the storage location of u_Sampler0
  u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
  if (!u_Sampler0) {
    console.log('Failed to get the storage location of u_Sampler0');
    return;
  }

  //get the storage location of u_Sampler1
  u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
  if (!u_Sampler1) {
    console.log('Failed to get the storage location of u_Sampler1');
    return;
  }

  u_Sampler2 = gl.getUniformLocation(gl.program, 'u_Sampler2');
  if (!u_Sampler2) {
    console.log('Failed to get the storage location of u_Sampler2');
    return;
  }

  u_Sampler3 = gl.getUniformLocation(gl.program, 'u_Sampler3');
  if (!u_Sampler3) {
    console.log('Failed to get the storage location of u_Sampler3');
    return;
  }

  u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
  if (!u_whichTexture) {
    console.log('Failed to get the storage location of u_whichTexture');
    return;
  }

  //set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ViewMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, identityM.elements);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, identityM.elements);

}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//global variables related to UI
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
let g_yellowAngle=0;
let g_magentaAngle=0;
let g_yellowAnimation=false;
let g_magentaAnimation=false;

//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events ===================

  // document.getElementById('animationBackRightLegOffButton').onclick = function() {g_upperBRAnimation=false;};
  // document.getElementById('animationBackRightLegOnButton').onclick = function() {g_upperBRAnimation=true;};


  // slider events =====================
  // document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); }); //head turn slider


  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};

  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};

  //color slider events
  document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
  document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  // canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  //size slider events
  // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
  //size slider events
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
}


function initTextures() {
  //UV GRID TEXTURE================
  var image0 = new Image();  // Create the image object
  if (!image0) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image0.onload = function(){ sendTextureToTEXTURE0(image0); };
  // Tell the browser to load an image
  image0.src = 'uvgrid.png';

  //SKY TEXTURE==========
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = 'blue.jpg';

  //GRASS TEXTURE==========
  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendTextureToTEXTURE2(image2); };
  // Tell the browser to load an image
  image2.src = 'grass.png';

  //DIRT TEXTURE==========
  var image3 = new Image();  // Create the image object
  if (!image3) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image3.onload = function(){ sendTextureToTEXTURE3(image3); };
  // Tell the browser to load an image
  image3.src = 'dirt.png';

  return true;
}

function sendTextureToTEXTURE0(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit0
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  // gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>
  // gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log('Finished loadTexture');
}

function sendTextureToTEXTURE1(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit1
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);

  console.log('Finished loadTexture');
}

function sendTextureToTEXTURE2(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit2
  gl.activeTexture(gl.TEXTURE2);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log('Finished loadTexture');
}

function sendTextureToTEXTURE3(image) {
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit2
  gl.activeTexture(gl.TEXTURE3);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler3, 3);

  console.log('Finished loadTexture');
}



function buildWall(){
  walls = [];
  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[0].length; z++) {
      if (g_map[x][z] == 1) {
        let w = new Cube();
        w.textureNum = 0;
        w.matrix.translate(x-4, -.25, z-4);
        walls.push(w);
      }
    }
  }
}

function main() {

  setupWebGL(); //set up canvas and gl variables
  connectVariablesToGLSL(); //set up GLSL shader prgms and connect GLSL variables
  camera = new Camera(canvas); // set up camera

  //set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Mouse detection
  // mouseDetect(); 
  //poke animation trigger
  // shiftClick();
  document.onkeydown = keydown;

  initTextures();
  buildWall();  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

function mouseDetect() {
  let drag = false;
  let prevX = 0;
  let prevY = 0;

  canvas.onmousedown=function(ev) {
    drag=true;
    prevX=ev.clientX;
    prevY=ev.clientY;
  };

  canvas.onmouseup=function(ev){
    drag=false;
  };

  canvas.onmouseleave=function(ev){
    drag=false;
  };

  canvas.onmousemove = function(ev) {

    if (!drag) return;

    const dx = ev.clientX - prevX;
    const dy = ev.clientY - prevY;

    const sensitivity = 0.5;

    g_mouseRotY += dx * sensitivity;
    g_mouseRotX += dy * sensitivity;

    g_mouseRotX = Math.max(-90, Math.min(90, g_mouseRotX));

    prevX = ev.clientX;
    prevY = ev.clientY;

    renderAllShapes();
  };
}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  // console.log(g_seconds); //removed to improve performance

  //update animation angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

//individual animation functions so that the overall animation button can call upon them

// function headAnimation() {
//   g_headAngle = (45*Math.sin(g_seconds));
// }

// function tailAnimation() {
//   g_btail = (10*Math.sin(g_seconds));
//   g_m1tail = (20*Math.sin(g_seconds));
//   g_m2tail = (25*Math.sin(g_seconds));
//   g_tiptail = (30*Math.sin(g_seconds));
// }

// function buttAnimation() {
//   const min = -5;
//   const max = 5;
//   const midpoint = (min + max) / 2;
//   const amplitude = (max - min) / 2;
//   g_buttAngle = midpoint + amplitude * Math.sin(g_seconds);
// }

// function walkAnimation() {
//   const t = 3 * g_seconds;
//   //walking should be diagonal to look natural
//   const group_A = t; //Front Right sync with Back Left
//   const group_B = t + Math.PI; //Front Right sync with Back Left
//   const delay = Math.PI / 2; // attempt to delay the lower legs

//   g_upperFR = walkRestrictions(-10, 35,group_A);
//   g_upperBL = walkRestrictions(-10, 35, group_A);

//   g_upperFL = walkRestrictions(-10, 35, group_B);
//   g_upperBR = walkRestrictions(-10, 35, group_B);

//   g_lowerFR = walkRestrictions(-35, 5, group_A + delay);
//   g_lowerBL = walkRestrictions(-15, 5, group_A + delay);

//   g_lowerFL = walkRestrictions(-35, 5, group_B + delay);
//   g_lowerBR = walkRestrictions(-15, 5, group_B + delay);

// }
 
//update the angles of everything if currently animated
function updateAnimationAngles(){
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
}

function keydown(ev) { //modify for the wasd keys
  const speed = 0.1; //speed
  const alpha = 5; //rotation speed

  if (ev.keyCode == 87) {        // W
    camera.moveForward(speed);
  } else if (ev.keyCode == 83) { // S
    camera.moveBackwards(speed);
  } else if (ev.keyCode == 65) { // A
    camera.moveLeft(speed);
  } else if (ev.keyCode == 68) { // D
    camera.moveRight(speed);
  } else if (ev.keyCode == 81) { // Q
    camera.panLeft(alpha);
  } else if (ev.keyCode == 69) { // E
    camera.panRight(alpha);
  }

  renderAllShapes();
}

var g_map=[
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1], 
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
  [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1], 
];

g_map.length === 32;
g_map[0].length === 32;

function drawMap() {
  for (x=0;x<g_map.length;x++) {
    for (y=0;y<g_map[0].length;y++) {
      //console.log(x,y);
      if (g_map[x][y] == 1) {
        var body = new Cube();
        body.textureNum=3; //texture
        // body.color = [1.0, 1.0, 1.0, 1.0];
        body.matrix.translate(x-16, -.75, y-16);
        body.render();
      }
    }
  }
}

// function drawMap() {
//   for (let x = 0; x < g_map.length; x++) {
//     for (let z = 0; z < g_map[0].length; z++) {
//       //console.log(x,y);
//       if (x==0 || x==31 || y==0 || y==31) {
//         var bodyqq = new Cube(); 
//         body.color = [1.0, 1.0, 1.0, 1.0];
//         body.matrix.translate(0, -.75, 0);
//         body.matrix.scale(.3,.3,.3);
//         body.matrix.translate(x-16, 0, y-16);
//         body.render();
//       }
//     }
//   }
// }

function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();

  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT );
  camera.viewMatrix.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0],  camera.at.elements[1],  camera.at.elements[2],
    camera.up.elements[0],  camera.up.elements[1],  camera.up.elements[2]
  )
  //pass projection matrix 3.6a video
  // var projMat=new Matrix4();
  // projMat.setPerspective(50, 1*canvas.width/canvas.height, 1, 100);
  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);

//   for (let i = 0; i < walls.length; i++) {
//     walls[i].render();
// }

  //pass view matrix 3.6a video
  // viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]); //(eye: xyz more z = farther away, at, up) 
  // viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); //(eye: xyz more z = farther away, at, up) 


  //Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //draw the GROUND 
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum=2;
  body.matrix.translate(-16, -.75, -16);
  body.matrix.scale(32,0.1,32);
  // body.matrix.translate(-.5, 0, -0.5);
  body.render();

  //draw the SKY BOX 
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum=1;
  sky.matrix.scale(150,150,150);
  sky.matrix.translate(-.5, -0.5, -0.5);
  sky.render();
  
  drawMap();

  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum=0;
  body.matrix.translate(-.25, -.75, 0.0);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.render();

  // var bodyCoordinates= new Matrix4(body.matrix);

  // draw a left arm
  var yellow = new Cube();
  yellow.color = [1,1,0,1];
  yellow.matrix.setTranslate(0, -.5, 0.0);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5,0,0);
  yellow.render();


  // Test box
  var magenta = new Cube();
  magenta.color = [1,0,1,1];
  magenta.textureNum=0;
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(0, 0.65, 0);
  magenta.matrix.rotate(-g_magentaAngle, 0,0,1);
  magenta.matrix.scale(.3,.3,.3);
  magenta.matrix.translate(-.5, 0, -0.001);
  magenta.render();


  //ground plane
  var ground = new Cube();
  ground.matrix.translate(0, 0, -1);
  ground.matrix.scale(2, .1, 2);
  ground.render();

  // a bunch of cubes rotating
  // var K=10.0;
  // for (var i=1; i<K; i++) {
  //   var c = new Cube;
  //   c.matrix.translate(-.8,1.9*i/K-1.0,0);
  //   c.matrix.rotate(g_seconds*100,1,1,1);
  //   c.matrix.scale(.1, 0.5/K, 1.0/K);
  //   c.render();
  // }

  //check the time at the end of the funciton, and show on web pg
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

}

//set the text of a HTML element
function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + " from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}


function click(ev) { //transforms the coords from browser to canvas
  
  //extract the event click and return in WebGL Coordinates
  let [x,y] = convertCoordinatesEventToGL(ev);

  //create and store the new point
  let point;
  if (g_selectedType==POINT) {
    point = new Point();
  } else if (g_selectedType==TRIANGLE){
    point = new Triangle();
  } else {
    point = new Circle();
    // point.segments = g_selectedSeg;
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
//   g_redoList = [];
  g_shapesList.push(point);


  //draw every shape that is supposed to be in the canvas
  renderAllShapes();
}

//extract the event click and return in WebGL Coordinates
function convertCoordinatesEventToGL(ev){
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return([x,y]);
}

