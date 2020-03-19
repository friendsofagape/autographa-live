import ConcatAudio from './ConcatAudio';
let audio = new ConcatAudio();
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');

const mergePause = async(book, chapter, currentVerse, updatedTime) => {

if (fs.existsSync(path.join(app.getPath('userData'), 'recordings', book.bookName, chapter, `temp.mp3`))){
    var existingVerse, tempVerse, merged, output;
    existingVerse = (path.join(app.getPath('userData'), 'recordings',book.bookName, chapter , `verse${currentVerse}.mp3`))
    tempVerse = path.join(app.getPath('userData'), 'recordings', book.bookName, chapter, `temp.mp3`)
    audio
            .fetchAudio(existingVerse, tempVerse)
            .then((buffers) => {
                // => [AudioBuffer, AudioBuffer]
                merged = audio.concatAudio(buffers);
                console.log('buff', merged);
            })
            .then(() => {
                // => AudioBuffer
                console.log('merged', merged);
                output = audio.export(merged, 'audio/mp3');
            })
            .then(() => {
                console.log('out', output);
                writeRecfile(output, path.join(app.getPath('userData'), 'recordings',book.bookName, chapter , `verse${currentVerse}.mp3`))
                // => {blob, element, url}
                // audio.download(
                // 	output.blob,
                // 	`${book.bookName}/${chapter}`,
                // );
                // console.log(output.element)
                // document.body.append(output.element);
            }).then(() => {
                return (output.blob)
            })
            .catch((error) => {
                // => Error Message
                console.log('error', error);
            });
        audio.notSupported(() => {
            console.log('Handle no browser support');
            // Handle no browser support
        });
    }
}
function writeRecfile(file, filePath) {
    var fileReader = new FileReader();
    fileReader.onload = function() {
        fs.writeFileSync(filePath, Buffer.from(new Uint8Array(this.result)));
    };
    fileReader.readAsArrayBuffer(file.blob);
    return filePath;
}
export default mergePause;
