import ConcatAudio from './ConcatAudio';
import swal from 'sweetalert';
import AutographaStore from '../../components/AutographaStore';
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
let audio = new ConcatAudio();
const db = require(`${__dirname}/../../util/data-provider`).targetDb();
const audioContext = new AudioContext()
const fileReader = new FileReader();


const mergeAudios = async(book, chapter, versenum,) => {
		var merged, output;
        let doc = await db.get('targetBible');
        let filepath = doc.targetPath
        if (fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
				// fileReader.readAsArrayBuffer()
                let audiomp3 =[];
                versenum = versenum.sort((a,b)=> a-b)
                versenum.forEach(function(verse, i) {
                    let audioImport;
					audioImport = (path.join(app.getPath('userData'), 'recordings',book.bookName, chapter , `verse${verse}.mp3`))
                    audiomp3.push(audioImport)
                  });
				audio
					.fetchAudio(...audiomp3)
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
                        let filepath = doc.targetPath
                        if (fs.existsSync(path.join(filepath[0],'recordings',book.bookName, `${chapter}.mp3`))){
                            writeRecfile(output.blob, path.join(filepath[0],'recordings',book.bookName, `${chapter}.mp3`))
                        }
                        else {
                            if (!fs.existsSync(path.join(filepath[0],'recordings'))){
                                fs.mkdirSync(path.join(filepath[0],'recordings'))
                            }
                            if (fs.existsSync(path.join(filepath[0], 'recordings', book.bookName))){ 
                                writeRecfile(output.blob, path.join(filepath[0], 'recordings', book.bookName, `${chapter}.mp3`))
                            }
                            else {
                                fs.mkdirSync(path.join(filepath[0],'recordings',book.bookName))
                                writeRecfile(output.blob, path.join(filepath[0],'recordings',book.bookName, `${chapter}.mp3`))
                            }
                        }
                        // => {blob, element, url}
						// audio.download(
						// 	output.blob,
						// 	`${book.bookName}/${chapter}`,
                        // );
                        // console.log(output.element)
						// document.body.append(output.element);
					}).then(() => {
                        let filePath = path.join(filepath[0],'recordings',book.bookName);
                        AutographaStore.isAudioSave = true
                        swal("Record Export Success!", `on Directory: ${filePath}`, "success");
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
    
	// function ConcatenateBlobs(blobs, type, callback) {
    //     var buffers = [];
    //     var index = 0;
    //     var filePath = path.join(app.getPath('userData'), 'recordings', 'Exodus', "Chapter1", `combined.mp3`)

    //     async function readAsArrayBuffer() {
    //         if (!blobs[index]) {
    //             writeRecfile( await concatenateBuffers(), filePath)
    //             return concatenateBuffers();
    //         }
    //         var reader = new FileReader();
    //         reader.onload = function(event) {
    //             buffers.push(event.target.result);
    //             index++;
    //             readAsArrayBuffer();
    //         };
    //         reader.readAsArrayBuffer(blobs[index]);
    //     }

    //     readAsArrayBuffer();

    //     function concatenateBuffers() {
    //         var byteLength = 0;
    //         buffers.forEach(function(buffer) {
    //             byteLength += buffer.byteLength;
    //         });
            
    //         var tmp = new Uint16Array(byteLength);
    //         var lastOffset = 0;
    //         buffers.forEach(function(buffer) {
    //             // BYTES_PER_ELEMENT == 2 for Uint16Array
    //             var reusableByteLength = buffer.byteLength;
    //             if (reusableByteLength % 2 != 0) {
    //                 buffer = buffer.slice(0, reusableByteLength - 1)
    //             }
    //             tmp.set(new Uint16Array(buffer), lastOffset);
    //             lastOffset += reusableByteLength;
    //         });

    //         var blob = new Blob([tmp.buffer], {
    //             type: type
    //         });
    //         return blob
    //     }
    // };

    function writeRecfile(file, filePath) {
        var fileReader = new FileReader();
        fileReader.onload = function() {
            fs.writeFileSync(filePath, Buffer.from(new Uint8Array(this.result)));
        };
        fileReader.readAsArrayBuffer(file);
        return filePath;
    }
export default mergeAudios;
