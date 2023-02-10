import {Module} from '/js/glue.js';
import * as THREE from '/js/three.module.js';
import { GLTFLoader } from '/js/GLTFLoader.js';

self.DrawGrid = function (type){
  if(grid) grid.removeFromParent();
  self.grid = new THREE.Group();
  grid.name = 'grid';
  scene.add(grid);
  if( type == 'plane' ){
    const GridSegmentCount = 100;
    const GridDistance = 10.0;
    const GridColorLight = 0xc0c0c0;
    const GridColorDark = GridColorLight/2;
  
  	const xStart = -(GridSegmentCount * GridDistance / 2.0);
  	const xEnd = xStart + (GridSegmentCount * GridDistance);
    let posHGridStart, posHGridEnd, posVGridStart, posVGridEnd;
    if(camera.isPerspectiveCamera){
      posHGridStart = new THREE.Vector3(xStart, 0, xStart);
      posHGridEnd = new THREE.Vector3(xStart, 0, xEnd);
      posVGridStart = new THREE.Vector3(xStart, 0, xStart);
      posVGridEnd = new THREE.Vector3(xEnd, 0, xStart);
    }else{
      posHGridStart = new THREE.Vector3(xStart, xStart, 0);
      posHGridEnd = new THREE.Vector3(xStart, xEnd, 0);
      posVGridStart = new THREE.Vector3(xStart, xStart, 0);
      posVGridEnd = new THREE.Vector3(xEnd, xStart, 0);  
    }
  
    for (let i = 0; i < GridSegmentCount + 1; ++i){
      const colorToUse = ((i % 5) == 0) ? GridColorDark : GridColorLight;
      const material = new THREE.LineBasicMaterial( { color: colorToUse } );
  
      const hpoints = [];
      hpoints.push(posHGridStart);
      hpoints.push(posHGridEnd);
      const hgeometry = new THREE.BufferGeometry().setFromPoints( hpoints );
      const hline = new THREE.Line( hgeometry, material );
      grid.add(hline);
            
      const vpoints = [];
      vpoints.push(posVGridStart);
      vpoints.push(posVGridEnd);
      const vgeometry = new THREE.BufferGeometry().setFromPoints( vpoints );
      const vline = new THREE.Line( vgeometry, material );
      grid.add(vline);
       
      posHGridStart.x += GridDistance;
  		posHGridEnd.x += GridDistance;
      if(camera.isPerspectiveCamera){
        posVGridStart.z += GridDistance;
  		  posVGridEnd.z += GridDistance;
      }else{
        posVGridStart.y += GridDistance;
  		  posVGridEnd.y += GridDistance;
      }
    }
    
  }else if (type == 'sphere'){ 
    const GridDistance = 10/180*Math.PI;
    const GridColorDark = 0xc0c0c0;
  
    for(let theta = -Math.PI; theta < Math.PI; theta += GridDistance){
      const material = new THREE.LineBasicMaterial( { color: GridColorDark } );
      const lonpoints = [];
      for(let phi = -Math.PI; phi <= 0; phi += Math.PI/180)
        lonpoints.push((new THREE.Vector3()).setFromSphericalCoords(15.01, phi, theta));
      const geometry = new THREE.BufferGeometry().setFromPoints(lonpoints);
      const line = new THREE.Line(geometry, material);
      grid.add(line);
    }
    for(let phi = -Math.PI + GridDistance; phi < 0; phi += GridDistance){
      const material = new THREE.LineBasicMaterial( { color: GridColorDark } );
      const latpoints = [];    
      for(let theta = -Math.PI; theta < Math.PI; theta += Math.PI/180)
        latpoints.push((new THREE.Vector3()).setFromSphericalCoords(15.01, phi, theta));
      const geometry = new THREE.BufferGeometry().setFromPoints(latpoints);
      const line = new THREE.Line(geometry, material);
      grid.add(line); 
    }
  }
}

self.AddLights = function (){
  // var directionalLight = new THREE.DirectionalLight( 0xffffff, 1 );
  // directionalLight.position.x = 1;
  // directionalLight.position.y = 1;
  // directionalLight.position.z = 0.75;
  // directionalLight.position.normalize();
  // scene.add( directionalLight );
  
  // var directionalLight = new THREE.DirectionalLight( 0x808080, 1 );
  // directionalLight.position.x = - 1;
  // directionalLight.position.y = 1;
  // directionalLight.position.z = - 0.75;
  // directionalLight.position.normalize();
  // scene.add( directionalLight );  
}

self.LoadGltf = function (url) {
  const loader = new GLTFLoader();
  return new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data.scene), null, reject);
  });
}

self.LoadBitmap = function (url) {
    const loader = new THREE.ImageBitmapLoader();
    loader.setOptions( { imageOrientation: 'flipY' } );
    return new Promise((resolve, reject) => {
      loader.load(url, data => resolve(data), null, reject);
    });
}  

self.LoadJson = function (url) {
  const loader = new THREE.FileLoader().setResponseType('json');
  return new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data), null, reject);
  });
}

self.Resize = function(data) {
	renderer.setSize(data.width, data.height, false);
  if(camera.isPerspectiveCamera){
    camera.aspect = data.width / data.height;
  }else{
    camera.left = -data.width/10;
    camera.right = data.width/10;
    camera.top = data.height/10;
    camera.bottom = -data.height/10;
  }
	camera.updateProjectionMatrix();
  renderer.render( scene, camera );
}

self.SetCam =  function (camtype){
  if(camtype=='ortho'){
    self.camera = new THREE.OrthographicCamera( -canvas.width/10, canvas.width/10, canvas.height/10, -canvas.height/10, -500, 10000 );
    camera.position.set(0,0,20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }else{
  	self.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 2, 3000 );
    camera.position.set(20,10,20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));    
  }
}

self.Init = async function(data){
	const {canvas} = data;
  self.canvas = canvas;
  self.renderer = new THREE.WebGLRenderer({canvas});
	renderer.setClearColor( 0xffffff, 0);
	self.scene = new THREE.Scene();
  const light = new THREE.AmbientLight( 0x404040, 6); // soft white light
  scene.add( light ); 
  SetCam('persp');

  // const model = await LoadJson('/res/world_countries.geojson');
  // const map = new THREE.Object3D();
  // model.features.forEach(elem => {
  //   const country = new THREE.Object3D();
  //   const type = elem.geometry.type;
  //   const coordinates = elem.geometry.coordinates;
  //   coordinates.forEach(multiPolygon => {
  //     if(type === 'Polygon'){
  //       multiPolygon = [multiPolygon];
  //     }
  //     multiPolygon.forEach(polygon => {
  //       const shape = new THREE.Shape();
  //       const lineMaterial = new THREE.LineBasicMaterial({ color: 'black' });
  //       const points = [];
  //       for (let i = 0; i < polygon.length; i++) {
  //         const [x, y] = polygon[i];
  //         if (i === 0) shape.moveTo(x, y);
  //         shape.lineTo(x, y);
  //         points.push(new THREE.Vector3(x, y, 0));
  //       }

  //       // const extrudeSettings = {depth: 4, bevelEnabled: false};
  //       // const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
  //       const geometry = new THREE.ShapeGeometry( shape );
  //       const material = new THREE.MeshBasicMaterial({ color: 0x3480C4, transparent: true, opacity: 0.6 })
  //       // const material1 = new THREE.MeshBasicMaterial({ color: '#3480C4', transparent: true, opacity: 0.5 })
  //       const mesh = new THREE.Mesh(geometry, material)
  //       const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
  //       const line = new THREE.Line(lineGeometry, lineMaterial)
  //       country.add(mesh);
  //       country.add(line);
  //     });
  //   });

  //   country.userData = elem.properties;
  //   if (elem.properties.contorid) {
  //     const [x, y] = elem.properties.contorid;
  //     country.userData.centroid = [x, y];
  //   }
  //   country.selectable = true;
  //   country.highlightcolor = new THREE.Color(0xff0000);
  //   map.add(country);
  // });
  // scene.add(map);
  
  // const model = await LoadGltf('../res/2axle.glb');
  // model.traverse((node) => {
  //     if(node.isMesh){
  //       let newMat = new THREE.MeshLambertMaterial({map: node.material.map});
  //       node.material = newMat;
  //     }
  // });
  // scene.add(model);
  
  // const geometry = new THREE.SphereGeometry( 15, 360, 180 );
  // const texture = new THREE.CanvasTexture(await LoadBitmap('../res/natrual_earth.jpg'));
  // const material = new THREE.MeshPhongMaterial( {map: texture, color: 0xffffff,  opacity: 0.9, transparent: true  });
  // const mesh = new THREE.Mesh( geometry, material );
  // mesh.selectable = true;
  // mesh.highlightcolor = new THREE.Color(0xffffff);
  // scene.add( mesh );

  renderer.render( scene, camera );

  self.grid = null;
	self.RotationSpeed = 1;
  self.TranslationSpeed = 1;
	self.runningstate = 'running';
  self.stopping = false;
  self.pausing = false;
  self.commanding = false;
  self.bps = [];
}

self.Select = function(obj){
  if (!self.selected){
    if(obj.selectable){
      self.selected = obj;
      obj.color = obj.material.color;
      obj.material.color = obj.highlightcolor || new THREE.Color(0xff0000);
    }else if(obj.parent.selectable){
      self.selected = obj.parent;
      self.selected.children.forEach(child =>{
        child.color = child.material.color;
        child.material.color = obj.highlightcolor || new THREE.Color(0xff0000);
      });
    }else{
      return false;
    }
    return true;
  }
}

self.Deselect = function(){
  if (self.selected){
    if(self.selected.children.length == 0){
      self.selected.material.color = self.selected.color;
      self.selected.color = null;
    }else{
      self.selected.children.forEach(child =>{
        child.material.color = child.color;
        child.color = null;
      });
    }
    self.selected = null;
  }
}

self.OnMouseDown = function(data){
  if(data.buttons == 1){ //left mouse button
    self.lookat = new THREE.Vector3();
    self.diffv = new THREE.Vector3();
    self.polarv = new THREE.Spherical(0, 0, 0);
  
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    var winsize = new THREE.Vector2();
    renderer.getSize(winsize);
    pointer.x = ( data.x / winsize.x ) * 2 - 1;
  	pointer.y = - ( data.y / winsize.y ) * 2 + 1;
    raycaster.setFromCamera(pointer, camera );
    raycaster.params.Line.threshold = 0.1;
    raycaster.params.Points.threshold = 0.1;
    const intersects = raycaster.intersectObjects( scene.children);
    Deselect();
    for (let i=0; i < intersects.length; i++) {
      if(Select(intersects[i].object)){
        self.lookat = self.selected.position;
        raycaster.setFromCamera((new THREE.Vector2(0,0)), camera );
        const distance = camera.position.distanceTo( self.selected.position );
        raycaster.ray.at(distance, self.diffv);
        self.diffv.sub(self.lookat);
        var lookatVector = (new THREE.Vector3()).subVectors(camera.position, self.lookat);
        self.polarv.setFromVector3(lookatVector);
        break;
      }
    }
    renderer.render( scene, camera );
  }
}

self.OnMouseUp = function(data) {

}

self.OnMouseMove = function(data) {
  const deltaX = -data.deltax;
  const deltaY = data.deltay;
  
  if(camera.isPerspectiveCamera){
  	var relativeTarget = (new THREE.Vector3(0,0,-1)).applyQuaternion( camera.quaternion );
  	var upVector = camera.up;
  	var tvectX = (new THREE.Vector3()).crossVectors(relativeTarget, upVector).normalize();
  	var tvectY = (new THREE.Vector3()).crossVectors(tvectX, relativeTarget).normalize();

  	if(data.buttons == 1){ //left mouse button
      if(self.polarv.radius == 0){
    		relativeTarget.add(tvectX.multiplyScalar(deltaX).add(tvectY.multiplyScalar(deltaY)).multiplyScalar(0.005*RotationSpeed));
    		if ((new THREE.Vector3()).crossVectors(relativeTarget, upVector).length() > 0.01){
    			camera.lookAt((new THREE.Vector3()).addVectors(camera.position, relativeTarget));
    		}
      }else{
        self.polarv.theta += deltaX*0.005*RotationSpeed;
        self.polarv.phi -= deltaY*0.005*RotationSpeed;
        var lookatVector = (new THREE.Vector3()).setFromSpherical(self.polarv);
        camera.position.copy((new THREE.Vector3()).addVectors(self.lookat, lookatVector));
        camera.lookAt((new THREE.Vector3()).addVectors(self.lookat, self.diffv.multiplyScalar(0.95)))
      }

  	}else if(data.buttons == 2){ //right mouse button
      tvectX.multiplyScalar(deltaX).add(tvectY.multiplyScalar(deltaY)).multiplyScalar(0.002*TranslationSpeed*camera.position.length());
		  camera.position.add(tvectX);

  	}else if(data.buttons == 3){ //left and right mouse button
      // self.polarv.theta += deltaX*0.005*RotationSpeed;
      // self.polarv.phi -= deltaY*0.005*RotationSpeed;
      // var lookatVector = (new THREE.Vector3()).setFromSpherical(self.polarv);
      // camera.position.copy((new THREE.Vector3()).addVectors(self.lookat, lookatVector));
      // camera.lookAt((new THREE.Vector3()).addVectors(self.lookat, self.diffv.multiplyScalar(0.99)))
  	}else if(data.buttons == 4){ //wheel button
 		  camera.position.add(relativeTarget.multiplyScalar(-0.0005*deltaY*TranslationSpeed*camera.position.length()));
  	}
  }else{
    if(data.buttons == 2){
      camera.position.x += 0.2*deltaX/camera.zoom;
      camera.position.y += 0.2*deltaY/camera.zoom;
    }else if(data.buttons == 4){
      camera.zoom *= (1 -0.001*deltaY*TranslationSpeed);
    }
  }
	camera.updateProjectionMatrix();
  renderer.render( scene, camera );
}

self.RunLua = async function (data){
  self.postMessage({fn: 'OnReturn', result:await Module.runlua(data.code), id:data.id});
}

self.SetVar = function (data){
  self[data.name] = data.value;
}

self.onmessage = (e) => {self[e.data.fn](e.data);};
