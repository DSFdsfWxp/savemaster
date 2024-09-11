
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

const limit = {
    maxPayloadSize: 26214400,
    maxNameSize: 512
};

var htmlHeader = new Headers();
var streamHeader = new Headers();
var jsonHeader = new Headers();

htmlHeader.set("content-type","text/html");
streamHeader.set("content-type","application/octet-stream");
jsonHeader.set("content-type","application/json");

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const key = env.key;
    var input = url.pathname.split('/');
    if (input.length>1) input.shift();
    if (input.length<1) return new Response(page,{status:403,headers:htmlHeader});
    if (request.headers.get('key')!=key) return new Response(page,{status:403,headers:htmlHeader});
    switch (input[0]){
      case 'limit':{
        return new Response(JSON.stringify(limit),{status:200,headers:jsonHeader});
      }
      case 'read':{
        let name = request.headers.get('name');
        let time = '';
        let k = (await env.db.list({prefix:name+'-data'})).keys;
        let found = false;
        for (let c of k) if (c.name==name+'-data') found = true;
        if (!found) return new Response('',{status:204,headers:streamHeader});
        if (request.headers.has('time')) time = request.headers.get('time');
        if (await env.db.get(name+'-time')==time) return new Response('',{status:304,headers:streamHeader});
        return new Response(await env.db.get(name+'-data',{type:'arrayBuffer'}),{status:200,headers:streamHeader});
      }
      case 'write':{
        let data = await request.arrayBuffer();
        let name = request.headers.get('name');
        let time = request.headers.get('time');
        await env.db.put(name+'-data',data);
        await env.db.put(name+'-time',time);
        return new Response('',{status:200});
      }
      case 'remove':{
        let name = request.headers.get('name');
        await env.db.delete(name+'-data');
        await env.db.delete(name+'-time');
        return new Response('',{status:200});
      }
      default:{
        return new Response(`{"msg":"not a vail cmdline '${input[0]}'.","code":400}`,{status:400,headers:jsonHeader});
        break;
      }
    }
  },
};
