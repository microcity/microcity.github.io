import {Module} from './glue.js';
import * as THREE from './three.module.js';
import { GLTFLoader } from './GLTFLoader.js';

self.DrawGrid = function (){
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
    hline.name = "grid";
    scene.add( hline );
    
    const vpoints = [];
    vpoints.push(posVGridStart);
    vpoints.push(posVGridEnd);
    const vgeometry = new THREE.BufferGeometry().setFromPoints( vpoints );
    const vline = new THREE.Line( vgeometry, material );
    vline.name = "grid";
    scene.add( vline );

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
  
 //  const GridSegmentCount = 100;
 //  const GridDistance = 10.0;
 //  const GridColorLight = 0xc0c0c0;
 //  const GridColorDark = GridColorLight/2;

	// const xStart = -(GridSegmentCount * GridDistance / 2.0);
	// const xEnd = xStart + (GridSegmentCount * GridDistance);
 //  let posHGridStart = new THREE.Vector3(xStart, xStart, 0);
 //  let posHGridEnd = new THREE.Vector3(xStart, xEnd, 0);
 //  let posVGridStart = new THREE.Vector3(xStart, xStart, 0);
 //  let posVGridEnd = new THREE.Vector3(xEnd, xStart, 0);

 //  for (let i = 0; i < GridSegmentCount + 1; ++i){
 //    const colorToUse = ((i % 5) == 0) ? GridColorDark : GridColorLight;
 //    const material = new THREE.LineBasicMaterial( { color: colorToUse } );

 //    const hpoints = [];
 //    hpoints.push(posHGridStart);
 //    hpoints.push(posHGridEnd);
 //    const hgeometry = new THREE.BufferGeometry().setFromPoints( hpoints );
 //    const hline = new THREE.Line( hgeometry, material );
 //    hline.name = "grid";
 //    scene.add( hline );
    
 //    const vpoints = [];
 //    vpoints.push(posVGridStart);
 //    vpoints.push(posVGridEnd);
 //    const vgeometry = new THREE.BufferGeometry().setFromPoints( vpoints );
 //    const vline = new THREE.Line( vgeometry, material );
 //    vline.name = "grid";
 //    scene.add( vline );
    
 //    posHGridStart.x += GridDistance;
	// 	posHGridEnd.x += GridDistance;
 //    posVGridStart.y += GridDistance;
	// 	posVGridEnd.y += GridDistance;
 //  }
  
  // const GridDistance = 10/180*Math.PI;
  // const GridColorDark = 0xc0c0c0;

  // for(let theta = -Math.PI; theta < Math.PI; theta += GridDistance){
  //   const material = new THREE.LineBasicMaterial( { color: GridColorDark } );
  //   const lonpoints = [];
  //   for(let phi = -Math.PI; phi <= 0; phi += Math.PI/180)
  //     lonpoints.push((new THREE.Vector3()).setFromSphericalCoords(15.01, phi, theta));
  //   const geometry = new THREE.BufferGeometry().setFromPoints(lonpoints);
  //   const line = new THREE.Line(geometry, material);
  //   line.name = "grid";
  //   scene.add(line);
  // }
  // for(let phi = -Math.PI + GridDistance; phi < 0; phi += GridDistance){
  //   const material = new THREE.LineBasicMaterial( { color: GridColorDark } );
  //   const latpoints = [];    
  //   for(let theta = -Math.PI; theta < Math.PI; theta += Math.PI/180)
  //     latpoints.push((new THREE.Vector3()).setFromSphericalCoords(15.01, phi, theta));
  //   const geometry = new THREE.BufferGeometry().setFromPoints(latpoints);
  //   const line = new THREE.Line(geometry, material);
  //   line.name = "grid";
  //   scene.add(line);  }
}

self.AddLights = function (){
  const light = new THREE.AmbientLight( 0x404040, 6); // soft white light
  scene.add( light );
  
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

self.LoadGltf = function(url) {
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

self.Init = async function(data){
	const {canvas} = data;
  self.renderer = new THREE.WebGLRenderer({canvas});
	renderer.setSize(canvas.width, canvas.height, false);
	renderer.setClearColor( 0xffffff, 0);
	
	self.scene = new THREE.Scene();
	self.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 2, 3000 );
  camera.position.set(20,10,20);
  camera.lookAt(new THREE.Vector3(0, 0, 0));
  // self.camera = new THREE.OrthographicCamera( -canvas.width/10, canvas.width/10, canvas.height/10, -canvas.height/10, -500, 10000 );
  // camera.position.set(0,0,20);
  // camera.lookAt(new THREE.Vector3(0, 0, 0));
  AddLights();

  // const model = await LoadGltf('../res/2axle.glb');
  // model.traverse((node) => {
  //     if(node.isMesh){
  //       let newMat = new THREE.MeshLambertMaterial({map: node.material.map});
  //       node.material = newMat;
  //     }
  // });
  // scene.add(model);
  
  // const geometry = new THREE.SphereGeometry( 15, 360, 180 );
  // const texture = new THREE.CanvasTexture(await LoadBitmap('../res/earth_without_clouds.jpg'));
  // const material = new THREE.MeshPhongMaterial( {map: texture, color: 0xffffff,  opacity: 0.9, transparent: true  });
  // const mesh = new THREE.Mesh( geometry, material );
  // scene.add( mesh );
  // DrawGrid(); 

  
	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
	};
	animate();
  
	self.RotationSpeed = 1;
  self.TranslationSpeed = 1;
	self.state = 'stopped';
}

self.SetState = function(data){
	state = data.state;
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
}

self.OnMouseDown = function(data){
  if(data.buttons == 1 && camera.isPerspectiveCamera){ //left mouse button
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
    const intersects = raycaster.intersectObjects( scene.children );
    for (let i=0; i < intersects.length; i++) {
      if(intersects[i].object.name != "grid"){
        self.lookat = intersects[0].object.position;
        raycaster.setFromCamera((new THREE.Vector2(0,0)), camera );
        raycaster.ray.at(intersects[0].distance, self.diffv);
        self.diffv.sub(self.lookat);
        var lookatVector = (new THREE.Vector3()).subVectors(camera.position, self.lookat);
        self.polarv.setFromVector3(lookatVector);
        break;
      }
    }
    //console.log(self.polarv.radius);
  }
}

self.OnMouseMove = function(data) {
	var relativeTarget = (new THREE.Vector3(0,0,-1)).applyQuaternion( camera.quaternion );
	var upVector = camera.up;
	var tvectX = (new THREE.Vector3()).crossVectors(relativeTarget, upVector).normalize();
	var tvectY = (new THREE.Vector3()).crossVectors(tvectX, relativeTarget).normalize();
	var deltaX = -data.deltax;
	var deltaY = data.deltay;
	if(data.buttons == 1 && camera.isPerspectiveCamera){ //left mouse button
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
    tvectX.multiplyScalar(deltaX).add(tvectY.multiplyScalar(deltaY)).multiplyScalar(0.1*TranslationSpeed);
		camera.position.add(tvectX);
    // if(self.polarv.radius != 0){
    //   camera.lookAt((new THREE.Vector3()).addVectors(self.lookat, self.diffv.multiplyScalar(0.95)))      
    // }
	}else if(data.buttons == 3){ //left and right mouse button
    // self.polarv.theta += deltaX*0.005*RotationSpeed;
    // self.polarv.phi -= deltaY*0.005*RotationSpeed;
    // var lookatVector = (new THREE.Vector3()).setFromSpherical(self.polarv);
    // camera.position.copy((new THREE.Vector3()).addVectors(self.lookat, lookatVector));
    // camera.lookAt((new THREE.Vector3()).addVectors(self.lookat, self.diffv.multiplyScalar(0.99)))
	}else if(data.buttons == 4){ //wheel button
    if(camera.isPerspectiveCamera){
		  camera.position.add(relativeTarget.multiplyScalar(-0.05*deltaY*TranslationSpeed));
    }else{
      camera.zoom *= (1 -0.001*deltaY*TranslationSpeed);
    }
	}
	camera.updateProjectionMatrix();
}

self.RunLua = function (data){
  	scene.remove.apply(scene, scene.children);
    DrawGrid();
    AddLights();
    
    Module.runlua(data.code);
}

self.onmessage = (e) => {self[e.data.fn](e.data);};
