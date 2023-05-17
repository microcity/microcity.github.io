scene.setenv({far=100000})
local obj = scene.addobj('sphere', {radius=6371, segments=360, hcolor='white'})
obj:setmat({type='MeshBasicMaterial', map='/res/natrual_earth.jpg'})
local ship = scene.addobj('/res/ct/ship.glb')
ship:setscale(10, 10, 10)

local cam = scene.getobj('camera')
cam:setpos(0, 0, 11000)
cam:setrot(0, 0, 0)

local phi = math.pi/2
local theta = 0
while scene.render() do
    theta = theta + 0.01
    ship:setpos(scene.tovector(6371, phi, theta))
    ship:setrot(0, theta + math.pi/2, phi)
end