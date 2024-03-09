# saveMaster

- Looking for readme in [English](./readme.md)?

一个像素工厂存档管理模组。提供多种实用功能。

# 功能
 
- 存档编辑器
- 多玩家
- 云存档 (需要自己搭建)

# 云存档
## 协议
### read
功能: 读取存档  
接口: `/read`  
方法: `GET`  
携带Header:

- `key`: 访问服务器的密钥
- `name`: 存档名称
- `time`: 上次同步存档的时间，形如`20240101123000`，用于判断是否需要更新存档

返回: 如果传入的`time`比服务器上的新，则请求返回仅`304`。如果服务器上找不到名为`name`的存档，则请求仅返回`404`。否则返回存档文件。  
### write
功能: 写入存档  
接口: `/write`  
方法: `POST`  
携带Header:

- `key`: 访问服务器的密钥
- `name`: 存档名称
- `time`: 存档创建时间

携带载荷: 存档文件  
返回: 写入成功则返回`200`  
### remove
功能: 删除存档  
接口: `/remove`  
方法: `GET`  
携带Header:

- `key`: 访问服务器的密钥
- `name`: 存档名称
返回: 删除成功则返回`200`  
### limit
功能: 获取服务器限制  
接口: `/limit`  
方法: `GET`  
携带Header:

- `key`: 访问服务器的密钥

返回:

```json
{
    maxPayloadSize: 26214400,
    maxNameSize: 512
}
```

## 一键部署
利用cloudflare的worker和kv搭建免费服务器。具体代码在`/cloud`。`wrangler.toml`中填入你想使用的子域，你想设置的服务器密钥和你的kv的id后用cloudflare的`wrangler`部署即可。