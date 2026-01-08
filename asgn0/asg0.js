// DrawTriangle.js (c) 2012 matsuda
function main() {  

  //instantiate v1 using Vector3 from cuon-matrix.js
  const v1 = new Vector3([2.25, 2.25, 0]);

  // Retrieve <canvas> element
  var canvas = document.getElementById('example');  
  if (!canvas) { 
    console.log('Failed to retrieve the <canvas> element');
    return false; 
  } 

  // Get the rendering context for 2DCG
  var ctx = canvas.getContext('2d');

  // Draw a blue rectangle
  ctx.fillStyle = "black"; // Set color to black canvas
  ctx.fillRect(120, 10, 150, 150);        // Fill a rectangle with the color

  //call drawVector
  drawVector(v1, "red")
}

//create function drawVector
function drawVector(v,color) {

  //center of canvas
  const originX = canvas.width/2;
  const originY = canvas.height/2;

  //Vector components
  const x = v.elements[0];
  const y = v.elements[1];

  //Convert vect coords into canvas coords
  const endX = originX + x * scale;
  const endY = originY - y * scale;

  //scale v1 by 20 when drawing
  const scale = 20;

  ctx.beginPath();
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;

  //draw v1
  ctx.moveTo(originX, originY);
  ctx.lineTo(endX, endY);
  ctx.stroke();
}