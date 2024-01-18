scene.setenv({camtype='ortho'})                                                             --set the scene camera to orthographic
local obj = scene.addobj('/res/world_countries.geojson')                                    --get gis data of world countries
for i,country in ipairs(obj:getchildren()) do                                               --traverse each country
    local x, y, z
    for j, land in ipairs(country:getchildren()) do                                         --traverse each land of a country
        land:setmat({color='#3480C4', opacity = 0.6})                                       --set color of the land to light blue
        local points = land:getvertices()                                                   --get all points of the land polygon
        x, y, z = points[1], points[2], points[3]                                           --get the vertex coordinates
    end
    local data = country:getdata()                                                          --get data of the country
    local label = scene.addobj('label', {text = data['NAME'], color = 'black', size = 2})   --add a label of the country name
    label:setpos(x, y, z)                                                                   --set the lable position
    print(data['NAME'], ", POP:", data['POP_EST'], ", GDP:", data['GDP_MD_EST'])            --print out the other data
end
scene.render()                                                                              --render the scene