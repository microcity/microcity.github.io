local chartId = "myLuaChart"
local chartType = "line"
local chartOptions = [[
{
  xAxis: {
    type: 'category',
    data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
  },
  yAxis: {
    type: 'value'
  },
  series: [{
    data: [820, 932, 901, 934, 1290, 1330, 1350],
    type: 'line'
  }]
}
]]

local command = string.format("RemoteCall('createChart', '%s', '%s', %s)", chartId, chartType, chartOptions)
print('call command:\n'..command)
os.execute(command)

-- os.execute("RemoteCall('hello')")


print("图表创建命令已发送")