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
  const v1 = new Vector3([2.25, 2.25, 0]);

  // Draw a blue rectangle
  ctx.fillStyle = "black"; // Set color to black canvas
  ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color

  //call drawVector
  drawVector(v1, "red");
}

//create function drawVector
function drawVector(v,color) {
  //scale v1 by 20 when drawing
  const scale = 20;
  //center of canvas
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
  ctx.lineWidth = 2;

  //draw v1
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}