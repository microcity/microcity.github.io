scene.setenv({grid='plane'})                                        --add a plane grid to the scene

local ship = scene.addobj('/res/ct/ship.glb')                       --add a container ship

local agv = scene.addobj('/res/ct/agv.glb')                         --add a agv
agv:setpos(25, 0, 0)                                                --set the position of the agv

local rmqc = scene.addobj('/res/ct/rmqc.glb')                       --add a rail mounted quayside crane (rmqc)
local trolley_rmqc = scene.addobj('/res/ct/trolley_rmqc.glb')       --add a trolley of rmqc
local spreader_rmqc = scene.addobj('/res/ct/spreader.glb')          --add a spreader of rmqc
local wirerope_rmqc = scene.addobj('/res/ct/wirerope.glb')          --add a wirerope of rmqc

trolley_rmqc:setparent(rmqc)                                        --set rmqc as the parent of the trolley
spreader_rmqc:setparent(trolley_rmqc)                               --set trolley as the parent of the spreader
wirerope_rmqc:setparent(trolley_rmqc)                               --set trolley as the parent of the trolley

spreader_rmqc:setpos(0, 1, 0)                                       --set the position of the spreader
wirerope_rmqc:setpos(0, 1, 0)                                       --set the position of the wirerope
wirerope_rmqc:setscale(1, 25.54, 1)                                 --set the vertical length of the wirerope

rmqc:setpos(50, 0, 0)                                               --move the rmqc to the right of the agv

local rmg = scene.addobj('/res/ct/rmg.glb')                         --add a rail mounted gantry (rmg)
local trolley_rmg = scene.addobj('/res/ct/trolley.glb')             --add a trolley of rmg
local spreader_rmg = scene.addobj('/res/ct/spreader.glb')           --add a spreader of rmg
local wirerope_rmg = scene.addobj('/res/ct/wirerope.glb')           --add a wirerope of rmg

trolley_rmg:setparent(rmg)                                          --set rmg as the parent of the trolley
spreader_rmg:setparent(trolley_rmg)                                 --set trolley as the parent of the spreader
wirerope_rmg:setparent(trolley_rmg)                                 --set trolley as the parent of the trolley

spreader_rmg:setpos(0, 1, 0)                                        --set the position of the spreader
wirerope_rmg:setpos(0, 1, 0)                                        --set the position of the wirerope
wirerope_rmg:setscale(1, 16.57, 1)                                  --set the vertical length of the wirerope

rmg:setpos(100, 0, 0)                                               --move the rmg to the right of the rmqc

local ctns = {}                                                     --set a container array
ctns[1] = scene.addobj('/res/ct/container.glb')                     --add a red container
ctns[2] = scene.addobj('/res/ct/container_blue.glb')                --add a blue container
ctns[3] = scene.addobj('/res/ct/container_yellow.glb')              --add a yellow container
ctns[4] = scene.addobj('/res/ct/container_brown.glb')               --add a brown container
ctns[5] = scene.addobj('/res/ct/container_gray.glb')                --add a gray container
ctns[6] = scene.addobj('/res/ct/container_white.glb')               --add a white container
for i, ctn in ipairs(ctns) do                                       --traverse all containers
    ctn:setpos(110 + 10*i, 0, 0)                                    --move them to the right of the rmg
end

local cam = scene.getobj('camera')                                  --get camera of the scene
cam:setpos(120, 50, 120)                                            --set the position of the cam
cam:setrot(0, math.pi/6, 0)                                         --rotate the camera

scene.render()                                                      --render the scene