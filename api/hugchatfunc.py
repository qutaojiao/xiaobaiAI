from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from hugchat import hugchat
from hugchat.login import Login

class LoginRequest(BaseModel):
    email: str
    password: str

class Cookies(BaseModel):
    cookies: dict

class ConversationResponse(BaseModel):
    conversation_id: str

class ChatRequest(BaseModel):
    conversation_id: str
    text: str
    retry_count: int = 5
    web_search: bool = False
    stream: bool = False  # 添加此行以支持流式响应选项

class ChatResponse(BaseModel):
    text_response: str
    stream_responses: list = []
    web_search_sources: list = []

def include_hugchatfunc_router(app: FastAPI):
    @app.post("/login/", response_model=Cookies,tags=["HugChat API"])
    async def login(login_request: LoginRequest):
        sign = Login(login_request.email, login_request.password)
        try:
            cookies = sign.login()
            return {"cookies": cookies.get_dict()}
        except Exception as e:
            raise HTTPException(status_code=500, detail=str(e))

    @app.post("/get_chatbot_conversation/", response_model=ConversationResponse,tags=["HugChat API"])
    async def get_chatbot_conversation(cookies: Cookies):
        chatbot = hugchat.ChatBot(cookies=cookies.cookies)
        conversation_id = str(chatbot.new_conversation())
        return {"conversation_id": conversation_id}

    @app.post("/chat/", response_model=ChatResponse,tags=["HugChat API"])
    async def chat(chat_request: ChatRequest, cookies: Cookies):
        """
        每次只能使用新的对话，不支持重复对话
        """
        chatbot = hugchat.ChatBot(cookies=cookies.cookies)

        # chatbot.change_conversation(chat_request.conversation_id)

        # 获取对话列表
        conversation_list = chatbot.get_conversation_list()

        print("conversation_list:",conversation_list)
        print("conversation_list:",conversation_list[0])

        # id = chatbot.new_conversation()
        chatbot.change_conversation(conversation_list[0])

        if chat_request.web_search:
            query_result = chatbot.query(
                chat_request.text,
                retry_count=chat_request.retry_count,
                web_search=True
            )
        else:
            query_result = chatbot.query(
                chat_request.text,
                retry_count=chat_request.retry_count
            )

        text_response = query_result["text"]

        if chat_request.stream:
            stream_responses = [resp for resp in chatbot.query(chat_request.text, stream=True)]
        else:
            stream_responses = []

        web_search_sources = []
        if "web_search_sources" in query_result:
            for source in query_result.web_search_sources:
                web_search_sources.append({
                    "link": source.link,
                    "title": source.title,
                    "hostname": source.hostname
                })

        return {
            "text_response": text_response,
            "stream_responses": stream_responses,
            "web_search_sources": web_search_sources
        }
