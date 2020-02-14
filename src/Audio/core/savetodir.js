const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
module.exports = {
	recSave: function(book, file, chapter, versenum) {
		var filePath = path.join(app.getPath('userData'), 'recordings', book.bookName, chapter, `verse${versenum}.mp3`)
		if (!fs.existsSync(path.join(app.getPath('userData'), 'recordings',book.bookName, chapter))){
			if (!fs.existsSync(path.join(app.getPath('userData'), 'recordings'))){
				fs.mkdirSync(path.join(app.getPath('userData'), 'recordings'));
			}
			if (!fs.existsSync(path.join(app.getPath('userData'), 'recordings', book.bookName))){
				fs.mkdirSync(path.join(app.getPath('userData'), 'recordings',book.bookName ));
			}
			if (!fs.existsSync(path.join(app.getPath('userData'), 'recordings', book.bookName, chapter))){
				fs.mkdirSync(path.join(app.getPath('userData'), 'recordings', book.bookName, chapter));
			}
			filePath = writeRecfile(file, filePath);
		}
		else{
			console.log('Directory Exists', file, filePath);
			filePath = writeRecfile(file, filePath);
		}
		return filePath;
	},
};

function writeRecfile(file, filePath) {
	var fileReader = new FileReader();
	fileReader.onload = function() {
		fs.writeFileSync(filePath, Buffer.from(new Uint8Array(this.result)));
	};
	fileReader.readAsArrayBuffer(file.blob);
	return filePath;
}
