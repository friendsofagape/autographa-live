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
        if (fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
				// fileReader.readAsArrayBuffer()
				let audiomp3 =[];
				for(var i =1; i<=versenum.length ; i++){
					let audioImport;
					audioImport = require(`../../recordings/${book.bookName}/${chapter}/verse${i}.mp3`)
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
						document.append(output.element);
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

export default mergeAudios;
