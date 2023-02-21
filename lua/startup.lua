print("Hello, there!")
local obj = scene.addobj('box')
local x = 1
local y = 1
local z = 0
while scene.render() do
	x = x + 0.1
	y = y + 0.1
	obj:setrot(x, y, z)
end