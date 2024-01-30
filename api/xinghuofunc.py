from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import HTMLResponse
import json
from typing import List

app = FastAPI()

class SparkRequest:
    def __init__(self, app_id: str, api_secret: str, api_key: str, uid: str, spark_result: str = ''):
        self.app_id = app_id
        self.api_secret = api_secret
        self.api_key = api_key
        self.uid = uid
        self.spark_result = spark_result

connected_clients = {}

async def process_message(socket: WebSocket, request_obj: SparkRequest, input_val: str):
    params = {
        "header": {
            "app_id": request_obj.app_id,
            "uid": request_obj.uid
        },
        "parameter": {
            "chat": {
                "domain": "generalv2",
                "temperature": 0.5,
                "max_tokens": 1024,
            }
        },
        "payload": {
            "message": {
                "text": [
                    {"role": "user", "content": "你是谁"},
                    {"role": "assistant", "content": "我是AI助手"},
                    {"role": "user", "content": input_val},
                ]
            }
        }
    }

    await socket.send_json(params)

    while True:
        try:
            message = await socket.receive_json()
            request_obj.spark_result += message['payload']['choices']['text'][0]['content']

            if message['header']['code'] != 0:
                await socket.close()
            if message['header']['code'] == 0 and message['payload']['choices']['text'] and message['header']['status'] == 2:
                request_obj.spark_result += message['payload']['choices']['text'][0]['content']
                await socket.close()
        except WebSocketDisconnect:
            break

def include_spark_gptfunc_router(app: FastAPI):
    @app.websocket("/spark_gpt/")
    async def spark_gpt(websocket: WebSocket):
        await websocket.accept()
        request_obj = SparkRequest(
            app_id='33fafcb3',
            api_secret='MWRjN2Y2ZTI1ZTU2NGRkZjU5MWYzMDRk',
            api_key='581688d8136cb60418502f065ff0facd',
            uid='MakerSNS_AI'
        )

        connected_clients[websocket] = request_obj

        try:
            while True:
                data = await websocket.receive_text()
                await process_message(websocket, request_obj, data)
        except WebSocketDisconnect:
            del connected_clients[websocket]
