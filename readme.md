# saveMaster

 - 是否在寻找[中文版本](./readme.zh_cn.md)?

A Mindustry mod to manage saves. Provides a variety of practical functions.

# Functions
 
 - Save editor
 - Multiplayer
 - Cloud save (need to build or deploy it yourself)
 
# How to install
You need to download the released mod from github manually then import.

# How to use
You'll find a new option in setting.  
Then explore by yourself. It's not complex.

# Cloud Save
## protocol
### read
Function: Read save  
Interface: `/read`  
Method: `GET`  
Header:

 - `key`: the key to access the server
 - `name`: save name
 - `time`: The time when the save was last synchronized, in the form of `20240101123000`, used to determine whether the local save needs to be updated

Returns: The request returns only `304` if the `time` passed in is newer than the one on the server.  If an save named `name` is not found on the server, the request simply returns `404`.  Otherwise return the save file.  
### write
Function: Write save  
Interface: `/write`  
Method: `POST`  
Header:

 - `key`: the key to access the server
 - `name`: save name
 - `time`: save creation time

Payload: save file  
Return: `200` is returned if the writing is successful.  
### remove
Function: Delete save  
Interface: `/remove`  
Method: `GET`  
Header:

 - `key`: the key to access the server
 - `name`: save name
Return: `200` is returned if the deletion is successful.  
### limit
Function: Get server limits  
Interface: `/limit`  
Method: `GET`  
Header:

 - `key`: the key to access the server

Return the limitations of the server (only include `maxPayloadSize` and `maxNameSize`), for example:

 ```json
{
    "maxPayloadSize": 26214400,
    "maxNameSize": 512
}
```

`maxPayloadSize`: max size of the save (byte).  
`maxNameSize`: max size of the save name (byte).

## deploy on cloudflare
Use cloudflare's workers and kv to build a free server.  The code needed is in `/cloud`.  

1. Make sure you have a cloudflare account.
2. Create a worker.
3. Create a kv.
4. bind the kv to the worker with a variable name `db`.
5. create environment variable `key` for the worker, puting the key to access this server.
6. Paste code in `/cloud/worker.js` into your worker (Remove all the code in worker first) then deploy.