var Build = {};

Build.size = 5000;
Build.step = 100;

Build.init = function () {

  this.camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 1, 10000);
  this.camera.position.set(500, 800, 1300);
  this.camera.lookAt(new THREE.Vector3());

  this.scene = new THREE.Scene();

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

  var ambientLight = new THREE.AmbientLight(0x555555);
  this.scene.add(ambientLight);

  var directionalLight = new THREE.DirectionalLight( 0xffffff );
  directionalLight.position.set( 1, 0.75, 0.5 ).normalize();
  this.scene.add( directionalLight );

  this.renderer = new THREE.WebGLRenderer({antialias: true});
  this.renderer.setClearColor( 0xf0f0f0 );
  this.renderer.setPixelRatio(window.devicePixelRatio);
  this.renderer.setSize(window.innerWidth, window.innerHeight);
  document.getElementById('container').appendChild(this.renderer.domElement);

};

Build.render = function () {

  this.renderer.render(this.scene, this.camera);

};

Build.init();
Build.render();