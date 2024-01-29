# Documentation

MicroCity Web is **An Online Logistics Modeling Tool** reassembled from the desktop version of <a href="https://github.com/microcity/" target="_blank">MicroCity</a>.

## Table of Contents
- 1 Introduction
  - [1.1 What MicroCity Web can Do](1.1_what_microcity_web_can_do.md)
- 2 Getting Started
  - [2.1 Rolling a Cube](2.1_rolling_a_cube.md)
  - [2.2 Searching for Countries](2.2_searching_for_countries.md)
- 3 User Interfaces
  - [3.1 UI Overview](3.1_ui_overview.md)
  - [3.2 Editing Scripts](3.2_editing_scripts.md)
  - [3.3 Running Scripts](3.3_running_scripts.md)
  - [3.4 Navigating Scenes](3.4_navigating_scenes.md)
- 4 Scripting Interfaces
  - [4.1 SI Overview](4.1_si_overview.md)
  - [4.2 Operation System](4.2_operation_system.md)
  - [4.3 Scene and Object](4.3_scene_and_object.md)
  - [4.4 Discrete Event Simulation](4.4_discrete_event_simulation.md)
  - [4.5 Mixed Integer Programming](4.5_mixed_integer_programming.md)
- 5 Appendix
  - 5.1 <a href="https://www.lua.org/manual/5.4/contents.html" target="_blank">Lua Reference Manual</a>
  - 5.2 <a href="https://microcity.gitee.io/book" target="_blank">From Data to Logistics Models</a>

## Index of Functions
- coroutine:
[coroutine.qexec](4.4_discrete_event_simulation.md#coroutine.qexec)
[coroutine.qtime](4.4_discrete_event_simulation.md#coroutine.qtime)
[coroutine.queue](4.4_discrete_event_simulation.md#coroutine.queue)
[coroutine.resume](4.4_discrete_event_simulation.md#coroutine.resume)
- debug:
[debug.cont](4.2_operation_system.md#debug.cont)
[debug.debug](4.2_operation_system.md#debug.debug)
[debug.pause](4.2_operation_system.md#debug.pause)
[debug.step](4.2_operation_system.md#debug.step)
[debug.stepi](4.2_operation_system.md#debug.stepi)
[debug.stepo](4.2_operation_system.md#debug.stepo)
[debug.watch](4.2_operation_system.md#debug.watch)
- math:
[math.addcol](4.5_mixed_integer_programming.md#math.addcol)
[math.addrow](4.5_mixed_integer_programming.md#math.addrow)
[math.delcol](4.5_mixed_integer_programming.md#math.delcol)
[math.delmip](4.5_mixed_integer_programming.md#math.delmip)
[math.delrow](4.5_mixed_integer_programming.md#math.delrow)
[math.newmip](4.5_mixed_integer_programming.md#math.newmip)
[math.random](4.5_mixed_integer_programming.md#math.random)
[math.randomseed](4.5_mixed_integer_programming.md#math.randomseed)
[math.solve](4.5_mixed_integer_programming.md#math.solve)
- os:
[os.download](4.2_operation_system.md#os.download)
[os.execute](4.2_operation_system.md#os.execute)
[os.getready](4.2_operation_system.md#os.getready)
[os.upload](4.2_operation_system.md#os.upload)
[os.sleep](4.2_operation_system.md#os.sleep)
- scene:
[scene.addobj](4.3_scene_and_object.md#scene.addobj)
[scene.getobj](4.3_scene_and_object.md#scene.getobj)
[scene.render](4.3_scene_and_object.md#scene.render)
[scene.setenv](4.3_scene_and_object.md#scene.setenv)
[scene.topolar](4.3_scene_and_object.md#scene.topolar)
[scene.tovector](4.3_scene_and_object.md#scene.tovector)<br>
obj:
[obj:delete](4.3_scene_and_object.md#obj:delete)
[obj:getchildren](4.3_scene_and_object.md#obj:getchildren)
[obj:getdata](4.3_scene_and_object.md#obj:getdata)
[obj:getmat](4.3_scene_and_object.md#obj:getmat)
[obj:getparent](4.3_scene_and_object.md#obj:getparent)
[obj:getpos](4.3_scene_and_object.md#obj:getpos)
[obj:getrot](4.3_scene_and_object.md#obj:getrot)
[obj:getscale](4.3_scene_and_object.md#obj:getscale)
[obj:getvertices](4.3_scene_and_object.md#obj:getvertices)
[obj:setchildren](4.3_scene_and_object.md#obj:setchildren)
[obj:setdata](4.3_scene_and_object.md#obj:setdata)
[obj:setmat](4.3_scene_and_object.md#obj:setmat)
[obj:setparent](4.3_scene_and_object.md#obj:setparent)
[obj:setpos](4.3_scene_and_object.md#obj:setpos)
[obj:setrot](4.3_scene_and_object.md#obj:setrot)
[obj:setscale](4.3_scene_and_object.md#obj:setscale)
[obj:setvertices](4.3_scene_and_object.md#obj:setvertices)
[obj:tojson](4.3_scene_and_object.md#obj:tojson)