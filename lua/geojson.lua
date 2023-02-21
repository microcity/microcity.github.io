scene.setenv({camtype='ortho'})
local obj = scene.addobj('/res/world_countries.geojson')
for i,country in ipairs(obj:getchildren()) do
    for j,land in ipairs(country:getchildren()) do
        land:setmat({color='#3480C4', opacity = 0.6})
    end
end
scene.render()