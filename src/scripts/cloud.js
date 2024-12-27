
const config = require('savemaster/config');
const http = require('savemaster/http');
const save = require('savemaster/save');
const types = require('savemaster/type');

var limit = {
    maxPayloadSize: 26214400,
    maxNameSize: 512
};

var conf = {
    serverUrl: '',
    saveName: '',
    key: '',
    lastSaveTime: '',
    enable: false
};

function updateLimit(noEnableCheck){
    if (typeof noEnableCheck == 'undefined') noEnableCheck = false;
    if (!exports.isEnable() && !noEnableCheck) return;
    let res = http.get(conf.serverUrl+'/limit',{
        key: conf.key
    });
    if (res.code!=200) throw new Error('updateLimit http request return code is not 200');
    if (res.header['Content-Type']!='application/json'&&res.header['content-type']!='application/json') throw new Error('updateLimit http request return content is not json');
    if (res.body.length==0) throw new Error('updateLimit http request return content is empty');
    limit = Object.assign(limit,JSON.parse(types.toString(res.body)));
}

function readConfig(){
    conf = {
        serverUrl: '',
        saveName: '',
        key: '',
        lastSaveTime: '',
        enable: false
    };
    conf = Object.assign(conf,config.readConfig('cloudsave'));
    //print(conf.serverUrl)
    if (conf.serverUrl.endsWith('/')){
        conf.serverUrl = conf.serverUrl.slice(0,conf.serverUrl.length-1);
        writeConfig();
    }
}

function writeConfig(){
    config.writeConfig('cloudsave',conf);
}

exports.init = (doUpdateLimit)=>{
    if (typeof doUpdateLimit == 'undefined') doUpdateLimit = true;
    if (!config.isInited()) config.init();
    save.init();
    readConfig();
    try{
        if (doUpdateLimit) updateLimit();
    }catch(e){
        print(e);
        print('updateLimit failed, using default value.');
    }
};

exports.getConfig = ()=>{
    return JSON.parse(JSON.stringify(conf));
};

exports.setConfig = (obj)=>{
    let old = JSON.parse(JSON.stringify(conf));
    conf = JSON.parse(JSON.stringify(Object.assign(conf,obj)));;

    if (!conf.serverUrl.startsWith("https://") && !conf.serverUrl.startsWith("http://"))
        conf.serverUrl = "https://" + conf.serverUrl;
    
    if (old.serverUrl != conf.serverUrl){
        conf.lastSaveTime = '';
        try{
            updateLimit();
        }catch(e){
            print(e);
        }
    }else if (old.saveName != conf.saveName) conf.lastSaveTime = '';

    if (types.getString(conf.saveName).length-5>limit.maxNameSize){
        conf = old;
        throw new Error('cloudsave the length of saveName is larger than limit.');
    }
    
    writeConfig();
};

function formatNumStr(num,length){
    const zero = '0';
    let ret = num.toString();
    let i = length - ret.length;
    if (i>0) ret = zero.repeat(i) + ret;
    return ret;
}

function makeTimeStr(time){
    const lengthMap = [4,2,2,2,2,2];
    let ret = '';
    for (let i in time) ret+=formatNumStr(time[i],lengthMap[i]);
    return ret;
}

exports.getSave = ()=>{
    let header = {
        key: conf.key,
        name: conf.saveName
    };
    if (conf.lastSaveTime.length>0) header.time = conf.lastSaveTime;
    let res = http.get(conf.serverUrl+'/read',header);
    if (res.code==304||res.code==204) return null;
    if (res.code!=200) throw new Error('getSave http request return code is not 200');
    if (res.header['Content-Type']!='application/octet-stream'&&res.header['content-type']!='application/octet-stream') throw new Error('getSave http request return content is not stream');
    if (res.body.length==0) throw new Error('getSave http request return content is empty');
    let ret = save.readData(res.body);
    conf.lastSaveTime = makeTimeStr(ret.time);
    writeConfig();
    return ret;
};

exports.writeSave = (obj)=>{
    let data = obj.makeData();
    if (data.length>limit.maxPayloadSize){
        throw new Error('cloudsave the length of save data is larger than limit.');
    }
    let timeStr = makeTimeStr(obj.time);
    let res = http.post(conf.serverUrl+'/write',{
        key: conf.key,
        name: conf.saveName,
        time: timeStr,
        'Content-Type': 'application/octet-stream',
        'Content-Length': data.length.toString()
    },data);
    if (res.code!=200) throw new Error('writeSave http request return code is not 200');
    conf.lastSaveTime = timeStr;
    writeConfig();
};

exports.removeSave = ()=>{
    if (!exports.isEnable()) return;
    let res = http.get(conf.serverUrl+'/remove',{
        key: conf.key,
        name: conf.saveName
    });
    if (res.code!=200) throw new Error('removeSave http request return code is not 200');
};

exports.test = (obj)=>{
    if (typeof obj == 'undefined') obj = conf;
    let old = JSON.parse(JSON.stringify(conf));
    conf = JSON.parse(JSON.stringify(Object.assign(conf,obj)));

    if (!conf.serverUrl.startsWith("https://") && !conf.serverUrl.startsWith("http://"))
        conf.serverUrl = "https://" + conf.serverUrl;

    try{
        updateLimit(true);
    }catch(e){
        print(e);
        conf = old;
        return false;
    }
    conf = old;
    return true;
};

exports.isEnable = ()=>{
    return (conf.serverUrl.length>0 && conf.key.length>0 && conf.saveName.length>0 && conf.enable);
};