import * as fs from 'fs-web';
const path = require("path");
var appPath = path.join(__dirname, "..", "..");

const ExportWebm = (book, file1, chapter, verse) => {
    var filePath = `${appPath}/recordings/${book}/${chapter}/${chapter} verse${verse}.webm`;
    console.log("hiii")
    fs.mkdir(`${appPath}/recordings/${book}/${chapter}`).then(function () {
        // All done! File has been saved.
        console.log("done")
        writeRecfile(file1, filePath)
    });
}

const writeRecfile = (file1, filePath) => {
    var fileReader = new FileReader();
    fileReader.onload = function () {
        fs.writeFile(filePath, Buffer.from(new Uint8Array(this.result)));
    };
    fileReader.readAsArrayBuffer(file1.blob);
    return filePath;
}

export default ExportWebm;