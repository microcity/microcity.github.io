scene.setenv({camtype='ortho'})
local obj = scene.addobj('/res/world_countries.geojson')
for i,country in ipairs(obj:getchildren()) do
    for j,land in ipairs(country:getchildren()) do
        land:setmat({color='#3480C4', opacity = 0.6})
    end
    local data = country:getdata()
    print(data['NAME'], ", POP:", data['POP_EST'], ", GDP:", data['GDP_MD_EST'])
end
scene.render()