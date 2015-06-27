
// Main namespace
var buildApp = {};

// Button numerical value constants
buildApp.BUTTONS = {};
buildApp.BUTTONS.W = 87;
buildApp.BUTTONS.S = 83;
buildApp.BUTTONS.SHIFT = 16;
buildApp.BUTTONS.SPACE = 32;
buildApp.BUTTONS.LMB = 0;
buildApp.BUTTONS.NoButton = -1;

// interface mode - look, build, shoot
buildApp.mode = 'none';

// Grid stats
buildApp.size = 5000;
buildApp.cubeSize = 100;

// Viewbox
buildApp.containerWidth = document.getElementById('container').clientWidth;
buildApp.containerHeight = document.getElementById('container').clientHeight;
buildApp.containerTop = 0;
buildApp.containerLeft = 0;

// Movement constants
buildApp.strideLength = 50;
buildApp.turnSpeed = 0.5;
buildApp.playerHeight = 200;

buildApp.camVector = new THREE.Vector3();

// Mouse move tracker
buildApp._moveCurr = new THREE.Vector2();
buildApp._movePrev = new THREE.Vector2();

buildApp.objects = [];


// ================
// Helper functions
// ================

// From Three.JS Trackball Controls library
// gets vector starting at center of screen going toward mouse position
buildApp.getMouseOnCircle = ( function () {

  var vector = new THREE.Vector2();

  return function ( pageX, pageY ) {

    vector.set(
      ( ( pageX - buildApp.containerWidth * 0.5 - buildApp.containerLeft ) / ( buildApp.containerWidth * 0.5 ) ),
      ( ( buildApp.containerHeight + 2 * ( buildApp.containerTop - pageY ) ) / buildApp.containerWidth )
    );

    return vector;
  };

}() );

// Helper to get camera direction vector
buildApp.updateCamVector = function() {
  this.camVector.set(0,0,-1);
  this.camVector.applyQuaternion(this.camera.quaternion);
  return this.camVector;
};

// Get intersect value at mouse cursor
buildApp.getIntersect = function(e) {

    buildApp.mouse.set( (e.clientX / buildApp.containerWidth) * 2 - 1, - (e.clientY / buildApp.containerHeight) * 2 + 1);
    buildApp.raycaster.setFromCamera(buildApp.mouse, buildApp.camera);

    var intersects = buildApp.raycaster.intersectObjects(buildApp.objects);

    if (intersects.length > 0) {
      return intersects[0];
    } else {
      return null;
    }

};


// Class for new building blocks
buildApp.Block = function () {
  this.mesh = new THREE.Mesh(buildApp.cubeGeo, buildApp.cubeMaterial);
  this.shootDirection = new THREE.Vector3();
  buildApp.scene.add(this.mesh);
  buildApp.objects.push(this.mesh);
};

// =============================
// Mouse/keyboard event handlers
// =============================

buildApp.onKeyDown = function(event) {
  
  event.preventDefault();

  if (event.keyCode === buildApp.BUTTONS.W) {
    buildApp.walk(1);
  }
  if (event.keyCode === buildApp.BUTTONS.S) {
    buildApp.walk(-1);
  }
  if (event.keyCode === buildApp.BUTTONS.SPACE) {
    buildApp.shoot();
  }
  if (event.keyCode === buildApp.BUTTONS.SHIFT) {
    buildApp.mode = 'build';
    document.addEventListener('keyup', buildApp.onKeyUp, false);
  }
};

buildApp.onKeyUp = function(event) {

  event.preventDefault();

  if (buildApp.mode === 'build') {
    buildApp.mode = 'none';
    buildApp.rollOverMesh.visible = false;
    //buildApp.render();
    document.removeEventListener('keyup', buildApp.onKeyUp);
  }

};

buildApp.onMouseDown = function(event) {
  
  event.preventDefault();

  if (event.button === buildApp.BUTTONS.LMB) {

    buildApp._moveCurr.copy(buildApp.getMouseOnCircle(event.pageX, event.pageY));
    buildApp._movePrev.copy(buildApp._moveCurr);
    if (buildApp.mode === 'none') {
      buildApp.mode = 'look';
    }

    document.addEventListener('mouseup', buildApp.onMouseUp, false );
    if (buildApp.mode === 'build') {

      var intersect = buildApp.getIntersect(event);

      if (intersect) {
        buildApp.build(intersect);
      }
    }
  }
};

buildApp.onMouseMove = function(event) {

  event.preventDefault();

  if (buildApp.mode === 'look') {

    buildApp._movePrev.copy(buildApp._moveCurr);
    buildApp._moveCurr.copy(buildApp.getMouseOnCircle(event.pageX, event.pageY));
    buildApp.turn(1);

   } else if (buildApp.mode === 'build') {

    var intersect = buildApp.getIntersect(event);

    if (intersect) {
      buildApp.projectCube(intersect);
    }

  }
};

buildApp.onMouseUp = function(event) {
  
  event.preventDefault();

  if (buildApp.mode === 'look') {
    buildApp.mode = 'none';
  }

  //document.removeEventListener('mousemove', buildApp.onMouseMove);
  document.removeEventListener('mouseup', buildApp.onMouseUp);
};


// =================================
// Environment interaction functions
// =================================

// Walk camera fwd/back in response to keypress
buildApp.walk = function (direction) {
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
  //this.render();
};


// Turn camera in direction of mouse drag
buildApp.turn = function (delta) {

  // 2D drag direction of mouse
  var xMove = this._moveCurr.x - this._movePrev.x;
  var yMove = this._moveCurr.y - this._movePrev.y;

  var rotMult = delta * this.turnSpeed;

  this.camera.rotation.y += -xMove;
  this.camera.rotation.x += yMove;

  this._movePrev.copy(this._moveCurr);
  //this.render();

};

// Project helper cube onto mouse location
buildApp.projectCube = function (intersect) {

  this.rollOverMesh.visible = true;
  this.rollOverMesh.position.copy(intersect.point).add(intersect.face.normal);
  this.rollOverMesh.position.divideScalar(this.cubeSize).floor().multiplyScalar(this.cubeSize).addScalar(this.cubeSize/2);

  //this.render();

};

// Create new building block cube at mouse location
buildApp.build = function (intersect) {

  var block = new buildApp.Block();
  block.mesh.position.copy(intersect.point).add(intersect.face.normal);
  block.mesh.position.divideScalar(buildApp.cubeSize).floor().multiplyScalar(buildApp.cubeSize).addScalar(buildApp.cubeSize/2);
      

};

buildApp.gravity = -1;
buildApp.shootVelocity = 50;
buildApp.shotObjects = [];

buildApp.shoot = function () {

  var block = new buildApp.Block();
  block.mesh.position.copy(this.camera.position);
  this.updateCamVector();
  block.shootDirection.copy(this.camVector).normalize();
  block.yVelocity = block.shootDirection.y * buildApp.shootVelocity;
  block.raycaster = new THREE.Raycaster();
  this.shotObjects.push(block);

};

buildApp.updateShotObjects = function () {

  var block;

  for (var i = 0; i < buildApp.shotObjects.length; i++) {
    block = this.shotObjects[i];
    var intersect = this.getBlockIntersect(block);
    // if it is going to collide
    if (intersect) {
      // remove from shotObjects array
      buildApp.shotObjects.splice(i,1);
      buildApp.landAndSnap(block, intersect);
    // } else if (block.mesh.position.y + block.yVelocity <= buildApp.cubeSize/2) {
    //   // failsafe to make sure it doesn't pass through ground plane
    //   buildApp.shotObjects.splice(i,1);
    //   block.mesh.position.y = buildApp.cubeSize/2;
    //   block.mesh.position.divideScalar(this.cubeSize).floor().multiplyScalar(this.cubeSize).addScalar(this.cubeSize/2);
    } else {
      block.mesh.position.x += block.shootDirection.x * buildApp.shootVelocity;
      block.mesh.position.y += block.yVelocity;
      block.mesh.position.z += block.shootDirection.z * buildApp.shootVelocity;
      block.yVelocity += buildApp.gravity;
    }
  }
};

buildApp.getBlockIntersect = function(block) {

  var currentDirection = new THREE.Vector3();
  var currentPosition = new THREE.Vector3();

  currentDirection.set(block.shootDirection.x * buildApp.shootVelocity, block.yVelocity,
    block.shootDirection.z * buildApp.shootVelocity).normalize();

  currentPosition.set(block.mesh.position.x, block.mesh.position.y-this.cubeSize/2, block.mesh.position.z);

  block.raycaster.set(currentPosition, currentDirection);
  block.raycaster.far = this.cubeSize*2;
  block.raycaster.near = this.cubeSize;

  var intersects = block.raycaster.intersectObjects(this.objects);
  if (intersects.length > 0) {
    console.log(intersects[0].object.geometry);
    console.log(intersects[0].point);;
    return intersects[0];
  }
  return null;
};

buildApp.landAndSnap = function(block, intersect) {

  block.mesh.position.copy(intersect.point).add(intersect.face.normal);
  block.mesh.position.divideScalar(this.cubeSize).floor().multiplyScalar(this.cubeSize).addScalar(this.cubeSize/2);

};

// ========================================
// Functions for building basic start scene
// ========================================

buildApp.createGroundPlane = function () {

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
  buildApp.objects.push(plane);

};

buildApp.createLights = function () {

  var ambientLight = new THREE.AmbientLight(0x555555);
  this.scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  this.scene.add(directionalLight);

};

// rollover helper cube (from three.js voxelpainter)

buildApp.createRolloverCube = function() {
  var rollOverGeo = new THREE.BoxGeometry( this.cubeSize, this.cubeSize, this.cubeSize );
  var rollOverMaterial = new THREE.MeshBasicMaterial( { color: 0xff0000, opacity: 0.5, transparent: true } );
  this.rollOverMesh = new THREE.Mesh( rollOverGeo, rollOverMaterial );
  this.rollOverMesh.visible = false;
  this.scene.add( this.rollOverMesh );
};

// define basic building block cube

buildApp.defineCube = function() {
  this.cubeGeo = new THREE.BoxGeometry(this.cubeSize, this.cubeSize, this.cubeSize);
  this.cubeMaterial = new THREE.MeshLambertMaterial({color: 0xfeb74c, shading: THREE.FlatShading});
};


// ============================================
// Init: basic scene components, event handlers
// ============================================

buildApp.init = function () {

  this.camera = new THREE.PerspectiveCamera(45, this.containerWidth/this.containerHeight, 1, 10000);
  this.camera.position.set(0, this.playerHeight, 1300);
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
  document.addEventListener('mousemove', buildApp.onMouseMove, false);

};

buildApp.render = function () {

  requestAnimationFrame(buildApp.render);
  buildApp.updateShotObjects();
  buildApp.renderer.render(buildApp.scene, buildApp.camera);

};

buildApp.init();
buildApp.render();