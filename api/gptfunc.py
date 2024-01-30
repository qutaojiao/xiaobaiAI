from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from bs4 import BeautifulSoup
from pyppeteer import launch
import re
import tiktoken

class KeywordConfig:
    def __init__(self, keyword, title, tag, class_regex, id):
        self.keyword = keyword
        self.title = title
        self.tag = tag
        self.class_regex = re.compile(class_regex) if class_regex else None
        self.id = id

keyword_configs = [
    KeywordConfig("www.example.com", "h1", "div", "entry-content", "")
    # 更多配置...
]

def include_gptfunc_router(app: FastAPI):
    @app.get('/getPageContent', tags=["URL网页爬取"])
    async def get_page_content(url: str):
        if not url.startswith("http://") and not url.startswith("https://"):
            raise HTTPException(status_code=400, detail="Invalid URL")

        # 启动 Pyppeteer
        browser = await launch(headless=True)
        page = await browser.newPage()

        print("Navigating to URL:", url)
        await page.goto(url)

        # 获取页面源代码
        page_source = await page.content()

        # 关闭浏览器
        await browser.close()

        soup = BeautifulSoup(page_source, 'html.parser')

        selected_config = next((cfg for cfg in keyword_configs if cfg.keyword in url), None)

        title = body = ""
        if selected_config:
            if selected_config.title:
                title_tag = soup.find(selected_config.title)
                title = title_tag.get_text(strip=True) if title_tag else ""

            if selected_config.tag:
                if selected_config.class_regex:
                    body_tags = soup.find_all(selected_config.tag, class_=selected_config.class_regex)
                else:
                    body_tags = soup.find_all(selected_config.tag)

                body = ' '.join(tag.get_text(strip=True) for tag in body_tags)
        else:
            body_tag = soup.find('body')
            body = body_tag.get_text(strip=True) if body_tag else ""

        return JSONResponse(content={"title": title, "body": body})

    @app.post('/count_token', tags=["OpenAI Tokens统计"])
    async def count_token(data: dict):
        text = data.get("text")
        model = data.get("model")

        try:
            enc = tiktoken.encoding_for_model(model)
            token_count = len(enc.encode(text))
            return JSONResponse(content={"tokens": token_count})
        except Exception as e:
            return JSONResponse(content={"error": str(e)}, status_code=500)
