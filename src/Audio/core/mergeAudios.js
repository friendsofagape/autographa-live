import ConcatAudio from './ConcatAudio';
import swal from 'sweetalert';
import AutographaStore from '../../components/AutographaStore';
import { FormattedMessage } from 'react-intl';
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
let audio = new ConcatAudio();
const db = require(`${__dirname}/../../util/data-provider`).targetDb();


const mergeAudios = async(book, chapter, versenum,) => {
		var merged, output;
        let doc = await db.get('targetBible');
        let filepath = doc.targetPath
        let outputmetaData = [];
        let audiomp3 =[];
        if (fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
				// fileReader.readAsArrayBuffer()
                versenum = versenum.sort((a,b)=> a-b)
                versenum.forEach(function(verse, i) {
                    audiomp3.push((path.join(app.getPath('userData'), 'recordings',book.bookName, chapter , `verse${verse}.mp3`)))
                  });
                  console.log("path", path.join(filepath[0],'recordings',book.bookName, chapter))
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
                        let destinationPath = path.join(filepath[0],'recordings',book.bookName, chapter)
                        fs.mkdirSync(destinationPath, { recursive: true })

                        if (fs.existsSync(destinationPath)){
                            writeRecfile(output.blob, path.join(filepath[0],'recordings',book.bookName, chapter, `${chapter}.mp3`))
                        }
                        else {
                            fs.mkdirSync(destinationPath, { recursive: true })
                            writeRecfile(output.blob, path.join(filepath[0],'recordings',book.bookName, chapter, `${chapter}.mp3`))
                        }
                    })
                    .then(() => {
                        if(AutographaStore.ChapterComplete === true) {
                            var newfilepath = path.join(
                                app.getPath('userData'),
                                'recordings',
                                book.bookName,
                                chapter,
                                `output.json`,
                            );
                            let outputTxtfile = path.join(filepath[0],'recordings',book.bookName, chapter, `${chapter}_timing.tsv`)
                            if (fs.existsSync(newfilepath)) {
                                fs.readFile(
                                    newfilepath,
                                    // callback function that is called when reading file is done
                                    function(err, data) {
                                        // json data
                                        var jsonData = data;
                                        // parse json
                                        var jsonParsed = JSON.parse(jsonData);
                                        // access elements
                                        var prevendtime
                                        for (var key in jsonParsed) {
                                            if (jsonParsed.hasOwnProperty(key)) {
                                                var val = jsonParsed[key];
                                                let starttime 
                                                let endtime; 
                                                if(val.verse === 1){
                                                    starttime = 0
                                                }else{
                                                    starttime = prevendtime
                                                }
                                                endtime =  starttime + val.totaltime
                                                prevendtime = endtime + 1
                                                let eachSegment = [ starttime, endtime , val.verse ]
                                                outputmetaData.push(eachSegment)
                                            }
                                        }
                                                require("fs").writeFile(
                                                    outputTxtfile,
                                                    outputmetaData.map(function(v){ return v.join('\t ') }).join('\n'),
                                                    function (err) { console.log(err ? 'Error :'+err : `Created ${chapter}.txt`) }
                                                );
                                    },
                                );
                            }
                        }
                    })
                    .catch((error) => {
						// => Error Message
						console.log('error', error);
					}).finally(() => {
                        const currentTrans = AutographaStore.currentTrans;
                        let filePath = path.join(filepath[0], 'recordings', book.bookName, chapter);
                        AutographaStore.isAudioSave = true
                        audiomp3 = undefined
                        merged = undefined
                        output = undefined
                        swal({title: currentTrans["dynamic-msg-export-recording"], text: `${currentTrans["label-folder-location"]} : ${filePath}` ,  icon: 'success'})
                    })
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
