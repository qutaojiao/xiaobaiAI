# xiaobaiAI
小白AI是一个拥有markdown编辑器的AI工具，支持潘多拉pandroa自搭建的环境，openai官方，讯飞星火，清华智谱，Google gemini，SuperAGI，自定义等多种接口接入方式。

# 已支持的功能：
1、支持上传doc、pdf、ppt、txt等文档文件进行向量相似度查询，并通过大模型进行分析和处理。
2、支持图像生成、图像识别（基于大模型接口，非本地）
3、支持角色自定义，支持上下文消息
4、所有数据存储都是在本地浏览器数据库中。


# 待完善功能：
1、编辑器内容转为pdf进行下载
2、发布接口，主要是WordPress发布
3、界面UI优化
4、历史记录修改待完善
5、配置界面待优化

体验地址：待云端部署

# 部署方式：
## 本地部署（推进）
git clone https://github.com/qutaojiao/xiaobaiAI
cd xiaobaiAI
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app:app --reload --port 8001

## Docker部署
docker-compose up -d

访问地址：127.0.0.1:8001

