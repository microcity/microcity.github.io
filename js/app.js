import {btns, disablebtn, enablebtn, editor, aceeditor, 
        docframe, footer, scene, offcanvas, worker} from '/js/ui.js';

self.lua = {state: '', file: null, rets:[], bps: aceeditor.session.getBreakpoints(0, 0), engine: false, loaded: false, debugwatch:{}};

self.BreakAt = function (data){
  if(data.row){
    lua.breakline = data.row;
    aceeditor.renderer.scrollToLine(data.row, true);
    aceeditor.gotoLine(data.row);
    aceeditor.session.addGutterDecoration(data.row-1, "ace_gutter_debug_current");
    // Print({text: `The lua code is breaked at line ${data.row+1}. Waiting for control commands (go, stepover, stepin, stepout, stop) or lua code.`, color:'white'})
  }
  if(!footer.console)
    footer.showconsole();
}

self.OnModuleLoaded = function(data){
  lua.engine = true;
  document.getElementById('version').innerText = data.version;
  SetState({state:'ready'});
}

self.OnReturn = function(data){
  lua.rets[data.id].thaw(data.result);
}

self.OnFilePicker = async function(data){
  const pickerOpts = {types: [{},], excludeAcceptAllOption: false, multiple: true};
  const fileHandles = await window.showOpenFilePicker(pickerOpts);
  var dropFiles = [];
  for (const fileHandle of fileHandles) {
    const file = await fileHandle.getFile();
    dropFiles.push(file);
  }
  worker.postMessage({fn: 'onFilesUpload', files: dropFiles});
}

self.OnFileDownPicker = async function(data){
  const files = data.files;
  // const table = document.getElementById("downfiletable");
  // 获取tbody的引用
  var tbodyRef = document.getElementById("downfiletable").getElementsByTagName("tbody")[0];
  // 获取tbody中的行数
  var rowCount = tbodyRef.rows.length;
  // 从最后一行开始，循环删除每一行
  for (var i = rowCount - 1; i >= 0; i--) {
    tbodyRef.deleteRow(i);
  }
  for(const file of files){
    const row = tbodyRef.insertRow();
    // 创建三个单元格
    const cell1 = row.insertCell();
    const cell2 = row.insertCell();
    const cell3 = row.insertCell();

    // 创建一个超链接元素
    const link = document.createElement("a");
    link.textContent = file.name; // 设置超链接文本为文件名
    link.download = file.name;
    const blob = new Blob ([file.data], {type: 'application/octet-stream'});
    link.href = URL.createObjectURL(blob);
    // link.href = file.url; // 设置超链接地址为文件url

    // 把超链接元素添加到第一个单元格中
    cell1.appendChild(link);
    // 把文件大小添加到第二个单元格中
    cell2.textContent = file.mtime;
    // 把文件修改时间添加到第三个单元格中
    cell3.textContent = file.size;
  }
  
  await downdialog.showModal();
  downdialog.focus();
}

self.OnFileDownload = function(data){
  let link = document.createElement('a');
  const blob = new Blob ([data.file], {type: 'application/octet-stream'});
  link.href = URL.createObjectURL(blob);
  link.download = data.filename; // specify a file name
  document.body.appendChild(link);
  link.click ();
  URL.revokeObjectURL(link.href);
  document.body.removeChild(link);
}

self.Print = function(data){
  let newElement = document.createElement("span");
  newElement.className = 'prompt';
  newElement.innerHTML = `<span class="date">[${new Date().toLocaleString()}]</span>><span style="color:${data.color};">${data.text}</span><br/>`;
    
  if(data.text == ''){                                                          //清空打印出来的内容
    const prompts = document.querySelectorAll('.prompt');
    prompts.forEach(prompt => {
        prompt.parentNode.removeChild(prompt);
    });
    footer.console = false;
  }else if(data.text.substring(0, 6) == '<input' || !footer.console)             //打印到最后
    footer.insertBefore(newElement, null);
  else
    footer.insertBefore(newElement, footer.lastChild);                          //打印到前一个
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
  }else if(data.state == 'ready' && lua.loaded){
    enablebtn(btns['play']);
    disablebtn(btns['pause']);
    disablebtn(btns['stop']);
    // enablebtn(btns['code']);
    if(!btns['code'].pass && btns['code'].active){
      enablebtn(btns['new']);
      enablebtn(btns['open']);
      enablebtn(btns['save']);
      enablebtn(btns['pub']);      
    }
  }
  document.getElementById('state').innerText = data.state;
}

self.UpdateWatch = function(data){
  if(data.cmd == "set"){
    lua.debugwatch[data.name] = data.value;
  }else if(data.cmd == "clr"){
    lua.debugwatch = {}
    document.getElementById("debugwatch").innerHTML = "";
  }else if(data.cmd == "prn"){
    var footer = document.getElementById("debugwatch");
    footer.innerHTML = "";
    for(var name in lua.debugwatch){
       footer.innerHTML += name + " = " + lua.debugwatch[name] + "<br>";
    }
  }
}

lua.getstate = function (){
  return document.getElementById('state').innerText;
}

lua.run = async function (code){
  const id = lua.rets.push({}) - 1;
  worker.postMessage({fn: 'RunLua', code:code, id:id});
  return new Promise(res => lua.rets[id].thaw = res);
}

let cmds = [""];                                                                        //保存cmd列表
let cmdi = 0;                                                                           //设置cmd指针
lua.runcmd = async function (ele){
  if(lua.getstate() != 'ready' &&  lua.getstate() != 'paused' )
    return;
  if(event.key === 'Enter' && ele.value != "") {                                        //在控制台运行
    Print({color: 'blue', text: ele.value});                                            //打印命令
    worker.postMessage({fn:'SetVar', name:'commanding', value:true});
    lua.run(ele.value);                                                                 //运行命令
    ele.parentNode.parentNode.firstChild.data = `[${new Date().toLocaleString()}]>`;    //重新调整日期
    cmds.splice(-1, 0, ele.value);                                                      //加入到cmd列表倒数第2个位置
    cmdi = cmds.length -1 ;                                                             //设置指针
    ele.value = "";
  }else if(event.key === 'ArrowUp'){
    if(cmdi > 0){
      cmdi--;
      ele.value = cmds[cmdi];
    }
  }else if(event.key === 'ArrowDown'){
    if(cmdi < cmds.length - 1){
      cmdi++;
      ele.value = cmds[cmdi];
    }
  }
  if(typeof ele == 'string'){                                                           //通过js调用运行
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
    await lua.runcmd("debug.debug(true)");
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

self.stepover = async function(){
  if(lua.breakline){
    aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
    lua.breakline = null;
    await lua.runcmd("debug.step()");
  }
}

self.stepin = async function(){
  if(lua.breakline){
    aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
    lua.breakline = null;
    await lua.runcmd("debug.stepi()");
  }
}

self.stepout = async function(){
  if(lua.breakline){
    aceeditor.session.removeGutterDecoration(lua.breakline - 1, "ace_gutter_debug_current");
    lua.breakline = null;
    await lua.runcmd("debug.stepo()");
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
markdown('/doc/readme.md', 'docframe');
SetState({state:'initializing'});

//load lua code
if(self.location.hash == ''){
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
  enablebtn(btns['code']);
  btns['code'].onclick();
  lua.loaded = true;
}else{
  const _supabase = supabase.createClient('https://vvbgfpuqexloiavpkout.supabase.co', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZ2YmdmcHVxZXhsb2lhdnBrb3V0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE2Njk5OTIzMTYsImV4cCI6MTk4NTU2ODMxNn0._sXP-cVlcVMCWQmiFUL-u2O1hR_wy3hm86bg71T8t0c');
  let { data, e } = await _supabase.from('posts').select('lua,pass').eq('id', self.location.hash);
  if(data && data.length == 1){
    aceeditor.setValue(data[0].lua, 1);
    btns['code'].pass = data[0].pass;
    onresize();
    Print({color:'white', text:`Published code is loaded!`});
    enablebtn(btns['code']);
    lua.loaded = true;
    if(document.getElementById('state').innerText == "ready")
      enablebtn(btns['play']);
  }else{
    Print({color:'red', text:`Can not load published code!`});
  }
}