from fastapi import FastAPI, Request
from pydantic import BaseModel
import requests
import json

app = FastAPI()

api_key = "fk-g1F1A04JLJUT11Iur8QTFRpPOUNOZvvSeLOqRb3jZT8"

class ChatContextPool:
    def __init__(self):
        self.pool = {}

    def add_message(self, user_id, role, content):
        if user_id not in self.pool:
            self.pool[user_id] = []

        self.pool[user_id].append({"role": role, "content": content})

    def get_context(self, user_id):
        return self.pool.get(user_id, [])

    def request_chat_gpt(self, user_id, user_message, api_key, temperature=0.7):
        self.add_message(user_id, "user", user_message)

        headers = {
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json"
        }

        data = {
            "model": "gpt-3.5-turbo",
            "messages": self.get_context(user_id),
            "temperature": temperature
        }

        print("提问：", user_message)

        response = requests.post(
            "http://127.0.0.1:8181/dhwgdeveRW322FS/v1/chat/completions",
            headers=headers,
            data=json.dumps(data)
        )

        result = response.json()
        try:
            generated_text = result["choices"][0]["message"]["content"]
            print("回答：", generated_text)
            self.add_message(user_id, "assistant", generated_text)
        except Exception as e:
            print("error:", e)

        return generated_text


chat_pool = ChatContextPool()

class CatalogRequest(BaseModel):
    topic: str
    user_name: str

class DetailRequest(BaseModel):
    topic: str
    user_name: str

class UpdateSlidesRequest(BaseModel):
    prompt: str
    user_name: str
    ppt_xml: str

def include_aipptfunc_router(app: FastAPI):

    # 获取生成的ppt大纲
    @app.post('/get_catalog')
    async def get_catalog(request: CatalogRequest):
        core_prompt = request.topic
        user_name = request.user_name

        prompt = f"""
        ⽤⼾: ⽣成介绍 {core_prompt} 的⼤纲,汇报人叫做{user_name}， 仿照以下格式， 不要带上任何注释性⽂字
        <slides>
        <section class='封面'>
            <!--第一张幻灯片-->
            <h1>《论语》</h1>
            <p>汇报人：</p>
        </section>
        <section class='目录页'>
            <!--只用给出目录项-->
            <h1> 目录 </h1>
            <h2> 目录项1 </h2>
            <h2> 目录项2 </h2>
            <h2> 目录项3 </h2>
        </section>
        <section class='内容'>
            <!--只用给出一个标题和一个内容概要即可-->
            <hl> 标题 </hl>
            <p>内容概要</p>
        </section>
        <!--更多的幻灯片・・・-->
        </slides>
        """

        prompt = prompt.replace("{{topic}}", core_prompt)
        prompt = prompt.replace("{{user_name}}", user_name)

        generated_text = chat_pool.request_chat_gpt(user_name, prompt, api_key)

        chat_pool.add_message(user_name, "assistant", generated_text)

        print('generated_text', generated_text)

        return {
            'data': generated_text
        }

    # 获取生成的ppt详细页
    @app.post('/get_detail')
    async def get_detail(request: DetailRequest):
        core_prompt = request.topic
        user_name = request.user_name

        prompt = f"{core_prompt}\n根据以上内容，仿照下列格式，不要带上任何注释⽂字\n<section class='内容'>\n<!--给出一个标题和2-3点内容(内容应较详细)即可-->\n<h1> 标题 </h1>\n<p> 第一点...</p>\n<p> 第二点...</p>\n<p> 第三点...</p>\n</section>"

        generated_text = chat_pool.request_chat_gpt(user_name, prompt, api_key)
        return generated_text

    # 输入：用户对ppt的编辑指令和ppt的xml字符串
    # 返回：更新后的ppt的xml字符串
    @app.post('/update_slides')
    async def update_slides(request: Request, user_name: str, prompt: str, ppt_xml: str):
        final_prompt = '''
        你将接收用户的指令去处理一个ppt，ppt的表示方式是xml格式的字符串。
        用户的指令是：{0}。
        要处理的ppt是：{1}。
        注意：你只用返回处理后的xml格式字符串，且不要带任何注释，谢谢！
        说明：用双括号{2}括起来的文本表示模板信息，是你一定要替换的部分'''.format(prompt, ppt_xml, '{{}}')
    
        final_question = '''
        给出ppt的表⽰，
        {0}
        ，不要带任何注释性⽂字,保持标签属性不变.
        {1}
        '''.format(prompt, ppt_xml)
    
        generated_text = chat_pool.request_chat_gpt(user_name, final_question, api_key)
    
        chat_pool.add_message(user_name, "assistant", generated_text)
    
        return {
            'code': 200,
            'data': {
                "xml_ppt": generated_text,
            },
            'msg': 'ok'
        }
