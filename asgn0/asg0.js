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
}
