scene.addobj("points", {vertices={0,0,0, 5,5,5}, size=5})
scene.addobj("polyline", {vertices={0,0,0, -2,3,5, 4,6,7}, color='blue'})
scene.addobj("polygon", {vertices={-1,-1,0, -1,1,0, 1,1,0, 1,-1,0}, size=0})
scene.render()