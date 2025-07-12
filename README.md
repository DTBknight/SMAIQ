# Car Price Calculator - Model Search Function

## Project structure

```
├── V2.html              # 前端页面
├── server.js            # 后端服务器
├── package.json         # 项目依赖
└── README.md           # 项目说明
```

## 安装和运行

### 1. 安装依赖

```bash
npm install
```

### 2. 启动后端服务

```bash
npm start
```

或者开发模式（自动重启）：
```bash
npm run dev
```

### 3. 访问前端页面

直接在浏览器中打开 `V2.html` 文件，或者使用本地服务器：

```bash
# 使用Python
python -m http.server 8080

# 使用Node.js
npx http-server -p 8080
```

然后访问 `http://localhost:8080/V2.html`

## 功能说明

### 车型搜索功能

1. **实时搜索**：在车型名称输入框中输入2个字符以上时，自动搜索相关车型
2. **智能匹配**：支持品牌名、车型名搜索
3. **自动填充**：点击搜索结果可自动填充车型名称和指导价
4. **图片显示**：显示车型图片（如果可用）

### API接口

- `GET /api/search-car?keyword=关键词` - 搜索车型
- `GET /api/search-car-fallback?keyword=关键词` - 备用搜索（静态数据）
- `GET /health` - 健康检查

### 调试方法

1. 查看浏览器控制台错误信息
2. 检查后端服务日志
3. 测试API接口：`curl http://localhost:3000/api/search-car?keyword=特斯拉` 
