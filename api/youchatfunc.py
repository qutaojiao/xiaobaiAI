# #无法用

# from fastapi import FastAPI
# from fastapi.responses import StreamingResponse
# from pydantic import BaseModel
# from typing import List, Dict
# import json
# import uuid
# import aiohttp,asyncio

# app = FastAPI()

# class ChatMessage(BaseModel):
#     question: str
#     answer: str

# class YouGPTRequest(BaseModel):
#     chat: List[ChatMessage]
#     chatId: str
#     domain: str
#     q: str
#     queryTraceId: str

# async def fetch_sse(url: str, headers: Dict):
#     try:
#         async with aiohttp.ClientSession(connector=aiohttp.TCPConnector(ssl=False)) as session:
#             async with session.get(url, headers=headers) as response:
#                 async for line in response.content:
#                     yield line
#     except asyncio.CancelledError:
#         # 处理任务取消的情况
#         pass
#     except Exception as e:
#         # 处理其他异常
#         print(f"Exception occurred: {e}")


# def create_streaming_response(url: str, headers: Dict):
#     return StreamingResponse(fetch_sse(url, headers), media_type="text/event-stream")



# # YouGPT的请求路由
# def include_yougptfunc_router(app: FastAPI):
#     @app.post("/yougpt/",tags=["YouChat API"])
#     async def call_you_gpt(request: YouGPTRequest):
#         """
#         从YouGPT获取聊天结果，存在问题，不可用
#         """
#         chatId = request.chatId 
#         domain = request.domain
#         query = request.q
#         queryTraceId = request.queryTraceId

#         # 将 ChatMessage 对象列表转换为字典列表
#         chat_messages = [message.dict() for message in request.chat]

#         # 构建请求的URL，确保 chat 参数是JSON序列化的字符串
#         url = f"https://you.com/api/streamingSearch?chat={json.dumps(chat_messages)}&chatId={chatId}&domain={domain}&q={query}&queryTraceId={queryTraceId}"
        
#         headers = {
#             "accept": "text/event-stream",
#         }

#         return create_streaming_response(url, headers)

#     @app.get("/generate_chatid/",tags=["YouChat API"])
#     def generate_chat_id():
#         """
#         生成聊天ID，存在问题，不可用
#         """
#         return {"chatId": str(uuid.uuid4())}