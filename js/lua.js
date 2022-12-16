importScripts('./glue.min.js');

var state = {};

function init(data) {
	state.ready = false;
	state.factory = new wasmoon.LuaFactory();
}

function AddCube(){
	const name = Date.now().toString();
	self.postMessage({fn: 'AddCube', name: name});
	return name;
};

function sleep(milliseconds) {
    var req = new XMLHttpRequest();
    req.open("GET", "http://192.0.2.0/", false);
    req.timeout = milliseconds;
    try{ req.send(); } catch (ex){ }
}

function Ready(){
	state.ready = true;
}

function GetReady(){
   	return true;
}

function Play(){
	state.play();
}

async function runlua(data) {
//	code = code.replace(/while.+GetReady\(\).+do/,"function Update()")
	state.lua = await state.factory.createEngine();
	try {
		state.lua.global.set('Sleep', (ms) => sleep(ms));
		state.lua.global.set('Print', (txt) => self.postMessage({fn: 'Print', text: txt, color: 'white'}));
		state.lua.global.set('print', (txt) => console.log(txt));
		state.lua.global.set('AddCube', () => AddCube());
		state.lua.global.set('SetRotation', (obj, x, y, z) => self.postMessage({fn: 'SetRotation', name: obj, x: x, y: y, z: z}));
		state.lua.global.set('GetReady', () => GetReady());
	    const result = state.lua.doStringSync(data.code);
		state.play = state.lua.global.get('Play');
		if(state.play){
			self.postMessage({fn: 'SetLuaPlay'});
		}
	}catch (err) {
		self.postMessage({fn: 'Print', text: err, color: 'red'});
		//state.scene.remove.apply(state.scene, state.scene.children);
	} finally {
    // Close the lua environment, so it can be freed
    	if(!state.play)
	    	state.lua.global.close();
	}
}

self.onmessage = (e) => {eval(e.data.fn)(e.data);};