--execute javascript 
print(os.execute("Math.floor(Math.random())"))           --use js Math lib and print out the result
os.execute("RemoteCall('alert', 'hello!')")              --Remotely call (accessing DOM) the js alert function


--add objects to the 3D scene
scene.setenv({grid='plane'})                                                 --set a plane grid
scene.addobj("points", {vertices={0,0,0, 5,5,5}, size=5})                    --add two points with size of 5
scene.addobj("polyline", {vertices={0,0,0, -2,3,5, 4,6,7}, color='blue'})    --add a blue polyline
scene.addobj("polygon", {vertices={-1,-1,0, -1,1,0, 1,1,0, 1,-1,0}, size=0}) --add a 2D polygon
scene.addobj("label", {text="hello", size=5})                                --add a label
scene.render()                                                               --render the scene


--random number generator
local seed = math.randomseed(1, {dist = "normal", mu = 5, sigma = 3})
for i = 1, 10 do
    print(seed:random())
end

--Mixwd Integer Programming
local mip = math.newmip()

mip:addrow({143,60}, 'max')
mip:addrow({110,30}, '<=', 4000)
mip:addrow({1,1}, '<=', 75)
mip:addrow('c1', 'int')
mip:addrow('c2', 'bin')
mip:solve()

print(mip['obj'], ' ', mip['c1'], ' ', mip['c2'])