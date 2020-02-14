// // import Soundfile from './recordings/Genesis/Chapter1/verse1.mp3';
// // import Soundfile1 from './recordings/Genesis/Chapter1/verse2.mp3';
// import ConcatAudio from './ConcatAudio';
// let audio = new ConcatAudio();
// const { app } = require('electron').remote;
// const fs = require('fs');
// const path = require('path');

// module.exports = {
// 	mergeAudio: function(book, chapter, versenum) {
//         let Soundfile2 = require(app.getPath('userData'))
//         console.log(Soundfile2)
    
// 		var merged, output;
// 		var verseNumber = versenum.sort();
// 		fs.exists(`${appPath}/recordings/${book.bookName}/${chapter}`, function(
// 			exists,
// 		) {
// 			if (exists) {
// 				verseNumber.map((verseNum, index) => {
// 					console.log(versenum);
// 				});
// 				audio
// 					.fetchAudio()
// 					.then((buffers) => {
// 						// => [AudioBuffer, AudioBuffer]
// 						merged = audio.concatAudio(buffers);
// 						console.log('buff', merged);
// 					})
// 					.then(() => {
// 						// => AudioBuffer
// 						console.log('merged', merged);
// 						output = audio.export(merged, 'audio/mp3');
// 					})
// 					.then(() => {
// 						console.log('out', output);
// 						// => {blob, element, url}
// 						audio.download(
// 							output.blob,
// 							`${book.bookName}/${chapter}`,
// 						);
// 						document.append(output.element);
// 						console.log(output.url);
// 					})
// 					.catch((error) => {
// 						// => Error Message
// 						console.log('error', error);
// 					});
// 				audio.notSupported(() => {
// 					console.log('Handle no browser support');
// 					// Handle no browser support
// 				});
// 			}
// 		});
// 		return filePath;
// 	},
// };
