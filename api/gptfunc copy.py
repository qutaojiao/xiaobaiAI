from fastapi import FastAPI, HTTPException
from fastapi.responses import JSONResponse
from bs4 import BeautifulSoup
from selenium.webdriver.chrome.service import Service
from selenium.webdriver.chrome.options import Options
from selenium import webdriver
import re
import tiktoken

# app = FastAPI()

# 定义KeywordConfig类，用于配置关键字规则
class KeywordConfig:
    def __init__(self, keyword, title, tag, class_regex, id):
        self.keyword = keyword
        self.title = title
        self.tag = tag
        self.class_regex = re.compile(class_regex) if class_regex else None
        self.id = id

# 示例关键字配置
keyword_configs = [
    KeywordConfig("www.example.com", "h1", "div", "entry-content", ""),
    # 更多配置...
]

def include_gptfunc_router(app: FastAPI):
    # 获取页面内容的函数
    @app.get('/getPageContent', tags=["URL网页爬取"])
    async def get_page_content(url: str):
        # 验证URL
        if not url.startswith("http://") and not url.startswith("https://"):
            raise HTTPException(status_code=400, detail="Invalid URL")

        # 设置Selenium选项
        # options = Options()
        # options.headless = True  # 如果不需要浏览器界面，可以设置为headless模式

        # 设置ChromeDriver路径
        # service = Service(executable_path='./chromedriver')

        chrome_options = webdriver.ChromeOptions()
        chrome_options.add_argument("--headless")

        chrome_options.add_experimental_option('w3c', True)

        chromedriver_url = "http://localhost:4444/wd/hub"  # 确保这是Chromedriver服务的正确地址
        driver = webdriver.Remote(command_executor=chromedriver_url, options=chrome_options)


        # 初始化WebDriver
        # driver = webdriver.Chrome(service=service, options=options)

        # 访问页面
        print("Navigating to URL:", url)
        driver.get(url)

        # 等待页面加载
        driver.implicitly_wait(2)

        # 获取页面源代码
        page_source = driver.page_source

        # 关闭浏览器
        driver.quit()

        # 使用BeautifulSoup解析HTML内容
        soup = BeautifulSoup(page_source, 'html.parser')

        # 查找匹配的关键字配置
        selected_config = next((cfg for cfg in keyword_configs if cfg.keyword in url), None)

        # 提取标题和正文内容
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
            # 如果没有定义关键字配置，提取<body>里面的内容
            body_tag = soup.find('body')
            body = body_tag.get_text(strip=True) if body_tag else ""

        # 返回提取的内容
        return JSONResponse(content={"title": title, "body": body})

    # 计算OpenAI模型的token数量
    @app.post('/count_token', tags=["OpenAI Tokens统计"])
    async def count_token(data: dict):
        text = data.get("text")
        model = data.get("model")

        # 获取对应模型的编码器
        try:
            enc = tiktoken.encoding_for_model(model)
            token_count = len(enc.encode(text))
            return JSONResponse(content={"tokens": token_count})
        except Exception as e:
            # 处理任何可能的异常
            return JSONResponse(content={"error": str(e)}, status_code=500)
