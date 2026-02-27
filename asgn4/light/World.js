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
  uniform sampler2D u_Sampler4;
  uniform sampler2D u_Sampler5;

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
    } else if (u_whichTexture == 4) {                   //use texture4 = glass
      gl_FragColor = texture2D(u_Sampler4, v_UV);   
    } else if (u_whichTexture == 5) {                   //use texture5 = cheese
      gl_FragColor = texture2D(u_Sampler5, v_UV);   
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
let u_Sampler4;
let u_Sampler5;

let g_rat = null;
let g_ratHead = [0,0,-1];
const RAT_OFFSET = [0.25, 0, 0.25];

// let g_cheese = true;
// let g_cheesePosition = [1, -0.65, 1]; //temp
// let g_cheeseCollected = 0;
// let g_cheeseCell = [];
// let g_cheeseCube = [];

// const TotCheese = 5;


// let g_timer = true;
// let g_tEnd = 0;
// let g_runs = [];
// let g_best = null;
// let g_final = false;

let g_mode = "fps";
let g_eye = null;
let g_at = null;
let g_up = null;
let g_ratPosition = [0, -0.65, 0];
let g_fpsFwd = [0,0,1];
let g_fpsYaw = 0;
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

  u_Sampler4 = gl.getUniformLocation(gl.program, 'u_Sampler4');
  if (!u_Sampler4) {
    console.log('Failed to get the storage location of u_Sampler4');
    return;
  }

  u_Sampler5 = gl.getUniformLocation(gl.program, 'u_Sampler5');
  if (!u_Sampler5) {
    console.log('Failed to get the storage location of u_Sampler5');
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

// const P_Size = 0.5; //size of player controlling 
// const P_Height = -0.65; //match ground level

//global variables related to UI
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_globalAngle=0;
// let g_yellowAngle=0;
// let g_magentaAngle=0;
// let g_yellowAnimation=false;
// let g_magentaAnimation=false;

//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events ===================

  document.getElementById('ratcamButton').onclick = function() {
    const fx = camera.at.elements[0] - camera.eye.elements[0];
    const fz = camera.at.elements[2] - camera.eye.elements[2];
    const len = Math.sqrt(fx*fx + fz*fz) || 1;
    g_fpsFwd = [fx/len, 0, fz/len];
    g_mode = "overhead";
  };
  // document.getElementById('camButton').onclick = function() {
  //   g_mode = "fps";
  //   newFP();
  // };
  // document.getElementById('restartButton').onclick = function() {
  //   restart();
  //   // if (restartButton) restartButton.onclick = () => restart(); 
  // };

  // slider events =====================
  // document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); }); //head turn slider


  // document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  // document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};

  // document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
  // document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};

  // //color slider events
  // document.getElementById('yellowSlide').addEventListener('mousemove', function() { g_yellowAngle = this.value; renderAllShapes(); });
  // document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  // canvas.onmousemove = function(ev) { if (ev.buttons == 1) { click(ev) } };

  //size slider events
  // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_globalAngle = this.value; renderAllShapes(); });
  //size slider events
  // document.getElementById('angleSlide').addEventListener('mousemove', function() { g_globalAngle = this.value; renderAllShapes(); });
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
  image0.src = '../textures/uvgrid.png';

  //SKY TEXTURE==========
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = '../textures/sky.jpg';

  //GRASS TEXTURE==========
  var image2 = new Image();  // Create the image object
  if (!image2) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image2.onload = function(){ sendTextureToTEXTURE2(image2); };
  // Tell the browser to load an image
  image2.src = '../textures/grass.png';

  //DIRT TEXTURE==========
  var image3 = new Image();  // Create the image object
  if (!image3) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image3.onload = function(){ sendTextureToTEXTURE3(image3); };
  // Tell the browser to load an image
  image3.src = '../textures/dirt.jpg';

  //GLASS TEXTURE==========
  var image4 = new Image();  // Create the image object
  if (!image4) {
    console.log('Failed to create the image object');
    return false;
  }

  // Register the event handler to be called on loading an image
  image4.onload = function(){ sendTextureToTEXTURE4(image4); };
  // Tell the browser to load an image
  image4.src = '../textures/Glass.png';


  return true;
}

function sendTextureToTEXTURE0(image) { //uv grid
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

function sendTextureToTEXTURE1(image) { //sky
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

function sendTextureToTEXTURE2(image) { //grass
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
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 2 to the sampler
  gl.uniform1i(u_Sampler2, 2);

  console.log('Finished loadTexture');
}

function sendTextureToTEXTURE3(image) { //dirt
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit3
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

function sendTextureToTEXTURE4(image) { //glass
  var texture = gl.createTexture(); // Create a texture object
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }
  
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit4
  gl.activeTexture(gl.TEXTURE4);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler4, 4);

  console.log('Finished loadTexture');
}

function main() {

  setupWebGL(); //set up canvas and gl variables
  connectVariablesToGLSL(); //set up GLSL shader prgms and connect GLSL variables
  camera = new Camera(canvas); // set up camera
  g_rat = new Rat(); //set up rat
  g_rat.position = [0, -.65, 0];
  g_rat.rotation = 0;
  g_eye = new Vector3([camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]]);
  g_at  = new Vector3([camera.at.elements[0],  camera.at.elements[1],  camera.at.elements[2]]);
  g_up  = new Vector3([camera.up.elements[0],  camera.up.elements[1],  camera.up.elements[2]]);

  //set up actions for the HTML UI elements
  addActionsForHtmlUI();
  // Mouse detection
  mouseDetect();  
  document.onkeydown = keydown;

  initTextures();
  buildWall();  
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  requestAnimationFrame(tick);

}

function mouseDetect() { //converted into the rotation funct for mouse/camera 
  let drag = false;
  let prevX = 0;
  let prevY = 0;

  canvas.onmousedown=function(ev) {
    drag=true;
    prevX=ev.clientX;
    prevY=ev.clientY;
  };

  canvas.onmouseup=function(){
    drag=false;
  };

  canvas.onmouseleave=function(){
    drag=false;
  };

  canvas.onmousemove = function(ev) {

    if (!drag) return;

    const dx = ev.clientX - prevX;
    const dy = ev.clientY - prevY;

    const sensitivity = 0.5;

    camera.panLeft(dx * sensitivity);
    camera.panUp(-dy * sensitivity);

    prevX = ev.clientX;
    prevY = ev.clientY;

  };
}

var g_startTime=performance.now()/1000.0;
// var g_seconds=performance.now()/1000.0-g_startTime;

let g_prevTime = performance.now();
let g_fps = 0;
let g_fpsFrames = 0;
// let g_fpsLastTime = performance.now(); // ms

// Called by browser repeatedly whenever its time
function tick() {
  // save current time
  const now = performance.now();
  g_fpsFrames++;

  // const tot = now - g_fpsLastTime;
  if (now - g_prevTime >= 1000) {
    g_fps = g_fpsFrames;
    // g_fps = (g_fpsFrames * 1000) / tot;
    g_fpsFrames = 0;
    g_prevTime = now;
  }

  g_seconds = performance.now()/1000 - g_startTime;

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}


function keydown(ev) { //modify for the wasd keys
  const speed = 0.1; //speed
  const alpha = 5; //rotation speed

  if (g_mode === "fps") {
      if (ev.keyCode == 87) {    // W
      camera.moveForward(speed);
      // moveRat(speed,0); 
    } else if (ev.keyCode == 83) { // S
      camera.moveBackwards(speed);
      // moveRat(-speed,0); 

    } else if (ev.keyCode == 65) { // A
      camera.moveLeft(speed);
      // g_rat.rotation += alpha;
      // moveRat(0, speed); 

    } else if (ev.keyCode == 68) { // D
      camera.moveRight(speed);
      // g_rat.rotation -= alpha;
      // moveRat(0, -speed); 
    
    } else if (ev.keyCode == 81) { // Q
      camera.panLeft(alpha);
    } else if (ev.keyCode == 69) { // E
      camera.panRight(alpha);
    }
  } 

}

function buildWall(){
  walls = [];

  for (let x = 0; x < g_map.length; x++) {
    for (let z = 0; z < g_map[0].length; z++) {
      const height = g_map[x][z];
      
      if (height <= 0) continue;

      //finding the edge walls
      const isEdge = (x === 0 || z === 0 || x === g_map.length -1 || z === g_map[0].length - 1);
      // outer wall is glass texture while internal walls are dirt texture
      const texture = isEdge ? 4 : 3;

      // if (height > 0) {
      for (let y = 0; y < height; y++) {
          let w = new Cube();
          w.textureNum = texture; //texture
          w.matrix.translate(x-16, -.65 + y, z-16);
          walls.push(w);
        }

      }
    }
  }

var g_map=[
  [0],
];

g_map.length === 5;
g_map[0].length === 5;

function drawMap() {
  for (let x=0;x<g_map.length;x++) {
    for (let z=0;z<g_map[0].length;z++) {
      //console.log(x,y);
      let height = g_map[x][z]; //N
      
      if (height >0) {
        for (let y = 0; y < height; y++) { 
          var body = new Cube();
          body.textureNum=4; //texture
          body.matrix.translate(x-16,-.65+y, z-16);
          body.renderfast();
        }
      }
    }
  }
}

//keeps rat from going outside the map array
function Boundary(worldX, worldZ) {
  const mapX = Math.floor(worldX + 16);
  const mapZ = Math.floor(worldZ + 16);
  if (mapX < 0 || mapX >= g_map.length || mapZ < 0 || mapZ >= g_map[0].length) {
    return true;
  } 
  return g_map[mapX][mapZ] > 0;
}

//collision detection function 
function collisionDetect(worldX, worldZ) {
  const r = 0.25;
  const shift = 0.001;

  const pts = [
    [worldX + r - shift, worldZ],
    [worldX - r + shift, worldZ],
    [worldX, worldZ + r - shift],
    [worldX, worldZ - r + shift],
    [worldX + r - shift, worldZ + r - shift],
    [worldX + r - shift, worldZ - r + shift],
    [worldX - r + shift, worldZ + r - shift],
    [worldX - r + shift, worldZ - r + shift],
  ];

  for (const [x,z] of pts) {
    if (Boundary(x,z)) {
      return true;
    }  
  }
  return false;

}

function getSquare(d) { //want square infront of us
  const f = new Vector3();
  f.set(camera.at);
  f.sub(camera.eye);

  f.elements[1] = 0; //disregard y coord here
  const len = Math.sqrt( f.elements[0] * f.elements[0] + f.elements[2] * f.elements[2]
  );

  if (len < 0.0001) {
    return null;
  }

  f.elements[0] /= len; //x coord normalizd
  f.elements[2] /= len; //z coord normalizd
  
  const push = 0.15;
  const worldX = camera.eye.elements[0] + f.elements[0] * (d+push);
  const worldZ = camera.eye.elements[2] + f.elements[2] * (d+push);
  const mapX = Math.floor(worldX + 16);
  const mapZ = Math.floor(worldZ + 16);

  if (mapX < 0 || mapX >= g_map.length || mapZ < 0 || mapZ >= g_map[0].length) {
    return null;
  }

  return {mapX, mapZ};

}

const max_height = 10; //max height of blocks to prevent lag / overflows 

function addBlock() { //add block in front
  const square = getSquare(2);
  if (!square) {
    console.log('No square in front to add block');
    return;
  }
  const {mapX, mapZ} = square;
  g_map[mapX][mapZ] = Math.min(max_height, g_map[mapX][mapZ] + 1); //height increment w limit
}

function delBlock() { //delete block in front
  const square = getSquare(2);
  if (!square) {
    console.log('No square in front to delete block');
    return;
  }
  const {mapX, mapZ} = square;
  g_map[mapX][mapZ] = Math.max(0, g_map[mapX][mapZ] - 1); //height decrement w limit
}

function newFP(){ //creates a new view over the rat no matter where it's moved to 
  const height = 1;
  const d = 1;

  
  camera.eye.elements[0] = g_rat.position[0] + RAT_OFFSET[0];
  camera.eye.elements[1] = g_rat.position[1] + height;
  camera.eye.elements[2] = g_rat.position[2] + RAT_OFFSET[2];

  // const offset = -90;
  // const yaw = g_fpsYaw + (g_rat.rotation * Math.PI / 180);

  // const fx = Math.sin(yaw);
  // const fz = -Math.cos(yaw);
  // g_fpsFwd = [fx, 0, fz];

  let fx = g_ratHead[0];
  let fz = g_ratHead[2];

  let len = Math.sqrt(fx*fx + fz*fz);
  if (len < 0.0001) { // fallback
    fx = 0;
    fz = -1;
    len = 1;
  }
  fx /= len;
  fz /= len;

  camera.at.elements[0] = camera.eye.elements[0] + fx * d;
  camera.at.elements[1] = camera.eye.elements[1];
  camera.at.elements[2] = camera.eye.elements[2] + fz * d;

  camera.up.elements[0] = 0;
  camera.up.elements[1] = 1;
  camera.up.elements[2] = 0;
}

// function restart() { //restart to center, restart rat position, reset score and time counters
//   g_mode = "fps";
//   final();
//   g_final = false;
//   g_startTime = performance.now() / 1000;
//   g_timer = true;
//   g_tEnd = 0;

//   g_cheeseCollected = 0;
//   // g_cheese = true;
//   spawnCheese(); //randomly places 5 cheese cubes

//   g_rat.position[0] = g_ratPosition[0];
//   g_rat.position[1] = g_ratPosition[1];
//   g_rat.position[2] = g_ratPosition[2];
//   g_rat.rotation = 0;

//   camera.eye.elements[0] = g_eye.elements[0];
//   camera.eye.elements[1] = g_eye.elements[1];
//   camera.eye.elements[2] = g_eye.elements[2];

//   camera.at.elements[0] = g_at.elements[0];
//   camera.at.elements[1] = g_at.elements[1];
//   camera.at.elements[2] = g_at.elements[2];

//   camera.up.elements[0] = g_up.elements[0];
//   camera.up.elements[1] = g_up.elements[1];
//   camera.up.elements[2] = g_up.elements[2];

//   const fx = camera.at.elements[0] - camera.eye.elements[0];
//   const fz = camera.at.elements[2] - camera.eye.elements[2];
//   const len = Math.sqrt(fx*fx + fz*fz) || 1;
//   g_fpsFwd = [fx/len, 0, fz/len];
//   g_fpsYaw = Math.atan2(g_fpsFwd[0], -g_fpsFwd[2]);

// }



function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();

  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT );

  // if (g_mode === "fps") {
  //   newFP();
  // }

  if (g_mode === "overhead") {
    Overhead();
  }

  camera.viewMatrix.setLookAt(
    camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2],
    camera.at.elements[0],  camera.at.elements[1],  camera.at.elements[2],
    camera.up.elements[0],  camera.up.elements[1],  camera.up.elements[2]
  )

  gl.uniformMatrix4fv(u_ViewMatrix, false, camera.viewMatrix.elements);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, camera.projectionMatrix.elements);


  //Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_globalAngle,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //draw the GROUND ==========
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.textureNum=2;
  body.matrix.translate(-16, -.76, -16);
  body.matrix.scale(32,0.1,32);
  // body.matrix.translate(-.5, 0, -0.5);
  body.render();

  //draw the SKY BOX ==========
  var sky = new Cube();
  sky.color = [1.0, 0.0, 0.0, 1.0];
  sky.textureNum=1;
  sky.matrix.scale(150,150,150);
  sky.matrix.translate(-.5, -0.5, -0.5);
  sky.render();
  
  // drawMap();
  for (let i = 0; i < walls.length; i++) {
    walls[i].renderfast();
  }

  //draw the RAT ==========
  g_rat.render();


  // var body = new Cube();
  // body.color = [1.0, 0.0, 0.0, 1.0];
  // body.textureNum=0;
  // body.matrix.translate(-.25, -.75, 0.0);
  // body.matrix.rotate(-5,1,0,0);
  // body.matrix.scale(0.5, .3, .5);
  // body.render();

  // var bodyCoordinates= new Matrix4(body.matrix);

  // draw a left arm
  // var yellow = new Cube();
  // yellow.color = [1,1,0,1];
  // yellow.matrix.setTranslate(0, -.5, 0.0);
  // yellow.matrix.rotate(-5,1,0,0);
  // yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  // var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  // yellow.matrix.scale(0.25, .7, .5);
  // yellow.matrix.translate(-.5,0,0);
  // yellow.render();


  // Test box
  // var magenta = new Cube();
  // magenta.color = [1,0,1,1];
  // magenta.textureNum=0;
  // magenta.matrix = yellowCoordinatesMat;
  // magenta.matrix.translate(0, 0.65, 0);
  // magenta.matrix.rotate(-g_magentaAngle, 0,0,1);
  // magenta.matrix.scale(.3,.3,.3);
  // magenta.matrix.translate(-.5, 0, -0.001);
  // magenta.render();


  //ground plane
  // var ground = new Cube();
  // ground.matrix.translate(0, 0, -1);
  // ground.matrix.scale(2, .1, 2);
  // ground.render();


  //check the time at the end of the funciton, and show on web pg
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + g_fps, "numdot");
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

