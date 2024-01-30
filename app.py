from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from fastapi.responses import FileResponse
from fastapi.responses import PlainTextResponse
import uvicorn


app = FastAPI()

# 导入后端接口模块的路由
from api.docfunc import include_docfunc_router
from api.gptfunc import include_gptfunc_router
from api.localfilefunc import include_localfilefunc_router
from api.zhipufunc import include_zhipugptfunc_router
from api.xinghuofunc import include_spark_gptfunc_router
# from api.youchatfunc import include_yougptfunc_router
from api.aippt import include_aipptfunc_router
from api.hugchatfunc import include_hugchatfunc_router
from api.superagifunc import include_superagi_gptfunc_router

# 包含后端接口模块的路由
include_docfunc_router(app)
include_gptfunc_router(app)
include_localfilefunc_router(app)
include_zhipugptfunc_router(app)
include_spark_gptfunc_router(app)
# include_yougptfunc_router(app)
include_aipptfunc_router(app)
include_hugchatfunc_router(app)
include_superagi_gptfunc_router(app)


# 添加前端静态文件路由
app.mount("/", StaticFiles(directory="frontend", html=True), name="frontend")

# 前端静态文件服务
@app.get("/frontend/{path:path}")
async def serve_assets(path: str):
    return FileResponse(path)

# 首页
# @app.get("/")
# async def index():
#     return FileResponse("frontend/index.html")

# 思维导图页面
@app.get("/mindmap.html")
async def mindmap():
    return FileResponse("frontend/mindmap.html")

# 辅助函数：发送文件
def send_file(path):
    try:
        with open(path, 'rb') as f:
            return PlainTextResponse(content=f.read())
    except FileNotFoundError:
        return PlainTextResponse(content='404 page not found', status_code=404)

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

