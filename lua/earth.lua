local obj = scene.addobj('sphere', {radius=15, segments=360, hcolor='white'})   --add a sphere object to the scene
obj:setmat({type='MeshBasicMaterial', map='/res/natrual_earth.jpg'})            --attach a materail map to the sphere
scene.render()                                                                  --render the scene