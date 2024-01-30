# xiaobaiAI
<img width="1507" alt="image" src="https://github.com/qutaojiao/xiaobaiAI/assets/19362820/9dff3357-614b-46d6-b48a-6293fa0c063e">
<img width="1509" alt="image" src="https://github.com/qutaojiao/xiaobaiAI/assets/19362820/adcb59e7-d43f-4b98-9c40-a9e86402b980">
<img width="1510" alt="image" src="https://github.com/qutaojiao/xiaobaiAI/assets/19362820/22c24f17-113b-4326-a006-b132d5aaa506">
<img width="1508" alt="image" src="https://github.com/qutaojiao/xiaobaiAI/assets/19362820/ffe9d21b-9bac-484f-9150-1211df56a5cb">
<img width="560" alt="image" src="https://github.com/qutaojiao/xiaobaiAI/assets/19362820/46595c69-4226-447d-ad16-bf7349abeb92">


小白AI是一个拥有Markdown编辑器的AI工具，支持潘多拉Pandora自搭建的环境，OpenAI官方，讯飞星火，清华智谱，Google Gemini，SuperAGI，自定义等多种接口接入方式。

## 已支持的功能：
1. 支持上传doc、pdf、ppt、txt等文档文件进行向量相似度查询，并通过大模型进行分析和处理。
2. 支持图像生成、图像识别（基于大模型接口，非本地）。
3. 支持角色自定义，支持上下文消息。
4. 所有数据存储都是在本地浏览器数据库中。

## 待完善功能：
1. 编辑器内容转为PDF进行下载。
2. 发布接口，主要是WordPress发布。
3. 界面UI优化。
4. 历史记录修改待完善。
5. 配置界面待优化。
6. 讯飞星火的接口秘钥填写待完善，目前需要自行在frontend/js/stream-response.js文件中添加秘钥，搜索“星火”查找所在的行。

**体验地址：** 待云端部署

# 部署方式：

## 本地部署（推荐）
```bash
git clone https://github.com/qutaojiao/xiaobaiAI
cd xiaobaiAI
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

## Docker部署
```bash
docker-compose up -d
```

**访问地址：** 127.0.0.1:8001

## 添加模型接口和秘钥
访问：127.0.0.1:8001/gptconfig.html



--------------------------------------------------

# xiaobaiAI

xiaobaiAI is an AI tool with a built-in Markdown editor that supports various integration methods, including self-built environments like Pandora, official OpenAI, Xunfei Starfire, Tsinghua Zhipu, Google Gemini, SuperAGI, and custom interfaces.

## Features Supported:
1. Supports uploading document files (doc, pdf, ppt, txt) for vector similarity queries, analyzed and processed using large models.
2. Supports image generation and image recognition (based on large model interfaces, not local).
3. Supports custom roles and contextual messages.
4. All data storage is in the local browser database.

## Features to be Improved:
1. Convert editor content to PDF for download.
2. Publishing interfaces, mainly for WordPress.
3. UI optimization.
4. History record modifications to be improved.
5. Configuration interface to be optimized.

**Experience Address:** To be deployed on the cloud.

# Deployment Methods:

## Local Deployment (Recommend)
```bash
git clone https://github.com/qutaojiao/xiaobaiAI
cd xiaobaiAI
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001
```

## Docker Deployment
```bash
docker-compose up -d
```

**Access Address:** 127.0.0.1:8001

