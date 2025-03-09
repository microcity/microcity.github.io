print()

-- 导入图表库
os.upload('/lua/lib/charts.lua')
require('charts')

-- 先创建options再创建折线图
local data = {
    data = {{1, 820}, {2, 932}, {3, 901}, {4, 934}, {5, 1290}, {6, 1330}, {7, 1350}},
    type = 'line'
}

local options = CreateChartOptions(data, {name='x-axis'}, {name='y-axis'})
print('options:', options..' ')  -- 最后的 ' ' 避免清屏

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

-- -- 清空图表
-- os.sleep(2000)
-- ClearCharts()