import { default as localforage } from 'localforage';
var newURL = [];

const ExportWebm = (book, file, chapter, verse) => {
    // console.log(book, file, chapter, verse)

    localforage.setItem(`${verse}`, file).then(value => {
        // Do other things once the value has been saved.
        newURL.push(value)
    }).catch(err => {
        // This code runs if there were any errors
        console.log(err);
    });

    return (newURL)
}


//     var filePath = `${appPath}/recordings/${book}/${chapter}/${chapter} verse${verse}.webm`;
//     console.log("hiii")
//     fs.mkdir(`${appPath}/recordings/${book}/${chapter}`).then(function () {
//         // All done! File has been saved.
//         console.log("done")
//         writeRecfile(file1, filePath)
//     });

// const writeRecfile = (file1) => {
//     var fileReader = new FileReader();
//     // fileReader.onload = function () {
//     //     fs.writeFile(filePath, Buffer.from(new Uint8Array(this.result)));
//     // };
//     fileReader.readAsArrayBuffer(file1.blob);
//     putBlobInDb(file1.blob)

//     return filePath;
// }

export default ExportWebm;