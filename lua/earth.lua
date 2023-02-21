local obj = scene.addobj('sphere', {radius=15, segments=360, hcolor='white'})
obj:setmat({type='MeshBasicMaterial', map='/res/natrual_earth.jpg'})
scene.render()