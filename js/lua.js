importScripts('./glue.min.js');

var lua = {};

function Init(){
	lua.factory = new wasmoon.LuaFactory();
//	indexedDB.open("microdes").onsuccess = function(event) {
//		console.log('database worker success');
//		lua.db = event.target.result;
//		lua.db.transaction(['state'], 'readwrite').objectStore('state').get('luastate').onsuccess = function(event) {
//		  	lua.state = event.target.result.value;
//		}
//	}
}

function AddCube(){
	const name = Date.now().toString();
	self.postMessage({fn: 'AddCube', name: name});
	return name;
};

function Sleep(milliseconds) {
    var req = new XMLHttpRequest();
    req.open("GET", "http://192.0.2.0/", false);
    req.timeout = milliseconds;
    try{ req.send(); } catch (ex){ }
}

//function SetState(data){
//	lua.state = data.state;
//	console.log('paused')
//}

function GetReady(){
//	if(self.location.hash == '#ready' || self.location.hash == '#running'){
//		console.log(location.hash);
//   		return true;
//	}else if(location.hash ==  '#stopped'){
//		return false;
//	}else{
//		while(location.hash == '#paused'){
//			Sleep(100);
//			console.log('ok')
//		}
//		return true;
//	}
	return true;
}

function Print(txt){
	self.postMessage({fn: 'Print', text: txt, color: 'white'});
}

function SetRotation(obj, x, y, z){
	self.postMessage({fn: 'SetRotation', name: obj, x: x, y: y, z: z});
}
//function Play(){
//	lua.play();
//}

async function RunLua(data) {
//	code = code.replace(/while.+GetReady\(\).+do/,"function Update()")
	lua.engine = await lua.factory.createEngine();
	try {
		lua.engine.global.set('Sleep', (ms) => Sleep(ms));
		lua.engine.global.set('Print', (txt) => Print(txt));
		lua.engine.global.set('print', (txt) => console.log(txt));
		lua.engine.global.set('AddCube', () => AddCube());
		lua.engine.global.set('SetRotation', (obj, x, y, z) => SetRotation(obj, x, y, z));
		lua.engine.global.set('GetReady', () => GetReady());
		lua.state = 'running';
	    const result = lua.engine.doStringSync(data.code);
//		lua.play = lua.lua.global.get('Play');
//		if(lua.play){
//			self.postMessage({fn: 'SetLuaPlay'});
//		}
	}catch (err) {
		self.postMessage({fn: 'Print', text: err, color: 'red'});
		//lua.scene.remove.apply(lua.scene, lua.scene.children);
	} finally {
    // Close the lua environment, so it can be freed
//    	if(!lua.play)
	    lua.engine.global.close();
	    lua.state = 'stopped'
		self.postMessage({fn: 'SetState', state:'finished'});
	}
}

self.onmessage = (e) => {eval(e.data.fn)(e.data);};