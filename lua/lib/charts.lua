print('charts.lua: loading table2json.lua')
os.upload('/lua/lib/table2json.lua')
require('table2json')
print('charts.lua: table2json.lua loaded')

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
-- return: options
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

function CreateChartAdvanced(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    local command = string.format("RemoteCall('createChart', '%s', %s)", chartId, options)
    print('CreateChart: command:\n' .. command)
    os.execute(command)
end

function CreateChart(chartId, series, xAxis, yAxis)
    local options = CreateChartOptions(series, xAxis, yAxis)
    CreateChartAdvanced(chartId, options)
end

function UpdateChart(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    if type(options) == 'table' then
        options = table2json(options)
    end

    local command = string.format("RemoteCall('updateChart', '%s', %s)", chartId, options)

    print('UpdateChart: command:\n', command)
    os.execute(command)
end

function ClearCharts()
    os.execute(string.format("RemoteCall('clearCharts')"))
end
