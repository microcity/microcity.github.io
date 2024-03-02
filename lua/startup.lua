print("Hello, there!")              
local obj = scene.addobj('box') --add a 1*1*1 cube to the scene
obj:setscale(5, 5, 5)           --scale up the cube to 5*5*5

local x, y, z = 0, 0, 0         --initialize rotation variables
while scene.render() do         --render the scene and check ui
  x = x + 0.05
  y = y + 0.05
  obj:setrot(x, y, z)           --set the rotation of the cube
end