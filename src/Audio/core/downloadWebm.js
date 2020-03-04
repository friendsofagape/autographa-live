import { default as localforage } from 'localforage';

const downloadWebm = async (verse) => {
    // console.log(book, file, chapter, verse)
    let newURL;
    localforage.getItem(`${verse}`).then(value => {
        // This code runs once the value has been loaded from the offline store.
        console.log("sdsdsdsd", value.blobURL)
        newURL = value.blobURL
        // console.log(value1.id)
        console.log("inside webm", newURL)
    }).catch(err => {
        // This code runs if there were any errors
        console.log(err);
    });
    console.log(" webm", newURL)


    return (newURL)
}


export default downloadWebm;