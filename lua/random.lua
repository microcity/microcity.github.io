local seed = math.randomseed(1, {distribution = "normal", mu = 5, sigma = 3})
for i = 1, 10 do
    print(seed:random())
end