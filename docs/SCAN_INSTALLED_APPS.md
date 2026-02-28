# scanInstalledApps() 函数使用说明

## 功能描述

`scanInstalledApps()` 函数用于扫描系统中已安装的应用程序，返回应用程序的详细信息列表。

该函数支持以下平台：
- **Windows**: 扫描注册表中的已安装应用程序
- **macOS**: 扫描 `/Applications`、`/System/Applications` 和 `~/Applications` 目录

## 返回值

返回一个 Promise，resolve 为应用程序信息数组。每个应用程序对象包含以下字段：

```typescript
interface InstalledAppData {
  name: string;      // 应用程序名称
  path: string;      // 应用程序启动路径（从 DisplayIcon 解析出的可执行文件路径（Windows）
  installLocation: string; // 注册表原始 InstallLocation（Windows）
  version: string;   // 应用程序版本号
  icon: string;      // 应用程序图标路径
}
```

## 使用方法

### 1. 使用 Promise

```javascript
const si = require('systeminformation');

si.scanInstalledApps()
  .then(apps => {
    console.log('已安装的应用程序:');
    apps.forEach(app => {
      console.log(`- ${app.name} (${app.version})`);
      console.log(`  路径: ${app.path}`);
      console.log(`  图标: ${app.icon}`);
    });
  })
  .catch(error => console.error(error));
```

### 2. 使用 async/await

```javascript
const si = require('systeminformation');

async function getInstalledApps() {
  try {
    const apps = await si.scanInstalledApps();

    console.log(`找到 ${apps.length} 个已安装的应用程序`);

    // 过滤特定应用
    const chromeApp = apps.find(app => app.name.includes('Chrome'));
    if (chromeApp) {
      console.log('Chrome 版本:', chromeApp.version);
    }

    return apps;
  } catch (error) {
    console.error('扫描失败:', error);
  }
}

getInstalledApps();
```

### 3. 使用回调函数

```javascript
const si = require('systeminformation');

si.scanInstalledApps(apps => {
  console.log('扫描完成，找到应用:', apps.length);

  // 按名称排序
  apps.sort((a, b) => a.name.localeCompare(b.name));

  // 输出前10个应用
  apps.slice(0, 10).forEach(app => {
    console.log(`${app.name} - ${app.version}`);
  });
});
```

## 示例输出

### macOS 示例

```json
[
  {
    "name": "Google Chrome",
    "path": "/Applications/Google Chrome.app",
    "version": "145.0.7632.117",
    "icon": "/Applications/Google Chrome.app/Contents/Resources/app.icns"
  },
  {
    "name": "Visual Studio Code",
    "path": "/Applications/Visual Studio Code.app",
    "version": "1.109.2",
    "icon": "/Applications/Visual Studio Code.app/Contents/Resources/Code.icns"
  },
  {
    "name": "Safari",
    "path": "/Applications/Safari.app",
    "version": "26.1",
    "icon": "/Applications/Safari.app/Contents/Resources/AppIcon.icns"
  }
]
```

### Windows 示例

```json
[
  {
    "name": "Google Chrome",
    "path": "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "installLocation": "C:\\Program Files\\Google\\Chrome\\Application",
    "version": "145.0.7632.117",
    "icon": null
  },
  {
    "name": "Microsoft Office",
    "path": "C:\\Program Files\\Microsoft Office\\Office16\\WINWORD.EXE",
    "installLocation": "C:\\Program Files\\Microsoft Office\\Office16",
    "version": "16.0.14326.20404",
    "icon": null
  }
]
```

## 使用场景

1. **应用程序管理工具**
   - 列出所有已安装的应用程序
   - 检查特定应用是否已安装
   - 获取应用版本信息

2. **系统监控和审计**
   - 生成已安装软件清单
   - 检测未授权的软件安装
   - 软件资产管理

3. **应用启动器**
   - 构建应用程序快速启动菜单
   - 显示应用图标和名称
   - 按名称或使用频率排序

4. **版本检查和更新**
   - 检查应用程序版本
   - 提示用户更新过时的应用
   - 生成软件版本报告

5. **开发工具集成**
   - 检测开发环境（IDE、编辑器）
   - 查找特定工具的安装目录或启动路径
   - 验证依赖软件是否已安装

## 注意事项

### macOS
- 扫描过程可能需要几秒钟，取决于已安装应用的数量
- 某些应用可能没有 `Info.plist` 文件，这些应用的版本和图标信息可能为空
- 系统应用位于 `/System/Applications`，用户应用位于 `/Applications` 和 `~/Applications`
- 图标路径指向 `.icns` 文件，可以使用 macOS 原生 API 加载

### Windows
- 扫描注册表的以下位置：
  - `HKLM\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`
  - `HKLM\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall` (64位系统)
  - `HKCU\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall`
- 某些便携式应用或绿色软件可能不会出现在注册表中
- 图标路径可能包含索引（如 `app.exe,0`），需要使用 Windows API 提取图标

### Linux
- 当前版本不支持 Linux 平台
- 在 Linux 上调用此函数将返回空数组
- 未来版本可能会添加对 `.desktop` 文件的支持

### 性能考虑
- 首次扫描可能较慢，建议在后台线程执行
- 可以缓存结果，定期刷新
- 对于大量应用的系统，考虑分页或按需加载

## 相关函数

- `system()` - 获取系统硬件信息
- `osInfo()` - 获取操作系统信息
- `versions()` - 获取已安装软件版本
- `processes()` - 获取正在运行的进程列表

## 错误处理

```javascript
const si = require('systeminformation');

async function safeGetApps() {
  try {
    const apps = await si.scanInstalledApps();

    if (!apps || apps.length === 0) {
      console.log('未找到已安装的应用程序');
      return [];
    }

    return apps;
  } catch (error) {
    console.error('扫描应用程序时出错:', error.message);
    return [];
  }
}
```

## 高级用法

### 过滤和搜索

```javascript
const si = require('systeminformation');

async function findApp(searchTerm) {
  const apps = await si.scanInstalledApps();

  return apps.filter(app =>
    app.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
}

// 查找所有包含 "Chrome" 的应用
findApp('Chrome').then(apps => {
  console.log('找到的应用:', apps);
});
```

### 按版本排序

```javascript
const si = require('systeminformation');

async function getAppsSortedByVersion() {
  const apps = await si.scanInstalledApps();

  return apps.sort((a, b) => {
    // 简单的版本号比较
    return b.version.localeCompare(a.version, undefined, { numeric: true });
  });
}
```

### 生成应用清单

```javascript
const si = require('systeminformation');
const fs = require('fs');

async function generateAppInventory() {
  const apps = await si.scanInstalledApps();

  const inventory = {
    timestamp: new Date().toISOString(),
    totalApps: apps.length,
    apps: apps.map(app => ({
      name: app.name,
      version: app.version,
      path: app.path
    }))
  };

  fs.writeFileSync('app-inventory.json', JSON.stringify(inventory, null, 2));
  console.log('应用清单已生成: app-inventory.json');
}

generateAppInventory();
```

## 设计决策

### Windows 平台的 path 和 icon 字段处理

在 Windows 平台上，注册表中的应用程序信息存在以下问题，需要特殊处理：

#### 1. path 字段处理逻辑

**问题**：
`InstallLocation` 字段在很多应用中为空、过时或不准确。

**解决方案**：
- `path` 统一表示启动路径（从 `DisplayIcon` 中解析并校验可执行文件路径）
- `installLocation` 保留注册表原始安装目录字段

**示例**：
```
原始数据:
  InstallLocation: (空)
  DisplayIcon: "C:\Program Files (x86)\App\app.exe"

处理后:
  path: "C:\Program Files (x86)\App\app.exe"
  installLocation: ""
```

#### 2. icon 字段处理逻辑

**问题**：
注册表中的 `DisplayIcon` 字段经常指向可执行文件（.exe）、动态链接库（.dll）等非图标文件。

**解决方案**：
只返回真正的图标文件（.ico），其他类型返回空字符串。

**原因**：
- **语义正确性**：icon 字段应该表示图标文件，而不是可执行文件
- **使用场景**：调用者期望获取可以直接显示的图标文件路径
- **避免混淆**：.exe 文件虽然包含图标资源，但不是图标文件本身

**对比**：
```javascript
// 修复前（直接返回注册表原始值）
{
  name: "7-Zip",
  path: "C:\\Program Files\\7-Zip\\7zFM.exe",
  icon: "C:\\Program Files\\7-Zip\\7zFM.exe",  // 错误：这是可执行文件
  version: "20.00"
}

// 修复后（只返回 .ico 文件）
{
  name: "7-Zip",
  path: "C:\\Program Files\\7-Zip\\7zFM.exe",
  icon: "",  // 正确：没有 .ico 文件时返回空字符串
  version: "20.00"
}
```

### 与 getRegistryInfo 的一致性

`getRegistryInfo()` 函数应用了相同的处理逻辑，确保两个函数返回的数据格式和语义一致。

## 技术细节

### macOS 实现
- 使用 `fs.readdir()` 扫描应用目录
- 使用 `defaults read` 命令读取 `Info.plist` 文件
- 解析 `CFBundleShortVersionString` 获取版本号
- 解析 `CFBundleIconFile` 获取图标路径

### Windows 实现
- 使用 PowerShell 的 `Get-ItemProperty` 读取注册表
- 扫描 64位和32位注册表项
- 读取 `DisplayName`、`InstallLocation`、`DisplayVersion` 和 `DisplayIcon` 字段
- 使用 `ConvertTo-Json` 输出 JSON 格式

## 更新日志

- **v5.x.x** - 首次发布 `scanInstalledApps()` 函数
  - 支持 Windows 和 macOS 平台
  - 返回应用名称、路径、版本和图标信息
