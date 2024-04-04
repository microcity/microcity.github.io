--execute javascript 
print(os.execute("Math.floor(Math.random())"))           --use js Math lib and print out the result
os.execute("RemoteCall('alert', 'hello!')")              --Remotely call (accessing DOM) the js alert function

--add 2D figures, 3D objects, gltf, mesh, labels to the scene
scene.setenv({grid='plane'})                                                 --set a plane grid
scene.addobj("points", {vertices={0,0,0, 5,5,5}, size=5})                    --add two points with size of 5
scene.addobj("polyline", {vertices={0,0,0, -2,3,5, 4,6,7}, color='blue'})    --add a blue polyline
scene.addobj("polygon", {vertices={-1,-1,0, -1,1,0, 1,1,0, 1,-1,0}, size=0}) --add a 2D polygon
scene.addobj("label", {text="hello", size=5})                                --add a label
scene.render()                                                               --render the scene

--random number generation
local seed = math.randomseed(1, {dist = "normal", mu = 5, sigma = 3})        --set a seed for a normal (others: "exponential", "poisson" and "uniform") distribution random generator
print(seed:random())                                                         --print out a random number

--mixwd integer programming 
local mip = math.newmip()                   --create a integer programming
mip:addrow({x1 = 143, x2 = 60}, 'max')      --set the objective function
mip:addrow({x1 = 110, x2 = 30}, '<=', 4000) --add the first constraint
mip:addrow({x1 = 1,   x2 = 1},  '<=', 75)   --add the second constraint
mip:addrow('x1', 'int')                     --set x1 a integer bound
mip:addrow('x2', 'bin')                     --set x2 a binary bound
mip:solve()                                 --solve the model               
print(mip.obj, ' ', mip.x1, ' ', mip.x2)    --print objective and variables values