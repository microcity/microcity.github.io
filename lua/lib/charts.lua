print('charts.lua: loading table2json.lua')
os.upload('/lua/lib/table2json.lua')
require('table2json')
print('charts.lua: table2json.lua loaded')

local CHART_OPTIONS_DEFAULT = [[
  {
    series: %s,
    xAxis: %s,
    yAxis: %s,
    title: %s,
    legend: %s,
    tooltip: %s
  }
]]

-- 创建图表options
-- series: table
-- xAxis: table
-- yAxis: table
-- title: table
-- legend: table
-- tooltip: table
-- return: options
function CreateChartOptions(series, xAxis, yAxis, title, legend, tooltip)
    if type(series) == 'nil' then
        print(debug.traceback())
    end
    assert(series ~= nil, "series不能为nil")

    if type(series) == 'table' then
        series = table2json(series)
    end

    local function convert2json(property, default)
        if property == nil then
            return default or '{}'
        elseif type(property) == 'table' then
            return table2json(property)
        else
            return property
        end
    end

    xAxis = convert2json(xAxis)
    yAxis = convert2json(yAxis)
    title = convert2json(title)
    legend = convert2json(legend)
    tooltip = convert2json(tooltip, "{trigger:'axis',axisPointer:{type:'cross'}}")

    return string.format(CHART_OPTIONS_DEFAULT, series, xAxis, yAxis, title, legend, tooltip)
end

-- 根据给定的options创建图表
-- chartId: string
-- options: string
function CreateChartAdvanced(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    local command = string.format("RemoteCall('createChart', '%s', %s)", chartId, options)
    -- print('CreateChart: command:\n' .. command)
    os.execute(command)
end

-- 根据给定的series, xAxis, yAxis创建图表
-- chartId: string
-- series: table
function CreateChart(chartId, series, xAxis, yAxis)
    local options = CreateChartOptions(series, xAxis, yAxis)
    CreateChartAdvanced(chartId, options)
end

-- 更新图表
-- chartId: string
-- options: string
function UpdateChart(chartId, options)
    assert(chartId ~= nil, "chartId can't be nil")
    assert(options ~= nil, "options can't be nil")

    if type(options) == 'table' then
        options = table2json(options)
    end

    local command = string.format("RemoteCall('updateChart', '%s', %s)", chartId, options)

    -- print('UpdateChart: command:\n', command)
    os.execute(command)
end

function ClearCharts()
    os.execute(string.format("RemoteCall('clearCharts')"))
end
