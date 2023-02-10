print("1")
print("2")
local obj = scene.addobj()
x = 1
y = 1
z = 0
while ui.update() do
	x = x + 0.1
	y = y + 0.1
	obj:setrot(x, y, z)
end