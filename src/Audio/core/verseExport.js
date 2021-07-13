import ConcatAudio from './ConcatAudio';
import swal from 'sweetalert';
import AutographaStore from '../../components/AutographaStore';
const util = require('util');
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
let audio = new ConcatAudio();
const copyFilePromise = util.promisify(fs.copyFile);
const db = require(`${__dirname}/../../util/data-provider`).targetDb();


const verseExport = async(book, chapter, versenum,) => {
		var merged, output;
        let doc = await db.get('targetBible');
        let filepath = doc.targetPath
        let outputmetaData = [];
        const destinationDir = path.join(filepath[0],'recordings',book.bookName, chapter, 'verses')
        const sourceDir = path.join(app.getPath('userData'), 'recordings',book.bookName, chapter)
        fs.mkdirSync(destinationDir, { recursive: true })
        if (fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
            let audiomp3 =[];
            versenum = versenum.sort((a,b)=> a-b)
            versenum.forEach(function(verse, i) {
                let audioImport;
				audioImport = `verse${verse}.mp3`
                audiomp3.push(audioImport)
            });
            copyFiles(sourceDir, destinationDir, audiomp3).then(() => {
                console.log("done");
             }).catch(err => {
                console.log(err);
             }).finally(() => {
                const currentTrans = AutographaStore.currentTrans;
                let filePath = path.join(filepath[0],'recordings',book.bookName);
                AutographaStore.isAudioSave = true
                swal({title: currentTrans["dynamic-msg-export-recording"], text: `${currentTrans["label-folder-location"]} : ${filePath}` ,  icon: 'success'})
            })
            console.log(audiomp3)
        }
}

function copyFiles(srcDir, destDir, files) {
    return Promise.all(files.map(f => {
        return copyFilePromise(path.join(srcDir, f), path.join(destDir, f));
    }));
}

export default verseExport;
