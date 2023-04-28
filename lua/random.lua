local seed = math.randomseed(1, {dist = "normal", mu = 5, sigma = 3})
for i = 1, 10 do
    print(seed:random())
end