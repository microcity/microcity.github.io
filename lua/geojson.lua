scene.setenv({camtype='ortho'})
local obj = scene.addobj('/res/world_countries.geojson')
for i,country in ipairs(obj:getchildren()) do
    local x, y, z
    for j, land in ipairs(country:getchildren()) do
        land:setmat({color='#3480C4', opacity = 0.6})
        local points = land:getvertices()
        x, y, z = points[1], points[2], points[3]
    end
    local data = country:getdata()
    local label = scene.addobj('label', {text = data['NAME'], color = 'black', size = 2})
    label:setpos(x, y, z)
    print(data['NAME'], ", POP:", data['POP_EST'], ", GDP:", data['GDP_MD_EST'])
end
scene.render()