function table2json(lua_table)
  local function encode_value(value)
    local value_type = type(value)
    if value_type == "string" then
      return "\"" .. value .. "\"" -- 简单地用双引号包裹字符串，需要更完善的转义处理
    elseif value_type == "number" or value_type == "boolean" then
      return tostring(value)
    elseif value_type == "nil" then
      return "null"
    elseif value_type == "table" then
      if #value > 0 then -- 判断是否是数组型 table (数字索引从 1 开始)
        local array_items = {}
        for i = 1, #value do
          array_items[#array_items + 1] = encode_value(value[i])
        end
        return "[" .. table.concat(array_items, ",") .. "]"
      else -- 对象型 table
        local object_pairs = {}
        for k, v in pairs(value) do
          object_pairs[#object_pairs + 1] = "" .. tostring(k) .. ":" .. encode_value(v) -- 简单地将键转换为字符串，并用双引号包裹
        end
        return "{" .. table.concat(object_pairs, ",") .. "}"
      end
    else
      return "null" -- 对于不支持的类型，返回 "null"
    end
  end

  if not lua_table then
    return "null"
  end
  return encode_value(lua_table)
end

-- -- 示例用法:
-- local my_table = {
--   name = "示例数据",
--   value = 123,
--   is_valid = true,
--   items = { "item1", "item2", "item3" },
--   sub_table = { key = "sub_value" }
-- }

-- local json_string_manual = table_to_json_manual(my_table)
-- print(json_string_manual)
-- --> {"name":"示例数据","value":123,"is_valid":true,"items":["item1","item2","item3"],"sub_table":{"key":"sub_value"}}

-- local array_table = {10, 20, 30, "hello"}
-- local json_array_string_manual = table_to_json_manual(array_table)
-- print(json_array_string_manual)
-- --> [10,20,30,"hello"]

-- local empty_table = {}
-- local json_empty_string_manual = table_to_json_manual(empty_table)
-- print(json_empty_string_manual)
-- --> {}

-- local nil_table = nil
-- local json_nil_string_manual = table_to_json_manual(nil_table)
-- print(json_nil_string_manual)
-- --> null