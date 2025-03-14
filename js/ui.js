import {tarball} from '/js/tarball.js';
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
  "downclose": document.getElementById('downclose'),
};

export const editor      = document.getElementById('editor');
export const aceeditor   = ace.edit("editor");
export const docframe    = document.getElementById('docframe');
export const figureframe = document.getElementById('figureframe');
export const footer      = document.getElementById('footer');
export const scene       = document.getElementById('scene');
export var   offcanvas   = document.getElementById('offcanvas');
export var   worker      = new Worker('./js/worker.module.js', {type : 'module'});

self.remotecallcount = 0;

//接受远程调用并返回结果
self.OnRemoteCall = async function(data){
  const ret = await self[data.refn](...data.args);
  worker.postMessage({fn: data.retfn, ret: ret});
}
//远程调用，refn为函数名，args为参数列表，可以接受返回值
self.RemoteCall = async function(refn, ...args){
  const retfn = 'RetRemoteCall' + self.remotecallcount++; //生成一个唯一的函数名
  worker.postMessage({fn: 'OnRemoteCall', refn: refn, args: args, retfn: retfn});
  return await new Promise(resolve => self[retfn] = (data) => resolve(data.ret)); 
}

worker.onmessage = (e) => {self[e.data.fn](e.data);};

self.onresize = () => {
  worker.postMessage({
    fn: 'Resize',
    width: scene.clientWidth,
    height: scene.clientHeight,
    devicePixelRatio: window.devicePixelRatio,
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

btns['play'].onclick = async function (){
  let mediaQuery = window.matchMedia("(orientation: portrait), (max-width: 720px)");
  if (mediaQuery.matches && aceeditor.getValue().includes("scene") && btns['code'].active) {
    btns['code'].onclick();
  }
  runlua();
}
btns['play'].oncontextmenu = () => debuglua();
btns['pause'].onclick = () => pauselua();	
btns['stop'].onclick = () => stoplua();
btns['stop'].oncontextmenu = () => scene.reload(true);

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
  
  lua.bps.forEach((element, row) => {if(element) aceeditor.session.clearBreakpoint(row);});
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  localStorage.setItem("bps", JSON.stringify(lua.bps));

  lua.runcmd('debug.watch()');
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

  lua.bps.forEach((element, row) => {if(element) aceeditor.session.clearBreakpoint(row);});
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  localStorage.setItem("bps", JSON.stringify(lua.bps));
  
  lua.runcmd('debug.watch()');
  Print({color:'white', text:`The file system, link and debug data are cleared!`});
}

btns['open'].onclick = async function (){		
  const pickerOpts = {types: [{description: 'MicroCity Web File', accept: {'lua/*': ['.mw', '.lua']}},], excludeAcceptAllOption: false, multiple: false};
  try{
    [lua.file] = await showOpenFilePicker(pickerOpts);
    const blob = await lua.file.getFile();
    const fileExtension = lua.file.name.split('.').pop(); // 获取文件扩展名
    if(fileExtension === 'lua') {
      const contents = await blob.text();
      aceeditor.setValue(contents, 1);
      localStorage.setItem('luacode', contents);
    }else if(fileExtension === 'mw') {
      worker.postMessage({fn: 'OnNewFS'});
      const decompdata = await RemoteCall('UnpackFiles', blob);
      aceeditor.setValue(decompdata.code, 1);
      localStorage.setItem('luacode', decompdata.code);
    }
    Print({color:'white', text:`The ${lua.file.name} has been opened!`});
  }catch(err){
    console.log(err);
  }
}

btns['open'].oncontextmenu = () => OnFilePicker();

// btns['save'].onclick = () => worker.postMessage({fn: 'OnFileSave'});
btns['save'].onclick = async function(){
  if(!lua.file){
    try{
      const pickerOpts = {
        suggestedName: 'untitled.mw', types: [
          {description: 'MicroCity Web File', accept: {'lua/*': ['.mw']}},
          {description: 'Lua File', accept: {'text/lua': ['.lua']}},
        ], excludeAcceptAllOption: false};
      lua.file = await self.showSaveFilePicker(pickerOpts);
    }catch(err){
      Print({color:'red', text:err});
      return;
    }
  }
  const fileExtension = lua.file.name.split('.').pop(); // 获取文件扩展名
  let blob;
  if(fileExtension === 'lua') {
    blob = aceeditor.getValue();
  }else if(fileExtension === 'mw') {
    blob =  await RemoteCall('PackFiles', aceeditor.getValue(), '');
  }
  const writable = await lua.file.createWritable();
  await writable.write(blob);
  await writable.close();			
  Print({color:'white', text:`All changes has been saved to ${lua.file.name}!`});
  localStorage.setItem('luacode', aceeditor.getValue());
}

btns['save'].oncontextmenu = async function (){
  worker.postMessage({fn: 'OnFileDownPicker'});
}

btns['pub'].onclick = async function (){
  //通过文件sha值来判断是否已经是发布到github上的文件
  let id = location.sha && location.hash.slice(1) || Math.trunc(Date.now()/1000).toString(36);
  let pass = prompt("Confirm to publish and fill a password for editing: (can be empty)");
  
  if(pass != null){
    //获取虚拟文件系统的压缩blob
    const blob =  await RemoteCall('PackFiles', aceeditor.getValue(), pass);
    //转换成base64存入github
    const reader = new FileReader();
    const token = atob(atob('WjJod1gxWTRjbGcxT1hCSFpHNXBRbGc0Y21wUFJXSlhSM2hUYlZwTlQzUkhTVEZoY25kVk5RPT0='));
    reader.readAsDataURL(blob);
    reader.onload = async function(){
      const base64String = reader.result.split(",")[1];
      try { 
        const response = await fetch(
          `https://api.github.com/repos/mixwind-1/microcity/contents/${id}`,
          {
            method: "PUT",
            headers: {
              Accept: "application/vnd.github+json",
              Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
              message: "from microcity",
              content: base64String,          //如果更新文件，还需要sha字段
              sha: location.sha
            })
          }
        );
        // 可以在这里检查响应状态
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const responseData = await response.json();
        location.hash = '#'+id;
        btns['code'].pass = pass;
        //判断是否已经发布过
        if(location.sha == null)         
          Print({color:'white', text:`This project is published to <span style="color:blue">${location.href}</span>`});
        else
          Print({color:'white', text:`The published project is updated!`});
        //将github返回的文件sha值存入浏览器
        location.sha = responseData.content.sha;
      } catch (error) {
        // 处理错误，显示给用户
        Print({color:'red', text: error.message});
      }
    };
  }
}

btns['pub'].oncontextmenu = async function (){
  let pass = prompt("Confirm to embed and fill a password for editing: (can be empty)");
  if(pass != null){
    //获取虚拟文件系统的压缩blob
    const blob =  await RemoteCall('PackFiles', aceeditor.getValue(), pass);
    //转换成base64放到url中
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = async function(){
      //获取文件的base64编码并保存到url中
      const base64String = reader.result.split(",")[1];
      location.hash = '#/'+base64String;
      btns['code'].pass = pass;  
      Print({color:'white', text:`The project is embeded in URL (${location.href.length} bytes).`});
      //如果包含github发布文件的sha值则去除
      location.sha = null;
    };
  }
}

btns['doc'].onclick = function(){
  if(docframe.style.display === 'none'){
    btns['doc'].style['background-color'] = 'white';
    btns['doc'].style['filter'] = 'invert(0%)';
    docframe.style.display = 'block';
  }else{
    btns['doc'].removeAttribute('style');
    docframe.style.display = 'none';
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
      e.editor.session.setBreakpoint(row);                        //在定义lua的时候定义了bps: aceeditor.session.getBreakpoints(0, 0)
  else
      e.editor.session.clearBreakpoint(row);
  e.stop();
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  localStorage.setItem("bps", JSON.stringify(lua.bps));
});

async function findFunc(){
  fetch('/js/mwfuncs.json') // 搜索内置函数
  .then(response => response.json())
  .then(data => {
      let cursorPosition = aceeditor.getCursorPosition(); // 获取当前光标位置
      let wordRange = aceeditor.session.getWordRange(cursorPosition.row, cursorPosition.column); // 获取光标所在位置的单词的范围
      let word = aceeditor.session.getTextRange(wordRange); // 获取光标所在位置的单词

      const link = data[word]; // 查询选中的文本
    
      if (link === undefined){
        fetch('/js/luafuncs.json') // 搜索lua函数
        .then(response2 => response2.json())
        .then(data2 => {
          // 检查word前面的字符是否为"."
          let cursorPosition = { row: wordRange.start.row, column: wordRange.start.column - 1 };
          var beforeWordChar = aceeditor.session.getTextRange({ start: cursorPosition, end: wordRange.start });
          if (beforeWordChar === '.') {
              // 如果前一个字符为"."，获取"."前的单词
              cursorPosition.column--;
              wordRange = aceeditor.session.getWordRange(cursorPosition.row, cursorPosition.column);
              word = aceeditor.session.getTextRange(wordRange) + '.' + word;
          }
          
          const link = data2[word]; // 查询选中的lua函数
          if (link === undefined){
            if(docframe.style['display'] === 'none')
              btns['doc'].onclick();
          }else
            window.open("https://www.lua.org/manual/5.4/manual.html#"+link, "luaref");
        })
        .catch(error => console.error('Error:', error));
      } else {
        markdown('/doc/' + link, 'docframe');
        if(docframe.style['display'] === 'none')
          btns['doc'].onclick();
      }
  })
  .catch(error => console.error('Error:', error));
}

function escape(){
  if(newdialog.open)
    newdialog.close();
  else if(downdialog.open)
    downdialog.close();
  else if(docframe.style['display'] != 'none')
    btns['doc'].onclick();
  else if(btns['code'].active)
    btns['code'].onclick();
}

aceeditor.commands.addCommand({
  name: 'esc',
  bindKey: {win: 'ESC',  mac: 'ESC'},
  exec: escape,
  readOnly: true, // false if this command should not apply in readOnly mode
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
  exec: findFunc,
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
  name: 'stepout',
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
      
      //去掉---只保留用户信息
      let input = comment.substring(3).replace(/['"\\]/g, '\\$&');
      worker.postMessage({fn:'SetVar', name:'commanding', value:true});
      worker.postMessage({fn:'SetVar', name:'embedding', value:true});
      const simstr = await lua.run(`return os.embedding([=[${input}]=])`);

      //去掉-保留--
      let userstr = comment.substring(1).replace(/['"\\]/g, '\\$&');
      worker.postMessage({fn:'SetVar', name:'commanding', value:true});
      let code;
      if(simstr)
        code = await lua.run(`return os.chatcmpl([=[${userstr}]=], [=[${simstr} Based on above code generate following Lua code as less as possible]=])`);
      else
        code = await lua.run(`return os.chatcmpl([=[${userstr}]=], 'Generate Lua code')`);
      //只保留代码部分
      let matches = [...code.matchAll(/```lua\n([\s\S]*?)```/g)];
      if(matches.length > 0)
        code = matches.map(match => match[1]).join('\n');
      aceeditor.removeToLineStart();
      aceeditor.insert(code);
      aceeditor.setReadOnly(false);
      aceeditor.renderer.scrollToLine(aceeditor.getCursorPosition().row, true);
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
    findFunc();
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
  }else if(e.key === 'Escape'){
    e.preventDefault();
    escape();
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

scene.reload = (kill) => {
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
  lua.engine = null;
  worker = new Worker('./js/worker.module.js', {type : 'module'});
  worker.onmessage = (e) => {self[e.data.fn](e.data);};
  const label = document.createElement("canvas").transferControlToOffscreen();
  worker.postMessage({fn: 'Init', canvas: offscreen, label: label}, [offscreen, label]);
  onresize();
  SetChatAPI();
  worker.postMessage({fn:'SetVar', name:'bps', value:lua.bps});
  if(kill) Print({color:'red', text:`The lua thread is killed!`});
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

// charts ui control

const chartsToggle = document.getElementById('charts-toggle');
const panelContent = figureframe.querySelector('.panel-content');

chartsToggle.onclick = function () {
  panelContent.classList.toggle('collapsed');

  // 如果展开了面板,重绘所有图表
  if (!panelContent.classList.contains('collapsed')) {
    charts.forEach(chart => chart.resize());
  }
}

chartsToggle.oncontextmenu = function() {
  clearCharts();
}

window.addEventListener('resize', function() {
  if (!panelContent.classList.contains('collapsed')) {
    charts.forEach(chart => chart.resize());
  }
});

// echart integration
const charts = new Map();

self.createChart = function (id, options) {
  if (figureframe.classList.contains('collapsed')) {
    figureframe.classList.remove('collapsed');
  }

  options.animation = false;
  
  if (!charts.has(id)) {
    const div = document.createElement('div');
    div.style.width = '100%';
    div.style.height = '400px';
    div.style.position = 'relative';
    div.id = id;
    figureframe.querySelector('.panel-content').appendChild(div);
    
    const chart = echarts.init(div, null, {
      renderer: 'svg'
    });
    
    // resize chart with window
    window.addEventListener('resize', function() {
      if (!panelContent.classList.contains('collapsed')) {
        chart.resize();
      }
    });
    
    charts.set(id, chart);
  }
  const chart = charts.get(id);
 
  // add toolbox
  if (!options.toolbox) {
    options.toolbox = {
      show: true,
      feature: {
        saveAsImage: {
          title: 'Save as Image',
          pixelRatio: 2
        }
      }
    };
  } else if (options.toolbox && !options.toolbox.feature?.saveAsImage) {
    // add saveAsImage
    if (!options.toolbox.feature) {
      options.toolbox.feature = {};
    }
    options.toolbox.feature.saveAsImage = {
      title: 'Save as Image',
      pixelRatio: 2
    };
  }
  
  chart.setOption(options);
  // return chart;
}

self.updateChart = function (id, data) {
  const chart = charts.get(id);
  if (chart) {
    chart.setOption(data, {notMerge: false});
    console.log('updateChart', id, data);
  }
}

self.removeChart = function (id) {
  const chart = charts.get(id);
  if (chart) {
    chart.dispose();
    charts.delete(id);
    document.getElementById(id)?.remove();
  }
}

self.clearCharts = function () {
  // dispose all charts
  for (const chart of charts.values()) {
    chart.dispose();
  }
  charts.clear();
  
  // remove all divs
  const chartDivs = figureframe.querySelectorAll('div[id]');
  chartDivs.forEach(div => div.remove());
}