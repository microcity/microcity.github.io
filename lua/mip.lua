local mip = math.newmip()

mip:addrow({143,60}, 'max')
mip:addrow({110,30}, '<=', 4000)
mip:addrow({1,1}, '<=', 75)
mip:addrow('c1', 'int')
mip:addrow('c2', 'bin')
mip:solve()

print(mip['obj'], ' ', mip['c1'], ' ', mip['c2'])