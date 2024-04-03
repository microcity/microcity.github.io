scene.setenv({grid='plane'})                                        --add a plane grid to the scene

local truck = scene.addobj('/res/2axle.glb')                        --add a truck
local shelf = scene.addobj('/res/shelf.glb')                        --add a shelf
local agv = scene.addobj('/res/agv.glb')                            --add a agv
shelf:setpos(5, 0, 0)                                               --set the position of the shelf
agv:setpos(7, 0, 0)                                                 --set the position of the agv

local cam = scene.getobj('camera')                                  --get camera of the scene
cam:setpos(20, 10, 20)                                              --set the position of the cam

scene.render()                                                      --render the scene