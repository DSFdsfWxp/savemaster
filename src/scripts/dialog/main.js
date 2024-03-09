
const listView = require("savemaster/dialog/basic/listView");
const saveEditDialog = require("savemaster/dialog/saveEdit");
const cloudSettingDialog = require("savemaster/dialog/cloudSetting");
const inputDialog = require("savemaster/dialog/input");
const cloud = require("savemaster/cloud");
const save = require("savemaster/save");

var mainDialog = null;

function formatNumStr(num,length){
    const zero = "0";
    let ret = num.toString();
    let i = length - ret.length;
    if (i>0) ret = zero.repeat(i) + ret;
    return ret;
}

exports.init = ()=>{
    mainDialog = listView.init();
    mainDialog.setTitle('@saveMgr.title');

    cloud.init(false);
    save.init();
    saveEditDialog.init([Vars.ui.settings,mainDialog]);
    cloudSettingDialog.init();
    inputDialog.init();

    mainDialog.button("@cloudConfig.title", Icon.link, ()=>{
        cloudSettingDialog.dialog.show();
    }).size(210, 64);

    cloudSettingDialog.dialog.hidden(()=>{
        cloud.init(false);
        mainDialog.rebuild();
    });
    
    saveEditDialog.dialog.hidden(()=>{
        if (saveEditDialog.needRebuild()&&saveEditDialog.modified()) mainDialog.rebuild();
    });
    
    mainDialog.shown(mainDialog.rebuild);

    mainDialog.rebuilt(()=>{

        mainDialog.listCase('[accent]'+Core.bundle.get('saveMgr.currentSave'),'[lightgray]'+((!cloud.isEnable()) ? Core.bundle.get('saveMgr.currentSave.local') : Core.bundle.get('saveMgr.currentSave.cloud')),Icon.save,()=>{},[
            {
                icon: Icon.downOpen,
                clicked: ()=>{
                    inputDialog.begin(Core.bundle.get('saveMgr.backupSaveName'),"",Core.bundle.get('saveMgr.backupSaveName'),(v)=>{
                        Vars.ui.loadAnd("@saveMgr.backuping",()=>{
                            save.make(v).writeToSavePath();
                            mainDialog.rebuild();
                            Vars.ui.showInfoFade("@saveMgr.backuped");
                        });
                    });
                }
            },
            {
                icon: Icon.pencil,
                clicked: ()=>{
                    saveEditDialog.setTargetPath(null);
                    saveEditDialog.show();
                }
            }
        ]);

        mainDialog.listLine();

        let saveLst = save.readAll();

        if (saveLst.length==0){
            mainDialog.text("@saveMgr.noAnyBackup").color(Packages.arc.graphics.Color.lightGray).pad(4);
        }else{
            for (let oo of saveLst){
                let o = oo;
                let saveName = (o.name.length==0) ? Core.bundle.get('saveMgr.untitled') : o.name;
                let statusTxt = o.time[0].toString()+"/"+o.time[1].toString()+"/"+o.time[2].toString()+" "+formatNumStr(o.time[3],2)+":"+formatNumStr(o.time[4],2)+":"+formatNumStr(o.time[5],2);
                statusTxt += ("\n[lightgray]"+Core.bundle.format('saveMgr.fileNum',o.fileNum.toString()));
                mainDialog.listCase('[accent]'+saveName,'[lightgray]'+statusTxt,Icon.save,()=>{},[
                    {
                        icon: Icon.upOpen,
                        clicked: ()=>{
                            Vars.ui.showConfirm("@saveMgr.restoreBackup",Core.bundle.format('saveMgr.restoreBackupComfirm',saveName),()=>{
                                Vars.ui.loadAnd("@saveMgr.restoring",()=>{
                                    o.apply();
                                    mainDialog.rebuild();
                                    Vars.ui.showInfoFade("@saveMgr.restored");
                                });
                            });
                        }
                    },
                    {
                        icon: Icon.pencil,
                        clicked: ()=>{
                            saveEditDialog.setTargetPath(o.save.path);
                            saveEditDialog.show();
                        }
                    },
                    {
                        icon: Icon.trash,
                        clicked: ()=>{
                            Vars.ui.showConfirm("@saveMgr.deleteBackup",Core.bundle.format('saveMgr.deleteBackupComfirm',saveName),()=>{
                                o.remove();
                                mainDialog.rebuild();
                                Vars.ui.showInfoFade("@saveMgr.deleted");
                            });
                        }
                    }
                ]);
            }
        }

    });

    exports.dialog = mainDialog;
};

exports.dialog = mainDialog;