---
date: 2017-01-02 18:32:08
title: "Apache 下的 Lua 的配置"
tags: [ "Lua", "Apache" ]
categories: [ "Develop" ]
draft: false
contentCopyright: false
---

对于 Apache 这个东西，绝大多数人都是非常熟悉的。很多人都会诟病这个 Apache，说它效率不高而且非常消耗资源，然后会建议用 Nginx。这些不能否认，但是我还是很喜欢 Apache，因为它比较稳定。

Apache 关于 Lua 我不知道是哪一个版本编译进去了的，但是最新版的是有的。在 Apache 的 bin 目录下有一个 `lua51.dll` 很明显，这个是 Lua5.1 版本的，目前 Lua 已经到了 5.3 版本了，如果你想追求新的版本的话，你可以自己把 Apache 编译一次。然后还有，在 Apache 的 modules 目录下有一个 `mod_lua.so` 是开启 Apache 和 Lua 通信桥梁的文件。
<!--more-->

### 修改配置文件

- 找到含有 `mod_lua.so` 的一行，去掉前边的#即可。
- 找到含有 `mod_rewrite.so` 的一行，去掉前边的#。
- 可能你需要修改 Apache 的默认文档，在 `DirectoryIndex` 的位置按要求添加即可。
- 将 `AllowOverride` 后边的 `None` 写为 `All`，表示在整台服务器上都开启了URL重写。

### 写Demo文件

- 首先我们写一个 `.htaccess` 的文件，作用就是会把我们的 Lua 后缀修改为 php。内容如下：

``` ini
RewriteEngine on
RewriteCond %{REQUEST_FILENAME} info
RewriteRule (.*).php $1.lua [NC]
```

- 新建一个 `info.lua`，写入内容如下：

``` lua
-- Extend tostring to report function type (C or Lua)
do
  local type, tostr = type, tostring
  function tostring(obj)
    local type, val = type(obj), tostr(obj)
    if type == "function" then
      type = pcall(coroutine.create, obj) and "Lua " or "C " -- coroutines cannot start at a C function
      return type .. val
    else
      return val
    end
  end
end

local safe_replacements = {
  ["<"] = "&lt;",
  [">"] = "&gt;",
  ["&"] ="&amp;",
}
local function safestring(...)
  return tostring(...):gsub("[<>&]", safe_replacements):gsub("\n", "<br/>\n")
end
local function emstring(...)
  return "&quot;<em>".. safestring(...) .."</em>&quot;"
end

local function print_info(info)
  print [[
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Strict//EN"
"http://www.w3.org/TR/xhtml1/DTD/xhtml1-strict.dtd">
<html>
  <head>
    <title>mod_lua info</title>
    <style type="text/css">
      body {
        background-color: #eef;
	color: black;
	font-family: sans-serif;
      }
      table {
        border-collapse: collapse;
	text-align: left;
	margin-left: auto;
	margin-right: auto;
      }
      table.head th {
        vertical-align: middle;
	background-color: #99c;
      }
      div.center {
        text-align: center;
      }
      h1 {
        margin: 0;
	padding: 0.3em 0;
      }
      td, th {
        border: 1px black solid;
	vertical-align: baseline;
	font-size: 75%;
      }
      th {
        background-color: #ccf;
      }
      td {
        background-color: #ccc;
      }
      ul {
        list-style: square;
	margin: 0;
	padding-left: 2em;
      }
    </style>
  </head>
  <body>
    <div class="center">
      <table class="head" width="600">
        <tr> <th><h1>mod_lua</h1></th> </tr>
      </table>
]]
  for group, settings in pairs(info) do
    print('<h2><a name="'.. group:gsub("[^a-zA-Z]", "") ..'">'.. group .. "</a></h2>")
    print [[
      <table width="600">
]]
    for key, value in pairs(settings) do
      print("<tr> <th>".. key .."</th> <td>".. value .."</td> </tr>\n")
    end
    print "</table>\n"
  end
  print [[
    </div>
  </body>
</html>
]]
end

local function compile_info(req)
  local info = {}
  do -- Lua compile options
    local dump = string.dump(function() end)
    local gc_pause = collectgarbage("setpause", 1); collectgarbage("setpause", gc_pause)
    local gc_stepmul = collectgarbage("setstepmul", 2); collectgarbage("setstepmul", gc_stepmul)
    info["Lua configuration"] = {
      -- Bytecode header is undocumented, see luaU_header in lundump.c
      Version = ("%i.%i"):format(math.floor(dump:byte(5) / 16), dump:byte(5) % 16),
      Endianness = dump:byte(7) == 1 and "little" or "big",
      int = dump:byte(8)*8 .. " bit integer",
      size_t = dump:byte(9)*8 .. " bit integer",
      ["VM instruction"] = dump:byte(10)*8 .. " bit integer",
      Number = dump:byte(11)*8 .. " bit " .. (dump:byte(12) == 1 and "integer" or "float"),
      -- package.config is undocumented, see luaopen_package in loadlib.c
      ["Path seperator"] = safestring(package.config:sub(1,1)),
      ["Lua package path"] = safestring(package.path:gsub(package.config:sub(3,3), "\n")),
      ["C package path"] = safestring(package.cpath:gsub(package.config:sub(3,3), "\n")),
      -- Garbage collection values _are_ documented :)
      ["GC count"] = ("%.0f bytes"):format(collectgarbage"count" * 1024),
      ["GC pause"] = ("%.0f%%"):format(gc_pause),
      ["GC step multiplier"] = ("%.0f%%"):format(gc_stepmul),
    }
  end
  do -- Globals
    local g = {}
    for key, value in pairs(getfenv(0)) do
      local typev = type(value)
      local str
      if typev == "table" then
        str = safestring(value)
        if value ~= getfenv(0) then -- don't recursively follow _G
          str = str .. "<ul>"
            for field, v in pairs(value) do
              str = str .. "<li>" .. safestring(field) .. " ("
              if type(v) == "string" then
                str = str .. emstring(v)
              else
                str = str .. safestring(v)
              end
              str = str .. ")</li>"
            end
          str = str .. "</ul>"
        end
      elseif typev == "string" then
        str = emstring(value)
      else
        str = safestring(value)
      end
      g[safestring(key)] = str
    end
    info.Globals = g
  end
  do -- Request object
    local rinfo = {}
    for _, field in pairs{"puts", "write", "document_root", "parseargs", "parsebody", "debug", "info", "notice",
    "warn", "err", "crit", "alert", "emerg", "add_output_filter", "assbackwards", "status", "protocol", "range",
    "content_type", "content_encoding", "ap_auth_type", "unparsed_uri", "user", "filename", "canonical_filename",
    "path_info", "args", "hostname", "uri", "the_request", "method", "headers_in", "headers_out"} do
      local value = req[field]
      if type(value) == "userdata" and apr_table and apr_table.pairs then
        local list = "<ul>"
        for key, value in apr_table.pairs(value) do
          list = list .. "<li>" .. safestring(key) .. " (" .. emstring(value) .. ")</li>"
        end
        rinfo[field] = tostring(req[field]) .. list .. "</ul>"
      elseif type(value) == "string" then
        rinfo[field] = emstring(req[field])
      else
        rinfo[field] = safestring(req[field])
      end
    end
    info.Request = rinfo
  end
  do -- Arguments (query string)
    local args = req:parseargs()
    local args_clean = {}
    for key, value in pairs(args) do
      args_clean[safestring(key)] = emstring(value)
    end
    if next(args_clean) then
      info["Query string"] = args_clean
    end
  end
  return info
end

function handle(r)
  -- setup the environment
  r.content_type = "text/html"
  r.headers_out["X-Powered-By"] = "mod_lua; " .. _VERSION
  print = function(s) return r:write(tostring(s)) end

  -- run the main script
  local info = compile_info(r)
  print_info(info)

  -- finish
  return apache2.OK
end
```

### 访问Demo

打开 `Apache`，访问 http://127.0.0.1/info.php 就能看到
