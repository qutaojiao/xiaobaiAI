# build.py

from PyInstaller.__main__ import run

if __name__ == '__main__':
    opts = ['app.py', '--onefile', '--windowed']
    run(opts)
