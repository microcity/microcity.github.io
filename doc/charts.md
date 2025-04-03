# MicroCity Web 图表功能说明文档

## 1. 概述

MicroCity Web 提供了基于[ECharts](https://echarts.apache.org/zh/index.html)的强大图表可视化功能，可以在 Lua 脚本中轻松创建和管理各种类型的图表，包括折线图、柱状图、散点图、饼图等。通过简单的 API 调用，您可以将数据可视化并实时更新图表内容。

### 1.1 功能实现原理

图表功能是通过在 MicroCity Web 中集成 ECharts 作为核心图表渲染引擎，通过 Lua 脚本（/lua/lib/table2json.lua）将 Lua 表结构转换为 ECharts 所需的 JSON 配置，再通过 RemoteCall 机制传递给前端 JavaScript 环境，实现图表的创建和动态更新。

## 2. 基本用法

### 2.1 图表面板

图表面板位于 MicroCity Web 界面右侧，会在创建第一个图表时自动显示。面板提供了以下功能：

#### 2.1.1 基础布局

- 每个图表都有独立的标题栏和内容区域
- 标题栏右侧显示展开/折叠状态指示器（"▼"表示展开，"▶"表示折叠）
- 图表右上角包含工具栏，提供数据查看和导出功能

#### 2.1.2 交互功能

- **展开/折叠操作**：
  - 点击单个图表的标题可展开或折叠该图表
  - 点击面板顶栏的展开按钮可同时展开或折叠所有图表
- **大小调整**：
  - 拖动左侧边缘可调整面板宽度
  - 拖动底部边缘可调整面板高度
  - 调整后图表会自动适应新尺寸
- **右键菜单**：
  - 右键点击图表标题可移除该图表
  - 右键点击面板顶栏可清除所有图表
- **工具栏功能**：
  - 数据视图：查看图表数据
  - 下载图片：将图表保存为图片文件

### 2.2 创建简单图表

使用`CreateChart`函数创建基本图表：

```lua
-- 引入图表库
os.upload('/lua/lib/charts.lua')
require('charts')


-- 创建简单折线图
local chartId = "SimpleLineChart" -- 图表唯一标识符
local series = {
      type = 'line',
      data = {150,230,224,218,135,147,260}
}
local xAxis = {
      type='category',
      data={'Mon','Tue','Wed','Thu','Fri','Sat','Sun'}
}

CreateChart(chartId, series, xAxis)
```

创建具有多个数据系列的图表：

```lua
-- 引入图表库
os.upload('/lua/lib/charts.lua')
require('charts')

-- 创建多数据系列折线图
local chartId = "MultiLineChart" -- 图表唯一标识符
local series = {
  {
    name = "邮件营销",
    type = "line",
    data = {120, 132, 101, 134, 90, 230, 210}
  },
  {
    name = "联盟广告",
    type = "line",
    data = {220, 182, 191, 234, 290, 330, 310}
  }
}

local xAxis = {data = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"}}

CreateChart(chartId, series, xAxis)
```

## 3. API 参考

### 3.1 CreateChart

根据数据系列和坐标轴信息创建图表。

```lua
CreateChart(chartId, series, xAxis, yAxis)
```

**参数**：

- `chartId`：字符串，图表的唯一标识符
- `series`：表，包含一个或多个数据系列的定义
- `xAxis`：表，X 轴配置
- `yAxis`：表，Y 轴配置

### 3.2 CreateChartAdvanced

使用完整的 ECharts 选项创建图表，提供更大的自定义灵活性。

```lua
CreateChartAdvanced(chartId, options)
```

**参数**：

- `chartId`：字符串，图表的唯一标识符
- `options`：字符串或表，完整的 ECharts 配置选项

### 3.3 UpdateChart

更新已存在的图表。

```lua
UpdateChart(chartId, options)
```

**参数**：

- `chartId`：字符串，要更新的图表标识符
- `options`：字符串或表，要更新的配置选项

### 3.4 ClearCharts

清除所有图表。

```lua
ClearCharts()
```

## 4. 图表类型示例

### 4.1 折线图

```lua
local series = {
  {
    name = "销售量",
    type = "line",
    data = {120, 132, 101, 134, 90, 230, 210}
  }
}
local xAxis = {data = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"}}
CreateChart("lineChart", series, xAxis, {})
```

### 4.2 柱状图

```lua
local series = {
  {
    name = "销售量",
    type = "bar",
    data = {120, 132, 101, 134, 90, 230, 210}
  }
}
local xAxis = {data = {"周一", "周二", "周三", "周四", "周五", "周六", "周日"}}
CreateChart("barChart", series, xAxis, {})
```

### 4.3 饼图

```lua
local series = {
  {
    name = "访问来源",
    type = "pie",
    radius = "55%",
    data = {
      {value = 235, name = "视频广告"},
      {value = 274, name = "联盟广告"},
      {value = 310, name = "邮件营销"},
      {value = 335, name = "直接访问"},
      {value = 400, name = "搜索引擎"}
    }
  }
}
CreateChart("pieChart", series, {}, {})
```

### 4.4 散点图

```lua
local series = {
  {
    name = "散点数据",
    type = "scatter",
    data = {{161.2, 51.6}, {167.5, 59.0}, {159.5, 49.2}, {157.0, 63.0}, {155.8, 53.6}}
  }
}
CreateChart("scatterChart", series, {}, {})
```

## 5. 高级功能

### 5.1 动态更新图表

您可以使用`UpdateChart`函数动态更新图表内容：

```lua
-- 创建初始图表
local chartId = "dynamicChart"
local series = {{name = "实时数据", type = "line", data = {5, 20, 36}}}
local xAxis = {data={1, 2, 3}}
CreateChart(chartId, series, xAxis, {})

-- 稍后更新图表数据
local newOptions = {
  series = {{name = "实时数据", data = {5, 20, 36, 10, 15}}},
  xAxis = {data = {1, 2, 3, 4, 5}}
}
UpdateChart(chartId, newOptions)
```

### 5.2 使用完整 ECharts 配置

当需要使用 ECharts 的高级特性时，可以通过`CreateChartAdvanced`函数来创建更复杂的图表。该函数支持完整的 ECharts 配置项，接收 JSON 字符串作为参数。对于使用 Lua 表格式的配置，可以使用的`table2json`函数进行转换（该函数随`charts.lua`一起加载）。

```lua
local options = {
  title = {text = "复杂图表示例"},
  tooltip = {trigger = "axis"},
  legend = {data = {"蒸发量", "降水量"}},
  xAxis = {
    type = "category",
    data = {"1月", "2月", "3月", "4月", "5月", "6月", "7月", "8月", "9月", "10月", "11月", "12月"}
  },
  yAxis = {type = "value"},
  series = {
    {
      name = "蒸发量",
      type = "bar",
      data = {2.0, 4.9, 7.0, 23.2, 25.6, 76.7, 135.6, 162.2, 32.6, 20.0, 6.4, 3.3}
    },
    {
      name = "降水量",
      type = "bar",
      data = {2.6, 5.9, 9.0, 26.4, 28.7, 70.7, 175.6, 182.2, 48.7, 18.8, 6.0, 2.3}
    }
  }
}

local json_options = table2json(options)

CreateChartAdvanced("advancedChart", json_options)
```

## 6. 注意事项

1. 每个图表必须有唯一的 ID，重复使用同一 ID 会覆盖原有图表
2. 图表面板大小调整后，图表会自动适应新尺寸
3. 图表具有导出和数据查看功能，可通过图表右上角工具栏使用
4. 创建图表过多可能会影响系统性能，建议在不需要时调用`ClearCharts()`清除

## 7. 更多资源

如需了解更多 ECharts 配置选项，请参考[ECharts 官方文档](https://echarts.apache.org/zh/option.html)。
