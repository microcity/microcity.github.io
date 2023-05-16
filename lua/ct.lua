scene.setenv({grid='plane'})

local ctns = {}
ctns[1] = scene.addobj('/res/ct/container.glb')
ctns[2] = scene.addobj('/res/ct/container_blue.glb')
ctns[3] = scene.addobj('/res/ct/container_yellow.glb')
ctns[4] = scene.addobj('/res/ct/container_brown.glb')
ctns[5] = scene.addobj('/res/ct/container_gray.glb')
ctns[6] = scene.addobj('/res/ct/container_white.glb')
for i, ctn in ipairs(ctns) do
    ctn:setpos(10*i, 0, 0)
end

local rmg = scene.addobj('/res/ct/rmg.glb')
local trolley = scene.addobj('/res/ct/trolley.glb')
local spreader = scene.addobj('/res/ct/spreader.glb')
local wirerope = scene.addobj('/res/ct/wirerope.glb')

spreader:setpos(0, 1, 0)
wirerope:setpos(0, 1, 0)
wirerope:setscale(1, 16.57, 1)

scene.render()