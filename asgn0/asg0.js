// DrawTriangle.js (c) 2012 matsuda
let canvas;
let ctx;

function main() {  
  // Retrieve <canvas> element
  canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  ctx = canvas.getContext('2d');

  //instantiate v1 using Vector3 from cuon-matrix.js
 // const v1 = new Vector3([2.25, 2.25, 0]);

  // Draw a blue rectangle
  ctx.fillStyle = "black"; // Set color to black canvas
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //call drawVector
 // drawVector(v1, "red");
}

//create function drawVector
function drawVector(v,color) {
  //scale v1 by 20 when drawing
  const scale = 20;
  
  //find center of canvas
  const originX = canvas.width/2;
  const originY = canvas.height/2;

  //Vector components
  const x = v.elements[0];
  const y = v.elements[1];

  //Convert vect coords into canvas coords
  const endX = originX + x * scale;
  const endY = originY - y * scale;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;

  //draw v1
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}

function handleDrawEvent(){
  //clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Read the values to create v1.
  const v1x = parseFloat(document.getElementById("v1x").value);
  const v1y = parseFloat(document.getElementById("v1y").value);

  //Read the values to create v2.
  const v2x = parseFloat(document.getElementById("v2x").value);
  const v2y = parseFloat(document.getElementById("v2y").value);



  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  //Call
  drawVector(v1, "red");
  drawVector(v2, "blue");

}