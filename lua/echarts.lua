os.upload('/lua/lib/table2json.lua')
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

-- 代码示例
print()

-- 先创建options再创建折线图
local data = {
    data = {{1, 820}, {2, 932}, {3, 901}, {4, 934}, {5, 1290}, {6, 1330}, {7, 1350}},
    type = 'line'
}
-- print(data)

local options = CreateChartOptions(data, {name='x-axis'}, {name='y-axis'})
print(options)

CreateChartAdvanced('chart1', options)

-- 先创建options再创建散点图，并实现动态更新
local data2 = {data=data.data,type='scatter'}
local options2 = CreateChartOptions(data2, {name='x-axis'}, {name='y-axis'})
CreateChartAdvanced('chart2', options2)

os.sleep(1000) -- 显示动态修改

table.insert(data2.data, {8,1500})
UpdateChart('chart2', '{series: ['..table2json(data2)..']}') -- 动态更新数据

-- 直接添加图表(CreateChart)
local data3 = {
    data = {120, 200, 150, 80, 70, 110, 130},
    type='bar'
}

CreateChart('chart3', data3, {
    type='category',
    data={'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'}
})