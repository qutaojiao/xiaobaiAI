from flask import Flask, send_from_directory

app = Flask(__name__, static_url_path='', static_folder='assets')

def include_frontend_router(app: Flask):
    # 静态文件服务
    @app.route('/assets/<path:path>')
    def serve_assets(path):
        return send_from_directory('assets', path)

    # 首页
    @app.route('/')
    def index():
        return send_from_directory('assets', 'index.html')

    # 思维导图页面
    @app.route('/mindmap.html')
    def mindmap():
        return send_from_directory('assets', 'mindmap.html')

    # 辅助函数：发送文件
    def send_file(path):
        try:
            with open(path, 'rb') as f:
                return f.read()
        except FileNotFoundError:
            return '404 page not found', 404
