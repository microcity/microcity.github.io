import {btns, disablebtn, enablebtn, editor, aceeditor, 
        docframe, footer, scene, offcanvas, worker} from '/js/ui.js';

self.lua = {state: '', file: null, rets:[], bps: aceeditor.session.getBreakpoints(0, 0)};

self.BreakAt = function (data){
  if(data.row){
    lua.breakline = data.row;
    aceeditor.renderer.scrollToLine(data.row);
    aceeditor.gotoLine(data.row);
    aceeditor.session.addGutterDecoration(data.row-1, "ace_gutter_debug_current");
    // Print({text: `The lua code is breaked at line ${data.row+1}. Waiting for control commands (go, stepover, stepin, stepout, stop) or lua code.`, color:'white'})
  }
  footer.showconsole();
}

self.OnModuleLoaded = function(data){
  SetState({state:'ready'});
  document.getElementById('version').innerText = data.version;
}

self.OnReturn = function(data){
  lua.rets[data.id].thaw(data.result);
}

self.Print = function(data){
  let newElement = document.createElement("span");
  newElement.className = 'prompt';
  newElement.innerHTML = `<span class="date">[${new Date().toLocaleString()}]</span>><span style="color:${data.color};">${data.text}</span><br/>`;
  if(data.text.substring(0, 6) == '<input' || !footer.console)
    footer.insertBefore(newElement, null);
  else
    footer.insertBefore(newElement, footer.lastChild);
	footer.scrollTop = footer.scrollHeight;			
}

self.SetState = function(data){
  if(data.state == 'running' || data.state == 'debugging'){
    disablebtn(btns['play']);
    enablebtn(btns['pause']);
    enablebtn(btns['stop']);
    disablebtn(btns['new']);
    disablebtn(btns['open']);
    disablebtn(btns['save']);
    disablebtn(btns['pub']);
  }else if(data.state == 'paused'){
    enablebtn(btns['play']);
    disablebtn(btns['pause']);
    enablebtn(btns['stop']);
    disablebtn(btns['new']);
    disablebtn(btns['open']);
    disablebtn(btns['save']);
    disablebtn(btns['pub']);
  }else if(data.state == 'ready'){
    enablebtn(btns['play']);
    disablebtn(btns['pause']);
    disablebtn(btns['stop']);
    if(!btns['code'].pass && btns['code'].active){
      enablebtn(btns['new']);
      enablebtn(btns['open']);
      enablebtn(btns['save']);
      enablebtn(btns['pub']);      
    }
  }
  document.getElementById('state').innerText = data.state;
}

lua.getstate = function (){
  return document.getElementById('state').innerText;
}

lua.run = async function (code){
  const id = lua.rets.push({}) - 1;
  worker.postMessage({fn: 'RunLua', code:code, id:id});
  return new Promise(res => lua.rets[id].thaw = res);
}

lua.runcmd = async function (ele){
  if(lua.getstate() != 'ready' &&  lua.getstate() != 'paused' )
    return;
  if(event.key === 'Enter' && ele.value != "") {
      Print({color: 'blue', text: ele.value});
      worker.postMessage({fn:'SetVar', name:'commanding', value:true});
      lua.run(ele.value);
      ele.parentNode.parentNode.firstChild.data = `[${new Date().toLocaleString()}]>`;
      ele.value = "";
  }
  if(typeof ele == 'string'){
    worker.postMessage({fn:'SetVar', name:'commanding', value:true});
    await lua.run(ele);
  }
}

self.runlua = async function (){
  if(lua.getstate() == 'ready'){
    aceeditor.setReadOnly(true);
    const result = await lua.run(aceeditor.getValue());
    aceeditor.setReadOnly(false);
  }else if(lua.getstate() == 'paused'){
    if(lua.breakline){
      aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
      lua.breakline = null;
    }
    await lua.runcmd("debug.cont()");
  }else{
    Print({color:'red', text:'Can not run more!'});
  }
}

self.debuglua = async function (){
  if(lua.getstate() == 'ready'){
    aceeditor.setReadOnly(true);
    Print({color:'yellow', text:'Start debugging...'});
    await lua.runcmd("debug.debug()");
    await lua.run(aceeditor.getValue());
    aceeditor.setReadOnly(false);
  }else if(lua.getstate() == 'paused'){
    if(lua.breakline){
      aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
      lua.breakline = null;
    }
    await lua.runcmd("debug.cont()");
  }else{
    Print({color:'red', text:'Can not debug!'});
  }
}

self.pauselua = async function (){
  if(lua.getstate() == 'running' || lua.getstate() == 'debugging'){
    worker.postMessage({fn:'SetVar', name:'pausing', value:true});
  }else{
    Print({color:'red', text:'Nothing to pause!'});
  }
}

self.stoplua = async function(){
  if(lua.getstate() == 'running' || lua.getstate() == 'debugging'){
    worker.postMessage({fn:'SetVar', name:'stopping', value:true});
  }else if(lua.getstate() == 'paused'){
    if(lua.breakline){
      aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
      lua.breakline = null;
    }
    worker.postMessage({fn:'SetVar', name:'stopping', value:true});
    await lua.runcmd("debug.cont()");
  }else{
    Print({color:'red', text:'Nothing to stop!'});
  }
}


//page load
disablebtn(btns['play']);
disablebtn(btns['pause']);
disablebtn(btns['stop']);
disablebtn(btns['code']);
disablebtn(btns['new']);
disablebtn(btns['open']);
disablebtn(btns['save']);
disablebtn(btns['pub']);
editor.style['display'] = 'none';
scene.style['grid-column'] = '1 / -1';
docframe.style['display'] = 'none';
markdown('/doc/sample.md', 'docframe');
SetState({state:'initializing'});

//load lua code
if(self.location.hash == ''){
  enablebtn(btns['code']);
  btns['code'].onclick();
  const bps = JSON.parse(localStorage.getItem("bps"));
  if(bps){
    bps.forEach((element, row) => {if(element) aceeditor.session.setBreakpoint(row);});
    worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  }
  const contents = localStorage.getItem('luacode');
  if(contents){
    aceeditor.setValue(contents, 1);
    Print({color:'white', text:`Cached code is loaded!`});
  }else{
    const response = await fetch('/lua/startup.lua');
    aceeditor.setValue(await response.text(), 1);
    Print({color:'white', text:`Startup code is loaded!`});
  }
}else{
  enablebtn(btns['code']);
  const _supabase = supabase.createClient('https://vvbgfpuqexloiavpkout.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c');
  let { data, e } = await _supabase.from('posts').select('lua,pass').eq('id', self.location.hash);
  if(data.length == 1){
    aceeditor.setValue(data[0].lua, 1);
    btns['code'].pass = data[0].pass;
    onresize();
  }else{
    Print({color:'red', text:`Can not load published code!`});
  }
}
