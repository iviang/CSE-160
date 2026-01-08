// DrawTriangle.js (c) 2012 matsuda

//Student Name: Vivian Nguyen
//UCSC Email: vnguy180@ucsc.edu

//Notes to Grader:
//All problems solved.
//Github pages link submitted in comments

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

function handleDrawOperationEvent(){

  //clear canvas
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = "black";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  //Read the values to create v1.
  const v1x = parseFloat(document.getElementById("v1x").value);
  const v1y = parseFloat(document.getElementById("v1y").value);

  //Read the values to create v2.
  const v2x = parseFloat(document.getElementById("v2x").value);
  const v2y = parseFloat(document.getElementById("v2y").value);

  // Read scalar
  const s = parseFloat(document.getElementById("scalar").value);

  const v1 = new Vector3([v1x, v1y, 0]);
  const v2 = new Vector3([v2x, v2y, 0]);

  //Call
  drawVector(v1, "red");
  drawVector(v2, "blue");

  //operation
  const op = document.getElementById("op").value;

  if (op === "add") {
    const v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.add(v2);
    drawVector(v3, "green");
  } else if (op === "sub") {
    const v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]);
    v3.sub(v2);
    drawVector(v3, "green");
  } else if (op === "div") {
    if (Number.isNaN(s)) { alert("Enter a scalar for mul/div."); return; }
    if (s === 0) { alert("Cannot divide by 0."); return; }
    const v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]).div(s);
    const v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]).div(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "mul") {
    if (Number.isNaN(s)) { alert("Enter a scalar for mul/div."); return; }
    const v3 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]).mul(s);
    const v4 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]).mul(s);
    drawVector(v3, "green");
    drawVector(v4, "green");
  } else if (op === "magnitude") {
    console.log("Magnitude v1:", v1.magnitude()); //console log
    console.log("Magnitude v2:", v2.magnitude()); //console log
  } else if (op === "normalize") {
    const n1 = new Vector3([v1.elements[0], v1.elements[1], v1.elements[2]]).normalize();
    const n2 = new Vector3([v2.elements[0], v2.elements[1], v2.elements[2]]).normalize();
    drawVector(n1, "green");
    drawVector(n2, "green");
  } else if (op === "angle") {
    const angle = angleBetween(v1, v2);
    console.log("Angle:", angle, "degrees"); //console log
  } else if (op === "area") {
    const area = areaTriangle(v1, v2);
    console.log("Area of the triangle:", area); //console log
  }
}

function angleBetween(v1, v2) {
  const dot = Vector3.dot(v1, v2); //uses dot
  const mag1 = v1.magnitude();
  const mag2 = v2.magnitude();

  if (mag1 === 0 || mag2 === 0) {
    return 0;
  }

  const cosAlpha = dot/(mag1 * mag2);
  const angleRad = Math.acos(Math.min(Math.max(cosAlpha, -1), 1));

  //conv rad to degrees
  const angleDeg = angleRad * 180 / Math.PI;
  return angleDeg;
}

function areaTriangle(v1, v2) {
  const cross = Vector3.cross(v1, v2);
  const parallelogramArea = cross.magnitude();
  return parallelogramArea/2; //div by 2 for triangle
}