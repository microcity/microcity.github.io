//	const myHeaders = new Headers();
//	myHeaders.append('Cross-Origin-Opener-Policy', 'same-origin');
//		var request = window.indexedDB.open("microdes");
//		var db;
//		request.onupgradeneeded = function(event) {
//		  console.log('database upgrade');
//		  db = event.target.result;
//		  var objectStore = db.createObjectStore('state', { keyPath: 'name' });
//		  objectStore.createIndex('value', 'value', { unique: false });
//		};
//		request.onsuccess = function (event) {
//		  console.log('database success');
//		  db = event.target.result;
//		  db.transaction(['state'], 'readwrite').objectStore('state').put({ name: 'luastate', value: 'ready' });
//		  db.transaction(['state'], 'readwrite').objectStore('state').get('luastate').onsuccess = function(event) {
//		  	console.log(event.target.result.value);
//		  };
//		};
		
		
		const _supabase = supabase.createClient(
		'https://vvbgfpuqexloiavpkout.supabase.co',
		'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c'
		);
		
		window.ToggleCode = function (){
			const btn = document.getElementById('code');
			if(btn.dataset.active == "false"){
				btn.style['background-color'] = 'white';
				btn.style['filter'] = 'invert(0%)';
				btn.dataset.active = "true";
				document.getElementById("new").removeAttribute('style');
				document.getElementById("open").removeAttribute('style');
				document.getElementById("save").removeAttribute('style');
				document.getElementById("publish").removeAttribute('style');
				document.getElementById("editor").removeAttribute('style');
				document.getElementById("canvas").removeAttribute('style');
				window.dispatchEvent(new Event('resize'));
			}else if(btn.dataset.active == "true"){
				btn.removeAttribute('style');
				btn.dataset.active = "false";
				document.getElementById("new").style['filter'] = 'invert(50%)';
				document.getElementById("open").style['filter'] = 'invert(50%)';
				document.getElementById("save").style['filter'] = 'invert(50%)';
				document.getElementById("publish").style['filter'] = 'invert(50%)';
				document.getElementById("editor").style['display'] = 'none';
				document.getElementById("canvas").style['grid-column'] = '1 / -1';
				window.dispatchEvent(new Event('resize'));
			}
		}
		

		var sab = new SharedArrayBuffer(1024);
		
//		window.location.hash = '#ready';
	
		
		window.RunLua = function (){
//			luaplay = false;
//			if(window.location.hash == '#ready' || window.location.hash == '#paused'){
				scene.remove.apply(scene, scene.children);
				worker.postMessage({fn: 'RunLua', code: editor.getValue()});
//				window.location.hash = '#running';
//				worker.postMessage({fn: 'SetState', state: 'running'});
//				LuaState = 'running';
//			}
//			ActivatePlayBtn(true);
		}
		
		window.PauseLua = function (){
//			if(window.location.hash == '#running'){
//				worker.postMessage({fn: 'SetState', state: 'paused'});
//				window.location.hash = '#paused';
//				LuaState = 'paused'
//			}
		}
		
		window.StopLua = function (){
//			if(window.location.hash == '#running' || window.location.hash == '#paused'){
//				worker.postMessage({fn: 'SetState', state: 'stopped'});
//				window.location.hash = '#stopped';
//			}
		}
		
		function SetState (data){
//			LuaState = data.state;
		}
		
		function Print(data){
			if(data.color == 'red')
				alert(data.text);
			const footer = document.getElementById('footer');
			footer.insertAdjacentHTML("beforeend", `<span style="color:silver;">[${new Date().toISOString().replace(/T/, '/').replace(/\..+/, '')}]</span> <span style="color:${data.color};">${data.text}</span><br>`);
			footer.scrollTop = footer.scrollHeight;			
		}
		
		window.luafile = null;
		
		window.NewFile = async function (){
			if(document.getElementById('code').dataset.active == "false")
				return;

			editor.setValue('');
			Print({color:'white', text:'A new lua file has been created!'});
			luafile = null;
		}
		
		window.OpenFile = async function (){
			if(document.getElementById('code').dataset.active == "false")
				return;
				
			const pickerOpts = {types: [{description: 'Lua File', accept: {'lua/*': ['.lua', '.txt']}},], excludeAcceptAllOption: false, multiple: false};
			try{
				[luafile] = await showOpenFilePicker(pickerOpts);
				const file = await luafile.getFile();
				const contents = await file.text();
				editor.setValue(contents);
				Print({color:'white', text:`The ${luafile.name} has been opened!`});
			}catch(err){
				console.log(luafile);
			}
		}
		
		window.SaveFile = async function (as){
			if(document.getElementById('code').dataset.active == "false")
				return;

			if(!luafile || as){
				try{
					const pickerOpts = {suggestedName: 'untitled.lua', types: [{description: 'Lua File', accept: {'lua/*': ['.lua']}},], excludeAcceptAllOption: false};
					luafile = await window.showSaveFilePicker(pickerOpts);
				}catch(err){
					return;
				}
			}
			const writable = await luafile.createWritable();
			await writable.write(editor.getValue());
			await writable.close();			
			Print({color:'white', text:`All changes has been saved to ${luafile.name}!`});
		}
		

		window.addEventListener('keydown', (e) => {
			if(document.getElementById('code').dataset.active == "false")
				return;

			if (e.ctrlKey && e.key == 'n') {
				e.preventDefault();
				NewFile();
			}else if(e.ctrlKey && e.key == 'o'){
				e.preventDefault();
				OpenFile();
			}else if(e.ctrlKey && e.key == 's'){
				e.preventDefault();
				SaveFile(false);
			}else if(e.ctrlKey && e.shiftKey && e.key == 's'){
				e.preventDefault();
				SaveFile(true);
			}
		});
		
		window.ReadCode = async function (){
			if(window.location.hash == ''){
				ToggleCode();
				return;
			}
			let { data, e } = await _supabase.from('posts').select('lua').eq('id', window.location.hash);
			if(data.length == 1){
				DeactivateBtns();
				editor.setValue(data[0].lua);
				return true;
			}else{
				ToggleCode();
			}
		}
		
		window.PublishCode = async function (){
			if(document.getElementById('code').dataset.active == "false")
				return;
			const time = Date.now();
			if(typeof PublishCode.lasttime !== "undefined" && time - PublishCode.lasttime < 1000*3600){
				Print({color:'red', text:`Please wait ${Math.trunc((1000*3600-(time-PublishCode.lasttime))/1000/60)} minutes to publish again!`});
				return;
			}
			const id = '#'+ Math.trunc(time/1000).toString(36);
			const { data, error } = await _supabase.from('posts').insert([{ id: id, lua: editor.getValue()},])
			Print({color:'white', text:`The current page has been published to <a style="color:blue" href="${window.location.href}${id}" target="_blank">${window.location.href}${id}</a> !`});
			PublishCode.lasttime = time;
		}
		
		function DeactivateBtns(){
			document.getElementById("code").style['filter'] = 'invert(50%)';
			document.getElementById("new").style['filter'] = 'invert(50%)';
			document.getElementById("open").style['filter'] = 'invert(50%)';
			document.getElementById("save").style['filter'] = 'invert(50%)';
			document.getElementById("publish").style['filter'] = 'invert(50%)';
			document.getElementById("examples").style['filter'] = 'invert(50%)';
			
			document.getElementById("code").removeAttribute('onclick');
			document.getElementById("new").removeAttribute('onclick');
			document.getElementById("open").removeAttribute('onclick');
			document.getElementById("save").removeAttribute('onclick');
			document.getElementById("publish").removeAttribute('onclick');
			document.getElementById("examples").removeAttribute('onclick');
			
		}
		
		window.Init = function (){
			ReadCode();
			CreateScene();
		}
		
		Init();
