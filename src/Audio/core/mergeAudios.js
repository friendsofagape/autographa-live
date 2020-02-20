import ConcatAudio from './ConcatAudio';
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
let audio = new ConcatAudio();
const audioContext = new AudioContext()
const fileReader = new FileReader();


const mergeAudios = async(book, chapter, versenum, blob) => {
		var merged, output,allarrayBuffer, resultantbuffer;
		let newblob=[];
		versenum = versenum.sort()
        let blobsort = blob.sort((a,b) => (a.verse > b.verse)? 1 : -1)
        blobsort.map((val,index) => {
            newblob.push(val.blob)
        })
        // let resultblob = await ConcatenateBlobs(newblob, 'audio/mp3')
        if (fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
				// fileReader.readAsArrayBuffer()
				let audiomp3 =[];
				for(var i =1; i<=versenum.length ; i++){
					let audioImport;
					audioImport = (path.join(app.getPath('userData'), 'recordings',book.bookName, chapter , `verse${i}.mp3`))
					audiomp3.push(audioImport)
				}
				console.log(audiomp3)
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
						// => {blob, element, url}
						audio.download(
							output.blob,
							`${book.bookName}/${chapter}`,
						);
						document.body.append(output.element);
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
			return output
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

    // function writeRecfile(file, filePath) {
    //     var fileReader = new FileReader();
    //     fileReader.onload = function() {
    //         fs.writeFileSync(filePath, Buffer.from(new Uint16Array(this.result)));
    //     };
    //     fileReader.readAsArrayBuffer(file);
    //     return filePath;
    // }
export default mergeAudios;
