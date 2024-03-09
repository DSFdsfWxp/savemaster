
const mainDialog = require('savemaster/dialog/main');
const playerDialog = require('savemaster/dialog/player');
const aboutDialog = require('savemaster/dialog/about');

exports.register = ()=>{
    mainDialog.init();
    playerDialog.init();
    aboutDialog.init();

    Vars.ui.settings.addCategory('saveMaster',Icon.save,(t)=>{

        t.button('@menu.saveMgr',()=>{
            mainDialog.dialog.show();
        }).width(240).height(64);

        t.row();

        t.button('@menu.multiplayer',()=>{
            playerDialog.dialog.show();
        }).width(240).height(64);

        t.row();

        t.button('@menu.about',()=>{
            aboutDialog.dialog.show();
        }).width(240).height(64);

    });
};

exports.button = (parent,f,style,listener)=>{
    let b = new Packages.arc.scene.ui.Button(style);
    b.clearChildren();
    b.clicked(listener);
    f(b);
    return parent.add(b);
};

exports.table = (parent,f)=>{
    let t = new Packages.arc.scene.ui.layout.Table();
    t.clearChildren();
    f(t);
    return parent.add(t);
};

var multiplayerUiRegistered = false;
var currentPlayer = Core.bundle.get("multiplayer.defaultPlayer");

exports.setupMultiplayer = (player)=>{
    if (!multiplayerUiRegistered){
        Vars.ui.planet.shown(()=>{
            Time.run(10,()=>{
                Vars.ui.showInfoFade(Core.bundle.get("multiplayer.currentPlayer")+': '+currentPlayer);
            });
        });
        multiplayerUiRegistered = true;
    }
    currentPlayer = player;
};