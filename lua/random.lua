local seed = math.randomseed(2, {distribution = "normal", sigma = 5})
for i = 1, 10 do
    print(seed:random())
end
print(math.random())