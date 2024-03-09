
const save = require('savemaster/save');
const cloud = require('savemaster/cloud');
const version = require('savemaster/version');
const ui = require('savemaster/game/ui');
const editor = require('savemaster/game/editor');
const control = require('savemaster/game/control');

print('saveMaster v'+version.major.toString()+'.'+version.minor.toString()+'.'+version.bugFix.toString());

Events.on(ClientLoadEvent,()=>{
    editor.removeFiles();
    Time.run(10,()=>{
        print('saveMaster init begin');
        ui.register();
        save.init();
        control.onCampaignQuit(()=>{
            editor.removeFiles();
            cloud.init(false);
            if (cloud.isEnable() && !control.isNetClient()){
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
            }
        });
        control.listen();
        cloud.init(false);
        if (cloud.isEnable() && !control.isNetClient()){
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
        }
        print('saveMaster init end');
    });
});