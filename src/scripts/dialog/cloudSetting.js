
const cloud = require('savemaster/cloud');
const save = require('savemaster/save');

var cloudSaveDialog =  null;
var conf = {};
var confModified = false;

exports.dialog = cloudSaveDialog;

function rebuild(){
    cloud.init(false);
    conf = cloud.getConfig();
    cloudSaveDialog.cont.clear();
    cloudSaveDialog.cont.pane((pane)=>{
        pane.add("@cloudConfig.server.url").padRight(8).left();
        pane.field(conf.serverUrl,{
            get: (v)=>{
                conf.serverUrl = v;
                confModified = true;
            }
        }).size(400, 55).maxTextLength(2048).get();
        pane.row();
        pane.add("@cloudConfig.server.saveName").padRight(8).left();
        pane.field(conf.saveName,{
            get: (v)=>{
                conf.saveName = v;
                confModified = true;
            }
        }).size(400, 55).maxTextLength(2048).get();
        pane.row();
        pane.add("@cloudConfig.server.key").padRight(8).left();
        pane.field(conf.key,{
            get: (v)=>{
                conf.key = v;
                confModified = true;
            }
        }).size(400, 55).maxTextLength(2048).get();
    });
    cloudSaveDialog.cont.row();
    let b = cloudSaveDialog.cont.button('enableCloudSave',()=>{
        conf.enable = !conf.enable;
        bUpdate();
    }).margin(14).width(240).height(64).pad(48).center().get();
    let bUpdate = ()=>{
        if (conf.enable){
            b.setText('@cloudConfig.cloudSaveEnabled');
        }else{
            b.setText('@cloudConfig.cloudSaveDisabled');
        }
    };
    bUpdate();
}

exports.init = ()=>{

    cloudSaveDialog = new Packages.mindustry.ui.dialogs.BaseDialog('@cloudConfig.title');
    exports.dialog = cloudSaveDialog;

    cloud.init(false);
    save.init();
    conf = cloud.getConfig();

    cloudSaveDialog.buttons.defaults().size(cloudSaveDialog.width, 64);
    cloudSaveDialog.buttons.button('@back',Icon.left,()=>{
        cloudSaveDialog.hide();
    });
    cloudSaveDialog.buttons.button("@cloudConfig.save", Icon.save, ()=>{
        try{
            cloud.setConfig(conf);
            confModified = false;
            Vars.ui.showOkText('@tip','@cloudConfig.save.success',()=>{});
        }catch(e){
            Vars.ui.showOkText('@error','@cloudConfig.warn.saveNameTooLong',()=>{});
            return;
        }
    });
    cloudSaveDialog.buttons.button("@cloudConfig.test", Icon.play, ()=>{
        if (cloud.test(conf)){
            Vars.ui.showOkText('@cloudConfig.test','@cloudConfig.test.success',()=>{});
        }else{
            Vars.ui.showOkText('@cloudConfig.test','@cloudConfig.test.fail',()=>{});
        }
    });
    
    let checkConf = ()=>{
        if (!cloud.isEnable()) {
            Vars.ui.showOkText('@error','@cloudConfig.warn.cloudSaveIsDisabled',()=>{});
            return false;
        }
        if (confModified) {
            Vars.ui.showOkText('@error','@cloudConfig.warn.saveConfigFirst',()=>{});
            return false;
        }
        return true;
    };
    
    cloudSaveDialog.buttons.button("@cloudConfig.clear", Icon.trash, ()=>{
        if (!checkConf()) return;
        Vars.ui.showConfirm('@cloudConfig.clear.desc',Core.bundle.format('cloudConfig.clear.comfirm',conf.saveName),()=>{
            try{
                cloud.setConfig(conf);
            }catch(e){
                Vars.ui.showOkText('@error','@cloudConfig.warn.saveNameTooLong',()=>{});
                return;
            }
            try{
                cloud.removeSave();
            }catch(e){
                Vars.ui.showOkText('@error',e.toString(),()=>{});
                return;
            }
            Vars.ui.showOkText('@cloudConfig.clear.desc','@cloudConfig.clear.done',()=>{});
        });
    });
    cloudSaveDialog.buttons.button("@cloudConfig.upload", Icon.upload, ()=>{
        if (!checkConf()) return;
        Vars.ui.showConfirm("@cloudSave.title","@cloudSave.syncToComfirm",()=>{
            Vars.ui.loadAnd('@cloudSave.syncingTo',()=>{
                try{
                    cloud.init();
                    cloud.writeSave(save.make('cloudsave'));
                }catch(e){
                    print(e);
                    Vars.ui.showOkText('@error',Core.bundle.get('cloudSave.syncToFail')+e.toString(),()=>{});
                }
            });
        });
    });
    cloudSaveDialog.buttons.button("@cloudConfig.download", Icon.download, ()=>{
        if (!checkConf()) return;
        Vars.ui.showConfirm("@cloudSave.title","@cloudSave.syncFromComfirm",()=>{
            Vars.ui.loadAnd('@cloudSave.syncingFrom',()=>{
                try{
                    cloud.init();
                    let obj = cloud.getSave();
                    if (obj!=null) obj.readFiles();
                    if (obj!=null) obj.apply();
                }catch(e){
                    print(e);
                    Vars.ui.showOkText('@error',Core.bundle.get('cloudSave.syncFromFail')+e.toString(),()=>{});
                }
            });
        });
    });
    cloudSaveDialog.addCloseListener();
    cloudSaveDialog.shown(rebuild);
};