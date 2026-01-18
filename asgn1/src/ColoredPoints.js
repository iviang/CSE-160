// ColoredPoint.js (c) 2012 matsuda
// Vertex shader program
var VSHADER_SOURCE = `
  attribute vec4 a_Position;
  uniform float u_Size;
  void main() {
    gl_Position = a_Position;
    gl_PointSize = u_Size;
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

  // Get the storage location of u_Size
  u_Size = gl.getUniformLocation(gl.program, 'u_Size');
  if (!u_Size) {
    console.log('Failed to get the storage location of u_Size');
    return;
  }

}

//constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

//global variables related to UI
let g_selectedColor=[1.0,1.0,1.0,1.0];
let g_selectedSize=5;
let g_selectedType=POINT;
let g_selectedSeg=10;

//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events
  document.getElementById('green').onclick = function(){ g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById('red').onclick = function(){ g_selectedColor = [1.0,0.0,0.0,1.0]; };

  document.getElementById('clearButton').onclick = function(){ g_shapesList = []; renderAllShapes();};

  document.getElementById('pointButton').onclick = function(){ g_selectedType=POINT;};
  document.getElementById('triButton').onclick = function(){ g_selectedType=TRIANGLE;};
  document.getElementById('circleButton').onclick = function(){ g_selectedType=CIRCLE;};

  document.getElementById('recreateButton').onclick = function(){ recreatePic();};

  //slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100; });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100; });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100; });

  //size slider events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

  //segment slider events
  document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

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
  gl.clear(gl.COLOR_BUFFER_BIT);
}

var g_shapesList = [];

// var g_points = [];  // The array for the position of a mouse press
// var g_colors = [];  // The array to store the color of a point
// var g_sizes = []; // the array to store the size of a point

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
    point.segments = g_selectedSeg;
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

//draw every shape that is supposed to be in the canvas

function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();
  
  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //draw each shape in the list
  var len = g_shapesList.length;

  for (var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }

  //check the time at the end of the funciton, and show on web pg
  var duration = performance.now() - startTime;
  sendTextToHTML("numdot: " + len + " ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

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

//color creation
const BLACK = [0.0, 0.0, 0.0, 1.0];
const BROWN = [0.55, 0.27, 0.07, 1.0];
const TAN   = [0.85, 0.70, 0.50, 1.0];
const PINK  = [1.0, 0.6, 0.6, 1.0];

//function to make the graphic of my reference
function recreatePic() {
  g_shapesList = []; //clear the page
  gl.clear(gl.COLOR_BUFFER_BIT);

  insertTri([-0.2, 0.0,  0.2, 0.0,  0.0, 0.3], [1, 0, 0, 1]);

  insertTri([-0.6, 0.6,  -0.4, 0.8,  -0.5, 0.9], BROWN);
  insertTri([-0.5, 0.9,  -0.4, 0.8,  -0.3, 0.9], BROWN);
  insertTri([-0.4, 0.8,  -0.3, 0.9,  -0.2, 0.8], BROWN);
  insertTri([-0.3, 0.9,  -0.2, 0.8,  -0.1, 0.85], BROWN);

  renderAllShapes();


}

function insertTri(x, y, size, color) {
  let t = new Triangle();
  t.vertices = vertices;
  // t.position = [x, y];
  // t.size = size;
  t.color = color;
  g_shapesList.push(t);
}