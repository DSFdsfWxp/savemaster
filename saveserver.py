import fastapi
import uvicorn
import os
from datetime import datetime

app = fastapi.FastAPI()
@app.post("/debug")
async def debug_save(request: fastapi.Request):
    try:
        # 获取请求头
        headers = dict(request.headers)
        
        # 获取请求体
        request_body = await request.body()
        
        # 打印请求头和请求体
        print("Headers:", headers)
        print("Body:", request_body)
        
        # 保存请求头和请求体到文件
        with open("debug_request.log", "a") as f:
            f.write(f"Timestamp: {datetime.now()}\n")
            f.write("Headers:\n")
            for key, value in headers.items():
                f.write(f"{key}: {value}\n")
            f.write("Body:\n")
            f.write(f"{request_body}\n")
            f.write("\n" + "-"*80 + "\n")
        
        return fastapi.responses.JSONResponse(status_code=200, content={"message": "Request saved"})
    except fastapi.HTTPException as e:
        return fastapi.responses.JSONResponse(status_code=e.status_code, content={"detail": e.detail})
    except Exception as e:
        return fastapi.responses.JSONResponse(status_code=500, content={"detail": str(e)})

@app.post("/write")
async def write_save(request: fastapi.Request):
    if request.headers.get("key") == "dinocekey":
        save_name = request.headers.get("name")
        savepath = os.path.join("save", save_name)
        os.makedirs(savepath, exist_ok=True)
        
        # 直接从请求体中读取二进制字节流
        binary_data = await request.body()
        
        # 保存二进制数据到文件
        save_file = os.path.join(savepath, f"{save_name}.save")
        with open(save_file, "wb") as f:
            f.write(binary_data)

        # 保存时间戳
        timefile = os.path.join(savepath, "time.txt")
        with open(timefile, "w") as f:
            f.write(request.headers.get("time"))
            
        return fastapi.responses.JSONResponse(status_code=200, content={})
    else:
        return fastapi.responses.JSONResponse(status_code=402, content={})

@app.get("/read")
def read_save(request: fastapi.Request):
    if request.headers.get("key") == "dinocekey":
        savepath = os.path.join("save", request.headers.get("name"))
        if not os.path.isdir(savepath):
            return fastapi.responses.JSONResponse(status_code=404, content={})
        else:
            timefile = os.path.join(savepath, "time.txt")
            tbase = open(timefile, "r").read()
            trequest = request.headers.get("time")
            if safe_time_compare(tbase, trequest):
                return fastapi.responses.JSONResponse(status_code=304, content={})
            else:
                # 确保返回正确的二进制文件流
                save_file = os.path.join(savepath, f"{request.headers.get('name')}.save")
                return fastapi.responses.FileResponse(save_file, media_type="application/octet-stream")
    else:
        return fastapi.responses.JSONResponse(status_code=402, content={})

@app.get("/remove")
def remove_save(request: fastapi.Request):
    savepath = os.path.join("save",request.headers.get("name"))
    if request.headers.get("key") == "dinocekey":
        if not os.path.isdir(savepath):
            return fastapi.responses.JSONResponse(status_code=404,content={})
        else:
            os.remove(savepath)
            return fastapi.responses.JSONResponse(status_code=200,content={})
    else:
        return fastapi.responses.JSONResponse(status_code=402,content={})
@app.get("/limit")
def limit_save():
    response = {
        "maxPayloadSize":26214400000,
        "maxNameSize":512
    }
    return fastapi.responses.JSONResponse(response)

def safe_time_compare(time_str1, time_str2):
    """更安全的带格式验证的时间比较"""
    try:
        t1 = datetime.strptime(time_str1, "%Y%m%d%H%M%S")
        t2 = datetime.strptime(time_str2, "%Y%m%d%H%M%S")
        return t1 < t2
    except ValueError:
        # 处理格式错误
        raise ValueError("Invalid time format")
    
uvicorn.run(app, host="0.0.0.0", port=8235)