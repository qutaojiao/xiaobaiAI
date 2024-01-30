from fastapi import FastAPI, HTTPException
from fastapi.responses import StreamingResponse, JSONResponse

from pydantic import BaseModel
from typing import List, Dict
from zhipuai import ZhipuAI
import json

# 定义接收的消息格式
class Message(BaseModel):
    role: str
    content: str

class ZhipuRequest(BaseModel):
    key: str
    messages: List[Message]
    model: str

class ImageRequest(BaseModel):
    model: str
    prompt: str



    
def include_zhipugptfunc_router(app: FastAPI):
    @app.post('/zhipugpt/', tags=["Zhipu AI 调用"])
    async def call_zhipu_gpt(request: ZhipuRequest):
        client = ZhipuAI(api_key=request.key)

        async def stream_response():
            try:
                response = client.chat.completions.create(
                    model=request.model,
                    messages=[message.dict() for message in request.messages],  # 确保消息是可序列化的
                    stream=True
                )

                # 逐个发送流式响应
                for chunk in response:
                    yield json.dumps(chunk.choices[0].delta.dict()) + "\n"
            except Exception as e:
                # 在流式响应中发送错误信息
                yield json.dumps({"error": str(e)})

        return StreamingResponse(stream_response(), media_type="application/json")

    @app.post('/zp_generate_image/', tags=["Zhipu AI 图像生成"])
    async def generate_image(request: ImageRequest):
        client = ZhipuAI(api_key="6c50c80bda35680328ba01ff0a3291f1.m3ZjxvEix8PBHOUT")  # 使用您的 APIKey

        try:
            response = client.images.generations(
                model=request.model,
                prompt=request.prompt
            )
            # 假设响应中包含图像URL
            image_url = response.data[0].url if response.data else None
            return JSONResponse(content={"url": image_url})
        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)
