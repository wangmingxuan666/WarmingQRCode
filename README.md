# Warming QR 网址二维码生成器

一个可直接部署的静态二维码产品工具：输入网址，生成可被手机扫码识别并跳转的二维码。页面支持样式自定义、PNG 下载、复制图片、复制链接、分享和最近生成记录。

本项目完全免费。如果你觉得有帮助，欢迎给仓库点一个 Star：

[https://github.com/wangmingxuan666/WarmingQRCode](https://github.com/wangmingxuan666/WarmingQRCode)

线上地址：

[https://wangmingxuan666.github.io/WarmingQRCode/](https://wangmingxuan666.github.io/WarmingQRCode/)

## 功能

- 输入任意合法网址生成二维码
- 自动补全未填写协议头的链接，例如 `baidu.com` 会补成 `https://baidu.com`
- 支持域名、IP 和 `localhost`
- 支持二维码名称，用于导出图片下方标签
- 支持尺寸、前景色、背景色、容错级别设置
- 支持配色预设
- 支持下载 PNG、复制二维码图片、复制目标链接和系统分享
- 支持最近 8 条生成记录，本地存储在浏览器中
- 支持空输入和非法网址提示
- 二维码生成逻辑在浏览器本地完成，不上传链接

## 技术栈

- HTML
- CSS
- JavaScript
- [qrcodejs](https://davidshimjs.github.io/qrcodejs/) 本地浏览器构建文件
- GitHub Pages 静态部署
- `http-server` 本地启动

## 环境要求

- Node.js 18+ 或更高版本
- npm 9+ 或更高版本

## 安装依赖

```bash
npm install
```

## 本地启动

```bash
npm run start
```

如果不想自动打开浏览器：

```bash
npm run serve
```

启动后访问：

[http://localhost:3000](http://localhost:3000)

## 使用方法

1. 打开网页
2. 输入网址，例如 `https://www.baidu.com`
3. 可选：填写二维码名称、调整颜色、尺寸和容错级别
4. 点击“生成二维码”
5. 使用手机扫码验证跳转
6. 按需下载 PNG、复制图片或复制链接

## 验收测试

建议按下面步骤测试：

1. 启动本地服务：`npm run serve`
2. 打开 [http://localhost:3000](http://localhost:3000)
3. 输入 `https://www.baidu.com`
4. 点击“生成二维码”
5. 确认右侧出现二维码，状态显示“二维码已生成，可以扫码访问。”
6. 用手机扫码，确认能够打开百度
7. 点击“下载 PNG”，确认生成图片文件
8. 点击“复制链接”，确认剪贴板得到目标网址
9. 刷新页面，确认最近生成记录仍然存在
10. 再测试异常场景：
    - 空输入应提示“请输入网址后再生成二维码。”
    - 输入 `abc` 应提示网址不完整

## 项目结构

```text
.
├── .github/
│   └── workflows/
│       └── pages.yml
├── index.html
├── style.css
├── script.js
├── vendor/
│   └── qrcode.min.js
├── package.json
├── package-lock.json
└── README.md
```

## 部署说明

项目已配置 GitHub Pages workflow。推送到 `main` 分支后会自动发布静态页面。

也可以使用 `gh-pages` 分支作为静态发布分支，当前线上地址为：

[https://wangmingxuan666.github.io/WarmingQRCode/](https://wangmingxuan666.github.io/WarmingQRCode/)
