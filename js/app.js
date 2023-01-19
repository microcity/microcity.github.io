//dynamically load page
document.body.innerHTML = await (await fetch('/editor.htm')).text();
  
//define dom variables
const header    = document.getElementById('header');
const btnplay   = document.getElementById('play');
const btnpause  = document.getElementById('pause');
const btnstop   = document.getElementById('stop');
const btncode   = document.getElementById('code');
const btnnew    = document.getElementById('new');
const btnopen   = document.getElementById('open');
const btnsave   = document.getElementById('save');
const btnpub    = document.getElementById('publish');
const btndoc    = document.getElementById('doc');
const editor    = document.getElementById('editor');
const scene     = document.getElementById('scene');
const docframe  = document.getElementById('docframe');
var   offcanvas = document.getElementById('offcanvas');
const footer    = document.getElementById('footer');
const aceeditor = ace.edit("editor");
const bps       = aceeditor.session.getBreakpoints(0, 0);
var   worker    = new Worker('./js/worker.module.js', {type : 'module'});
const lua       = {state: '', file: null};

//define gui functions
worker.onmessage = (e) => {self[e.data.fn](e.data);};

self.onresize = () => {
  worker.postMessage({
    fn: 'Resize',
    width: scene.clientWidth,
    height: scene.clientHeight,
  });
}

self.OnModuleLoaded = function(){
  enablebtn(btnplay);
  enablebtn(btnpause);
  enablebtn(btnstop);
  SetState({state: 'ready'});
}

header.oncontextmenu = (e) => {
  e.preventDefault();
}

const disablebtn = function (btn){
  btn.style['filter'] = 'invert(50%)';
  btn.style['pointer-events'] = 'none';
}

const enablebtn = function (btn){
  btn.removeAttribute('style');
}

const runlua = function (debug){
  if(lua.state == 'ready'){
    // lua.state = debug ? 'debugging' : 'running';
    worker.postMessage({fn: 'SetState', state: lua.state});
    worker.postMessage({fn: 'RunLua', code: aceeditor.getValue(), debug:debug, bps:bps});
    Print({color:'white', text:`The current lua code is runned!`});
  }else if(lua.state == 'paused'){
    // lua.state = 'running';
    worker.postMessage({fn: 'SetState', state: lua.state});
    Print({color:'white', text:`The current paused lua code is continued!`});
  }
}
btnplay.onclick = () => runlua(false);
btnplay.oncontextmenu = () => runlua(true);

btnpause.onclick = function (){
  if(lua.state == 'running'){
  //  lua.state = 'paused';
    worker.postMessage({fn: 'SetState', state: lua.state});
    Print({color:'white', text:`The current running lua code is paused!`});
  }
}
		
btnstop.onclick = async function (){
  if(lua.state == 'running' || lua.state == 'debugging' || lua.state == 'paused'){
    lua.state = 'ready';
    worker.postMessage({fn: 'SetState', state: lua.state});
    Print({color:'white', text:`The current lua code is ready!`});
  }else if(lua.state == 'ready'){

  }
}

btnstop.oncontextmenu = function (){
  lua.state = 'terminated';
  worker.terminate();
  var newcanvas = document.getElementById('scene').appendChild(document.createElement('canvas'));
  [newcanvas.id, newcanvas.style.display] = [offcanvas.id, offcanvas.style.display];
  [newcanvas.onmousedown, newcanvas.onmouseup, newcanvas.oncontextmenu, newcanvas.onmousemove, newcanvas.onwheel] = 
  [offcanvas.onmousedown, offcanvas.onmouseup, offcanvas.oncontextmenu, offcanvas.onmousemove, offcanvas.onwheel];
  offcanvas.remove();
  offcanvas = newcanvas;
  offscreen = offcanvas.transferControlToOffscreen();
  
  disablebtn(btnplay);
  disablebtn(btnpause);
  disablebtn(btnstop);
  worker = new Worker('./js/worker.module.js', {type : 'module'});
  worker.onmessage = (e) => {self[e.data.fn](e.data);};
  worker.postMessage({fn: 'Init', canvas: offscreen}, [offscreen]);
  onresize();
  Print({color:'red', text:`The current lua thread is killed!`});
}

btncode.onclick = function (){
  if(!btncode.active){
    btncode.style['background-color'] = 'white';
    btncode.style['filter'] = 'invert(0%)';
    btncode.active = true;
    enablebtn(btnnew);
    enablebtn(btnopen);
    enablebtn(btnsave);
    enablebtn(btnpub);
    editor.removeAttribute('style');
    scene.removeAttribute('style');
    self.dispatchEvent(new Event('resize'));
  }else{
    btncode.removeAttribute('style');
    btncode.active = false;
    disablebtn(btnnew);
    disablebtn(btnopen);
    disablebtn(btnsave);
    disablebtn(btnpub);
    editor.style['display'] = 'none';
    scene.style['grid-column'] = '1 / -1';
    self.dispatchEvent(new Event('resize'));
  }
}

btnnew.onclick = async function (){
  if(window.confirm("Discard all changes and create a new lua file?")){
    aceeditor.setValue('');
    Print({color:'white', text:'A new lua file has been created!'});
    lua.file = null;
    localStorage.clear();
  }
}
		
btnopen.onclick = async function (){		
  const pickerOpts = {types: [{description: 'Lua File', accept: {'lua/*': ['.lua']}},], excludeAcceptAllOption: false, multiple: false};
  try{
    [lua.file] = await showOpenFilePicker(pickerOpts);
    const file = await lua.file.getFile();
    const contents = await file.text();
    aceeditor.setValue(contents, 1);
    Print({color:'white', text:`The ${lua.file.name} has been opened!`});
    localStorage.setItem('luacode', contents);
  }catch(err){
    console.log(lua.file);
  }
}
		
const savefile = async function (as){
  if(!lua.file || as){
    try{
      const pickerOpts = {suggestedName: 'untitled.lua', types: [{description: 'Lua File', accept: {'lua/*': ['.lua']}},], excludeAcceptAllOption: false};
      lua.file = await self.showSaveFilePicker(pickerOpts);
    }catch(err){
      return;
    }
  }
  const writable = await lua.file.createWritable();
  await writable.write(aceeditor.getValue());
  await writable.close();			
  Print({color:'white', text:`All changes has been saved to ${lua.file.name}!`});
  localStorage.setItem('luacode', aceeditor.getValue());
}
setInterval(function(){ //autosave
  if(self.location.hash == '')
    localStorage.setItem('luacode', aceeditor.getValue());
},60000);

btnsave.onclick = () => savefile(false);
btnsave.oncontextmenu = () => savefile(true);

btnpub.onclick = async function (){
  const time = Date.now();
  const _supabase = supabase.createClient('https://vvbgfpuqexloiavpkout.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c');
  if(btnpub.lasttime && time - btnpub.lasttime < 1000*3600){
    Print({color:'red', text:`Please wait ${Math.trunc((1000*3600-(time-btnpub.lasttime))/1000/60)} minutes to publish again!`});
    return;
  }
  const id = '#'+ Math.trunc(time/1000).toString(36);
  const { data, error } = await _supabase.from('posts').insert([{ id: id, lua: aceeditor.getValue()},])
  Print({color:'white', text:`The current page has been published to <a style="color:blue" href="${self.location.href}${id}" target="_blank">${self.location.href}${id}</a> !`});
  btnpub.lasttime = time;
}

btndoc.onclick = function(){
  if(docframe.style['display'] === 'none'){
    btndoc.style['background-color'] = 'white';
    btndoc.style['filter'] = 'invert(0%)';
    docframe.style['display'] = 'unset';
    offcanvas.style['display'] = 'none'
  }else{
    btndoc.removeAttribute('style');
    docframe.style['display'] = 'none';
    offcanvas.style['display'] = 'unset';
  }
  self.dispatchEvent(new Event('resize'));
}

aceeditor.setOptions({theme: 'ace/theme/nord_dark', mode: 'ace/mode/lua', showPrintMargin: false, enableLiveAutocompletion: true, useWorker: false});
aceeditor.on("guttermousedown", function(e) {
  var target = e.domEvent.target; 
  if (target.className.indexOf("ace_gutter-cell") == -1)
    return; 
  if (!aceeditor.isFocused()) 
      return; 
  if (e.clientX > 25 + target.getBoundingClientRect().left) 
      return; 
  
  var row = e.getDocumentPosition().row;
  if(typeof bps[row] === typeof undefined)
      e.editor.session.setBreakpoint(row);
  else
      e.editor.session.clearBreakpoint(row);
  e.stop();
});

aceeditor.commands.addCommand({
  name: 'help',
  bindKey: {win: 'F1',  mac: 'F1'},
  exec: btndoc.onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'go',
  bindKey: {win: 'F9',  mac: 'F9'},
  exec: btndoc.onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

offcanvas.onmousedown = (e) => {
  e.preventDefault();
  offcanvas.startx = e.clientX;
  offcanvas.starty = e.clientY;
  var rect = e.target.getBoundingClientRect();
  worker.postMessage({fn: 'OnMouseDown', buttons:e.buttons, x: offcanvas.startx - rect.left, y: offcanvas.starty - rect.top});
  if(e.buttons == 2){
    offcanvas.style.cursor = 'grab';
  }
}

offcanvas.onmouseup = (e) => {
  e.preventDefault();
  offcanvas.style.cursor = 'default';
  worker.postMessage({fn: 'OnMouseUp', buttons:e.buttons});
}
                       
offcanvas.oncontextmenu = (e) => {
  e.preventDefault();
}

offcanvas.onmousemove = (e) => {
  e.preventDefault();
  if(e.buttons > 0){
    worker.postMessage({fn: 'OnMouseMove', buttons:e.buttons, deltax:e.clientX - offcanvas.startx, deltay:e.clientY - offcanvas.starty});
    offcanvas.startx = e.clientX;
    offcanvas.starty = e.clientY;
  }
}

offcanvas.onwheel = (e) => {
  e.preventDefault();
  worker.postMessage({fn: 'OnMouseMove', buttons:4, deltay:e.deltaY});
}

docframe.oncontextmenu = (e) => {
  e.preventDefault();
}

self.execute = function (ele){
  if(event.key === 'Enter' && ele.value != "") {
      Print({color: 'blue', text: ele.value});
      worker.postMessage({fn: 'RunCommand', code: ele.value});
      ele.parentNode.parentNode.firstChild.data = `[${new Date().toLocaleString()}]>`;
      ele.value = "";
  }
}

footer.onmousedown = (e) => {
  if(e.buttons == 1){
    if(e.target.id == "footer"){
      if(!footer.active){
        document.getElementById('container').style['grid-template-rows'] = '50px 1fr 1fr';
        footer.style['overflow-y'] = 'auto';
        footer.active = true;
      }else{
        document.getElementById('container').style['grid-template-rows'] = '50px 1fr 36px';
        footer.style['overflow-y'] = 'hidden';
        footer.active = false;        
      }
      footer.scrollTop = footer.scrollHeight;		
      self.dispatchEvent(new Event('resize'));
    }
  }else if(e.buttons == 2 && !footer.console){
    Print({text: '<input id="command" onkeydown="execute(this)"/>'});
    footer.console = true;
  }
}

footer.oncontextmenu = (e) => {
  e.preventDefault();
  if(footer.console)
    document.getElementById('command').focus();  
}

footer.onmouseover = (e) => {
  if(e.target.id != "footer" && e.target.tagName != "A"){
    e.target.style['cursor'] = 'auto';
  }
}

self.onkeydown = (e) => {
  if(!btncode.active)
    return;

  if (e.ctrlKey && e.key == 'n') {
    e.preventDefault();
    newfile();
  }else if(e.ctrlKey && e.key == 'o'){
    e.preventDefault();
    openfile();
  }else if(e.ctrlKey && e.key == 's'){
    e.preventDefault();
    savefile(false);
  }else if(e.ctrlKey && e.shiftKey && e.key == 's'){
    e.preventDefault();
    savefile(true);
  }else if(e.key === "F1"){
    e.preventDefault();
    btndoc.onclick();
  }else if(e.key === 'F9' && lua.state === 'debugging'){
    e.preventDefault();
  }
}

self.SetState = function(data){
  lua.state = data.state;
  document.getElementById('state').innerText = data.state;
}

self.Print = function(data){
  let newElement = document.createElement("span");
  newElement.className = 'prompt';
  newElement.innerHTML = `[${new Date().toLocaleString()}]><span style="color:${data.color};">${data.text}</span><br/>`;
  if(data.text.substring(0, 6) == '<input' || !footer.console)
    footer.insertBefore(newElement, null);
  else
    footer.insertBefore(newElement, footer.lastChild);
	footer.scrollTop = footer.scrollHeight;			
}

//page load
disablebtn(btnplay);
disablebtn(btnpause);
disablebtn(btnstop);
disablebtn(btncode);
disablebtn(btnnew);
disablebtn(btnopen);
disablebtn(btnsave);
disablebtn(btnpub);
editor.style['display'] = 'none';
scene.style['grid-column'] = '1 / -1';
docframe.style['display'] = 'none';
markdown('/doc/sample.md', 'docframe');
SetState({state:'initializing'});

//transfer offcanvas
if (!offcanvas.transferControlToOffscreen) {
  alert("This browser does not support offscreen canvas!");
}
var offscreen = offcanvas.transferControlToOffscreen();
worker.postMessage({fn: 'Init', canvas: offscreen}, [offscreen]);
onresize();

//load lua code
if(self.location.hash == ''){
  enablebtn(btncode);
  btncode.onclick();
  const contents = localStorage.getItem('luacode');
  if(contents){
    aceeditor.setValue(contents, 1);
    Print({color:'white', text:`Restore the last autosaved lua code!`});
  }else{
    const response = await fetch('/lua/startup.lua');
    aceeditor.setValue(await response.text(), 1);
    Print({color:'white', text:`The startup lua code is loaded!`});
  }
}else{
  const _supabase = supabase.createClient('https://vvbgfpuqexloiavpkout.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c');
  let { data, e } = await _supabase.from('posts').select('lua').eq('id', self.location.hash);
  if(data.length == 1){
    aceeditor.setValue(data[0].lua, 1);
  }else{
    Print({color:'red', text:`Can not load published code!`});
  }
}
