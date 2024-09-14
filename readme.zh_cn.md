# saveMaster

- Looking for readme in [English](./readme.md)?

一个像素工厂存档管理模组。提供多种实用功能。

# 功能
 
- 存档编辑器
- 多玩家
- 云存档 (需要自己搭建)

# 安装
需要手动从github下载已发布的mod然后导入.

# 使用
您会在设置中找到一个新选项.  
然后剩下的自行探索. 这并不复杂.

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

返回服务器限制(仅包含`maxPayloadSize`和`maxNameSize`), 例如:

```json
{
    "maxPayloadSize": 26214400,
    "maxNameSize": 512
}
```

`maxPayloadSize`: 最大存档大小 (字节).  
`maxNameSize`: 最大存档名称大小 (字节).

## 在 cloudflare 上部署
使用 cloudflare 的 worker 和 kv 搭建免费服务器. 所需代码位于 `/cloud`

1. 确保您拥有 cloudflare 帐户
2. 创建一个 worker
3. 创建一个 kv
4. 将 kv 绑定到 worker, 变量名为`db`
5. 为 worker 创建环境变量 `key`，写入访问此服务器的密钥
6. 将 `/cloud/worker.js` 中的代码粘贴到 worker 中（首先删除 worker 中的所有代码）然后部署