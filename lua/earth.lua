scene.setenv({far=100000})                                                          --set the camera far plane

local obj = scene.addobj('sphere', {radius=6371, segments=360, hcolor='white'})     --add a sphere (the earth)
obj:setmat({type='MeshBasicMaterial', map='/res/natrual_earth.jpg'})                --attach a materail map

local ufo = scene.addobj('sphere', {radius=100, segments=360, hcolor='white'})      --add a ufo sphere


local cam = scene.getobj('camera')                                                  --get the camera
cam:setpos(0, 0, 11000)                                                             --set the camera position
cam:setrot(0, 0, 0)                                                                 --set the camera to face the earth

local phi = math.pi/2                                                               --set the initial phi angle (in radians, pi/2 - latitude)
local theta = 0                                                                     --set the initial theta angle (in radians, longitude)
while scene.render() do                                                             --render the scene and check ui
    phi = phi + math.random()/50                                                   --increase the phi angle a little
    theta = theta + math.random()/100                                               --increase the theta angle a little
    ufo:setpos(scene.tovector(6571, phi, theta))                                    --move the ufo according to the polar coordinates 
end
