import os
from fastapi import FastAPI, UploadFile, File, HTTPException, Depends
from fastapi.responses import JSONResponse
from fastapi import Query

from typing import Optional

app = FastAPI()

# 获取用户目录
def get_user_directory():
    return os.path.expanduser("~")


def get_project_directory():
    return os.getcwd()

PROJECT_DIRECTORY = get_project_directory()

def is_outside_project_directory(folder_path: str):
    full_path = os.path.abspath(folder_path)
    
    # 确保操作不在项目目录内
    if full_path.startswith(PROJECT_DIRECTORY):
        raise HTTPException(status_code=403, detail="Operations on files within the project directory are forbidden.")
    
    return folder_path

import os
from fastapi.responses import JSONResponse

def get_folder_files(folder_path):
    try:
        files = [
            {
                "name": file,
                "type": "file" if os.path.isfile(os.path.join(folder_path, file)) else "folder",
                "last_modified": os.path.getmtime(os.path.join(folder_path, file))
            }
            for file in os.listdir(folder_path) if not file.startswith('.')
        ]
        sorted_files = sorted(files, key=lambda x: (x["type"], x["last_modified"]), reverse=True)
        return JSONResponse(content={"files": sorted_files})
    except FileNotFoundError:
        return JSONResponse(content={"error": f"Folder '{folder_path}' not found."}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)


def rename_file(folder_path, old_name, new_name):
    try:
        old_path = os.path.join(folder_path, old_name)
        new_path = os.path.join(folder_path, new_name)
        os.rename(old_path, new_path)
        return JSONResponse(content={"message": f"File '{old_name}' renamed to '{new_name}'."})
    except FileNotFoundError:
        return JSONResponse(content={"error": f"File '{old_name}' not found."}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def delete_file(folder_path, filename):
    try:
        file_path = os.path.join(folder_path, filename)
        os.remove(file_path)
        return JSONResponse(content={"message": f"File '{filename}' deleted."})
    except FileNotFoundError:
        return JSONResponse(content={"error": f"File '{filename}' not found."}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def upload_file(folder_path: str =  Query(get_user_directory()), file: UploadFile = File(...)):
    try:
        file_path = os.path.join(folder_path, file.filename)
        with open(file_path, 'wb') as file_obj:
            file_obj.write(file.file.read())
        return JSONResponse(content={"message": f"File '{file.filename}' uploaded."})
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def read_file_content(folder_path: str = Query(get_user_directory()), filename: str = Query(...)):
    try:
        file_path = os.path.join(folder_path, filename)
        with open(file_path, 'r') as file:
            content = file.read()
        return JSONResponse(content={"filename": filename, "content": content})
    except FileNotFoundError:
        return JSONResponse(content={"error": f"File '{filename}' not found."}, status_code=404)
    except Exception as e:
        return JSONResponse(content={"error": str(e)}, status_code=500)

def include_localfilefunc_router(app: FastAPI):
    # 注册路由
    # 列出文件夹中的文件
    @app.get('/list_folder_files', dependencies=[Depends(is_outside_project_directory)], tags=["本地文件操作"])
    async def list_folder_files(folder_path: Optional[str] = None):
        return get_folder_files(folder_path)

    # 重命名文件
    @app.post('/rename_file', dependencies=[Depends(is_outside_project_directory)], tags=["本地文件操作"])
    async def rename_existing_file(folder_path: Optional[str] = None, old_name: str = Query(...), new_name: str = Query(...)):
        return rename_file(folder_path, old_name, new_name)

    # 删除文件
    @app.delete('/delete_file', dependencies=[Depends(is_outside_project_directory)], tags=["本地文件操作"])
    async def delete_existing_file(folder_path: Optional[str] = None, filename: str = Query(...)):
        return delete_file(folder_path, filename)

    # 上传文件
    @app.post('/upload_file', dependencies=[Depends(is_outside_project_directory)], tags=["本地文件操作"])
    async def upload_new_file(folder_path: Optional[str] = None, file: UploadFile = File(...)):
        return upload_file(folder_path, file)

    # 读取文件内容
    @app.get('/read_file_content', dependencies=[Depends(is_outside_project_directory)], tags=["本地文件操作"])
    async def read_existing_file(folder_path: Optional[str] = None, filename: str = Query(...)):
        return read_file_content(folder_path, filename)

# 将路由函数包含
