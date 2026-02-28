# getRegistryInfo() 函数使用说明

## 功能描述

`getRegistryInfo()` 函数用于根据注册表名称（regname）查询 Windows 注册表中已安装应用程序的详细信息，包括启动路径、安装目录、图标路径和版本号。

该函数支持单个或多个注册表名称的批量查询，适用于需要快速获取特定应用程序信息的场景。

**平台支持**: 仅支持 Windows 系统

## 返回值

返回一个 Promise，resolve 为包含应用程序信息的数组：

```typescript
Promise<RegistryInfoData[]>

interface RegistryInfoData {
  regname: string;        // 注册表名称
  path: string | null;    // 启动路径（从 DisplayIcon 解析出的可执行文件路径）
  installLocation: string | null; // 注册表原始 InstallLocation
  icon: string | null;    // 图标路径（未找到时为 null）
  version: string | null; // 版本号（未找到时为 null）
}
```

**返回数据说明**:
- `regname`: 查询的注册表名称
- `path`: 应用程序启动路径（从 `DisplayIcon` 解析并校验后的可执行文件路径）
- `installLocation`: 应用程序注册表安装目录（原始 `InstallLocation`）
- `icon`: 应用程序的图标文件路径（DisplayIcon）
- `version`: 应用程序的版本号（DisplayVersion）
- 如果查询失败或应用程序不存在，对应字段返回 `null`

## 使用方法

### 1. 使用 Promise

```javascript
const si = require('systeminformation');

// 单个注册表名称查询
si.getRegistryInfo('BZDisplayServiceCaster')
  .then(data => {
    console.log('Registry Info:', data);
    // 输出: [{regname: 'BZDisplayServiceCaster', path: '...', icon: '...', version: '...'}]
  })
  .catch(error => {
    console.error('Error:', error);
  });

// 多个注册表名称批量查询
si.getRegistryInfo(['BZDisplayServiceCaster', 'NearHub', 'AnotherApp'])
  .then(data => {
    console.log('Registry Info:', data);
    // 输出: [{regname: 'BZDisplayServiceCaster', ...}, {regname: 'NearHub', ...}, ...]
  })
  .catch(error => {
    console.error('Error:', error);
  });
```

### 2. 使用 async/await

```javascript
const si = require('systeminformation');

async function getAppInfo() {
  try {
    // 单个查询
    const singleResult = await si.getRegistryInfo('BZDisplayServiceCaster');
    console.log('Single Result:', singleResult);

    // 批量查询
    const multipleResults = await si.getRegistryInfo([
      'BZDisplayServiceCaster',
      'NearHub',
      'AnotherApp'
    ]);
    console.log('Multiple Results:', multipleResults);

    // 处理查询结果
    multipleResults.forEach(app => {
      if (app.path !== null) {
        console.log(`${app.regname} is installed at: ${app.path}`);
      } else {
        console.log(`${app.regname} is not found`);
      }
    });
  } catch (error) {
    console.error('Error:', error);
  }
}

getAppInfo();
```

### 3. 使用回调函数

```javascript
const si = require('systeminformation');

// 单个查询
si.getRegistryInfo('BZDisplayServiceCaster', (data) => {
  console.log('Registry Info:', data);
});

// 批量查询
si.getRegistryInfo(['BZDisplayServiceCaster', 'NearHub'], (data) => {
  console.log('Registry Info:', data);
});
```

## 示例输出

### 成功查询（Windows 系统）

```json
[
  {
    "regname": "BZDisplayServiceCaster",
    "path": "C:\\Program Files\\BZDisplayService\\WindowsServer.exe",
    "installLocation": "C:\\Program Files\\BZDisplayService",
    "icon": "C:\\Program Files\\BZDisplayService\\icon.ico",
    "version": "1.2.3"
  },
  {
    "regname": "NearHub",
    "path": "C:\\Program Files\\NearHub\\app.exe",
    "installLocation": "C:\\Program Files\\NearHub",
    "icon": null,
    "version": "2.0.1"
  }
]
```

### 应用程序未找到

```json
[
  {
    "regname": "NonExistentApp",
    "path": null,
    "installLocation": null,
    "icon": null,
    "version": null
  }
]
```

### 混合结果（部分找到，部分未找到）

```json
[
  {
    "regname": "BZDisplayServiceCaster",
    "path": "C:\\Program Files\\BZDisplayService\\WindowsServer.exe",
    "installLocation": "C:\\Program Files\\BZDisplayService",
    "icon": "C:\\Program Files\\BZDisplayService\\icon.ico",
    "version": "1.2.3"
  },
  {
    "regname": "NonExistentApp",
    "path": null,
    "installLocation": null,
    "icon": null,
    "version": null
  },
  {
    "regname": "NearHub",
    "path": "C:\\Program Files\\NearHub\\app.exe",
    "installLocation": "C:\\Program Files\\NearHub",
    "icon": null,
    "version": "2.0.1"
  }
]
```

## 使用场景

1. **应用程序检测**: 检查特定应用程序是否已安装
2. **版本验证**: 获取已安装应用程序的版本号，用于版本兼容性检查
3. **路径查找**: 获取应用程序启动路径与安装目录，用于启动或配置
4. **图标提取**: 获取应用程序的图标路径，用于 UI 显示
5. **批量检测**: 一次性检查多个应用程序的安装状态
6. **依赖检查**: 在安装前检查依赖应用程序是否存在

## 注意事项

1. **平台限制**: 此函数仅在 Windows 系统上有效，在其他平台（macOS、Linux）上会返回 null 值
2. **注册表名称**: 需要使用准确的注册表名称（通常是应用程序的唯一标识符）
3. **权限要求**: 需要有读取注册表的权限
4. **查询范围**: 函数会自动搜索以下注册表路径：
   - `HKLM:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\`
   - `HKLM:\SOFTWARE\WOW6432Node\Microsoft\Windows\CurrentVersion\Uninstall\`
   - `HKCU:\SOFTWARE\Microsoft\Windows\CurrentVersion\Uninstall\`
5. **性能考虑**: 批量查询时，建议一次查询不超过 20 个应用程序
6. **错误处理**: 查询失败时不会抛出异常，而是返回 null 值，便于批量处理
7. **异步执行**: 函数是异步的，使用 Promise 或 callback 处理结果

## 相关函数

- `scanInstalledApps()`: 扫描所有已安装的应用程序
- `system()`: 获取系统信息
- `osInfo()`: 获取操作系统信息
- `versions()`: 获取已安装软件的版本信息

## 实际应用示例

### 示例 1: 检查应用程序是否安装

```javascript
const si = require('systeminformation');

async function checkAppInstalled(appName) {
  const result = await si.getRegistryInfo(appName);
  const app = result[0];

  if (app.path !== null) {
    console.log(`✓ ${appName} is installed`);
    console.log(`  Path: ${app.path}`);
    console.log(`  Version: ${app.version}`);
    return true;
  } else {
    console.log(`✗ ${appName} is not installed`);
    return false;
  }
}

checkAppInstalled('BZDisplayServiceCaster');
```

### 示例 2: 批量检查依赖应用程序

```javascript
const si = require('systeminformation');

async function checkDependencies(requiredApps) {
  const results = await si.getRegistryInfo(requiredApps);

  const installed = [];
  const missing = [];

  results.forEach(app => {
    if (app.path !== null) {
      installed.push(app.regname);
    } else {
      missing.push(app.regname);
    }
  });

  console.log('Installed:', installed);
  console.log('Missing:', missing);

  return missing.length === 0;
}

const dependencies = ['BZDisplayServiceCaster', 'NearHub', 'AnotherApp'];
checkDependencies(dependencies).then(allInstalled => {
  if (allInstalled) {
    console.log('All dependencies are installed!');
  } else {
    console.log('Some dependencies are missing!');
  }
});
```

### 示例 3: 获取应用程序详细信息

```javascript
const si = require('systeminformation');

async function getAppDetails(appName) {
  const result = await si.getRegistryInfo(appName);
  const app = result[0];

  if (app.path === null) {
    return null;
  }

  return {
    name: app.regname,
    installPath: app.installLocation,
    iconPath: app.icon,
    version: app.version,
    isInstalled: true
  };
}

getAppDetails('BZDisplayServiceCaster').then(details => {
  if (details) {
    console.log('App Details:', details);
  } else {
    console.log('App not found');
  }
});
```

## 设计决策

### 为什么要特殊处理 path 和 icon 字段？

Windows 注册表中的应用程序信息存在以下问题：

#### 1. path 字段语义

**问题现象**：
`InstallLocation` 在很多应用里为空、过时或不准确，不适合作为启动依据。

**解决方案**：
将 `path` 定义为启动路径（可执行文件路径）；并单独保留 `installLocation`。

**示例**：
```
DisplayIcon: "C:\Program Files (x86)\Bozee\BZDisplayService\WindowsServer.exe"
提取为 path: "C:\Program Files (x86)\Bozee\BZDisplayService\WindowsServer.exe"
```

**原理**：
- `DisplayIcon` 通常包含可执行文件路径（可能带 `,0` 索引）
- 解析并校验后可得到更可靠的启动路径
- 安装目录信息通过 `installLocation` 单独提供

#### 2. icon 字段问题

**问题现象**：
注册表中的 `DisplayIcon` 字段经常指向可执行文件（.exe）、动态链接库（.dll）或其他非图标文件。

**解决方案**：
只返回真正的图标文件（.ico），其他类型返回 null。

**原因**：
- **语义正确性**：icon 字段应该表示图标文件，而不是可执行文件
- **使用场景**：调用者期望获取可以直接显示的图标文件路径
- **避免混淆**：.exe 文件虽然包含图标资源，但不是图标文件本身

**对比**：
```javascript
// 错误的做法（直接返回注册表原始值）
{
  icon: "C:\\Program Files\\App\\app.exe"  // 这是可执行文件，不是图标
}

// 正确的做法（只返回 .ico 文件）
{
  icon: null  // 如果没有 .ico 文件，返回 null
}
```

### 与 scanInstalledApps 的一致性

`scanInstalledApps()` 函数也应用了相同的处理逻辑，确保两个函数返回的数据格式和语义一致。

## 技术细节

### 查询机制

函数使用 PowerShell 脚本查询 Windows 注册表，搜索以下三个位置：
1. 64位应用程序注册表
2. 32位应用程序注册表（在64位系统上）
3. 当前用户注册表

### 性能特性

- 异步执行，不阻塞主线程
- 批量查询时，所有查询在一次 PowerShell 调用中完成
- 平均查询时间：单个应用 < 100ms，批量查询 < 500ms

### 错误处理策略

- 查询失败时返回 null 值，不中断其他查询
- PowerShell 执行失败时，所有查询返回 null
- 不抛出异常，便于批量处理和错误恢复

## 更新日志

- **v1.0.0**: 初始版本，支持单个和批量查询
