**English** | [简体中文](./readme.zh_cn.md)

# worker.js
## A server deployed with a Cloudflare Worker
The free server implementation.

See [readme](../readme.md) for how to deploy and use it.

# local.py
## A server for this mod, written with FastAPI

### How to use

```bash
pip install fastapi uvicorn
python local.py
```

It serves over http on local port 8235 by default.

### Configuration

The key and the port can be changed at the top of `local.py`.

The defaults are `safekey = "dinocekey"` and `port = 8235`.

The program creates a `save` folder in the directory you run it from and keeps the saves there as binary files.

```txt
/save
  └─ [save name]
      ├─ [save name].save  # the actual file
      └─ time.txt          # the recorded timestamp
```

### Notes

If you want to use cloud save across platforms and devices, just give them the same save name. Even then, a device that has never uploaded a save, or a device whose cloud save settings you have just changed, has to upload once first: a download on a device that has never uploaded fails. If you play on several devices, transfer your game data with the game's own function before you use cloud save for the first time, upload once, and cloud save works normally from then on.

### Todo

For a client that has never uploaded a save, syncing may fail with a `Too much data for declared Content-Length` error. Why it happens is still unclear; it will be looked into when there is time.
