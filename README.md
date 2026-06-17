# 网址二维码生成器

一个简洁现代的本地小工具：输入网址，立即生成可被手机扫码识别并跳转的二维码。

## 功能

- 输入任意合法网址生成二维码
- 自动补全未填写协议头的链接，例如 `baidu.com` 会补成 `https://baidu.com`
- 支持空输入和非法网址提示
- 支持下载二维码 PNG 图片
- 可直接本地运行

## 技术栈

- HTML
- CSS
- JavaScript
- [qrcodejs](https://davidshimjs.github.io/qrcodejs/) 本地浏览器构建文件
- `http-server` 用于本地启动静态网站

## 环境要求

- Node.js 18+ 或更高版本
- npm 9+ 或更高版本

## 安装依赖

在项目目录执行：

```bash
npm install
```

## 启动项目

```bash
npm run start
```

如果你不想自动打开浏览器，也可以执行：

```bash
npm run serve
```

启动后默认访问：

[http://localhost:3000](http://localhost:3000)

## 使用方法

1. 打开网页
2. 在输入框中输入网址，例如：`https://www.baidu.com`
3. 点击“生成二维码”
4. 页面右侧会显示二维码
5. 用手机扫码后，即可跳转到对应网址
6. 如有需要，可点击“下载 PNG”保存二维码图片

## 验收测试

建议按下面步骤测试：

1. 启动本地服务：`npm run start`
2. 打开 [http://localhost:3000](http://localhost:3000)
3. 输入 `https://www.baidu.com`
4. 点击“生成二维码”
5. 使用手机扫一扫二维码
6. 确认手机浏览器能够正常打开百度页面
7. 再测试以下异常场景：
   - 输入为空，应出现提示“请输入网址后再生成二维码”
   - 输入非法内容，例如 `abc`，应出现合法性提示

## 项目结构

```text
.
├── index.html
├── style.css
├── script.js
├── vendor/
│   └── qrcode.min.js
├── package.json
└── README.md
```

## 说明

本项目是静态网站，逻辑都在前端完成。二维码内容就是用户输入的网址本身，所以只要网址可访问，手机扫码后就能正常跳转。二维码库已放在 `vendor/qrcode.min.js`，启动后不依赖外部 CDN。
