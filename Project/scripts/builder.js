// Button numerical value constants
var Buttons = {};
Buttons.W = 87;
Buttons.S = 83;
Buttons.LMB = 0;
Buttons.NoButton = -1;

// Main namespace
var BuildApp = {};

// Grid stats
BuildApp.size = 5000;
BuildApp.cubeSize = 100;

// Viewbox
BuildApp.containerWidth = document.getElementById('container').clientWidth;
BuildApp.containerHeight = document.getElementById('container').clientHeight;
BuildApp.containerTop = 0;
BuildApp.containerLeft = 0;

// Movement constants
BuildApp.strideLength = 50;
BuildApp.turnSpeed = 0.5;

BuildApp.camVector = new THREE.Vector3();

// Mouse move tracker
BuildApp._moveCurr = new THREE.Vector2();
BuildApp._movePrev = new THREE.Vector2();

BuildApp.objects = [];


// ================
// Helper functions
// ================

// From Three.JS Trackball Controls library
// gets vector starting at center of screen going toward mouse position
BuildApp.getMouseOnCircle = ( function () {

  var vector = new THREE.Vector2();

  return function ( pageX, pageY ) {

    vector.set(
      ( ( pageX - BuildApp.containerWidth * 0.5 - BuildApp.containerLeft ) / ( BuildApp.containerWidth * 0.5 ) ),
      ( ( BuildApp.containerHeight + 2 * ( BuildApp.containerTop - pageY ) ) / BuildApp.containerWidth )
    );

    return vector;
  };

}() );

// Helper to get camera direction vector
BuildApp.updateCamVector = function() {
  this.camVector.set(0,0,-1);
  this.camVector.applyQuaternion(this.camera.quaternion);
  return this.camVector;
};

// =============================
// Mouse/keyboard event handlers
// =============================

BuildApp.onKeyDown = function(event) {
  
  event.preventDefault();

  if (event.keyCode === Buttons.W) {
    BuildApp.walk(1);
  }
  if (event.keyCode === Buttons.S) {
    BuildApp.walk(-1);
  }
};

// TODO: Only place cubes when shift is down
BuildApp.onMouseDown = function(event) {
  
  event.preventDefault();

  if (event.button === Buttons.LMB) {

    BuildApp._moveCurr.copy(BuildApp.getMouseOnCircle(event.pageX, event.pageY));
    BuildApp._movePrev.copy(BuildApp._moveCurr);

    BuildApp.currentMouseButton = Buttons.LMB;
    document.addEventListener('mouseup', BuildApp.onMouseUp, false );

    BuildApp.mouse.set( (event.clientX / BuildApp.containerWidth) * 2 - 1, - (event.clientY / BuildApp.containerHeight) * 2 + 1);
    BuildApp.raycaster.setFromCamera(BuildApp.mouse, BuildApp.camera);

    var intersects = BuildApp.raycaster.intersectObjects(BuildApp.objects);

    if (intersects.length > 0) {
      var voxel = new THREE.Mesh(BuildApp.cubeGeo, BuildApp.cubeMaterial);
      voxel.position.copy(intersects[0].point).add(intersects[0].face.normal);
      voxel.position.divideScalar(BuildApp.cubeSize).floor().multiplyScalar(BuildApp.cubeSize).addScalar(BuildApp.cubeSize/2);
      BuildApp.scene.add(voxel);
      BuildApp.objects.push(voxel);
    }

  }
};

// TODO: Only show helper cube when shift is down
BuildApp.onMouseMove = function(event) {

  event.preventDefault();

  if (BuildApp.currentMouseButton === Buttons.LMB) {

    BuildApp._movePrev.copy(BuildApp._moveCurr);
    BuildApp._moveCurr.copy(BuildApp.getMouseOnCircle(event.pageX, event.pageY));
    BuildApp.turn(1);

   } else {

    BuildApp.mouse.set( (event.clientX / BuildApp.containerWidth) * 2 - 1, - (event.clientY / BuildApp.containerHeight) * 2 + 1);
    BuildApp.raycaster.setFromCamera(BuildApp.mouse, BuildApp.camera);

    var intersects = BuildApp.raycaster.intersectObjects(BuildApp.objects);

    if (intersects.length > 0) {
      BuildApp.rollOverMesh.position.copy(intersects[0].point).add(intersects[0].face.normal);
      BuildApp.rollOverMesh.position.divideScalar(BuildApp.cubeSize).floor().multiplyScalar(BuildApp.cubeSize).addScalar(BuildApp.cubeSize/2);
    }

    BuildApp.render();

  }
};

BuildApp.onMouseUp = function(event) {
  
  event.preventDefault();
  
  BuildApp.currentMouseButton = Buttons.NoButton;

  //document.removeEventListener('mousemove', BuildApp.onMouseMove);
  document.removeEventListener('mouseup', BuildApp.onMouseUp);
};

// Walk camera fwd/back in response to keypress
BuildApp.walk = function (direction) {
  var xUnits, zUnits;
  this.updateCamVector();
  xComp = this.camVector.x;
  zComp = this.camVector.z;
  var vecLength = Math.sqrt((xComp*xComp)+(zComp*zComp));
  var multiplier = direction * this.strideLength/vecLength;
  xUnits = multiplier * xComp;
  zUnits = multiplier * zComp;
  this.camera.position.x += xUnits;
  this.camera.position.z += zUnits;
  this.render();
};


// Turn camera in direction of mouse drag
BuildApp.turn = function (delta) {

  // 2D drag direction of mouse
  var xMove = this._moveCurr.x - this._movePrev.x;
  var yMove = this._moveCurr.y - this._movePrev.y;

  var rotMult = delta * this.turnSpeed;

  this.camera.rotation.y += -xMove;
  this.camera.rotation.x += yMove;

  this._movePrev.copy(this._moveCurr);
  this.render();

};

// ========================================
// Functions for building basic start scene
// ========================================

BuildApp.createGroundPlane = function () {

  var lineGeo = new THREE.Geometry();
  var size = this.size, step = this.cubeSize;

  for (var i = -size/2; i <= size/2; i += step) {

    lineGeo.vertices.push( new THREE.Vector3(-size/2, 0, i));
    lineGeo.vertices.push( new THREE.Vector3(size/2, 0, i));

    lineGeo.vertices.push( new THREE.Vector3(i, 0, -size/2));
    lineGeo.vertices.push( new THREE.Vector3(i, 0, size/2));
  }

  var lineMat = new THREE.LineBasicMaterial( { color: 0x000000, opacity: 0.2, transparent: true } );
  var line = new THREE.Line(lineGeo, lineMat, THREE.LinePieces);
  this.scene.add(line);

  var planeGeo = new THREE.PlaneBufferGeometry( size, size );
  planeGeo.applyMatrix( new THREE.Matrix4().makeRotationX( - Math.PI / 2 ) );
  var planeMat = new THREE.MeshBasicMaterial( {color: 0x009900 });

  plane = new THREE.Mesh(planeGeo, planeMat);
  plane.visible = true;
  this.scene.add( plane );
  BuildApp.objects.push(plane);

};

BuildApp.createLights = function () {

  var ambientLight = new THREE.AmbientLight(0x555555);
  this.scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  this.scene.add(directionalLight);

};

// rollover helper cube (from three.js voxelpainter)

BuildApp.createRolloverCube = function() {
  var rollOverGeo = new THREE.BoxGeometry( this.cubeSize, this.cubeSize, this.cubeSize );
  var rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
  this.rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
  this.scene.add( this.rollOverMesh );
};

// define basic building block cube

BuildApp.defineCube = function() {
  this.cubeGeo = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
  this.cubeMaterial = new THREE.MeshLambertMaterial({color: 0xfeb74c, shading: THREE.FlatShading});
};


// ============================================
// Init: basic scene components, event handlers
// ============================================

BuildApp.init = function () {

  this.camera = new THREE.PerspectiveCamera(45, this.containerWidth/this.containerHeight, 1, 10000);
  this.camera.position.set(0, 200, 1300);
  this.target = new THREE.Vector3();
  // best rotation order to avoid camera roll
  this.camera.rotation.order = "YXZ";

  this.scene = new THREE.Scene();

  this.raycaster = new THREE.Raycaster();
  this.mouse = new THREE.Vector2();

  this.createGroundPlane();
  this.createLights();

  this.createRolloverCube();
  this.defineCube();

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setClearColor(0xbbeeff);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(this.containerWidth, this.containerHeight);
  this.container = document.getElementById('container');

  this.container.appendChild(this.renderer.domElement);

  document.addEventListener('keydown', this.onKeyDown, false);
  document.addEventListener('mousedown', this.onMouseDown, false);
  document.addEventListener('mousemove', BuildApp.onMouseMove, false);

};

BuildApp.render = function () {

  this.renderer.render(this.scene, this.camera);

};

BuildApp.init();
BuildApp.render();