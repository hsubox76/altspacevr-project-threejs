var Buttons = {};
Buttons.W = 87;
Buttons.S = 83;
Buttons.LMB = 0;
Buttons.NoButton = -1;

var Build = {};

Build.size = 5000;
Build.step = 100;

Build.containerWidth = document.getElementById('container').clientWidth;
Build.containerHeight = document.getElementById('container').clientHeight;
Build.containerTop = 0;
Build.containerLeft = 0;

Build.strideLength = 50;

Build.camVector = new THREE.Vector3();

Build._moveCurr = new THREE.Vector2();
Build._movePrev = new THREE.Vector2();

// From Three.JS Trackball Controls library
// gets vector starting at center of screen going toward mouse position
var getMouseOnCircle = ( function () {

  var vector = new THREE.Vector2();

  return function ( pageX, pageY ) {

    vector.set(
      ( ( pageX - Build.containerWidth * 0.5 - Build.containerLeft ) / ( Build.containerWidth * 0.5 ) ),
      ( ( Build.containerHeight + 2 * ( Build.containerTop - pageY ) ) / Build.containerWidth )
    );

    return vector;
  };

}() );

Build.onKeyDown = function(event) {
  if (event.keyCode === Buttons.W) {
    Build.walk(1);
  }
  if (event.keyCode === Buttons.S) {
    Build.walk(-1);
  }
};

Build.onMouseDown = function(event) {
  if (event.button === Buttons.LMB) {
    Build._moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
    Build._movePrev.copy(Build._moveCurr);
    document.addEventListener('mousemove', Build.onMouseMove, false);
    document.addEventListener('mouseup', Build.onMouseUp, false );
  }
};

Build.onMouseMove = function(event) {
  console.log(event.button);
  if (event.button === Buttons.LMB) {
    Build._movePrev.copy(Build._moveCurr);
    Build._moveCurr.copy(getMouseOnCircle(event.pageX, event.pageY));
    Build.turn(1);
  }
};

Build.onMouseUp = function(event) {
  document.removeEventListener('mousemove', Build.onMouseMove);
  document.removeEventListener('mouseup', Build.onMouseUp);
};

Build.updateCamVector = function() {
  this.camVector.set(0,0,-1);
  this.camVector.applyQuaternion(this.camera.quaternion);
  return this.camVector;
};

Build.walk = function (direction) {
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

Build.moveDirection = new THREE.Vector3();
Build.eyeVector = new THREE.Vector3();
Build.eyeDirection = new THREE.Vector3();
Build.cameraUpDirection = new THREE.Vector3();
Build.cameraHorizDirection = new THREE.Vector3();
Build.rotateAxis = new THREE.Vector3();
Build.rotateAngle = 0;
Build.rotateSpeed = 10;
Build.rotateQuaternion = new THREE.Quaternion();

Build.turnSpeed = 0.5;

Build.turn = function (delta) {

  // 2D drag direction of mouse
  //this.moveDirection.set(this._moveCurr.x - this._movePrev.x, this._moveCurr.y - this._movePrev.y, 0);

  var xMove = this._moveCurr.x - this._movePrev.x;
  var yMove = this._moveCurr.y - this._movePrev.y;

  var rotMult = delta * this.turnSpeed;

  this.camera.rotation.y += -xMove;
  this.camera.rotation.x += yMove;

  //this.rotateQuaternion.set(yMove * rotMult, -xMove * rotMult, 0, 1).normalize();
  //this.camera.quaternion.multiply(this.rotateQuaternion);
  //this.camera.rotation.setFromQuaternion(this.camera.quaternion, this.camera.rotation.order);

  //this.rotateAngle = this.moveDirection.length();

  // if (this.rotateAngle) {

  //   this.eyeVector.copy(this.camera.position).sub(this.target);

  //   // get correct vector for z axis of camera
  //   //this.updateCamVector();
  //   //this.eyeVector.copy(this.camVector);
  //   this.eyeDirection.copy(this.eyeVector).normalize();

  //   // get correct vector for up (y) axis of camera
  //   this.cameraUpDirection.copy(this.camera.up).normalize();

  //   this.cameraHorizDirection.crossVectors(this.cameraUpDirection, this.eyeDirection).normalize();

  //   this.cameraUpDirection.setLength(this._moveCurr.y - this._movePrev.y);
  //   this.cameraHorizDirection.setLength(this._moveCurr.x - this._movePrev.x);

  //   this.moveDirection.copy(this.cameraUpDirection.add(this.cameraHorizDirection));
  //   this.rotateAxis.crossVectors(this.moveDirection, this.eyeVector).normalize();

  //   this.rotateAngle *= this.rotateSpeed;

  //   this.rotateQuaternion.setFromAxisAngle(this.rotateAxis, this.rotateAngle);
  //   this.eyeVector.applyQuaternion(this.rotateQuaternion);
  //   this.camera.up.applyQuaternion(this.rotateQuaternion);
  // }

  // this.camera.position.addVectors(this.target, this.eyeVector);
  // this.camera.lookAt(this.target);
  //this.camera.position.applyQuaternion(this.rotateQuaternion);

  this._movePrev.copy(this._moveCurr);
  console.log(this.camera.rotation);
  this.render();

};

Build.createGroundPlane = function () {

  var lineGeo = new THREE.Geometry();
  var size = this.size, step = this.step;

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

};

Build.createLights = function () {

  var ambientLight = new THREE.AmbientLight(0x555555);
  this.scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  this.scene.add(directionalLight);

};

Build.init = function () {

  this.camera = new THREE.PerspectiveCamera(45, this.containerWidth/this.containerHeight, 1, 10000);
  this.camera.position.set(500, 200, 1300);
  this.target = new THREE.Vector3();
  this.camera.lookAt(this.target);
  this.camera.rotation.order = "YXZ";

  this.scene = new THREE.Scene();

  this.createGroundPlane();
  this.createLights();

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setClearColor(0xbbeeff);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(this.containerWidth, this.containerHeight);
  this.container = document.getElementById('container');

  this.container.appendChild(this.renderer.domElement);

  document.addEventListener('keydown', this.onKeyDown, false);
  document.addEventListener('mousedown', this.onMouseDown, false);

};

Build.render = function () {

  this.renderer.render(this.scene, this.camera);

};

Build.init();
Build.render();