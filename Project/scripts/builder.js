var Build = {};

Build.size = 5000;
Build.step = 100;
Build.containerWidth = document.getElementById('container').clientWidth;
Build.containerHeight = document.getElementById('container').clientHeight;

Build.onDocumentKeyDown = function(event) {
  if (event.keyCode === 87) {
    Build.walk();
  }
};

Build.walk = function () {
  var strideLength = 50;
  var xUnits, zUnits;
  var camVector = new THREE.Vector3(0,0,-1);
  camVector.applyQuaternion(this.camera.quaternion);
  xComp = camVector.x;
  zComp = camVector.z;
  var vecLength = Math.sqrt((xComp*xComp)+(zComp*zComp));
  var multiplier = strideLength/vecLength;
  xUnits = multiplier * xComp;
  zUnits = multiplier * zComp;
  this.camera.position.x += xUnits;
  this.camera.position.z += zUnits;
  this.render();
};

Build.turn = function () {

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

  this.scene = new THREE.Scene();

  this.createGroundPlane();
  this.createLights();

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setClearColor(0xbbeeff);
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(this.containerWidth, this.containerHeight);
  document.getElementById('container').appendChild(this.renderer.domElement);

  document.addEventListener('keydown', this.onDocumentKeyDown, false);

};

Build.render = function () {

  this.renderer.render(this.scene, this.camera);

};

Build.init();
Build.render();