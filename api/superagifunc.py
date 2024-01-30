from fastapi import FastAPI, HTTPException, Response
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import requests

class SuperagiRequest(BaseModel):
    system_prompt: str
    messages: list
    max_tokens: int
    temperature: float
    top_p: float
    repetition_penalty: float
    best_of: int
    top_k: int
    stream: bool

def include_superagi_gptfunc_router(app: FastAPI):
    @app.post('/superagi/', tags=["Superagi AI 调用"])
    async def call_superagi(request: SuperagiRequest):
        url = 'https://api.superagi.com/v1/chat/65437cbf227a4018516ad1ce'
        headers = {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer 0e1d4431b38df08e'
        }

        data = {
            "system_prompt": request.system_prompt,
            "messages": request.messages,
            "max_tokens": request.max_tokens,
            "temperature": request.temperature,
            "top_p": request.top_p,
            "repetition_penalty": request.repetition_penalty,
            "best_of": request.best_of,
            "top_k": request.top_k,
            "stream": request.stream
        }

        def stream_response():
            try:
                with requests.post(url, headers=headers, json=data, stream=True) as response:
                    response.encoding = 'utf-8'  # 设置正确的字符编码

                    for line in response.iter_lines(decode_unicode=True):
                        # print(line)
                        if line.startswith('data: '):
                            data_line = line[6:]
                            if data_line.startswith('[DONE]'):
                                break
                            else:
                                json_data = json.loads(data_line)
                                if 'choices' in json_data and json_data['choices']:
                                    text_value = json_data['choices'][0].get('text')
                                    if text_value:
                                        for char in text_value:
                                            yield char  # 逐字返回
            except Exception as e:
                yield json.dumps({"error": str(e)}) + "\n"

        return StreamingResponse(stream_response(), media_type="application/json; charset=utf-8")
