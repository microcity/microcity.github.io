export const header    = document.getElementById('header');
export const btns      = {
  "play":   document.getElementById('play'),
  "pause":  document.getElementById('pause'),
  "stop":   document.getElementById('stop'),
  "code":   document.getElementById('code'),
  "new":    document.getElementById('new'),
  "open":   document.getElementById('open'),
  "save":   document.getElementById('save'),
  "pub":    document.getElementById('pub'),
  "doc":    document.getElementById('doc'),
  "newclose":  document.getElementById('newclose'),
  "downclose": document.getElementById('downclose')
};

export const editor    = document.getElementById('editor');
export const aceeditor = ace.edit("editor");
export const docframe  = document.getElementById('docframe');
export const footer    = document.getElementById('footer');
export const scene     = document.getElementById('scene');
export var   offcanvas = document.getElementById('offcanvas');
export var   worker    = new Worker('./js/worker.module.js', {type : 'module'});

worker.onmessage = (e) => {self[e.data.fn](e.data);};

self.onresize = () => {
  worker.postMessage({
    fn: 'Resize',
    width: scene.clientWidth,
    height: scene.clientHeight,
  });
}
//transfer offcanvas
if (!offcanvas.transferControlToOffscreen) {
  alert("This browser does not support offscreen canvas!");
}
var offscreen = offcanvas.transferControlToOffscreen();
const label = document.createElement("canvas").transferControlToOffscreen();
worker.postMessage({fn: 'Init', canvas: offscreen, label: label}, [offscreen, label]);
onresize();

export const disablebtn = function (btn){
  btn.style['filter'] = 'invert(50%)';
  btn.style['pointer-events'] = 'none';
  btn.enabled = false;
}

export const enablebtn = function (btn){
  btn.removeAttribute('style');
  btn.enabled = true;
}

header.oncontextmenu = (e) => {
  e.preventDefault();
}

btns['play'].onclick = () => runlua();
btns['play'].oncontextmenu = () => debuglua();
btns['pause'].onclick = () => pauselua();	
btns['stop'].onclick = () => stoplua();
btns['stop'].oncontextmenu = () => scene.reload();

btns['code'].onclick = function (){
  if(btns['code'].pass){
    const pass = prompt("The password for allowing editing:");
    if(btns['code'].pass == pass){
      btns['code'].pass = false;
    }else{
      Print({color:'red', text:'The password is wong!'})
      return;
    }
  }
  editor.removeAttribute('style');
  scene.removeAttribute('style');
  if(!btns['code'].active){
    btns['code'].style['background-color'] = 'white';
    btns['code'].style['filter'] = 'invert(0%)';
    btns['code'].active = true;
    if(lua.getstate() == 'ready'){
      enablebtn(btns['new']);
      enablebtn(btns['open']);
      enablebtn(btns['save']);
      enablebtn(btns['pub']);
    }
    self.dispatchEvent(new Event('resize'));
  }else{
    btns['code'].removeAttribute('style');
    btns['code'].active = false;
    disablebtn(btns['new']);
    disablebtn(btns['open']);
    disablebtn(btns['save']);
    disablebtn(btns['pub']);
    editor.style['display'] = 'none';
    scene.style['grid-column'] = '1 / -1';
    self.dispatchEvent(new Event('resize'));
  }
}

btns['code'].oncontextmenu = function (){
  btns['code'].onclick();
  if(btns['code'].active){
    btns['code'].style['background-color'] = '#2e3440';
    scene.style['display'] = 'none';
    editor.style['grid-column'] = '1 / -1';
    self.dispatchEvent(new Event('resize'));
  }
}

btns['new'].onclick = async function (){
  await newdialog.showModal();
  // if(window.confirm("Discard all changes and create a new lua file?")){
  //   aceeditor.setValue('');
  //   Print({color:'white', text:'A new lua file has been created!'});
  //   lua.file = null;
  //   localStorage.clear();
  // }
}
btns['new'].oncontextmenu = function (){
  history.replaceState(null, null, ' ');
  worker.postMessage({fn: 'OnNewFS'});
  Print({color:'white', text:`The file system and link are cleared!`});
}

btns['open'].onclick = async function (){		
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

btns['open'].oncontextmenu = () => OnFilePicker();

const savefile = async function (as){
  if(!lua.file || as){
    try{
      const pickerOpts = {suggestedName: 'untitled.lua', types: [{description: 'Lua File', accept: {'lua/*': ['.lua']}},], excludeAcceptAllOption: false};
      lua.file = await self.showSaveFilePicker(pickerOpts);
    }catch(err){
      Print({color:'red', text:err});
      return;
    }
  }
  const writable = await lua.file.createWritable();
  await writable.write(aceeditor.getValue());
  await writable.close();			
  Print({color:'white', text:`All changes has been saved to ${lua.file.name}!`});
  localStorage.setItem('luacode', aceeditor.getValue());
}

btns['save'].onclick = () => savefile(false);
btns['save'].oncontextmenu = async function (){
  worker.postMessage({fn: 'OnFileDownPicker'});
}

btns['pub'].onclick = async function (){
  const time = Date.now();
  const _supabase = supabase.createClient('https://vvbgfpuqexloiavpkout.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c');
  // if(btns['pub'].lasttime && time - btns['pub'].lasttime < 1000*3600){
  //   Print({color:'red', text:`Please wait ${Math.trunc((1000*3600-(time-btns['pub'].lasttime))/1000/60)} minutes to publish again!`});
  //   return;
  // }
  if(location.hash){
    // const pass = prompt("The new password for allowing editing: (can be empty)");
    const id = location.hash;
    const { data, error } = await _supabase.from('posts').upsert([{ id: id, lua: aceeditor.getValue()}]);
    Print({color:'white', text:`The published page is updated!`});
  }else{
    const pass = prompt("Confirm to publish and fill a password for editing: (can be empty)");
    if(pass != null){
      const id = '#'+ Math.trunc(time/1000).toString(36);
      const { data, error } = await _supabase.from('posts').insert([{ id: id, lua: aceeditor.getValue(), pass:pass}]);
      Print({color:'white', text:`This page is published to <span style="color:blue">${self.location.href}${id}</span>`});
      location.hash = id;
    }
  }
  // btns['pub'].lasttime = time;
}

btns['pub'].oncontextmenu = async function(){
  const pickerOpts = {types: [{},], excludeAcceptAllOption: false, multiple: false};
  const [fileHandle] = await window.showOpenFilePicker(pickerOpts);
  const file = await fileHandle.getFile();
  const reader = new FileReader();
  reader.readAsDataURL(file);
  reader.onload = async function(){
    const base64String = reader.result.split(",")[1];
    await fetch(
      `https://api.github.com/repos/mixwind-1/mixwind-1.github.io/contents/${file.name}`,
      {
        method: "PUT",
        headers: {
          Accept: "application/vnd.github+json",
          Authorization: `Bearer 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`
        },
        body: JSON.stringify({
          message: "from microcity web",
          content: base64String
        })
      }
    );
    Print({color:'white', text:`The file is shared with https://mixwind-1.github.io/${file.name}`});
  };
}

btns['doc'].onclick = function(){
  if(docframe.style['display'] === 'none'){
    btns['doc'].style['background-color'] = 'white';
    btns['doc'].style['filter'] = 'invert(0%)';
    docframe.style['display'] = 'unset';
    offcanvas.style['display'] = 'none'
  }else{
    btns['doc'].removeAttribute('style');
    docframe.style['display'] = 'none';
    offcanvas.style['display'] = 'unset';
  }
  self.dispatchEvent(new Event('resize'));
}

btns['newclose'].onclick = function (){
  newdialog.close();
}

btns['downclose'].onclick = function (){
  downdialog.close();
  worker.postMessage({fn: 'FinishDownload'});  
}

ace.config.set('basePath', 'js');
aceeditor.setOptions({theme: 'ace/theme/nord_dark', mode: 'ace/mode/lua', showPrintMargin: false, enableLiveAutocompletion: true, useWorker: false});
aceeditor.on("guttermousedown", function(e) {
  var target = e.domEvent.target; 
  if (target.className.indexOf("ace_gutter-cell") == -1)
    return; 
  if (e.clientX > 25 + target.getBoundingClientRect().left) 
    return; 
  
  var row = e.getDocumentPosition().row;
  if(typeof lua.bps[row] === typeof undefined)
      e.editor.session.setBreakpoint(row);
  else
      e.editor.session.clearBreakpoint(row);
  e.stop();
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  localStorage.setItem("bps", JSON.stringify(lua.bps));
});

aceeditor.commands.addCommand({
  name: 'new',
  bindKey: {win: 'Ctrl-B',  mac: 'Command-B'},
  exec: btns['new'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});
aceeditor.commands.addCommand({
  name: 'open',
  bindKey: {win: 'Ctrl-O',  mac: 'Command-O'},
  exec: btns['open'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});
aceeditor.commands.addCommand({
  name: 'save',
  bindKey: {win: 'Ctrl-S',  mac: 'Command-S'},
  exec: btns['save'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'help',
  bindKey: {win: 'F1',  mac: 'F1'},
  exec: btns['doc'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'play',
  bindKey: {win: 'F5',  mac: 'F5'},
  exec: btns['play'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'pause',
  bindKey: {win: 'F6',  mac: 'F6'},
  exec: btns['pause'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'stop',
  bindKey: {win: 'F7',  mac: 'F7'},
  exec: btns['stop'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'toggle code',
  bindKey: {win: 'F8',  mac: 'F8'},
  exec: btns['code'].onclick,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'stepover',
  bindKey: {win: 'F9',  mac: 'F9'},
  exec: self.stepover,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'stepin',
  bindKey: {win: 'F10',  mac: 'F10'},
  exec: self.stepin,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'step',
  bindKey: {win: 'F11',  mac: 'F11'},
  exec: self.stepout,
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.commands.addCommand({
  name: 'gencode',
  bindKey: {win: 'Enter',  mac: 'Enter'},
  exec: async () => {
    const currline = aceeditor.getCursorPosition().row;
    const currcol = aceeditor.getCursorPosition().column;
    const comment = aceeditor.session.getLine(currline);
    if(comment.substring(0, 3) === "---" && currcol == aceeditor.session.getLine(currline).length){
      aceeditor.setReadOnly(true);
      aceeditor.insert("\nGenerating code...");
      worker.postMessage({fn:'SetVar', name:'commanding', value:true});
      const code = await lua.run(`return os.chatcmpl('Generate Lua code', '${comment.substring(1)}')`);
      aceeditor.removeToLineStart();
      aceeditor.insert(code);
      aceeditor.setReadOnly(false);
    }else
      aceeditor.insert("\n");
  },
  readOnly: true, // false if this command should not apply in readOnly mode
});

aceeditor.on('input', function() { // async and batched
  if(self.location.hash == '')
    localStorage.setItem('luacode', aceeditor.getValue());
});

// setInterval(function(){ //autosave
//   if(self.location.hash == '')
//     localStorage.setItem('luacode', aceeditor.getValue());
// },60000);

docframe.oncontextmenu = (e) => {
  e.preventDefault();
}

footer.showconsole = () => {
  if(!footer.console){
    Print({text: '<input id="command" onkeydown="lua.runcmd(this)"/>'});
    footer.console = true;
    document.getElementById('command').focus();
  }else{
    footer.removeChild(footer.lastChild);
    footer.console = false;
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
  }
}

footer.oncontextmenu = (e) => {
  e.preventDefault();
  footer.showconsole();
}

footer.onmouseover = (e) => {
  if(e.target.id != "footer" && e.target.tagName != "A"){
    e.target.style['cursor'] = 'auto';
  }
}

self.onkeydown = (e) => {
  // if(!btns['code'].active)
  //   return;

  if (e.ctrlKey && e.key == 'b') {
    e.preventDefault();
    if(btns['new'].enabled)
      btns['new'].onclick();
  }else if(e.ctrlKey && e.key == 'o'){
    e.preventDefault();
    if(btns['open'].enabled)
      btns['open'].onclick();
  }else if(e.ctrlKey && e.key == 's'){
    e.preventDefault();
    if(btns['save'].enabled)
      btns['save'].onclick(false);
  }else if(e.key === "F1"){
    e.preventDefault();
    btns['doc'].onclick();
  }else if(e.key === 'F5'){
    e.preventDefault();
    btns['play'].onclick();
  }else if(e.key === 'F6'){
    e.preventDefault();
    btns['pause'].onclick();
  }else if(e.key === 'F7'){
    e.preventDefault();
    btns['stop'].onclick();
  }else if(e.key === 'F8'){
    e.preventDefault();
    btns['code'].onclick();  
  }else if(e.key === 'F9'){
    e.preventDefault();
    self.stepover();
  }else if(e.key === 'F10'){
    e.preventDefault();
    self.stepin();
  }else if(e.key === 'F11'){
    e.preventDefault();
    self.stepout();
  }
}

offcanvas.onmousedown = (e) => {
  e.preventDefault();
  offcanvas.startx = e.clientX;
  offcanvas.starty = e.clientY;
  var rect = e.target.getBoundingClientRect();
  worker.postMessage({fn: 'OnMouseDown', buttons:e.buttons, x: offcanvas.startx - rect.left, y: offcanvas.starty - rect.top});
  if(e.buttons == 2){
    offcanvas.style.cursor = 'grab';
  }
  // console.log(e.clientX, e.clientY);
}

offcanvas.ontouchstart = (e) =>{
  // console.log(e);
  e.clientX = e.touches[0].clientX;
  e.clientY = e.touches[0].clientY;
  if(e.touches.length == 2){
    offcanvas.zoom = Math.hypot(e.touches[0].clientX -  e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
  }else{
    offcanvas.zoom = null;
  }
  e.buttons = e.touches.length;
  offcanvas.onmousedown(e);
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

offcanvas.ontouchmove = (e) => {
  e.clientX = e.touches[0].clientX;
  e.clientY = e.touches[0].clientY;
  if(e.touches.length == 2){
    const czoom =  Math.hypot(e.touches[0].clientX -  e.touches[1].clientX, e.touches[0].clientY - e.touches[1].clientY);
    if (Math.abs(czoom - offcanvas.zoom)<10){
      e.buttons = 2;
      offcanvas.onmousemove(e);
    }else{
      e.buttons = 4;
      e.deltaY =  offcanvas.zoom - czoom;
      offcanvas.onwheel(e);
    }
  }else if(!offcanvas.zoom){
    e.buttons = 1;
    offcanvas.onmousemove(e);
  }
}

offcanvas.onwheel = (e) => {
  e.preventDefault();
  worker.postMessage({fn: 'OnMouseMove', buttons:4, deltay:e.deltaY});
}

scene.reload = () => {
  if(lua.breakline){
    aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
    lua.breakline = null;
  }
  aceeditor.setReadOnly(false);
  worker.terminate();
  var newcanvas = document.getElementById('scene').appendChild(document.createElement('canvas'));
  [newcanvas.id, newcanvas.style.display] = [offcanvas.id, offcanvas.style.display];
  [newcanvas.onmousedown, newcanvas.onmouseup, newcanvas.oncontextmenu, newcanvas.onmousemove, newcanvas.onwheel] = 
  [offcanvas.onmousedown, offcanvas.onmouseup, offcanvas.oncontextmenu, offcanvas.onmousemove, offcanvas.onwheel];
  offcanvas.remove();
  offcanvas = newcanvas;
  offscreen = offcanvas.transferControlToOffscreen();
  
  disablebtn(btns['play']);
  disablebtn(btns['pause']);
  disablebtn(btns['stop']);
  worker = new Worker('./js/worker.module.js', {type : 'module'});
  worker.onmessage = (e) => {self[e.data.fn](e.data);};
  const label = document.createElement("canvas").transferControlToOffscreen();
  worker.postMessage({fn: 'Init', canvas: offscreen, label: label}, [offscreen, label]);
  onresize();
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  Print({color:'red', text:`The lua thread is killed!`});
}

const newfrom = async function (file){
  const response = await fetch(file);
  aceeditor.setValue(await response.text(), 1);
  Print({color:'white', text:`Created new code from the template ${file}!`});
  lua.file = null;
  newdialog.close();
  // location.hash = "";
  history.replaceState(null, null, ' ');
  worker.postMessage({fn: 'OnNewFS'});
}
const newcodes = document.getElementsByClassName("newcode");
for (let i = 0; i < newcodes.length; i++) {
  const file = newcodes[i].getAttribute("data");
  newcodes[i].onclick = () => newfrom(file);
}

document.addEventListener( "dragenter" , function (e) {
     e.preventDefault();
     e.stopPropagation();
}, false );
 
document.addEventListener( "dragover" , function (e) {
     e.preventDefault();
     e.stopPropagation();
}, false );
 
document.addEventListener( "dragleave" , function (e) {
     e.preventDefault();
     e.stopPropagation();
}, false );
 
document.addEventListener( "drop" , function (e) {
     e.preventDefault();
     e.stopPropagation();
     worker.postMessage({fn: 'onFilesUpload', files: e.dataTransfer.files});
}, false );