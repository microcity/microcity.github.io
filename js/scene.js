function CreateScene(){
	//Add Renderer
	const renderer = new THREE.WebGLRenderer();
	const container = document.getElementById('offcanvas');
	var w = container.clientWidth;
	var h = container.clientHeight ;
	renderer.setSize(w, h);
	renderer.setClearColor( 0xffffff, 0);
	container.appendChild(renderer.domElement);
	//Create Scene, Add Camera
	window.scene = new THREE.Scene();
	window.camera = new THREE.PerspectiveCamera( 75, w / h, 2, 1000 );
	camera.position.z = 5;

//	window.luaplay = false;
	function animate() {
		requestAnimationFrame( animate );
		renderer.render( scene, camera );
//		if(luaplay){
//			worker.postMessage({fn: 'Play'});
//		}
	};
	animate();
	
	function resize() {
		w = container.offsetWidth;
		h = container.offsetHeight ;
		renderer.setSize(w, h);
		camera.aspect = w / h;
		camera.updateProjectionMatrix();
	}
	window.addEventListener('resize', resize);
	resize();

}

function AddCube(data){
	var geometry = new THREE.BoxGeometry(1,1,1);
	var material = new THREE.MeshBasicMaterial({color:0x00ff00});
	var mesh = new THREE.Mesh(geometry,material);
	scene.add(mesh);
	return mesh;
};

function SetRotation(data){
	const obj = data.obj;
	obj.rotation.x = data.x;
	obj.rotation.y = data.y;
	obj.rotation.z = data.z;
}

var sab = new SharedArrayBuffer(1024);

//function SetLuaPlay(data){
//	luaplay = true;
//}
