
const version = require('savemaster/version');

let aboutDialog = null;

function makeColor(txt,color){
    let ret = [];
    txt.split('\n').forEach(c=>{
        ret.push(color+c);
    });
    return ret.join('\n');
}

exports.init = ()=>{
    aboutDialog = new Packages.mindustry.ui.dialogs.BaseDialog('@about.title');

    aboutDialog.addCloseButton();

    let img = new Packages.mindustry.ui.BorderImage();
    img.setDrawable(Icon.save);
    img.border(Packages.mindustry.graphics.Pal.accent);
    aboutDialog.cont.add(img).size(102);

    aboutDialog.cont.row();

    aboutDialog.cont.add('[accent]saveMaster');
    aboutDialog.cont.row();
    aboutDialog.cont.add('@about.version');
    aboutDialog.cont.row();
    aboutDialog.cont.add('[lightgray]'+version.major.toString()+'.'+version.minor.toString()+'.'+version.bugFix.toString());
    aboutDialog.cont.row();
    aboutDialog.cont.add('@about.changelog');
    aboutDialog.cont.row();
    aboutDialog.cont.add('[lightgray]'+makeColor(version.changeLog,'[lightgray]'));

    exports.dialog = aboutDialog;
};

exports.dialog = aboutDialog;