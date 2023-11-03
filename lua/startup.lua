print("Hello, there!")
local obj = scene.addobj('box')
obj:setscale(5, 5, 5)

local x, y, z = 0, 0, 0
while scene.render() do
  x = x + 0.1
  y = y + 0.1
  obj:setrot(x, y, z)
end