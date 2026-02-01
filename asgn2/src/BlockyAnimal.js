// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  void main() {
    gl_Position = u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  uniform vec4 u_FragColor;
  void main() {
    gl_FragColor = u_FragColor;
  }`

// Global Variables
let canvas;
let gl;
let a_Position;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
let u_GlobalRotateMatrix;
 
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

  // // Get the storage location of a_Position
  a_Position = gl.getAttribLocation(gl.program, 'a_Position');
  if (a_Position < 0) {
    console.log('Failed to get the storage location of a_Position');
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

  //set an initial value for this matrix to identity
  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);

}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//global variables related to UI
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_AnimalGlobalRotation=0;

let g_btail=0;
let g_m1tail=0;
let g_m2tail=0;
let g_tiptail=0;

let g_upperFR= 0;
let g_lowerFR= 0;
let g_pawFR=0;

let g_upperBR= 0;
let g_lowerBR= 0;
let g_pawBR=0;

let g_upperFL= 0;
let g_lowerFL= 0;
let g_pawFL=0;

let g_upperBL= 0;
let g_lowerBL= 0;
let g_pawBL=0;

let g_headAnimation=false;
let g_headAngle=0;

let g_upperFRAnimation=false;
let g_lowerFRAnimation=false;


//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events
  document.getElementById('animationHeadOffButton').onclick = function() {g_headAnimation=false;};
  document.getElementById('animationHeadOnButton').onclick = function() {g_headAnimation=true;};

  document.getElementById('animationFrontRightLegOffButton').onclick = function() {g_upperFRAnimation=false;};
  document.getElementById('animationFrontRightLegOnButton').onclick = function() {g_upperFRAnimation=true;};

  document.getElementById('animationLowerFrontRightLegOffButton').onclick = function() {g_lowerFRAnimation=false;};
  document.getElementById('animationLowerFrontRightLegOnButton').onclick = function() {g_lowerFRAnimation=true;};

  // document.getElementById('animationMagentaOffButton').onclick = function() {g_magentaAnimation=false;};
  // document.getElementById('animationMagentaOnButton').onclick = function() {g_magentaAnimation=true;};

  // slider events
  document.getElementById('headSlide').addEventListener('mousemove', function() { g_headAngle = this.value; renderAllShapes(); });

  document.getElementById('upperFRSlide').addEventListener('mousemove', function() { g_upperFR = this.value; renderAllShapes(); });
  document.getElementById('lowerFRSlide').addEventListener('mousemove', function() { g_lowerFR = this.value; renderAllShapes(); });


  // document.getElementById('magentaSlide').addEventListener('mousemove', function() { g_magentaAngle = this.value; renderAllShapes(); });

  //size slider events
  // document.getElementById('angleSlide').addEventListener('mouseup', function() { g_AnimalGlobalRotation = this.value; renderAllShapes(); });
  document.getElementById('angleSlide').addEventListener('mousemove', function() { g_AnimalGlobalRotation = this.value; renderAllShapes(); });
}

function main() {

  setupWebGL(); //set up canvas and gl variables
  connectVariablesToGLSL(); //set up GLSL shader prgms and connect GLSL variables

  //set up actions for the HTML UI elements
  addActionsForHtmlUI();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  //canvas.onmousemove = click;

  canvas.onmousemove = function(ev) { if(ev.buttons == 1) { click(ev) } };
  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
//   gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
  requestAnimationFrame(tick);

}

var g_startTime=performance.now()/1000.0;
var g_seconds=performance.now()/1000.0-g_startTime;

// Called by browser repeatedly whenever its time
function tick() {
  // save current time
  g_seconds=performance.now()/1000.0-g_startTime;
  console.log(g_seconds);

  //update animation angles
  updateAnimationAngles();

  // Draw everything
  renderAllShapes();

  // Tell the browser to update again when it has time
  requestAnimationFrame(tick);
}

//update the anggles of everything if currently animated
function updateAnimationAngles(){
  if (g_headAnimation) {
    g_headAngle = (45*Math.sin(g_seconds));
  }
  if (g_upperFRAnimation) {
    const min = -10;
    const max = 35;
    const midpoint = (min + max) / 2;
    const amplitude = (max - min) / 2;
    
    g_upperFR = midpoint + amplitude * Math.sin(3*g_seconds); //restricted the movement into a natural looking range 
  }
  if (g_lowerFRAnimation) {
    const min = -35;
    const max = 5;
    const midpoint = (min + max) / 2;
    const amplitude = (max - min) / 2;
    
    g_lowerFR = midpoint + amplitude * Math.sin(3*g_seconds); //restricted the movement into a natural looking range 
  }

}

function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();
  
  //Pass the matrix to u_ModelMatrix attribute
  var globalRotMat=new Matrix4().rotate(g_AnimalGlobalRotation,0,1,0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  // gl.clear(gl.COLOR_BUFFER_BIT );

  //base
  var base = new Matrix4();
  base.translate(-0.30, -0.20, -0.15); //attaches to the body and butt cubes

  //draw the body cube
  var body = new Cube();
  body.color = [0.7, 0.7, 0.7, 1.0]; //light GREY COLORED
  body.matrix.set(base); 
  // body.matrix.translate(-.3, -.2, -0.15);
  // body.matrix.rotate(-5,1,0,0);
  body.matrix.scale(.5, .3, .5);
  body.render();

  var bodyCoordinates= new Matrix4(body.matrix);

  //butt

  var butt = new Cube();
  butt.color = [0.6, 0.6, 0.6, 1.0]; //darker grey
  butt.matrix.set(base);
  butt.matrix.translate(-0.20, -0.05, -0.025);
  butt.matrix.scale(0.3, 0.35, 0.55);
  butt.render();
  
  var buttCoordinates = new Matrix4(butt.matrix);

  // TAIL =======================================================
  // connect to butt

  //base of tail
  var btail = new Cube();
  btail.color = [1,0,0,0];
  btail.matrix.set(buttCoordinates); //connects to butt
  btail.matrix.translate(-.3,.15,.4);
  btail.matrix.rotate(g_btail, 0,0,1);
  btail.matrix.scale(.3, .3, .2);
  btail.render();

  var btailCoordinates = new Matrix4(btail.matrix);

  // mid tail 1

  var m1tail = new Cube();
  m1tail.color = [1,0,0,1];
  m1tail.matrix.set(btailCoordinates); //connect to base of tail
  m1tail.matrix.translate(-1,.1,.2);
  m1tail.matrix.rotate(g_m1tail, 0,0,1);
  m1tail.matrix.scale(1, .8, .6);
  m1tail.render();

  var m1tailCoordinates = new Matrix4(m1tail.matrix);

  // mid tail 2
  var m2tail = new Cube();
  m2tail.color = [1,0,0,0];
  m2tail.matrix.set(m1tailCoordinates); //connect to base of tail
  m2tail.matrix.translate(-1,.1,.2);
  m2tail.matrix.rotate(g_m2tail, 0,0,1);
  m2tail.matrix.scale(1, .65, .6);
  m2tail.render();

  var m2tailCoordinates = new Matrix4(m2tail.matrix);

  // tail tip
  var tiptail = new Cube();
  tiptail.color = [1,0,0,1];
  tiptail.matrix.set(m2tailCoordinates); //connect to base of tail
  tiptail.matrix.translate(-1,.1,.2);
  tiptail.matrix.rotate(g_tiptail, 0,0,1);
  tiptail.matrix.scale(1, .65, .6);
  tiptail.render();

  //HEAD ==================================================================================
  
  var head = new Cube();
  head.color = [1,0,0,1];
  head.matrix.set(bodyCoordinates); //connects to body
  head.matrix.translate(1,0,0.07);
  head.matrix.rotate(-g_headAngle, 0,1,0); //move head
  head.matrix.scale(.5, .9, .85);
  head.render();

  var headCoordinates = new Matrix4(head.matrix);

  //snout
  var snout = new Cube();
  snout.color = [1,0,0,0];
  snout.matrix.set(headCoordinates); //connects to head
  snout.matrix.translate(1,0.05,0.16);
  snout.matrix.scale(.6, .8, .7);
  snout.render();

  var snoutCoordinates = new Matrix4(snout.matrix);

  //nose
  var nose = new Cube();
  nose.color = [1,0,0,1];
  nose.matrix.set(snoutCoordinates); //connects to head
  nose.matrix.translate(1,0.05,0.4);
  nose.matrix.scale(.4, .3, .2);
  nose.render();

  //LEGS (4 upper + 4 lower + 4 paws) =======================================================

  //R SIDE:==============================================

  // upper FRONT RIGHT leg
  var upperFR = new Cube();
  upperFR.color = [1,1,0,1]; // [0.6, 0.6, 0.6, 1.0];

  upperFR.matrix.set(bodyCoordinates); //connects to body
  upperFR.matrix.translate(0.75, -.3, -0.01);
  upperFR.matrix.rotate(g_upperFR, 0,0,1); //move the leg
  upperFR.matrix.scale(0.15, 0.6, 0.25);
  upperFR.render(); 
  var upperFRCoordinates=new Matrix4(upperFR.matrix);

  // lower FRONT RIGHT leg
  var lowerFR = new Cube();
  lowerFR.color = [1,0,0,1]; // [0.6, 0.6, 0.6, 1.0];

  lowerFR.matrix.set(upperFRCoordinates); //CONNECTS TO UPPER LEG
  // lowerFR.matrix.translate(0, -1, 0);

  lowerFR.matrix.translate(1, 0, 0.5);
  lowerFR.matrix.rotate(g_lowerFR, 0,0,1); //set up for joint
  lowerFR.matrix.scale(0.8, .7, 0.9);
  lowerFR.matrix.translate(-1.0, -1.0, -0.5);

  lowerFR.render();
  var lowerFRCoordinates=new Matrix4(lowerFR.matrix);

  // Front RIGHT paw
  var pawFR = new Cube();
  pawFR.color = [1,0,0,0]; // [0.6, 0.6, 0.6, 1.0];

  pawFR.matrix.set(lowerFRCoordinates); //CONNECTS TO UPPER LEG
  pawFR.matrix.translate(.5, -.1, 0.1);
  pawFR.matrix.rotate(g_pawFR, 0,0,1); //set up for joint
  pawFR.matrix.scale(0.8, .1, 0.9);
  pawFR.render();


  
  // upper BACK RIGHT leg
  var upperBR = new Cube();
  upperBR.color = [1,1,0,1]; // [0.6, 0.6, 0.6, 1.0];

  upperBR.matrix.set(buttCoordinates); //connects to body
  upperBR.matrix.translate(0.5, -.05, -0.01);
  upperBR.matrix.rotate(g_upperBR, 0,0,1);
  upperBR.matrix.scale(0.4, 0.6, 0.2);
  upperBR.render(); 
  var upperBRCoordinates=new Matrix4(upperBR.matrix);

  // lower BACK RIGHT leg
  var lowerBR = new Cube();
  lowerBR.color = [1,0,0,1]; // [0.6, 0.6, 0.6, 1.0];

  lowerBR.matrix.set(upperBRCoordinates); //CONNECTS TO UPPER LEG
  lowerBR.matrix.translate(.2, -.7, 0.1);
  lowerBR.matrix.rotate(g_lowerBR, 0,0,1); //set up for joint
  lowerBR.matrix.scale(0.8, .7, 0.9);
  lowerBR.render();
  var lowerBRCoordinates=new Matrix4(lowerBR.matrix);

  // BACK RIGHT paw
  var pawBR = new Cube();
  pawBR.color = [1,0,0,0]; // [0.6, 0.6, 0.6, 1.0];

  pawBR.matrix.set(lowerBRCoordinates); //CONNECTS TO UPPER LEG
  pawBR.matrix.translate(.5, -.1, 0.1);
  pawBR.matrix.rotate(g_pawBR, 0,0,1); //set up for joint
  pawBR.matrix.scale(0.8, .1, 0.9);
  pawBR.render();

  //L SIDE: =================================================

  // upper FRONT LEFT leg
  var upperFL = new Cube();
  upperFL.color = [1,1,0,1]; // [0.6, 0.6, 0.6, 1.0];

  upperFL.matrix.set(bodyCoordinates); //connects to body
  upperFL.matrix.translate(0.75, -.3, .72);
  upperFL.matrix.rotate(g_upperFL, 0,0,1);
  upperFL.matrix.scale(0.15, 0.6, 0.25);
  upperFL.render(); 
  var upperFLCoordinates=new Matrix4(upperFL.matrix);

  // lower FRONT LEFT leg
  var lowerFL = new Cube();
  lowerFL.color = [1,0,0,1]; // [0.6, 0.6, 0.6, 1.0];

  lowerFL.matrix.set(upperFLCoordinates); //CONNECTS TO UPPER LEG
  lowerFL.matrix.translate(.2, -.7, 0.01);
  lowerFL.matrix.rotate(g_lowerFL, 0,0,1); //set up for joint
  lowerFL.matrix.scale(0.8, .7, 0.9);
  lowerFL.render();
  var lowerFLCoordinates=new Matrix4(lowerFL.matrix);

  // Front LEFT paw
  var pawFL = new Cube();
  pawFL.color = [1,0,0,0]; // [0.6, 0.6, 0.6, 1.0];

  pawFL.matrix.set(lowerFLCoordinates); //CONNECTS TO UPPER LEG
  pawFL.matrix.translate(.5, -.1, 0.1);
  pawFL.matrix.rotate(g_pawFL, 0,0,1); //set up for joint
  pawFL.matrix.scale(0.8, .1, 0.9);
  pawFL.render();


  // upper BACK LEFT leg
  var upperBL = new Cube();
  upperBL.color = [1,1,0,1]; // [0.6, 0.6, 0.6, 1.0];

  upperBL.matrix.set(buttCoordinates); //connects to body
  upperBL.matrix.translate(0.5, -.05, .81);
  upperBL.matrix.rotate(g_upperBL, 0,0,1);
  upperBL.matrix.scale(0.4, 0.6, 0.2);
  upperBL.render(); 
  var upperBLCoordinates=new Matrix4(upperBL.matrix);

  // lower BACK LEFT leg
  var lowerBL = new Cube();
  lowerBL.color = [1,0,0,1]; // [0.6, 0.6, 0.6, 1.0];

  lowerBL.matrix.set(upperBLCoordinates); //CONNECTS TO UPPER LEG
  lowerBL.matrix.translate(.2, -.7, -.01);
  lowerBL.matrix.rotate(g_lowerBL, 0,0,1); //set up for joint
  lowerBL.matrix.scale(0.8, .7, 0.9);
  lowerBL.render();
  var lowerBLCoordinates=new Matrix4(lowerBL.matrix);

  // BACK LEFT paw
  var pawBL = new Cube();
  pawBL.color = [1,0,0,0]; // [0.6, 0.6, 0.6, 1.0];

  pawBL.matrix.set(lowerBLCoordinates); //CONNECTS TO UPPER LEG
  pawBL.matrix.translate(.5, -.1, 0.1);
  pawBL.matrix.rotate(g_pawBL, 0,0,1); //set up for joint
  pawBL.matrix.scale(0.8, .1, 0.9);
  pawBL.render();

  // ==========================================


  //draw a left arm
  // var yellow = new Cube();
  // yellow.color = [1,1,0,1];
  // yellow.matrix.setTranslate(0, -.5, 0.0);
  // yellow.matrix.rotate(-5,1,0,0);
  // yellow.matrix.rotate(-g_yellowAngle, 0,0,1); 
  // var yellowCoordinatesMat=new Matrix4(yellow.matrix);
  // yellow.matrix.scale(0.25, .7, .5);
  // yellow.matrix.translate(-.5,0,0);
  // yellow.render();


  //Test box
  // var magenta = new Cube();
  // magenta.color = [1,0,1,1];
  // magenta.matrix = yellowCoordinatesMat;
  // magenta.matrix.translate(0, 0.65, 0);
  // magenta.matrix.rotate(-g_magentaAngle, 0,0,1);
  // magenta.matrix.scale(.3,.3,.3);
  // magenta.matrix.translate(-.5, 0, -0.001);
  // magenta.render();

  //a bunch of cubes rotating
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

var g_shapesList = [];
var g_redoList = []; 

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
