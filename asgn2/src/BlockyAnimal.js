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

function updatePreview(){
  const r = g_selectedColor[0];
  const g = g_selectedColor[1];
  const b = g_selectedColor[2];
  const a = g_selectedColor[3];
  const R = Math.round(r * 255);
  const G = Math.round(g * 255);
  const B = Math.round(b * 255);

  const preview = document.getElementById('colorPreview');
  if (preview) preview.style.backgroundColor = `rgba(${R}, ${G}, ${B}, ${a})`;

  const text = document.getElementById('colorText');
  if (text) text.innerHTML = `rgba(${R}, ${G}, ${B}, ${a.toFixed(2)})`;
}

//set up actions for the HTML UI elements
function addActionsForHtmlUI(){
  
  //Button Events
  document.getElementById('green').onclick = function(){ g_selectedColor = [0.0,1.0,0.0,1.0]; updatePreview(); };

  document.getElementById('red').onclick = function(){ g_selectedColor = [1.0,0.0,0.0,1.0]; updatePreview(); };

  document.getElementById('clearButton').onclick = function(){ g_shapesList = []; g_redoList = []; renderAllShapes();};

//   document.getElementById('undoButton').onclick = function () {
//     if (g_shapesList.length > 0) {const last = g_shapesList.pop(); g_redoList.push(last); renderAllShapes(); } 
//   };

//   document.getElementById('redoButton').onclick = function () {
//     if (g_redoList.length > 0) { const shape = g_redoList.pop(); g_shapesList.push(shape); renderAllShapes(); }
//   };

//   document.getElementById('downloadButton').onclick = function () { downloadCanvas();};

  document.getElementById('pointButton').onclick = function(){ g_selectedType=POINT;};
  document.getElementById('triButton').onclick = function(){ g_selectedType=TRIANGLE;};
  document.getElementById('circleButton').onclick = function(){ g_selectedType=CIRCLE;};

//   document.getElementById('recreateButton').onclick = function(){ recreatePic();};

  //slider events
  document.getElementById('redSlide').addEventListener('mouseup', function() { g_selectedColor[0] = this.value/100;  updatePreview(); });
  document.getElementById('greenSlide').addEventListener('mouseup', function() { g_selectedColor[1] = this.value/100;  updatePreview(); });
  document.getElementById('blueSlide').addEventListener('mouseup', function() { g_selectedColor[2] = this.value/100;  updatePreview(); });

  //size slider events
  document.getElementById('sizeSlide').addEventListener('mouseup', function() { g_selectedSize = this.value; });

//   //segment slider events
//   document.getElementById('segSlide').addEventListener('mouseup', function() { g_selectedSeg = this.value; });

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
  renderAllShapes();
}

var g_shapesList = [];
var g_redoList = []; 

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

//draw every shape that is supposed to be in the canvas

function renderAllShapes() {
  //check the time at the start of this function
  var startTime = performance.now();
  
  //Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT);

  //draw each shape in the list
    //   var len = g_shapesList.length;

    //   for (var i = 0; i < len; i++) {
    //     g_shapesList[i].render();
    //   }

  //draw a test triangle
  drawTriangle3D( [-1.0, 0.0, 0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0]); 

  //draw a cube
  var body = new Cube();
  body.color = [1.0,0.0,0.0,1.0];
  body.render();


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

// //color creation
// const BLACK = [0.0, 0.0, 0.0, 1.0];
// const DARK_BROWN = [0.35, 0.20, 0.10, 1.0];
// const BROWN = [0.55, 0.27, 0.07, 1.0];
// const TAN   = [0.65, 0.30, 0.20, 1.0]; //redish brown
// const PINK  = [1.0, 0.6, 0.6, 1.0];

// const RED = [1.0, 0.0, 0.0, 1.0];

//function to make the graphic of my reference
// function recreatePic() {
//   g_shapesList = []; //clear the page
//   gl.clear(gl.COLOR_BUFFER_BIT);

//   // insertTri([-0.2, 0.0,  0.2, 0.0,  0.0, 0.3], [1, 0, 0, 1]); //TEST

//   //left vert, right vert, top vert

//   //left eye
//   insertTri([-0.3, 0.0,   -0.2, 0.0,  -0.25, 0.05], BLACK); //top
//   insertTri([-0.3, 0.0,   -0.2, 0.0,  -0.25, -0.05], BLACK);

//   //right eye
//   insertTri([0.1, 0.0,  0.2, 0.0,  0.15, 0.05], BLACK); //top
//   insertTri([0.1, 0.0,  0.2, 0.0,  0.15, -0.05], BLACK);

//   //head ---
//   insertTri([-0.2, 0.0,   0.1, 0.0,  0.1, 0.3], BROWN); //1
//   insertTri([-0.2, 0.0,   0.1, 0.3,  -0.2, 0.3], BROWN); //2

//   //left side of head
//   insertTri([-0.2, 0.0,    -0.25, 0.05,   -0.2, 0.3], BROWN); //3
//   insertTri([-0.25, 0.05,    -0.3, 0.0,   -0.2, 0.3], BROWN); //4
//   insertTri([-0.3, 0.0,    -0.4, 0.2,   -0.2, 0.3], BROWN); //5
//   insertTri([-0.3, 0.0,    -0.45, 0.1,   -0.4, 0.2], BROWN); //6
//   insertTri([-0.3, 0.0,    -0.45, -0.1,   -0.45, 0.1], BROWN); //7
//   insertTri([-0.35, -0.2,  -0.3, 0.0,  -0.45, -0.1], BROWN); //8
//   insertTri([-0.35, -0.2,  -0.3, 0.0,  -0.25, -0.05], BROWN); //9
//   insertTri([-0.35, -0.2,  -0.3, 0.0,  -0.35, -0.25], BROWN); //10

//   //right side of head
//   insertTri([0.1, 0.0,    0.15, 0.05,   0.1, 0.3], BROWN); //3
//   insertTri([0.15, 0.05,    0.2, 0.0,   0.1, 0.3], BROWN); //4
//   insertTri([0.2, 0.0,    0.3, 0.2,   0.1, 0.3], BROWN); //5
//   insertTri([0.2, 0.0,    0.35, 0.1,   0.3, 0.2], BROWN); //6
//   insertTri([0.2, 0.0,    0.35, -0.1,   0.35, 0.1], BROWN); //7
//   insertTri([0.25, -0.2,  0.2, 0.0,  0.35, -0.1], BROWN); //8
//   insertTri([0.25, -0.2,  0.2, 0.0,  0.15, -0.05], BROWN); //9
//   insertTri([0.25, -0.2,  0.2, 0.0,  0.25, -0.25], BROWN); //10
  
//   //ears ----

//   //right ear
//   insertTri([0.2, 0.25,    0.3, 0.2,   0.4, 0.2], TAN); //a
//   insertTri([0.3, 0.2,   0.4, 0.2,   0.35, 0.1], TAN); //b
//   insertTri([0.35, 0.1,   0.4, 0.2,   0.5, 0.1], TAN); //c
//   insertTri([0.35, 0.1,   0.45, 0.0,   0.5, 0.1], TAN); //d

//   //left ear
//   insertTri([-0.3, 0.25,    -0.4, 0.2,   -0.5, 0.2], TAN); //a
//   insertTri([-0.4, 0.2,   -0.5, 0.2,   -0.45, 0.1], TAN); //b
//   insertTri([-0.45, 0.1,   -0.5, 0.2,   -0.6, 0.1], TAN); //c
//   insertTri([-0.45, 0.1,   -0.55, 0.0,   -0.6, 0.1], TAN); //d

//   //antler ---

//   //right antler
//   insertTri([0.2, 0.25,    0.3, 0.3,   0.25, 0.4], DARK_BROWN); //a
//   insertTri([0.1, 0.3,    0.2, 0.25,   0.15, 0.315], DARK_BROWN); //b
//   insertTri([0.175, 0.4,    0.25, 0.4,   0.2, 0.5], DARK_BROWN); //c
//   insertTri([0.175, 0.4,    0.25, 0.4,   0.2, 0.3], DARK_BROWN); //d
//   insertTri([0.2, 0.5,    0.3, 0.5,   0.3, 0.3], DARK_BROWN); //e
//   insertTri([0.3, 0.3,    0.4, 0.35,   0.3, 0.5], DARK_BROWN); //f
//   insertTri([0.35, 0.4,    0.4, 0.35,   0.4, 0.6], DARK_BROWN); //g
//   insertTri([0.4, 0.35,    0.5, 0.4,   0.4, 0.6], DARK_BROWN); //h
//   insertTri([0.4, 0.6,    0.5, 0.6,   0.5, 0.4], DARK_BROWN); //i

//   //left antler

//   insertTri([-0.4, 0.3,    -0.2, 0.3,   -0.3, 0.25], DARK_BROWN); //c
//   insertTri([-0.4, 0.3,    -0.3, 0.5,   -0.2, 0.3], DARK_BROWN); //d
//   insertTri([-0.3, 0.5,    -0.4, 0.5,   -0.4, 0.3], DARK_BROWN); //e
//   insertTri([-0.4, 0.3,    -0.5, 0.35,   -0.4, 0.5], DARK_BROWN); //f
//   insertTri([-0.45, 0.4,   -0.5, 0.35,   -0.5, 0.6], DARK_BROWN); //g
//   insertTri([-0.5, 0.35,    -0.6, 0.4,   -0.5, 0.6], DARK_BROWN); //h
//   insertTri([-0.5, 0.6,    -0.6, 0.6,   -0.6, 0.4], DARK_BROWN); //i

//   //intials : VN ----

//   insertTri([-0.3, 0.3,    -0.35, 0.4,   -0.25, 0.4], TAN); //V
//   insertTri([-0.3, 0.35,    -0.35, 0.4,   -0.25, 0.4], DARK_BROWN); //V


//   insertTri([0.1, 0.3,    0.185, 0.35,   0.175, 0.4], TAN); //N1
//   insertTri([0.15, 0.35,    0.2, 0.25,   0.185, 0.35], TAN); //N2
//   insertTri([0.2, 0.25,    0.2, 0.3,   0.25, 0.4], TAN); //N3

//   insertTri([0.2, 0.25,    0.2, 0.3,   0.175, 0.4], TAN); //gap fill
//   insertTri([0.1, 0.3,    0.185, 0.35,   0.15, 0.35], TAN); //gap fill
//   insertTri([0.1, 0.3,   0.15, 0.315,   0.15, 0.35], TAN); //gap fill
//   insertTri([0.15, 0.315,   0.15, 0.35,   0.2, 0.25], TAN); //gap fill

//   //nose ---
//   insertTri([0.0, 0.0,  0.1, 0.0,  0.0, -0.2], TAN); //1
//   insertTri([-0.1, -0.2,  0.0, -0.2,  0.0, 0.0], TAN); //2
//   insertTri([-0.2, 0.0,   0.0, 0.0,   -0.1, -0.2], TAN); //3
//   insertTri([-0.35, -0.2,   -0.1, -0.2,   -0.2, 0.0], TAN); //4
//   insertTri([-0.35, -0.2,   -0.2, 0.0,  -0.25, -0.05], TAN); //gap
//   insertTri([0.0, -0.2,   0.1, 0.0,   0.25, -0.2], TAN); //5
//   insertTri([0.1, 0.0,  0.15, -0.05,  0.25, -0.2], TAN); //gap

//   insertTri([-0.1, -0.3,   -0.1, -0.2,   -0.15, -0.25], PINK); //L nostril
//   insertTri([0.0, -0.3,   0.0, -0.2,   0.05, -0.25], PINK); //R nostril

//   insertTri([-0.1, -0.2,  0.0, -0.2,  -0.1, -0.3], TAN); //6
//   insertTri([ 0.0, -0.2,  0.0, -0.3,  -0.1, -0.3], TAN); //7
//   insertTri([0.0, -0.2,   0.05, -0.25,   0.25, -0.2], TAN); //8
//   insertTri([-0.35, -0.2,   -0.1, -0.2,   -0.15, -0.25], TAN); //9
//   insertTri([-0.35, -0.3,   -0.1, -0.3,   -0.35, -0.2], TAN); //10
//   insertTri([-0.35, -0.2,   -0.1, -0.3,   -0.15, -0.25], TAN); //11
//   insertTri([0.0, -0.3,   0.25, -0.2,   0.05, -0.25], TAN); //12
//   insertTri([0.0, -0.3,   0.25, -0.2,   0.25, -0.3], TAN); //13
//   insertTri([-0.35, -0.3,   -0.1, -0.3,   -0.2, -0.5], TAN); //14
//   insertTri([0.0, -0.3,   0.1, -0.5,   0.25, -0.3], TAN); //15
//   insertTri([0.0, -0.5,  0.1, -0.5,  0.0, -0.3], TAN); //16
//   insertTri([-0.1, -0.3,  0.0, -0.3,  0.0, -0.5], TAN); //17
//   insertTri([-0.2, -0.5,   0.0, -0.5,   -0.1, -0.3], TAN); //18
  
//   renderAllShapes();

// }

// function insertTri(vertices, color) {
//   let t = new Triangle();
//   t.vertices = vertices;
//   t.color = color;
//   g_shapesList.push(t);
// }

// function downloadCanvas() {
//   const c = document.getElementById('webgl');
//   if (!c) return;

//   //blob implementation to do normal download
//   c.toBlob(function(blob) {
//     if (!blob) {
//       console.log("Canvas toBlob failed.");
//       return;
//     }

//   // const dataURL = c.toDataURL("image/png");
//   const url = URL.createObjectURL(blob);
//   const link = document.createElement('a');
//   const date = new Date().toISOString().split('T')[0];

//   link.download = `asgn1_canvas${date}.png`;

//   link.href = url;
//   document.body.appendChild(link);
//   link.click();
//   document.body.removeChild(link);

//   URL.revokeObjectURL(url);
//   }, "image/png");
// }