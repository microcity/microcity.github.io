print()

-- Import chart library
os.upload('/lua/lib/charts.lua')
require('charts')

-- Create options first, then create line chart
local data = {
    data = {{1, 820}, {2, 932}, {3, 901}, {4, 934}, {5, 1290}, {6, 1330}, {7, 1350}},
    type = 'line'
}

local options = CreateChartOptions(data, {name='x-axis'}, {name='y-axis'})
print('options:', options..' ')  -- The trailing ' ' prevents screen clearing

CreateChartAdvanced('chart1', options)

-- Create options first, then create scatter plot with dynamic update support
local data2 = {data=data.data,type='scatter'}
local options2 = CreateChartOptions(data2, {name='x-axis'}, {name='y-axis'})
CreateChartAdvanced('chart2', options2)

os.sleep(1000) -- Show dynamic modification

table.insert(data2.data, {8,1500})
UpdateChart('chart2', '{series: ['..table2json(data2)..']}') -- Dynamic data update

-- Directly add chart (CreateChart)
local data3 = {
    data = {120, 200, 150, 80, 70, 110, 130},
    type='bar'
}

CreateChart('chart3', data3, {
    type='category',
    data={'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'}
})

-- -- Clear all charts
-- os.sleep(2000)
-- ClearCharts()