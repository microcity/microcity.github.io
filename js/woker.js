var Module = {
	print: (txt) => self.postMessage({fn: 'Print', text: txt, color: 'white'}),
    printErr: (err) => self.postMessage({fn: 'Print', text: err, color: 'red'}),
    onRuntimeInitialized: () => {
       	Module.runlua = Module.cwrap('lua_main', 'number', ['string']);
    }
};

importScripts('./glue.js');
importScripts('./three.min.js');

function Init(data){
	const {canvas} = data;
  	self.renderer = new THREE.WebGLRenderer({canvas});
	renderer.setSize(canvas.width, canvas.height, false);
	renderer.setClearColor( 0xffffff, 0);
	
	self.scene = new THREE.Scene();
	self.camera = new THREE.PerspectiveCamera( 75, canvas.width / canvas.height, 2, 1000 );
	camera.position.z = 5;
	
	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
	};
	animate();
	
	self.state = 'stopped';
}

function SetState(data){
	state = data.state;
}

function Resize(data) {
	renderer.setSize(data.width, data.height, false);
	camera.aspect = data.width / data.height;
	camera.updateProjectionMatrix();
}

function OnMouseMove(data){
	var relativeTarget = (new THREE.Vector3(0,0,-1)).applyQuaternion( camera.quaternion );
	var upVector = camera.up;
	var tvectX = (new THREE.Vector3()).crossVectors(relativeTarget, upVector).normalize();
	var tvectY = (new THREE.Vector3()).crossVectors(tvectX, relativeTarget).normalize();
	var deltaX = -data.deltax;
	var deltaY = data.deltay;
	if(data.buttons == 1){ //left mouse button
		relativeTarget.add(tvectX.multiplyScalar(deltaX).add(tvectY.multiplyScalar(deltaY)).multiplyScalar(0.005*1));
		if ((new THREE.Vector3()).crossVectors(relativeTarget, upVector).length() > 0.01){
			camera.lookAt((new THREE.Vector3()).addVectors(camera.position, relativeTarget));
		}
	}else if(data.buttons == 2){ //right mouse button
		tvectX.multiplyScalar(deltaX).add(tvectY.multiplyScalar(deltaY)).multiplyScalar(0.05*1);
		camera.position.add(tvectX);
	}else if(data.buttons == 3){ //left and right mouse button
		
	}else if(data.buttons == 4){ //wheel button
		camera.position.add(relativeTarget.multiplyScalar(-0.05*1*deltaY));
	}
	camera.updateMatrix();
}

function RunLua(data){
	scene.remove.apply(scene, scene.children);
	Module.runlua(data.code);
}

self.onmessage = (e) => {self[e.data.fn](e.data);};
