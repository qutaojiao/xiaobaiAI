# your_launch_script.py

import subprocess
import sys
import time  # 添加这一行
from PyQt5.QtCore import QUrl
from PyQt5.QtWidgets import QApplication, QMainWindow
from PyQt5.QtWebEngineWidgets import QWebEngineView  # 注意修改这一行

class WebAppWindow(QMainWindow):
    def __init__(self):
        super().__init__()

        self.browser = QWebEngineView()
        self.browser.setUrl(QUrl("http://127.0.0.1:8000"))

        self.setCentralWidget(self.browser)
        self.showMaximized()

        self.setWindowTitle("Web App Client")

if __name__ == "__main__":
    app = QApplication(sys.argv)

    # 启动 app 二进制文件
    app_process = subprocess.Popen(["./dist/app"])  # 替换为你实际的应用程序路径

    # 等待 app 启动（根据需要调整等待时间）
    time.sleep(5)

    # 创建并显示 GUI 窗口
    window = WebAppWindow()
    sys.exit(app.exec_())
