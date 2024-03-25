import * as THREE from '/js/three.module.min.js';
import { GLTFLoader } from '/js/GLTFLoader.js';

// Remove all objects
self.DisposeObj = function(obj){
    if(!obj) return false;
  
    if(obj.children.length > 0){
        for (var x = obj.children.length - 1; x>=0; x--){
            DisposeObj( obj.children[x]);
        }
    }

    if (obj.geometry) {
        obj.geometry.dispose();
    }

    if (obj.material) {
        if (obj.material.length) {
            for (let i = 0; i < obj.material.length; ++i) {

                if (obj.material[i].map) obj.material[i].map.dispose();
                if (obj.material[i].lightMap) obj.material[i].lightMap.dispose();
                if (obj.material[i].bumpMap) obj.material[i].bumpMap.dispose();
                if (obj.material[i].normalMap) obj.material[i].normalMap.dispose();
                if (obj.material[i].specularMap) obj.material[i].specularMap.dispose();
                if (obj.material[i].envMap) obj.material[i].envMap.dispose();

                obj.material[i].dispose()
            }
        }
        else {
            if (obj.material.map) obj.material.map.dispose();
            if (obj.material.lightMap) obj.material.lightMap.dispose();
            if (obj.material.bumpMap) obj.material.bumpMap.dispose();
            if (obj.material.normalMap) obj.material.normalMap.dispose();
            if (obj.material.specularMap) obj.material.specularMap.dispose();
            if (obj.material.envMap) obj.material.envMap.dispose();

            obj.material.dispose();
        }
    }

    obj.removeFromParent();

    return true;
}

self.InitEnv = function (){
  // scene.clear();
  // for( var i = scene.children.length - 1; i >= 0; i--) { 
  //    obj = scene.children[i];
  //    scene.remove(obj); 
  // }
  DisposeObj(scene);
  scene.background = new THREE.Color( 0xffffff );
  SetCam('persp');
  self.grid = null;
  self.selected = null;
  self.RotationSpeed = 1;
  self.TranslationSpeed = 1;
}

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
        lonpoints.push((new THREE.Vector3()).setFromSphericalCoords(1, phi, theta));
      const geometry = new THREE.BufferGeometry().setFromPoints(lonpoints);
      const line = new THREE.Line(geometry, material);
      grid.add(line);
    }
    for(let phi = -Math.PI + GridDistance; phi < 0; phi += GridDistance){
      const material = new THREE.LineBasicMaterial( { color: GridColorDark } );
      const latpoints = [];    
      for(let theta = -Math.PI; theta < Math.PI; theta += Math.PI/180)
        latpoints.push((new THREE.Vector3()).setFromSphericalCoords(1, phi, theta));
      const geometry = new THREE.BufferGeometry().setFromPoints(latpoints);
      const line = new THREE.Line(geometry, material);
      grid.add(line); 
    }
  }
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
  DisposeObj(self.camera);
  if(camtype=='ortho'){
    self.camera = new THREE.OrthographicCamera( -canvas.width/10, canvas.width/10, canvas.height/10, -canvas.height/10, -500, 10000 );
    camera.position.set(0, 0, 1);
    camera.lookAt(new THREE.Vector3(0, 0, 0));
  }else{
  	self.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 2, 3000 );
    camera.position.set(20,10,20);
    camera.lookAt(new THREE.Vector3(0, 0, 0));    
  }
  camera.name = "camera";
  scene.add( camera );
}

self.LoadGltf = function (url) {
  url = ConvertURL(url);
  const loader = new GLTFLoader();
  // loader.crossOrigin = 'use-credentials';
  return new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data.scene), null, reject);
    URL.revokeObjectURL(url);
  });
}

self.LoadBitmap = function (url) {
  url = ConvertURL(url);
  const loader = new THREE.ImageBitmapLoader();
  loader.setOptions( { imageOrientation: 'flipY' } );
  return new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data), null, reject);
    URL.revokeObjectURL(url);
  });
}  

self.LoadJson = function (url) {
  url = ConvertURL(url);
  const loader = new THREE.FileLoader().setResponseType('json');
  return new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data), null, reject);
    URL.revokeObjectURL(url);
  });
}

self.AddPoints = function (sel, color, opacity, hcolor, size){
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  const material = new THREE.PointsMaterial( { color: color, opacity: opacity, transparent: true, size: size, sizeAttenuation: false} );
  obj[++id] = new THREE.Points( geometry, material );
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}

self.AddLine = function (sel, color, opacity, hcolor, size){
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  const material = new THREE.LineBasicMaterial( { color: color, opacity: opacity, transparent: true, linewidth: size} );
  obj[++id] = new THREE.Line( geometry, material );
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}

self.AddShape = function (sel, color, opacity, hcolor, size){
  const shape = new THREE.Shape();
  shape.moveTo(vertices[0], vertices[1]);
  for(let i = 3; i < vertices.length; i+=3){
    shape.lineTo(vertices[i], vertices[i+1]);
  }
  const geometry = new THREE.ExtrudeGeometry(shape, {depth: size, bevelEnabled: false});
  const material = new THREE.MeshMatcapMaterial( { color: color, opacity: opacity, transparent: true} );
  obj[++id] = new THREE.Mesh( geometry, material );
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}


self.AddMesh = function (sel, color, opacity, hcolor){
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute( 'position', new THREE.Float32BufferAttribute( vertices, 3 ) );
  const material = new THREE.MeshMatcapMaterial( { color: color, opacity: opacity, transparent: true} );
  obj[++id] = new THREE.Mesh( geometry, material );
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}


self.AddBox = function (x, y, z, sel, color, opacity, hcolor){
  const geometry = new THREE.BoxGeometry(x,y,z);
  const material = new THREE.MeshMatcapMaterial({color:color, opacity: opacity, transparent: true});
  obj[++id] = new THREE.Mesh(geometry,material);
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}

self.AddSphere = function (r, seg, sel, color, opacity, hcolor){
  const geometry = new THREE.SphereGeometry( r, seg, seg/2 );
  const material = new THREE.MeshMatcapMaterial({color:color, opacity: opacity, transparent: true});
  obj[++id] = new THREE.Mesh(geometry,material);
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
  // const texture = new THREE.CanvasTexture(await LoadBitmap('/res/natrual_earth.jpg'));
  // const material = new THREE.MeshPhongMaterial( {map: texture, color: 0xffffff,  opacity: 0.9, transparent: true  });
  // const mesh = new THREE.Mesh( geometry, material );
  // mesh.selectable = true;
  // mesh.highlightcolor = new THREE.Color(0xffffff);
  // scene.add( mesh );
}

self.AddJson = async function (url, sel, hcolor){
  url = ConvertURL(url);
  const loader = new THREE.ObjectLoader();
  obj[++id] = await new Promise((resolve, reject) => {
    loader.load(url, data => resolve(data), null, reject);
    URL.revokeObjectURL(url);
  });
  obj[id].traverse((node) => {
    if ( node.material ) node.material.metalness = 0;
    node.selectable = sel;
  });
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}

self.AddGLTF = async function (file, sel, hcolor){
  obj[++id] = await LoadGltf(file);
  obj[id].traverse((node) => {
      // if(node.isMesh){
      //   let newMat = new THREE.MeshMatcapMaterial({map: node.material.map});
      //   node.material = newMat;
      // }
      if ( node.material ) node.material.metalness = 0;
      node.selectable = sel;
  });
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
  return id;
}

self.AddGeoJson = async function(file, sel, color, opacity, hcolor){
  const model = await LoadJson(file);                        //'/res/world_countries.geojson'
  obj[++id] = new THREE.Object3D();
  model.features.forEach(elem => {
    const feature = new THREE.Object3D();
    const type = elem.geometry.type;
    const coordinates = elem.geometry.coordinates;
    if(type == 'Polygon' || type == 'MultiPolygon'){
      coordinates.forEach(multiPolygon => {
      if(type === 'Polygon'){
        multiPolygon = [multiPolygon];
      }
      multiPolygon.forEach(polygon => {
        const shape = new THREE.Shape();
        const lineMaterial = new THREE.LineBasicMaterial({ color: 'black' });
        const points = [];
        for (let i = 0; i < polygon.length; i++) {
          const [x, y] = polygon[i];
          if (i === 0) shape.moveTo(x, y);
          shape.lineTo(x, y);
          points.push(new THREE.Vector3(x, y, 0));
        }

        // const extrudeSettings = {depth: 4, bevelEnabled: false};
        // const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings)
        const geometry = new THREE.ShapeGeometry( shape );
        const material = new THREE.MeshBasicMaterial({ color: color, transparent: true, opacity: opacity });
        // const material1 = new THREE.MeshBasicMaterial({ color: '#3480C4', transparent: true, opacity: 0.5 })
        const mesh = new THREE.Mesh(geometry, material);
        const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
        const line = new THREE.Line(lineGeometry, lineMaterial);
        mesh.add(line);
        feature.add(mesh);
      });
    });
    }if(type == 'LineString' || type == 'MultiLineString'){
      // coordinates.forEach(multiLine =>{
      let multiLine = coordinates;
      if(type === 'LineString'){
        multiLine = [multiLine];
      }
      multiLine.forEach(line => {
        const points = [];
        for (let i = 0; i < line.length; i++) {
          const [x, y] = line[i];
          points.push(new THREE.Vector3(x, y, 0));
        }
        const lineMaterial = new THREE.LineBasicMaterial({ color: 'black' });
        const lineGeometry = new THREE.BufferGeometry().setFromPoints( points );
        const objline = new THREE.Line(lineGeometry, lineMaterial);
        feature.add(objline);
      });
      // });
    }if(type == 'Point' || type == 'MultiPoint'){
      // coordinates.forEach(multiPoint =>{
      let multiPoint = coordinates;
      if(type === 'Point'){
        multiPoint = [multiPoint];
      }
      const points = [];
      multiPoint.forEach(point => {
        const [x, y] = point;
        points.push(new THREE.Vector3(x, y, 0));
      });
      var dotGeometry = new THREE.BufferGeometry().setFromPoints( points );
      var dotMaterial = new THREE.PointsMaterial( {color: 'black', size: 5, sizeAttenuation: false } );
      var dot = new THREE.Points( dotGeometry, dotMaterial );       
      feature.add(dot);
      // });
    }

    feature.userData = elem.properties;
    if (elem.properties.contorid) {
      const [x, y] = elem.properties.contorid;
      feature.userData.centroid = [x, y];
    }
    feature.selectable = sel;
    feature.highlightcolor = new THREE.Color(hcolor);
    obj[id].add(feature);
  });
  scene.add(obj[id]);
  return id;
}

self.AddLight = function (color, opacity){
  obj[++id] = new THREE.DirectionalLight( 0xffffff, opacity );
  scene.add(obj[id]);
  return id;
}

self.AddTextSprite = function( text, font, sel, size, color, opacity, hcolor){
	// var context = label.getContext('2d', {willReadFrequently: true});
  
  context.reset();
  // context.clearRect(0, 0, label.width, label.height); //gpt suggest
  
  size = size*16;
	context.font = size + "px " + font;   
	// get size data (height depends only on font size)
  label.width = context.measureText(text).width;
  label.height = size;
  
  context.font = size + "px " + font; // Set font again after canvas is resized, as context properties are reset
  context.textBaseline = 'bottom';
  context.fillStyle = color;
  context.fillText( text, 0, label.height);

  // var data = new Uint8ClampedArray(context.getImageData(0,0,label.width, label.height).data);
  
  const data = context.getImageData(0,0,label.width, label.height).data;
  const texture = new THREE.DataTexture( data, label.width, label.height);

  // const imageData = context.getImageData(0, 0, label.width, label.height);
  // const data = new Uint8Array(imageData.data.buffer);
  // const texture = new THREE.DataTexture(data, label.width, label.height, THREE.RGBAFormat); //gpt suggest
  
  texture.needsUpdate = true;
  texture.flipY = true;
  
	var spriteMaterial = new THREE.SpriteMaterial({ map: texture, transparent: true, opacity: opacity});
	obj[++id] = new THREE.Sprite( spriteMaterial );
	obj[id].scale.set(label.width/16, label.height/16, 0);
  obj[id].selectable = sel;
  obj[id].highlightcolor = new THREE.Color(hcolor);
  scene.add(obj[id]);
	return id;	
}