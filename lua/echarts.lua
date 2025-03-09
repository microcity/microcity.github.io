require('table2json')

local CHART_OPTIONS_DEFAULT = [[
  {
    series: [%s],
    xAxis: %s,
    yAxis: %s
  }
]]

-- series: table
-- xAxis: table
-- yAxis: table
function CreateChartOptions(series, xAxis, yAxis)
    assert(type(series) ~= 'nil', "series不能为nil")
    if type(series) == 'table' then
        series = table2json(series)
    end

    if xAxis == nil then
        xAxis = '{}'
    elseif type(xAxis) == 'table' then
        xAxis = table2json(xAxis)
    end

    if yAxis == nil then
        yAxis = '{}'
    elseif type(yAxis) == 'table' then
        yAxis = table2json(yAxis)
    end

    return string.format(CHART_OPTIONS_DEFAULT, series, xAxis, yAxis)
end

function CreateChart(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    local command = string.format("RemoteCall('createChart', '%s', %s)", chartId, options)
    print('CreateChart: command:\n' .. command)
    os.execute(command)
end

function UpdateChart(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    local command = string.format("RemoteCall('updateChart', '%s', %s)", chartId, options)

    print('UpdateChart: command:\n', command)
    os.execute(command)
end

-- custom
print()

local data = {
    data = {{1, 820}, {2, 932}, {3, 901}, {4, 934}, {5, 1290}, {6, 1330}, {7, 1350}},
    type = 'line'
}
-- print(data)

local options = CreateChartOptions(data, {name='x-axis'}, {name='y-axis'})
print(options)

CreateChart('chart1', options)

local data2 = {data=data.data,type='scatter'}
local options2 = CreateChartOptions(data2, {name='x-axis'}, {name='y-axis'})
CreateChart('chart2', options2)

os.sleep(1000) -- 显示动态修改

table.insert(data2.data, {8,1500})
UpdateChart('chart2', '{series: ['..table2json(data2)..']}')