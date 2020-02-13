import Soundfile from "../../recordings/Genesis/Chapter1/verse1.mp3"
import Soundfile1 from "../../recordings/Genesis/Chapter1/verse2.mp3"
var fs = require('fs');
const NodeCrunker = require('node-crunker');
const audio = new NodeCrunker();

module.exports = {
	mergeAudio: function(book, file, chapter, versenum) {
        const path = require('path');
		var appPath = path.join(__dirname, '..', '..');
		var filePath = `${appPath}/recordings/${book.bookName}/${chapter}/verse${versenum}.mp3`;
		fs.exists(`${appPath}/recordings/${book.bookName}/${chapter}`, function(
			exists,
		) {
			if (exists) {
                console.log('Directory Exists', file, filePath);
			}
		});
		return filePath;
	},
};
