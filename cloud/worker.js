
const page=`
<!DOCTYPE html>
<html>
  <body>
    <h1>savesMaster CloudSaves Server</h1>
    <h4>v1.0.0</h4>
    <p>403 Forbidden</p>
  </body>
</html>
`;

import { Buffer } from 'node:buffer';

const limit = {
    maxPayloadSize: 26214400,
    maxNameSize: 512
};

var headerA = new Headers();
var headerB = new Headers();
var headerC = new Headers();
headerA.set("content-type","text/html");
headerB.set("content-type","application/octet-stream");
headerC.set("content-type","application/json");

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = env.key;
    var input = url.pathname.split('/');
    if (input.length>1) input.shift();
    if (input.length<1) return new Response(page,{status:403,headers:headerA});
    if (request.headers.get('key')!=key) return new Response(page,{status:403,headers:headerA});
    switch (input[0]){
      case 'limit':{
        return new Response(JSON.stringify(limit),{status:200,headers:headerC});
      }
      case 'read':{
        let data;
        let name = request.headers.get('name');
        let time = '';
        let k = (await env.db.list({prefix:name})).keys;
        let found = false;
        for (let c of k) if (c.name==name) found = true;
        if (!found) return new Response('',{status:204,headers:headerB});
        data = await env.db.get(name,{type:'arrayBuffer'});
        if (request.headers.has('time')) time = request.headers.get('time');
        let dec = new TextDecoder("utf-8");
        if (dec.decode(data.slice(0,14))==time) return new Response('',{status:304,headers:headerB});
        return new Response(data.slice(14),{status:200,headers:headerB});
      }
      case 'write':{
        let data = await request.arrayBuffer();
        let name = request.headers.get('name');
        let time = Buffer.from(request.headers.get('time'));
        data = Buffer.concat([time,Buffer.from(data)]);
        await env.db.put(name,data.buffer);
        return new Response('',{status:200});
      }
      case 'remove':{
        let name = request.headers.get('name');
        await env.db.delete(name);
        return new Response('',{status:200});
      }
      default:{
        return new Response(`{"msg":"not a vail cmdline '${input[0]}'.","code":400}`,{status:400,headers:headerB});
        break;
      }
    }
  },
};
