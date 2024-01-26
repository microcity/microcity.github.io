# Documentation

MicroCity Web is **An Online Logistics Modeling Tool** reassembled from the desktop version of <a href="https://github.com/microcity/desktop" target="_blank">MicroCity</a>.

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
  - 5.1 <a href="https://www.lua.org/manual/5.4/manual.html" target="_blank">Lua Reference Manual</a>

## Index of Functions
**os:**
[os.execute](4.2_operation_system.md#os.execute)
[os.sleep](4.2_operation_system.md#os.sleep#os.sleep)
[os.getready](4.2_operation_system.md#os.getready#os.getready)
[os.upload](4.2_operation_system.md#os.upload)
[os.download](4.2_operation_system.md#os.download)
**debug:**
[debug.debug](4.2_operation_system.md#debug.debug)
[debug.pause](4.2_operation_system.md#debug.pause)
[debug.cont](4.2_operation_system.md#debug.cont)
[debug.step](4.2_operation_system.md#debug.step)
[debug.stepi](4.2_operation_system.md#debug.stepi)
[debug.stepo](4.2_operation_system.md#debug.stepo)
[debug.watch](4.2_operation_system.md#debug.watch)
**coroutine:**
[coroutine.queue](4.4_discrete_event_simulation.md#coroutine.queue)
[coroutine.resume](4.4_discrete_event_simulation.md#coroutine.resume)
[coroutine.qtime](4.4_discrete_event_simulation.md#coroutine.qtime)
[coroutine.qexec](4.4_discrete_event_simulation.md#coroutine.qexec)
**math:**
[math.randomseed](4.5_mixed_integer_programming.md#math.randomseed)
[math.random](4.5_mixed_integer_programming.md#math.random)
[math.newmip](4.5_mixed_integer_programming.md#math.newmip)
[math.delmip](4.5_mixed_integer_programming.md#math.delmip)
[math.addrow](4.5_mixed_integer_programming.md#math.addrow)
[math.delrow](4.5_mixed_integer_programming.md#math.delrow)
[math.addcol](4.5_mixed_integer_programming.md#math.addcol)
[math.delcol](4.5_mixed_integer_programming.md#math.delcol)
[math.solve](4.5_mixed_integer_programming.md#math.solve)
**scene:**
[scene.setenv](4.3_scene_and_object.md#scene.setenv)
[scene.addobj](4.3_scene_and_object.md#scene.addobj)
[scene.getobj](4.3_scene_and_object.md#scene.getobj)
[scene.getselection](4.3_scene_and_object.md#scene.getselection)
[scene.tovector](4.3_scene_and_object.md#scene.tovector)
[scene.topolar](4.3_scene_and_object.md#scene.topolar)
[scene.render](4.3_scene_and_object.md#scene.render)
[scene.delete](4.3_scene_and_object.md#scene.delete)
[scene.getmat](4.3_scene_and_object.md#scene.getmat)
[scene.setmat](4.3_scene_and_object.md#scene.setmat)
[scene.getvertices](4.3_scene_and_object.md#scene.getvertices)
[scene.setvertices](4.3_scene_and_object.md#scene.setvertices)
[scene.getdata](4.3_scene_and_object.md#scene.getdata)
[scene.getpos](4.3_scene_and_object.md#scene.getpos)
[scene.setpos](4.3_scene_and_object.md#scene.setpos)
[scene.getrot](4.3_scene_and_object.md#scene.getrot)
[scene.setrot](4.3_scene_and_object.md#scene.setrot)
[scene.getscale](4.3_scene_and_object.md#scene.getscale)
[scene.setscale](4.3_scene_and_object.md#scene.setscale)
[scene.getchildren](4.3_scene_and_object.md#scene.getchildren)
[scene.setchildren](4.3_scene_and_object.md#scene.setchildren)
[scene.getparent](4.3_scene_and_object.md#scene.getparent)
[scene.setparent](4.3_scene_and_object.md#scene.setparent)
[scene.tojson](4.3_scene_and_object.md#scene.tojson)
