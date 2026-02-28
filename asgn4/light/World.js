// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  attribute vec3 a_Normal;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  varying vec4 v_VertPos;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_NormalMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
    v_Normal = normalize(vec3(u_NormalMatrix * vec4(a_Normal,1)));
    // v_Normal = a_Normal;
    v_VertPos = u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  varying vec3 v_Normal;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform sampler2D u_Sampler2;
  uniform sampler2D u_Sampler3;
  uniform sampler2D u_Sampler4;

  uniform int u_whichTexture;
  uniform vec3 u_lightPos;
  uniform vec3 u_cameraPos;
  varying vec4 v_VertPos;
  uniform float u_specStrength;
  uniform bool u_lightOn;

  void main() {
    if (u_whichTexture == -3) {
      gl_FragColor = vec4((v_Normal+1.0)/2.0, 1.0);     //use normal
    } else if (u_whichTexture == -2) {
      gl_FragColor = u_FragColor;                       //use color

    } else if (u_whichTexture == -1) {                  //use UV debug color
      gl_FragColor = vec4(v_UV, 1.0, 1.0);

    } else if (u_whichTexture == 0) {                   //use texture0 = uv grid
      gl_FragColor = texture2D(u_Sampler0, v_UV);       

    } else if (u_whichTexture == 1) {                   //use texture1 = cheese
      gl_FragColor = texture2D(u_Sampler1, v_UV);       
    } else if (u_whichTexture == 2) {                   //use texture2 = grass
      gl_FragColor = texture2D(u_Sampler2, v_UV);       
    } else {                                            //error push Redish
      gl_FragColor = vec4(1,.2,.2,1);
    }

    vec3 lightVector = u_lightPos - vec3(v_VertPos) ;
    float r=length(lightVector);

    //R/G visualization
    // if (r<1.0) {
    //   gl_FragColor= vec4(1,0,0,1);
    // } else if (r<2.0) {
    //   gl_FragColor= vec4(0,1,0,1);
    // }

    //light fall off visualization 1/r^2
    // gl_FragColor = vec4(vec3(gl_FragColor)/(r*r),1);  

    //N dot L
    vec3 L = normalize(lightVector);
    vec3 N = normalize(v_Normal);
    float nDotL = max(dot(N,L), 0.0);

    //reflection
    vec3 R = reflect(-L,N);

    //eye
    vec3 E = normalize(u_cameraPos - vec3 (v_VertPos));

    //specular
    float specular = u_specStrength * pow(max(dot(E,R), 0.0), 64.0);
  
    vec3 diffuse = vec3(gl_FragColor) * nDotL *0.7;
    vec3 ambient = vec3(gl_FragColor) * 0.2;
    if (u_lightOn) {
      gl_FragColor = vec4(diffuse + ambient + vec3(specular), 1.0);
      // if (u_whichTexture == 0) {
      //   gl_FragColor = vec4(specular+diffuse+ambient, 1.0);
      // } else {
      //   gl_FragColor = vec4(diffuse+ambient, 1.0);  
      // }
    }
    




  }`


// Global Variables
let canvas;
let camera; 
let gl;
let a_Position;
let a_UV; 
let a_Normal; //added
let u_lightPos; //added
let u_cameraPos; //added
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_NormalMatrix;
let u_ProjectionMatrix;
let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_specStrength; //added
let u_lightOn;
let u_Sampler0;
let u_Sampler1;
let u_Sampler2;

let g_rat = null;
let g_ratHead = [0,0,-1];
const RAT_OFFSET = [0.25, 0, 0.25];

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

  // Get the storage location of a_Normal
  a_Normal = gl.getAttribLocation(gl.program, 'a_Normal');
  if (a_Normal < 0) {
    console.log('Failed to get the storage location of a_Normal');
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

  //get the storage location of u_ModelMatrix
  u_NormalMatrix = gl.getUniformLocation(gl.program, 'u_NormalMatrix');
  if (!u_NormalMatrix) {
    console.log('Failed to get the storage lcoation of u_NormalMatrix');
    return;
  }

  //get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage lcoation of u_GlobalRotateMatrix');
    return;
  }

  u_lightPos = gl.getUniformLocation(gl.program, 'u_lightPos');
  if (!u_lightPos) {
    console.log('Failed to get the storage location of u_lightPos');
    return;
  }

  u_specStrength = gl.getUniformLocation(gl.program, 'u_specStrength');
  if (!u_specStrength) {
    console.log('Failed to get the storage location of u_specStrength');
    return;
  }

  u_cameraPos = gl.getUniformLocation(gl.program, 'u_cameraPos');
  if (!u_cameraPos) {
    console.log('Failed to get the storage location of u_cameraPos');
    return;
  }

  u_lightOn = gl.getUniformLocation(gl.program, 'u_lightOn');
  if (!u_lightOn) {
    console.log('Failed to get the storage location of u_lightOn');
    return;
  }

  
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
let g_normalOn=false;
let g_lightOn=true;
let g_lightPos=[0,1.5,0.5]; //added

//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events ===================

  document.getElementById('lightOn').onclick = function() {g_lightOn=true};
  document.getElementById('lightOff').onclick = function() {g_lightOn=false};
  document.getElementById('normalOn').onclick = function() {g_normalOn=true};
  document.getElementById('normalOff').onclick = function() {g_normalOn=false};
  document.getElementById('animationYellowOffButton').onclick = function() {g_yellowAnimation=false;};
  document.getElementById('animationYellowOnButton').onclick = function() {g_yellowAnimation=true;};

  document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
  document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};
  // slider events =====================
  document.getElementById('yellowSlide').addEventListener('mousemove', function(ev) { if(ev.buttons ==1) {g_yellowAngle = this.value; renderAllShapes(); }});
  document.getElementById('magentaSlide').addEventListener('mousemove', function(ev) { if(ev.buttons ==1) { g_magentaAngle = this.value; renderAllShapes(); }});
  document.getElementById('lightSlideX').addEventListener('mousemove', function(ev) { if(ev.buttons ==1) { g_lightPos[0] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideY').addEventListener('mousemove', function(ev) { if(ev.buttons ==1) { g_lightPos[1] = this.value/100; renderAllShapes(); }});
  document.getElementById('lightSlideZ').addEventListener('mousemove', function(ev) { if(ev.buttons ==1) { g_lightPos[2] = this.value/100; renderAllShapes(); }});

  canvas.onmousemove = function(ev) {if (ev.buttons == 1) { click(ev) }};

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
  image0.src = '../textures/uvgrid.png';

  //CHEESE TEXTURE==========
  var image1 = new Image();  // Create the image object
  if (!image1) {
    console.log('Failed to create the image object');
    return false;
  }
  // Register the event handler to be called on loading an image
  image1.onload = function(){ sendTextureToTEXTURE1(image1); };
  // Tell the browser to load an image
  image1.src = '../textures/cheese.jpg';

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

function sendTextureToTEXTURE1(image) { //cheese
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


function main() {

  setupWebGL(); //set up canvas and gl variables
  connectVariablesToGLSL(); //set up GLSL shader prgms and connect GLSL variables
  camera = new Camera(canvas); // set up camera
  g_rat = new Rat(); //set up rat
  g_rat.position = [1.2, -.5, -1.2];
  g_rat.rotation = 180;
  g_eye = new Vector3([camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]]);
  g_at  = new Vector3([camera.at.elements[0],  camera.at.elements[1],  camera.at.elements[2]]);
  g_up  = new Vector3([camera.up.elements[0],  camera.up.elements[1],  camera.up.elements[2]]);

  //set up actions for the HTML UI elements
  addActionsForHtmlUI();
  // Mouse detection
  mouseDetect();  
  document.onkeydown = keydown;

  initTextures();
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
var g_seconds=performance.now()/1000.0-g_startTime;

let g_prevTime = performance.now();
let g_fps = 0;
let g_fpsFrames = 0;

// Called by browser repeatedly whenever its time
function tick() {
  // save current time
  const now = performance.now();
  g_fpsFrames++;

  if (now - g_prevTime >= 1000) {
    g_fps = g_fpsFrames;
    g_fpsFrames = 0;
    g_prevTime = now;
  }

  g_seconds = performance.now()/1000 - g_startTime;

  updateAnimationAngles();


  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

//update the angles of everything if currently animated
function updateAnimationAngles(){
  if (g_yellowAnimation) {
    g_yellowAngle = (45*Math.sin(g_seconds));
  }
  if (g_magentaAnimation) {
    g_magentaAngle = (45*Math.sin(3*g_seconds));
  }
  g_lightPos[0] = 2.3*Math.cos(g_seconds);

}


function keydown(ev) { //modify for the wasd keys
  const speed = 0.1; //speed
  const alpha = 5; //rotation speed

  if (g_mode === "fps") {
      if (ev.keyCode == 87) {    // W
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
  } 

}

function drawMap() {
  for (let x=0;x<g_map.length;x++) {
    for (let z=0;z<g_map[0].length;z++) {
      //console.log(x,y);
      let height = g_map[x][z]; //N
      
      if (height >0) {
        for (let y = 0; y < height; y++) { 
          var body = new Cube();
          body.textureNum=4; //texture
          body.matrix.translate(x-2.5,-.65+y, z-2.5);
          body.renderfast();
        }
      }
    }
  }
}


function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();

  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT );


  //Pass the light pos to GLSL
  gl.uniform3f(u_lightPos, g_lightPos[0], g_lightPos[1], g_lightPos[2]);

  //pass the camera pos to GLSL
  gl.uniform3f(u_cameraPos,camera.eye.elements[0], camera.eye.elements[1], camera.eye.elements[2]);

  gl.uniform1i(u_lightOn, g_lightOn);

  //Draw the light
  var light = new Cube();
  light.color = [2,2,0,1];
  light.matrix.translate(g_lightPos[0], g_lightPos[1], g_lightPos[2]);
  light.matrix.scale(-.1,-.1,-.1);
  light.matrix.translate(-.5,-.5,-.5);
  light.render();


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
  body.matrix.translate(0, -0.76, 0);
  body.matrix.scale(5, 0.1, 5);
  body.matrix.translate(-0.5, 0, -0.5);
  gl.uniform1f(u_specStrength, 0.0);
  body.render();

  //draw the SKY BOX ==========
  var sky = new Cube();
  sky.color = [0.5, 0.75, 1, 1.0]; // blue color
  if (g_normalOn) sky.textureNum=-3;
  sky.matrix.scale(-5, -5, -5);
  sky.matrix.translate(-0.5, -0.5, -0.5);
  gl.uniform1f(u_specStrength, 0.0);
  sky.render();
    
  // drawMap();
  for (let i = 0; i < walls.length; i++) {
    walls[i].renderfast();
  }

  //draw the RAT ==========
  g_rat.render();

  //CHEESE BALL
  var sphere = new Sphere();
  gl.uniform1f(u_specStrength, 1.0);
  sphere.textureNum = 1; //cheese texture
  if (g_normalOn) sphere.textureNum=-3;
  sphere.matrix.translate(0, -0.2, -1);
  sphere.matrix.scale(0.5, 0.5, 0.5)
  sphere.render();

  var body = new Cube();
  body.textureNum = 1; //cheese texture
  body.color = [1.0, 0.0, 0.0, 1.0];
  if (g_normalOn) body.textureNum=-3;
  body.matrix.translate(-1.75, -.75, -0.7);
  body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(0.5, .3, .5);
  body.normalMatrix.setInverseOf(body.matrix).transpose();

  body.render();

  var bodyCoordinates= new Matrix4(body.matrix);

  // draw a left arm
  var yellow = new Cube();
  yellow.textureNum = 1; //cheese texture

  yellow.color = [1,1,0,1];
  if (g_normalOn) yellow.textureNum=-3;
  yellow.matrix = bodyCoordinates;

  yellow.matrix.setTranslate(-1.5, -.5, -0.7);
  yellow.matrix.rotate(-5,1,0,0);
  yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  yellow.matrix.scale(0.25, .7, .5);
  yellow.matrix.translate(-.5,0,0);
  yellow.normalMatrix.setInverseOf(yellow.matrix).transpose();
  yellow.render();


  // Test box
  var magenta = new Cube();
  magenta.textureNum = 1; //cheese texture

  magenta.color = [1,0,1,1];
  if (g_normalOn) magenta.textureNum=-3;
  // magenta.textureNum=0;
  magenta.matrix = yellowCoordinatesMat;
  magenta.matrix.translate(0, 0.65, 0);
  magenta.matrix.rotate(-g_magentaAngle, 0,0,1);
  magenta.matrix.scale(.3,.3,.3);
  magenta.matrix.translate(-.5, 0, -0.001);
  magenta.normalMatrix.setInverseOf(magenta.matrix).transpose();

  magenta.render();

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
  }
  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
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

