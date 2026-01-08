// DrawTriangle.js (c) 2012 matsuda
let ctx;

function main() {  
  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
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
  ctx.fillRect(0, 0, canvas.width, canvas.height);

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
  ctx.lineWidth = 6;

  //draw v1
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}