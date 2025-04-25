import fastapi
import uvicorn
import os
from datetime import datetime

safekey = "dinocekey"
port = 8235

app = fastapi.FastAPI()

@app.post("/write")
async def write_save(request: fastapi.Request):
    if request.headers.get("key") == safekey:
        save_name = request.headers.get("name")
        savepath = os.path.join("save", save_name)
        os.makedirs(savepath, exist_ok=True)
        
        # 流式写入文件
        save_file = os.path.join(savepath, f"{save_name}.save")
        with open(save_file, "wb") as f:
            async for chunk in request.stream():
                f.write(chunk)

        # 保存时间戳
        timefile = os.path.join(savepath, "time.txt")
        with open(timefile, "w") as f:
            f.write(request.headers.get("time"))
            
        return fastapi.responses.JSONResponse(status_code=200, content={})
    else:
        return fastapi.responses.JSONResponse(status_code=402, content={})

@app.get("/read")
def read_save(request: fastapi.Request):
    if request.headers.get("key") == safekey:
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
    if request.headers.get("key") == safekey:
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
        "maxPayloadSize":26214400,
        "maxNameSize":512
    }
    return fastapi.responses.JSONResponse(response)

def safe_time_compare(time_str1, time_str2):
    if time_str2 is None: 
        return True
    elif time_str1 is None:
        return False
    else:
        try:
            t1 = datetime.strptime(time_str1, "%Y%m%d%H%M%S")
            t2 = datetime.strptime(time_str2, "%Y%m%d%H%M%S")
            return t1 < t2
        except ValueError:
            # 处理格式错误
            raise ValueError("Invalid time format")
    
uvicorn.run(app, host="0.0.0.0", port=port)