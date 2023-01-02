print("1")
Sleep(2000)
print("2")
local obj = Add3DBox()
x = 1
y = 1
z = 0
while GetReady() do
	x = x + 0.1
	y = y + 0.1
	SetRotation(obj, x, y, z)
end