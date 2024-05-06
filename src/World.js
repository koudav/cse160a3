// BlockyAnimal.js
// Vertex shader program
var VSHADER_SOURCE = `
  precision mediump float;
  attribute vec4 a_Position;
  attribute vec2 a_UV;
  varying vec2 v_UV;
  uniform mat4 u_ModelMatrix;
  uniform mat4 u_GlobalRotateMatrix;
  uniform mat4 u_ViewMatrix;
  uniform mat4 u_ProjectionMatrix;
  void main() {
    gl_Position = u_ProjectionMatrix * u_ViewMatrix * u_GlobalRotateMatrix * u_ModelMatrix * a_Position;
    v_UV = a_UV;
  }`

// Fragment shader program
var FSHADER_SOURCE = `
  precision mediump float;
  varying vec2 v_UV;
  uniform vec4 u_FragColor;
  uniform sampler2D u_Sampler0;
  uniform sampler2D u_Sampler1;
  uniform int u_whichTexture;
  void main() {
    if (u_whichTexture == -2) { // use color
        gl_FragColor = u_FragColor;
    }
    else if (u_whichTexture == -1) { // use debug
        gl_FragColor = vec4(v_UV, 1.0, 1.0);
    }
    else if (u_whichTexture == 0) { // use texture0
        gl_FragColor = texture2D(u_Sampler0, v_UV);
    }
    else if (u_whichTexture == 1) { // use texture1
      gl_FragColor = texture2D(u_Sampler1, v_UV);
    }
    else { // error (reddish)
        gl_FragColor = vec4(1, .2, .2, 1);
    }
  }`

// Global vars
let canvas;
let gl;
let a_Position;
let a_UV;
let u_FragColor;
let u_Size;
let u_ModelMatrix;
//let u_ProjectionMatrix;
//let u_ViewMatrix;
let u_GlobalRotateMatrix;
let u_Sampler0;
let u_Sampler1;
let u_whichTexture;

function setupWebGL(){
    // Retrieve <canvas> element
    canvas = document.getElementById('webgl');

    // Get the rendering context for WebGL
    gl = canvas.getContext("webgl", { preserveDrawingBuffer: true });
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

  // // Get the storage location of a_UV
  a_UV = gl.getAttribLocation(gl.program, 'a_UV');
  if (a_UV < 0) {
    console.log('Failed to get the storage location of a_UV');
    return;
  }

  // Get the storage location of u_FragColor
  u_FragColor = gl.getUniformLocation(gl.program, 'u_FragColor');
  if (!u_FragColor) {
    console.log('Failed to get the storage location of u_FragColor');
    return;
  }

  // Get the storage location of u_ModelMatrix
  u_ModelMatrix = gl.getUniformLocation(gl.program, 'u_ModelMatrix');
  if (!u_ModelMatrix) {
    console.log('Failed to get the storage location of u_ModelMatrix');
    return;
  }

  // Get the storage location of u_ViewMatrix
  u_ViewMatrix = gl.getUniformLocation(gl.program, 'u_ViewMatrix');
  if (!u_ViewMatrix) {
    console.log('Failed to get the storage location of u_ViewMatrix');
    return;
  }

  // Get the storage location of u_ProjectionMatrix
  u_ProjectionMatrix = gl.getUniformLocation(gl.program, 'u_ProjectionMatrix');
  if (!u_ProjectionMatrix) {
    console.log('Failed to get the storage location of u_ProjectionMatrix');
    return;
  }
  

  // Get the storage location of u_GlobalRotateMatrix
  u_GlobalRotateMatrix = gl.getUniformLocation(gl.program, 'u_GlobalRotateMatrix');
  if (!u_GlobalRotateMatrix) {
    console.log('Failed to get the storage location of u_GlobalRotateMatrix');
    return;
  }

   // Get storage location of u_Sampler0
   u_Sampler0 = gl.getUniformLocation(gl.program, 'u_Sampler0');
   if (!u_Sampler0) {
     console.log('Failed to get the storage location of u_Sampler0');
     return false;
   }

   // Get storage location of u_Sampler1
   u_Sampler1 = gl.getUniformLocation(gl.program, 'u_Sampler1');
   if (!u_Sampler1) {
     console.log('Failed to get the storage location of u_Sampler1');
     return false;
   }

   // Get storage location of u_whichTexture
   u_whichTexture = gl.getUniformLocation(gl.program, 'u_whichTexture');
   if (!u_whichTexture) {
     console.log('Failed to get the storage location of u_whichTexture');
     return false;
   }

  var identityM = new Matrix4();
  gl.uniformMatrix4fv(u_ModelMatrix, false, identityM.elements);
}

// Constants
const POINT = 0;
const TRIANGLE = 1;
const CIRCLE = 2;

// Global vars related to UI elements
let g_selectedColor = [1.0,1.0,1.0,1.0];
let g_selectedSize = 5;
let g_selectedType = POINT;
let g_segmentCount = 6;
let g_selectedAlpha = 100;

let g_globalAngleX = 30;
let g_globalAngleY = 0;

let g_hatAngle = 0;
let g_neckAngle = 0;
let g_headAngle = 0;
let g_leftLegAngle = 0;
let g_rightLegAngle = 0;

let g_bodyZOffset = 0;

let g_hatAnimationRunning = false;
let g_neckAnimationRunning = false;
let g_headAnimationRunning = false;
let g_walkAnimationRunning = false;

// Set up actions for HTML UI elements
function addActionsForHtmlUI() {
  
  // Button Events (Shape Type)
  /*document.getElementById("cyan").onclick = function() {g_selectedColor = [0.0,1.0,0.0,1.0]; };
  document.getElementById("red").onclick = function() {g_selectedColor = [1.0,0.0,0.0,1.0]; };*/
  //document.getElementById("clearButton").onclick = function() {g_shapesList = []; renderAllShapes(); };

  /*document.getElementById("pointButton").onclick = function() {g_selectedType = POINT; };
  document.getElementById("triButton").onclick = function() {g_selectedType = TRIANGLE; };
  document.getElementById("circleButton").onclick = function() {g_selectedType = CIRCLE; };
  document.getElementById("surpriseButton").onclick = function() {g_shapesList = []; renderAllShapes(); renderSurprise();};*/

  // Slider Events
  /*document.getElementById("redSlide").addEventListener('mouseup', function() {g_selectedColor[0] = this.value/100;});
  document.getElementById("cyanSlide").addEventListener('mouseup', function() {g_selectedColor[1] = this.value/100;});
  document.getElementById("blueSlide").addEventListener('mouseup', function() {g_selectedColor[2] = this.value/100;});*/
  //document.getElementById("alphaSlide").addEventListener('mouseup', function() {g_selectedColor[3] = this.value/100;});
  document.getElementById("neckStartAniButton").onclick = function() {g_neckAnimationRunning = true; };
  document.getElementById("neckStopAniButton").onclick = function() {g_neckAnimationRunning = false; };
  document.getElementById("headStartAniButton").onclick = function() {g_headAnimationRunning = true; };
  document.getElementById("headStopAniButton").onclick = function() {g_headAnimationRunning = false; };
  document.getElementById("hatStartAniButton").onclick = function() {g_hatAnimationRunning = true; };
  document.getElementById("hatStopAniButton").onclick = function() {g_hatAnimationRunning = false; };
  document.getElementById("angleXSlide").addEventListener('input', function() {g_globalAngleX = this.value; renderAllShapes();});
  document.getElementById("angleYSlide").addEventListener('input', function() {g_globalAngleY = this.value; renderAllShapes();});
  document.getElementById("neckSlide").addEventListener('input', function() {g_neckAngle = this.value; g_neckAnimationRunning = false; renderAllShapes();});
  document.getElementById("headSlide").addEventListener('input', function() {g_headAngle = this.value; g_headAnimationRunning = false; renderAllShapes();});
  document.getElementById("hatSlide").addEventListener('input', function() {g_hatAngle = this.value; g_hatAnimationRunning = false; renderAllShapes();});
  //ocument.getElementById("walkEnableButton").onclick = function() {g_walkAnimationRunning = true;};
  //document.getElementById("walkDisableButton").onclick = function() {g_walkAnimationRunning = false};
  document.getElementById("walkResetButton").onclick = function() {
    g_walkAnimationRunning = false; g_neckAnimationRunning = false; g_headAnimationRunning = false; g_hatAnimationRunning = false; 
    g_bodyZOffset = 0; g_leftLegAngle = 0; g_rightLegAngle = 0; g_headAngle = 0; g_neckAngle = 0; g_hatAngle = 0;
    g_globalAngleX = 30; g_globalAngleY = 0;
  };
  

  // Size Slider Events
  /*document.getElementById("segSlide").addEventListener('mouseup', function() {g_segmentCount = this.value;});
  document.getElementById("sizeSlide").addEventListener('mouseup', function() {g_selectedSize = this.value;});*/
}

function main() {
  // Set up canvas and gl vars
  setupWebGL();

  // Set up GLSL shader programs and connect GLSL vars
  connectVariablesToGLSL();

  // Set up actions for HTML UI elements
  addActionsForHtmlUI();

  // init textures
  initTextures();

  // Register function (event handler) to be called on a mouse press
  canvas.onmousedown = click;
  // and also while moving, if a button is pressed
  canvas.onmousemove = function(ev) {if(ev.buttons == 1) {mouseCamera(ev);}};

  // Specify the color for clearing <canvas>
  gl.clearColor(0.0, 0.0, 0.0, 1.0);

  // Clear <canvas>
  //gl.clear(gl.COLOR_BUFFER_BIT);
  // renderAllShapes();
    requestAnimationFrame(tick);
}

function initTextures(){

  var image0 = new Image();
  if (!image0) {
    console.log('Failed to create Image object for image0');
    return false;
  }

  // Register event handler to be called on loading the image
  image0.onload = function() { sendImageToTEXTURE0(image0);};

  // Tell browser to load image
  image0.src = 'caught.png';

  var image1 = new Image();
  if (!image1) {
    console.log('Failed to create Image object for image1');
    return false;
  }

  // Register event handler to be called on loading the image
  image1.onload = function() { sendImageToTEXTURE1(image1);};

  // Tell browser to load image
  image1.src = 'sky.jpg';

  // Can add more textures

  return true;
}

function sendImageToTEXTURE0(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit
  gl.activeTexture(gl.TEXTURE0);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 0 to the sampler
  gl.uniform1i(u_Sampler0, 0);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("Finished loadTexture");
  
  //return true;
}

function sendImageToTEXTURE1(image) {
  var texture = gl.createTexture();
  if (!texture) {
    console.log('Failed to create the texture object');
    return false;
  }

  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, 1); // Flip the image's y axis
  // Enable texture unit
  gl.activeTexture(gl.TEXTURE1);
  // Bind the texture object to the target
  gl.bindTexture(gl.TEXTURE_2D, texture);

  // Set the texture parameters
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  // Set the texture image
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, image);
  
  // Set the texture unit 1 to the sampler
  gl.uniform1i(u_Sampler1, 1);
  
  gl.clear(gl.COLOR_BUFFER_BIT);   // Clear <canvas>

  //gl.drawArrays(gl.TRIANGLE_STRIP, 0, n); // Draw the rectangle
  console.log("Finished loadTexture");
  
  //return true;
}

var g_startTime = performance.now() / 1000.0;
var g_seconds = performance.now() / 1000.0 - g_startTime;

function tick() {
  // save current time
  g_seconds = performance.now() / 1000.0 - g_startTime;
  //console.log(g_seconds);

  // update animation angles
  updateAnimationAngles();

  // draw everything
  renderAllShapes();

  // tell browser to update again when it has time
  requestAnimationFrame(tick);

}

//var g_shapesList = [];

/*var g_points = [];  // The array for the position of a mouse press
var g_colors = [];  // The array to store the color of a point
var g_sizes = []; // The array to store the size of a point*/

var lastMouseCoord = [0,0];

function mouseCamera(ev){
  let [x,y] = convertCoordinatesEventToGL(ev);
  if (x < lastMouseCoord[0]) {
    g_globalAngleX -= 1;
  }
  else if (x > lastMouseCoord[0]) {
    g_globalAngleX += 1;
  }
  if (y < lastMouseCoord[1]) {
    g_globalAngleY += 1;
  }
  else if (y > lastMouseCoord[1]){
    g_globalAngleY -= 1;
  }
  lastMouseCoord = [x, y];
}

function click(ev) {

  if (ev.shiftKey) {
    if (g_walkAnimationRunning) {
      g_walkAnimationRunning = false;
    }
    else {
      g_walkAnimationRunning = true;
    }
  }

  /*// Extract the event click and return it in WebGL coords
  let [x,y] = convertCoordinatesEventToGL(ev);
  
  // Create and store new point
  let point;
  switch (g_selectedType) {
    case TRIANGLE:
      point = new Triangle();
      break;
    case POINT:
      point = new Point();
      break;
    case CIRCLE:
      point = new Circle();
      break;
    default:
      point = new Point();
      break; 
  }

  point.position=[x,y];
  point.color=g_selectedColor.slice();
  point.size=g_selectedSize;
  if (g_selectedType == CIRCLE) {
    point.segments = g_segmentCount;
  }
  //console.log("pushing point with color: " + point.color);
  g_shapesList.push(point);

  // Store the coordinates to g_points array
  g_points.push([x,y]);

  // Store selected color to g_colors array
  g_colors.push(g_selectedColor.slice());

  // Store size to g_sizes array
  g_sizes.push(g_selectedSize);*/

  /* // Deprecated: Picked color via coordinate
  // Store the coordinates to g_colors array
  if (x >= 0.0 && y >= 0.0) {      // First quadrant
    g_colors.push([1.0, 0.0, 0.0, 1.0]);  // Red
  } else if (x < 0.0 && y < 0.0) { // Third quadrant
    g_colors.push([0.0, 1.0, 0.0, 1.0]);  // cyan
  } else {                         // Others
    g_colors.push([1.0, 1.0, 1.0, 1.0]);  // White
  }*/

  // draw every shape on the canvas
  renderAllShapes();
}

function convertCoordinatesEventToGL(ev) {
  var x = ev.clientX; // x coordinate of a mouse pointer
  var y = ev.clientY; // y coordinate of a mouse pointer
  var rect = ev.target.getBoundingClientRect();

  x = ((x - rect.left) - canvas.width/2)/(canvas.width/2);
  y = (canvas.height/2 - (y - rect.top))/(canvas.height/2);

  return [x,y];
}

function updateAnimationAngles() {
  if (g_neckAnimationRunning) {
    g_neckAngle = 45 * Math.sin(g_seconds);
  }
  if (g_headAnimationRunning) {
    g_headAngle = 45 * (Math.sin(g_seconds * 3));
  }
  if (g_hatAnimationRunning) {
    g_hatAngle = 20 * (Math.sin(g_seconds * 2));
  }
  if (g_walkAnimationRunning){
    let max_angle = 15;
    g_rightLegAngle = max_angle - (max_angle/2 * (Math.sin(g_seconds * 2) + 1));
    g_leftLegAngle = (max_angle/2 * (Math.sin(g_seconds * 2) + 1));

    if (g_rightLegAngle < max_angle/2){
      g_bodyZOffset += 0.01 * g_rightLegAngle;
    }
    else if (g_leftLegAngle < max_angle/2){
      g_bodyZOffset += 0.01 * g_leftLegAngle;
    }
  }
}

var g_eye = [0,0,3];
var g_at = [0,0,-100];
var g_up = [0,1,0];

function renderAllShapes(){
  // Check time at start of function
  var startTime = performance.now();

  // Pass projection matrix
  var projMat = new Matrix4();
  projMat.setPerspective(60, canvas.width/canvas.height, .1, 100);
  gl.uniformMatrix4fv(u_ProjectionMatrix, false, projMat.elements);

  // Pass view matrix
  var viewMat = new Matrix4();
  viewMat.setLookAt(g_eye[0], g_eye[1], g_eye[2], g_at[0], g_at[1], g_at[2], g_up[0], g_up[1], g_up[2]);
  //viewMat.setLookAt(0,0,3, 0,0,-100, 0,1,0); // (eye, at, up)
  gl.uniformMatrix4fv(u_ViewMatrix, false, viewMat.elements);

  // Pass matrix to u_ModelMatrix attribute
  var globalRotMat = new Matrix4().rotate(g_globalAngleX, 0, 1, 0);
  globalRotMat.rotate(g_globalAngleY, 1, 0, 0);
  gl.uniformMatrix4fv(u_GlobalRotateMatrix, false, globalRotMat.elements);

  // Clear <canvas>
  gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
  gl.clear(gl.COLOR_BUFFER_BIT);

  //gl.enable(gl.BLEND);
  //gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
  
  /* RENDER SHAPES LIST DISABLED
  //var len = g_points.length;
  var len = g_shapesList.length;

  
  for(var i = 0; i < len; i++) {
    g_shapesList[i].render();
  }*/

  // test triangle
  // drawTriangle3D( [-1.0,0.0,0.0, -0.5,-1.0,0.0, 0.0,0.0,0.0] );

  // next time i am defining variables to feed into these matrices instead of hard coding

  // skybox
  var skyBox = new Cube();
  skyBox.color = [1.0, 0.2, 0.2, 1.0];
  skyBox.textureNum = 1;
  let sky_size = 20;
  skyBox.matrix.translate(-1 * sky_size, 3, -1 * sky_size);
  skyBox.matrix.scale(2 * sky_size, sky_size, 2 * sky_size);
  skyBox.render();

  // ground...box?
  var groundBox = new Cube();
  groundBox.color = [0.4, 0.2, 0.2, 1.0];
  groundBox.textureNum = -2;
  let ground_size = 20;
  groundBox.matrix.translate(-1 * ground_size, -1.06, -1 * ground_size);
  groundBox.matrix.scale(2 * ground_size, 0.1, 2 * ground_size);
  groundBox.render();


  // draw body
  var body = new Cube();
  body.color = [1.0, 0.0, 0.0, 1.0];
  body.matrix.translate(-0.25, -0.25 + 0.003 * (Math.max(g_rightLegAngle, g_leftLegAngle)), 0.5 - 0.01 * g_bodyZOffset);
  body.matrix.rotate(-5, 1, 0, 0);
  var bodyCoordinatesMat = new Matrix4(body.matrix);
  body.matrix.scale(0.5, 0.75, 0.25);
  body.render();

  // draw neck
  var neck = new Cube();
  neck.color = [0.7, 0.3, 0.2, 0.6];
  neck.matrix = new Matrix4(bodyCoordinatesMat);
  neck.matrix.translate(0.25, 0.7, 0.04); // setTranslate vs translate?

  neck.matrix.rotate(-0.5 * g_neckAngle, 0, 0, 1);
  var neckCoordinatesMat = new Matrix4(neck.matrix);

  neck.matrix.scale(0.15, 0.15, 0.15);
  neck.matrix.translate(-0.5, 0, 0.001);
  neck.render();

  // draw head
  var head = new Cube();
  head.color = [0.7, 0.3, 0.2, 0.6];
  head.textureNum = 0;
  head.matrix = new Matrix4(neckCoordinatesMat);
  head.matrix.translate(0, 0.1, -0.07);

  head.matrix.translate(0, 0, 0.15);
  head.matrix.rotate(0.3 * g_headAngle,1, 0, 0);
  head.matrix.translate(0, 0, -0.15);
  var headCoordinatesMat = new Matrix4(head.matrix);

  head.matrix.scale(0.3, 0.3, 0.3);
  head.matrix.translate(-0.5, 0.0, -0.001);
  head.render();

  // draw dunce hat
  var hat = new Cylinder();
  hat.color = [0.2, 0.3, 0.5, 1];
  hat.matrix = new Matrix4(headCoordinatesMat);
  hat.matrix.translate(0, 0.3, 0.15);
  hat.matrix.rotate(g_hatAngle, 0, 0, 1);
  hat.matrix.scale(0.1, 0.11, 0.1);
  hat.render();


  // draw left arm
  var leftArm1 = new Cube();
  leftArm1.color = [0.7, 0.3, 0.2, 0.6];
  leftArm1.matrix = new Matrix4(bodyCoordinatesMat);
  leftArm1.matrix.translate(0.65, 0.275, 0.025);
  var leftArm1CoordinatesMat = new Matrix4(leftArm1.matrix);
  leftArm1.matrix.rotate(20, 0, 0, 1);
  leftArm1.matrix.scale(0.15, 0.45, 0.15);
  leftArm1.render();

  var leftArm2 = new Cube();
  leftArm2.color = [0.7, 0.3, 0.2, 0.6];
  leftArm2.matrix = new Matrix4(leftArm1CoordinatesMat);
  leftArm2.matrix.rotate(90, 0, 1, 0);
  leftArm2.matrix.rotate(-45, 1, 1, 0);
  leftArm2.matrix.scale(0.15, 0.45, 0.15);
  leftArm2.render();

  // draw right arm
  var rightArm1 = new Cube();
  rightArm1.color = [0.7, 0.3, 0.2, 0.6];
  rightArm1.matrix = new Matrix4(bodyCoordinatesMat);
  rightArm1.matrix.translate(-0.3, 0.35, 0.0);
  var rightArm1CoordinatesMat = new Matrix4(rightArm1.matrix);
  rightArm1.matrix.rotate(90, 0, 1, 0);
  rightArm1.matrix.rotate(30, 1, 0, 1);
  rightArm1.matrix.scale(0.15, 0.45, 0.15);
  rightArm1.render();

  var rightArm2 = new Cube();
  rightArm2.color = [0.7, 0.3, 0.2, 0.6];
  rightArm2.matrix = new Matrix4(rightArm1CoordinatesMat);
  rightArm2.matrix.translate(0, 0.05, -0.1);
  rightArm2.matrix.rotate(90, 0, 1, 0);
  rightArm2.matrix.rotate(45, 1, 0, 0);
  rightArm2.matrix.scale(0.15, 0.45, 0.15);
  rightArm2.render();

  // draw left leg
  var leftLeg1 = new Cube();
  leftLeg1.color = [0.2, 0.2, 0.9, 1];
  leftLeg1.matrix = new Matrix4(bodyCoordinatesMat);
  leftLeg1.matrix.translate(0.299, -0.3, 0.025);
  leftLeg1.matrix.translate(0, 0, -0.005 * g_leftLegAngle);
  var leftLeg1CoordinatesMat = new Matrix4(leftLeg1.matrix);
  leftLeg1.matrix.rotate(g_leftLegAngle, 1, 0, 0);
  
  leftLeg1.matrix.scale(0.2, 0.35, 0.2);
  leftLeg1.render();

  var leftLeg2 = new Cube();
  leftLeg2.color = [0.7, 0.3, 0.2, 0.6];
  leftLeg2.matrix = new Matrix4(leftLeg1CoordinatesMat);
  leftLeg2.matrix.translate(0.00001, -0.4115 + 0.0025 * g_leftLegAngle, 0.001 + 0.004 * g_leftLegAngle);
  leftLeg2.matrix.rotate(-0.5 * g_leftLegAngle, 1, 0, 0);
  leftLeg2.matrix.scale(0.1999, 0.3999, 0.1999);
  leftLeg2.render();

  // draw right leg
  var rightLeg1 = new Cube();
  rightLeg1.color = [0.2, 0.2, 0.9, 1];
  rightLeg1.matrix = new Matrix4(bodyCoordinatesMat);
  rightLeg1.matrix.translate(0.001, -0.3, 0.025);
  rightLeg1.matrix.translate(0, 0, -0.005 * g_rightLegAngle);
  var rightLeg1CoordinatesMat = new Matrix4(rightLeg1.matrix);
  rightLeg1.matrix.rotate(g_rightLegAngle, 1, 0, 0);
  rightLeg1.matrix.scale(0.2, 0.35, 0.2);
  rightLeg1.render();

  var rightLeg2 = new Cube();
  rightLeg2.color = [0.7, 0.3, 0.2, 0.6];
  rightLeg2.matrix = new Matrix4(rightLeg1CoordinatesMat);
  rightLeg2.matrix.translate(0.00001, -0.4115 + 0.0025 * g_rightLegAngle, 0.001 + 0.004 * g_rightLegAngle);
  rightLeg2.matrix.rotate(-0.5 * g_rightLegAngle, 1, 0, 0);
  rightLeg2.matrix.scale(0.1999, 0.3999, 0.1999);
  rightLeg2.render();


  // Check time at end of function and display on webpage
  var duration = performance.now() - startTime;
  sendTextToHTML(" ms: " + Math.floor(duration) + " fps: " + Math.floor(10000/duration)/10, "numdot");

  return;
}

function sendTextToHTML(text, htmlID) {
  var htmlElm = document.getElementById(htmlID);
  if (!htmlElm) {
    console.log("Failed to get " + htmlID + "from HTML");
    return;
  }
  htmlElm.innerHTML = text;
}
