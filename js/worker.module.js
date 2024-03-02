import {Module} from '/js/glue.js';
import * as THREE from '/js/three.module.min.js';
import { RoomEnvironment } from '/js/RoomEnvironment.js';
import '/js/scene.js';
import {tarball} from '/js/tarball.js';

// self.animate = function(timeStamp) {
//     renderer.render( scene, camera );
//     requestAnimationFrame((t) => animate(t));
// }

self.Init = async function(data){
  self.canvas = data.canvas;
  self.label = data.label;
  self.renderer = new THREE.WebGLRenderer({canvas});
	//renderer.setClearColor( 0xffffff, 0);
	self.scene = new THREE.Scene();
  // const light = new THREE.AmbientLight( 0x404040, 6); // soft white light
  // scene.add( light ); 
  const pmremGenerator = new THREE.PMREMGenerator( renderer );
  scene.environment = pmremGenerator.fromScene( new RoomEnvironment() ).texture;
  InitEnv();
  //renderer.render( scene, camera );

  // self.grid = null;
	self.runningstate = 'running';
  self.stopping = false;
  self.pausing = false;
  self.commanding = false;
  self.debugfunc = '';
  self.debugtype = '';
  self.debuglevel = 0;
  self.debugwatch = [];
  self.bps = [];                //breakpoints
  self.vertices = [];           //object3d vertices
  self.index = [];              //the index of each vertex for each triangular face
  self.entries = [];            //userdata entries
  self.context = label.getContext('2d', {willReadFrequently: true});
  self.embedding = false;
  self.remotecallcount = 0;
  // self.createClient = createClient;
  // requestAnimationFrame(animate);
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
        if(child.material){
          if(!child.material.ocolor)
            child.material.ocolor = child.material.color;
          child.material.color = obj.parent.highlightcolor || new THREE.Color(0xff0000);
        }
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
        if(child.material && child.material.ocolor)
          child.material.color = child.material.ocolor;
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
        scene.updateMatrixWorld(true);
        // self.lookat = self.selected.position;
        self.selected.getWorldPosition(self.lookat);
        raycaster.setFromCamera((new THREE.Vector2(0,0)), camera );
        const distance = camera.position.distanceTo( self.lookat );
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

self.onFilesUpload = async function(data){ //通过打开按钮上传文件
  const files = data.files;
  for(const file of files){
    const data = new Uint8Array(await file.arrayBuffer());
    Module.FS.writeFile(file.name, data);
    self.postMessage({fn: 'Print', text: `${file.name} is uploaded!`, color: 'white'});
  }
  if(self.finishupload) 
    finishupload(files.map(file => file.name).join(","));
  else{
    Module.FS.syncfs(false, function (err) {
      if(err) console.error('Error syncing IDBFS:', err);
    });
  }
}

self.OSUpload = async function(url){ //通过os.upload命令上传文件
  if(url){
    const response = await fetch(url);
    if(!response.ok) return 0;
    const data = new Uint8Array(await response.arrayBuffer());
    const filename = url.replace(/^.*[\\\/]/, '');
    Module.FS.writeFile(filename, data);
    self.postMessage({fn: 'Print', text: `${filename} is uploaded!`, color: 'white'});
    return url;
  }else{
    self.postMessage({fn: 'OnFilePicker'});
    return await new Promise(res => self.finishupload = res);
  }
  // Module.FS.syncfs(false, function (err) {
  //   if(err) console.error('Error syncing IDBFS:', err);
  // }); 
}

self.ConvertURL = function(url){
  if(!url.startsWith('http') && !url.startsWith('/res/')){
    try {
      const data = Module.FS.readFile(url);
      const blob = new Blob ([data], {type: 'application/octet-stream'});
      return URL.createObjectURL(blob);
    } catch (err) {
      self.postMessage({fn: 'Print', text: `The ${url} cannot be found!`, color: 'red'});
      throw err;
    }
  }else
    return url;
}

self.OnFileDownPicker = async function(data){
  return await OSDownload();
}

//打包压缩虚拟文件系统中的文件
self.PackFiles = async function(code, pass){
  const tar = new tarball.TarWriter();
  tar.addTextFile('code', code);
  tar.addTextFile('pass', pass);
  
  //遍历虚拟文件系统中的文件
  const filenames = Module.FS.readdir('/usr');
  for(const filename of filenames){
    if(filename === '.' || filename === '..') continue;
    tar.addFileArrayBuffer(filename, Module.FS.readFile(filename));
  }

  //创建压缩包
  const tarBlob = await tar.writeBlob();
  const tarStream = tarBlob.stream();
  const compressionStream = new CompressionStream('gzip');
  const compressedStream = tarStream.pipeThrough(compressionStream);

  const chunks = [];
  const reader = compressedStream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
      chunks.push(result.value);
  }
  
  //返回压缩的文件
  return new Blob(chunks, { type: 'application/gzip' });
}

//解压文件到虚拟系统中
self.UnpackFiles = async function(blob){
  // OnNewFS(); //清空文件系统
  const compressedBlob = blob;
  const fileStream = compressedBlob.stream();  // 获取文件流
  const decompressionStream = new DecompressionStream('gzip');
  const decompressedStream = fileStream.pipeThrough(decompressionStream);

  const chunks = [];
  const reader = decompressedStream.getReader();
  let result;
  while (!(result = await reader.read()).done) {
    chunks.push(result.value);
  }

  const decompressedBlob = new Blob(chunks, { type: 'application/tar' });
  const tar = new tarball.TarReader();
  const fileInfo = await tar.readFile(decompressedBlob);

  let code, pass;
  for (let i = 0; i < fileInfo.length; i++) {
    const fileName = fileInfo[i].name;
    if (fileInfo[i].type === "file") {
      if(fileName === 'code'){
        code = tar.getTextFile(fileName);
      }else if(fileName === 'pass'){
        pass = tar.getTextFile(fileName);
      }else{
        const bin = tar.getFileBinary(fileName);
        Module.FS.writeFile(fileName, bin);
      }
    }
  }

  //返回主代码和密码
  return {code: code, pass: pass};
}

self.OSDownload = async function(url){
  if(url){
    self.postMessage({fn: 'OnFileDownload', filename:url, file: Module.FS.readFile(url)});
    return 1;
  }else{
    let filelist = [];
    const filenames = Module.FS.readdir('/usr');
    for(const filename of filenames){
      if(filename === '.' || filename === '..') continue;
      const stat = Module.FS.stat(filename);
      const file = {
        data: Module.FS.readFile(filename),
        name: filename,
        size: (stat.size / 1024).toFixed(2) + " KB",
        mtime: new Date(stat.mtime).toLocaleString("zh-CN", {year:'numeric', month:'numeric', day:'numeric', hour: 'numeric',  minute: 'numeric',})
      }
      filelist.push(file);
    }
    self.postMessage({fn: 'OnFileDownPicker', files: filelist});
    await new Promise(res => self.FinishDownload = res); //等待浏览器端关闭对话框
    return 1;
  }
}

self.OnNewFS = function(data){
  Module.FS.unmount('/usr');
  // Module.FS.unlink('/usr');
  // Module.FS.mkdir('/usr');
  Module.FS.mount(Module.IDBFS, {}, '/usr');
  Module.FS.chdir('/usr');
                                          
  Module.FS.syncfs(false, function (err) {              //如果出现warning: 2 FS.syncfs operations in flight at once，执行lua代码在结束时重复刷新了
    if(err) console.error('Error syncing IDBFS:', err);
  }); 
}

self.FindSimilarStr = function(embvec){
  let str = "similar";
  return str;
}

//接受远程调用并返回结果
self.OnRemoteCall = async function(data){
  const ret = await self[data.refn](...data.args);
  self.postMessage({fn: data.retfn, ret: ret});
}
//远程调用，refn为函数名，args为参数列表，可以接受返回值
self.RemoteCall = async function(refn, ...args){
  const retfn = 'RetRemoteCall' + self.remotecallcount++; //生成一个唯一的函数名
  self.postMessage({fn: 'OnRemoteCall', refn: refn, args: args, retfn: retfn});
  return await new Promise(resolve => self[retfn] = (data) => resolve(data.ret)); 
}

self.onmessage = (e) => {self[e.data.fn](e.data);};