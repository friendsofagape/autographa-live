const path = require("path");
const fs = require("fs");
const constants = require("../util/constants");
const db = require(`${__dirname}/data-provider`).targetDb();


export const allBooksToUsfm = async (exportPath) => {
	const activeBookNums = await db.allDocs()
		.then(docs => docs.rows
			.map(row => row.id)
			.filter(id => parseInt(id, 10) === id));

	const books = activeBookNums.map(bookNumber => {
		const index = parseInt(bookNumber, 10) - 1;
		return ({
			bookNumber: bookNumber,
			bookName: constants.booksList[index],
			bookCode: constants.bookCodeList[index],
			outputPath: exportPath
		});
	});

	const skipEmptyBook = true;
	const bookWritePromises = books.map(book =>
		toUsfmDoc(book, skipEmptyBook)
			.then(usfmDoc => writeUsfm(usfmDoc, buildFilePath(book)))
			.then(filename => Object.assign(book, {filename:filename})));

	const booksWithFilenames = await Promise.all(bookWritePromises);
	const writtenBooks = booksWithFilenames.filter(book => book.filename);
	return writtenBooks;
};

export const toUsfm = async (book, stage, targetLangDoc) => {
    const usfmDoc = await toUsfmDoc(book, false);
    const filePath = buildFilePath(book, targetLangDoc, stage, new Date());
    return writeUsfm(usfmDoc, filePath);
};

export const backuptoUSFM = async (book, filePath) => {
    console.log(book, filePath);
    const usfmDoc = await toUsfmDoc(book, false);
    return writeUsfm(usfmDoc, filePath);
};

async function toUsfmDoc(book, returnNullForEmptyBook=false) {
    try {
        const usfmContent = [];
        var isEmpty = true;
        usfmContent.push('\\id ' + book.bookCode);
        usfmContent.push('\\mt ' + book.bookName);
        const doc = await db.get(book.bookNumber);
        for (const chapter of doc.chapters) {
            usfmContent.push('\n\\c ' + chapter.chapter);
            usfmContent.push('\\p');
            for (const verse of chapter.verses) {
                // Push verse number and content.
                usfmContent.push('\\v ' + verse.verse_number + ' ' + verse.verse);
                isEmpty = isEmpty && !verse.verse;
            }
        }
        return (returnNullForEmptyBook && isEmpty)
            ? null
            : usfmContent.join('\n');
    } catch(err) {
        console.log(err);
    }
}

function buildFilePath(book, targetLangDoc, stage, date) {
    const directory = Array.isArray(book.outputPath) ? book.outputPath[0] : book.outputPath;
    const nameElements = [
        targetLangDoc && targetLangDoc.targetLang,
        targetLangDoc && targetLangDoc.targetVersion,
        book.bookCode,
        stage,
        date && getTimeStamp(date)
    ].filter(Boolean);
    const filename = nameElements.join("_") + '.usfm';
    return path.join(directory, filename);
}

function writeUsfm(usfmDoc, filePath) {
    if (usfmDoc && filePath) {
        fs.writeFileSync(filePath, usfmDoc, 'utf8');
        return filePath;
    } else {
        return null;
    }
}

function getTimeStamp(date) {
    var year = date.getFullYear(),
	// months are zero indexed
        month = ((date.getMonth() + 1) < 10 ? '0' : '') + (date.getMonth() + 1),
        day = (date.getDate() < 10 ? '0' : '') + date.getDate(),
        hour = (date.getHours() < 10 ? '0' : '') + date.getHours(),
        minute = (date.getMinutes() < 10 ? '0' : '') + date.getMinutes(),
        second = (date.getSeconds() < 10 ? '0' : '') + date.getSeconds();
    //hourFormatted = hour % 12 || 12, // hour returned in 24 hour format
    //minuteFormatted = minute < 10 ? "0" + minute : minute,
    //morning = hour < 12 ? "am" : "pm";
    return (year.toString().substr(2,2) + month + day +  hour + minute + second).toString();
}
