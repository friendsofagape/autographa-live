import React, { PropTypes } from 'react';
import swal from 'sweetalert';
import AutographaStore from "./AutographaStore";
import * as usfm_export from "../util/json_to_usfm";
import * as usfm_import from "../util/usfm_import";
import Gitea from "../helpers/giteaAdapter"
import { Panel,  FormGroup, Checkbox } from 'react-bootstrap/lib';
import xml2js from 'xml2js';
import { TouchBarColorPicker } from 'electron';
import * as setting from "./Settings";
import ImportReport from './ImportReport';
const db = require(`${__dirname}/../util/data-provider`).targetDb();
const bibUtil_to_json = require(`${__dirname}/../util/usfm_to_json`);
const booksCodes = require(`${__dirname}/../util/constants.js`).bookCodeList;
const booksNames = require(`${__dirname}/../util/constants.js`).booksList;
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const bibleSkel = require(`${__dirname}/../lib/full_bible_skel.json`);
var patterns = "";


class ProjectListRow extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			branchList: [],
			bookList: [],
			selectedBook: [],
			importText: AutographaStore.currentTrans["btn-import"],
			isImporting: false,
			open: false,
			selectedBranch: "",
			isReady: false,
			totalFiles: []
		}
	}
	componentDidMount() {
		// let config = {headers: {
        //     Authorization: `Bearer ${AutographaStore.tempAccessToken}`
        // }}
        // let books = [];
        // axios.get(`https://data-access.paratext.org/api8/books/${this.props.project.projid[0]}`, config).then((res) => {
        //     let parser = new xml2js.Parser();
        //     parser.parseString(res.data, (err, result) => {
        //     	books = result.ProjectBooks.Book.map((res, i) => {
        //     		return res.$
        //     	});
        //     	this.setState({
        //  			bookList: books
        // 		});
        //     });
        // });
	}
	selectBook = (projId, bookId, obj) => {
		console.log(projId, bookId, obj.target.checked)
		if (this.props.syncAdapter instanceof Gitea) {
			if(obj.target.checked) {
				this.state.selectedBook.push(bookId)
				AutographaStore.door43Book[projId] = this.state.selectedBook
			}else{
				this.setState({selectedBook: this.state.selectedBook.filter(id => id !== bookId)})
				AutographaStore.door43Book[projId] = this.state.selectedBook
			}
		}
		else{
			if(obj.target.checked) {
				this.state.selectedBook.push(bookId)
				AutographaStore.paratextBook[projId] = this.state.selectedBook
			}else{
				this.setState({selectedBook: this.state.selectedBook.filter(id => id !== bookId)})
				AutographaStore.paratextBook[projId] = this.state.selectedBook
			}
		}
	}
	resetLoader = () => {
		this.props.showLoader(false);						
	    this.setState({importText: AutographaStore.currentTrans["btn-import"], isImporting: false})
    };

	importBook = (projectId) => {
		//comment for Gitea now
		console.log("importbooksss",projectId);
		if (this.props.syncAdapter instanceof Gitea) {
			return this.importBookGitea(projectId);
		} else {
			return this.importBookParatext(projectId);
		}

		//need to remove and uncomment above code when gitea will work fine
		// return this.importBookParatext(projectId);

	};

  	importBookParatext = (projectId) => {
  		if(AutographaStore.paratextBook[projectId] == null || Object.keys(AutographaStore.paratextBook[projectId]).length === 0){
        	swal(AutographaStore.currentTrans["dynamic-msg-error"], AutographaStore.currentTrans["label-selection"], "error");
  			return
  		}
		const currentTrans = AutographaStore.currentTrans;
	    swal({
	        title: currentTrans["label-warning"],
	        text: currentTrans["label-override-text"],
	        icon: "warning",
	        buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
	        dangerMode: false,
	        closeOnClickOutside: false,
	        closeOnEsc: false
	      })
	      .then((action) => {
	        if (action) {
				this.props.showLoader(true)
	        	AutographaStore.paratextBook[projectId].map(async(bookId) => {
 	        		let bookData = await this.props.syncAdapter.getUsxBookData(projectId, bookId);
		            let book = {};
		            let parser = new DOMParser();
					let xmlDoc = parser.parseFromString(bookData,"text/xml");
					
					//Modifying the exisitng dom and uploading to paratext
					if (xmlDoc.evaluate) {
						let chapterNodes =  xmlDoc.evaluate("//chapter", xmlDoc, null, XPathResult.ANY_TYPE, null);
						let verseNodes = xmlDoc.evaluate("//verse", xmlDoc, null, XPathResult.ANY_TYPE, null);
						let currChapter=chapterNodes.iterateNext();
						book[currChapter.attributes["number"].value] = []
						let currVerse = verseNodes.iterateNext();
						while(currVerse){
							if(currVerse.attributes["number"].value === 1 && book[currChapter.attributes["number"].value].length !== 0){
								currChapter = chapterNodes.iterateNext();
								book[currChapter.attributes["number"].value] = [];
							}
							if(!currVerse.nextSibling){
								//do nothing
							}else {
								let temp = currVerse.nextSibling;
								let verseText = '';
								while(true){
									if(!temp || temp.nodeName === "verse"){
										break;
									}
									if(temp.nodeName === "note"){
										//do nothing
									}else if(temp.nodeName === "#text"){
										verseText += temp.data
										//verseText += temp.textContent;
									}else{
										verseText += temp.textContent;
									}
									temp = temp.nextSibling;
								}
								// for getting text from sibling of parent para tag
								temp = currVerse.parentElement.nextElementSibling;
								while(true){
									if(!temp || temp.nodeName !== "para" ){
										break;
									}
									let foundVerse = false;
									for( let i = 0; i < temp.childNodes.length; i++){
										if(temp.childNodes[i].nodeName === 'verse'){
											foundVerse = true;
										}
									}
									if(foundVerse) {
										break;
									}
									verseText += " "+temp.textContent;
									temp = temp.nextElementSibling;
								}
								book[currChapter.attributes["number"].value].push({verse_number: currVerse.attributes["number"].value, verse: verseText});
							}
							currVerse = verseNodes.iterateNext();
						}
					}
					//get bookIndex from const 
					let bookCode = booksCodes.findIndex((book) => book === bookId)

					db.get((bookCode + 1).toString()).then((doc) => {
	                    for (let i = 0; i < doc.chapters.length; i++) {
	                        for (let j = 1; j <= Object.keys(book).length; j++) {
	                            if (j === doc.chapters[i].chapter) {
	                                var versesLen = Math.min(book[j].length, doc.chapters[i].verses.length);
	                                for (let k = 0; k < versesLen; k++) {
	                                    var verseNum = book[j][k].verse_number;
	                                    doc.chapters[i].verses[verseNum - 1].verse = book[j][k].verse;
	                                    book[j][k] = undefined;
	                                }
	                                //check for extra verses in the imported usfm here.
	                                break;
	                            }
	                        }
	                    }
	                    db.put(doc).then((response) => {
							this.resetLoader();
							//swal({AutographaStore.currentTrans["btn-import"], AutographaStore.currentTrans["label-imported-book"], "success");
							swal({
								title: AutographaStore.currentTrans["btn-import"],
								text:  AutographaStore.currentTrans["label-imported-book"],
								icon: "success",
								dangerMode: false,
								closeOnClickOutside: false,
								closeOnEsc: false
							  })
							  .then((action) => {
								if(action){
									window.location.reload();
								}
							  })

	                    }).catch((err) => {
							this.resetLoader();
							swal(AutographaStore.currentTrans["dynamic-msg-error"], AutographaStore.currentTrans["dynamic-msg-went-wrong"], "error");
						});
                	});
					// console.log(book)
 	        	})
	        }
	    });
	  };

	  backupTranslation = (projectId, branch, projectName) => {
		let Id;
		const dir = path.join(app.getPath('userData'), 'backup');
		AutographaStore.door43Book[projectId].map(async(bookId) => {
			let bookData = await this.props.syncAdapter.getDoorBookData(projectId, bookId, branch, projectName);
			// let usfmBibleBook = false;
			let xmlDoc = bookData.split('\n');
			xmlDoc.map((line) => {
				if (line){
					line = line.trim();
					var splitLine = line.split(/ +/);
						if (splitLine[0] === '\\id') {
							// if (booksCodes.includes(splitLine[1].toUpperCase()))
								// usfmBibleBook = true;
							Id = splitLine[1].toUpperCase();
						}
				}
			});
			if (Id){
				if (!fs.existsSync(dir)){
					fs.mkdirSync(dir);
				}
				let book = {};
            	let bookArray = {'GEN':"1",'EXO':"2",'LEV':"3",'NUM':"4",'DEU':"5",'JOS':"6",'JDG':"7",'RUT':"8",'1SA':"9",'2SA':"10",'1KI':"11",'2KI':"12",'1CH':"13",'2CH':"14",'EZR':"15",'NEH':"16",'EST':"17",'JOB':"18",'PSA':"19",'PRO':"20",'ECC':"21",'SNG':"22",'ISA':"23",'JER':"24",'LAM':"25",'EZK':"26",'DAN':"27",'HOS':"28",'JOL':"29",'AMO':"30",'OBA':"31",'JON':"32",'MIC':"33",'NAM':"34",'HAB':"35",'ZEP':"36",'HAG':"37",'ZEC':"38",'MAL':"39",'MAT':"40",'MRK':"41",'LUK':"42",'JHN':"43",'ACT':"44",'ROM':"45",'1CO':"46",'2CO':"47",'GAL':"48",'EPH':"49",'PHP':"50",'COL':"51",'1TH':"52",'2TH':"53",'1TI':"54",'2TI':"55",'TIT':"56",'PHM':"57",'HEB':"58",'JAS':"59",'1PE':"60",'2PE':"61",'1JN':"62",'2JN':"63",'3JN':"64",'JUD':"65",'REV':"66"}
				book.bookNumber = bookArray[Id];
				book.bookName = booksNames[parseInt(book.bookNumber, 10) - 1];
				book.bookCode = booksCodes[parseInt(book.bookNumber, 10) - 1];
				book.outputPath = [dir];
				
				let filename = [book.bookNumber, book.bookCode].join("_") + '.usfm';
				const filePath = path.join(dir, filename);
				const usfmDoc = await usfm_export.backuptoUSFM(book, filePath);

				console.log(usfmDoc, "*********",  filePath)
                // AutographaStore.showModalDownload = false;
				
				// const usfmDoc = await usfm_export.toUsfmDoc(book, false);
			}
		});
	  }
	  
	//   getStuffAsync = (param) =>
	// 	new Promise(function (resolve, reject) {
	// 		bibUtil_to_json.toJson(param, (err, data) => {
	// 			console.log("getStuffAsync---->",err,"*******", data);
	// 			if (err !== null) {
	// 				console.log("*******if*******");
	// 				reject(err);
	// 			}
	// 			else {
	// 				console.log("else*******");
	// 				resolve(data);
	// 			}
	// 		});
	// 	});

	
		getReport = (doc, filePath) => {
			console.log("getReport---------");
			return usfm_import.getStuffAsync({
				lang: doc.targetLang.toLowerCase(),
				version: doc.targetVersion.toLowerCase(),
				usfmFile: filePath,
				targetDb: 'target',
				scriptDirection: AutographaStore.refScriptDirection
			})
			.then((res) => {
				if(res !== undefined)
					AutographaStore.successFile.push(res);
			}).catch((err) => {
					AutographaStore.errorFile.push(err);
			})
		};
		
	  importBookGitea = (projectId) => {
		AutographaStore.showSyncImportReport = false ;
		if(AutographaStore.door43Book[projectId] == null || Object.keys(AutographaStore.door43Book[projectId]).length === 0){
		  swal(AutographaStore.currentTrans["dynamic-msg-error"], AutographaStore.currentTrans["label-selection"], "error");
			return
		}
	  const currentTrans = AutographaStore.currentTrans;
	  swal({
		  title: currentTrans["label-warning"],
		  text: currentTrans["label-override-text"],
		  icon: "warning",
		  buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
		  dangerMode: false,
		  closeOnClickOutside: false,
		  closeOnEsc: false
		})
		.then((action) => {
		  if (action) {
			this.props.showLoader(true);
			let branch = this.state.selectedBranch[0];
			let projectName = this.props.project.proj[0];

			// This function is for backing up the current data in Translation pane
			this.backupTranslation(projectId, branch, projectName);
			const folderPath = path.join(app.getPath('userData'), 'gitea_projects');
			const dir = path.join(folderPath, projectName);
			let filePath;
			let localPath = [];

			db.get('targetBible')
			.then((doc) => {
				// this.setState({ totalFiles: (AutographaStore.door43Book[projectId])});
				console.log("Mainnnnnnnnnnnnn",(AutographaStore.door43Book[projectId]))
				AutographaStore.door43Book[projectId].map(async(bookId) => {
					let bookData = await this.props.syncAdapter.getDoorBookData(projectId, bookId, branch, projectName);
					if (!fs.existsSync(folderPath)){
						fs.mkdirSync(folderPath);
					}
					if (!fs.existsSync(dir)){
						fs.mkdirSync(dir);
					}
					if(bookData !== undefined || bookData !== null){
						if (!fs.existsSync(path.join(dir, branch))){
							fs.mkdirSync(path.join(dir, branch));
						}
	
						// To check whether the file is inside a directory in gitea
						if (bookId[0].match(/(\/)/g)){
							let folder = ((bookId[0]).replace(/(\/)(.*)/g,""));
							let fileName = ((bookId[0]).replace(/(.*)(\/)/g,""));
							if(fs.existsSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch))){
								if(!fs.existsSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder))){
									fs.mkdirSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder));
								}
								fs.writeFileSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder, fileName), bookData, 'utf8');
								filePath = path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder, fileName);
							}
						}
						else{
							if(fs.existsSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch))){
								fs.writeFileSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, `${bookId}`), bookData, 'utf8');
								filePath = path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, `${bookId}`);
							}
						}
					}
					console.log("Before get report");
					this.getReport(doc, filePath);
				});
			}, (err) => {
				this.resetLoader();
				swal(AutographaStore.currentTrans["set-translation-details"], AutographaStore.currentTrans["dynamic-translation-details"], "warning");
			})
			}
		})
		.finally(() => {
			console.log("finally***********");
			this.setState({ totalFiles: AutographaStore.door43Book[projectId]});
			AutographaStore.showSyncImportReport=true;
		});
  	};
			
			// 	  let xmlDoc1 = bookData;
			// 	  var book = {},
			// 	  verse = [],
			// 	  db = require(`${__dirname}/../util/data-provider`).targetDb(),
			// 	  refDb = require(`${__dirname}/../util/data-provider`).referenceDb(),
			// 	  c = 0,
			// 	  v = 0;
			// 	  let usfmBibleBook = false;
			// 	  let id_prefix;
			// 	//   book["scriptDirection"] = options.scriptDirection;
            // 		book.chapters = [];
			// 	  console.log("1 st     verse--------->",verse);
			// 	//   console.log(xmlDoc1);
			// 	  let xmlDoc = xmlDoc1.split('\n');
			// 	//   console.log("************",xmlDoc);
			// 	  xmlDoc.map((line) => {
			// 		if (line){
			// 			console.log("line---------->",line);
			// 			line = line.trim();
			// 			var splitLine = line.split(/ +/);
			// 			console.log("splitLine---------->",splitLine);
			// 			if (splitLine[0] === '\\id') {
			// 				if (booksCodes.includes(splitLine[1].toUpperCase()))
			// 					usfmBibleBook = true;
			// 				book._id = id_prefix + "_" + splitLine[1].toUpperCase();
			// 			} else if (splitLine[0] === '\\c') {
			// 				console.log("--------Inside Chapter------",splitLine[0],c);
			// 				// if (c == 1){
			// 				// 	const bookIndex1 = booksCodes.findIndex((element) => {
			// 				// 		if (book._id !== undefined){
			// 				// 			return (element === book._id.split("_").slice(-1)[0].toUpperCase())
			// 				// 		}
			// 				// 	})
			// 				// 	if (bookIndex1 !== -1){
			// 				// 		console.log("checking------>",bibleSkel[bookIndex1 + 1].chapters[c - 1],"******",parseInt(splitLine[1], 10),"******",bibleSkel[bookIndex1 + 1]);
			// 				// 		if(bibleSkel[bookIndex1 + 1].chapters[parseInt(splitLine[1], 10) - 1] !== undefined){
			// 				// 			verse = bibleSkel[bookIndex1 + 1].chapters[parseInt(splitLine[1], 10) - 1].verses;
			// 				// 		}
			// 				// 	}
			// 				// }
			// 				console.log("verse--------->",verse,verse.length);
			// 				book.chapters[parseInt(splitLine[1], 10) - 1 ] = {
			// 					"verses": verse,
			// 					"chapter": parseInt(splitLine[1], 10)
			// 				}
			// 				console.log([parseInt(splitLine[1], 10) ],book.chapters[parseInt(splitLine[1], 10) ])
			// 				verse = [];
			// 				c = parseInt(splitLine[1], 10)
			// 				v = 0;
			// 			} else if (splitLine[0] === '\\v') {
			// 				if (c === 0)
			// 					return 
			// 					// callback(new Error("USFM files without chapters aren't supported."));
			// 				var verseStr = (splitLine.length <= 2) ? '' : splitLine.splice(2, splitLine.length - 1).join(' ');
			// 				verseStr = this.replaceMarkers(verseStr);
			// 				console.log("**----book._id----->",book._id);
			// 				const bookIndex = booksCodes.findIndex((element) => {
			// 					if (book._id !== undefined){
			// 						return (element === book._id.split("_").slice(-1)[0].toUpperCase())
			// 					}
			// 				})
			// 				// if (v < bibleSkel[bookIndex + 1].chapters[c - 1].verses.length) {
			// 				//     book.chapters[c - 1].verses.push({
			// 				//         "verse_number": parseInt(splitLine[1], 10),
			// 				//         "verse": verseStr
			// 				//     });
			// 				//     v++;
			// 				// }
			// 				console.log("bibleSkel--------->",bibleSkel,"----bookIndex---",bookIndex,"----c---",c,bibleSkel[bookIndex + 1]);
			// 				if (bookIndex !== -1){
			// 					console.log("checking------>",bibleSkel[bookIndex + 1].chapters[c - 1],"******",parseInt(splitLine[1], 10),"******",verseStr);
			// 					if(bibleSkel[bookIndex + 1].chapters[c - 1] !== undefined){
			// 						console.log(book,book.chapters,book.chapters[c-1].verses,c);
			// 					if (v < bibleSkel[bookIndex + 1].chapters[c - 1].verses.length) {
			// 						book.chapters[c - 1].verses.push({
			// 							"verse_number": parseInt(splitLine[1], 10),
			// 							"verse": verseStr
			// 						});
			// 						v++;
			// 					}
			// 				}
			// 			}
			// 			} else if (splitLine[0].startsWith('\\s')) {
			// 				//Do nothing for section headers now.
			// 			} else if (splitLine.length === 1) {
			// 				// Do nothing here for now.
			// 			} else if (splitLine[0].startsWith('\\m')) {
			// 				// Do nothing here for now
			// 			} else if (splitLine[0].startsWith('\\r')) {
			// 				// Do nothing here for now.
			// 			} else if (c > 0 && v > 0) {
			// 				let cleanedStr = this.replaceMarkers(line);
			// 				book.chapters[c - 1].verses[v - 1].verse += ((cleanedStr.length === 0 ? '' : ' ') + cleanedStr);

			// 			}
			// 		}
			// 	});
			// 	// console.log(book,book.chapters[0].verses.length);
				
			// 	// if (options.targetDb === 'refs') {
			// 	// 	for (let i = 0; i < book.chapters.length; i++) {
			// 	// 		if (!(i in book.chapters)) {
			// 	// 			book.chapters[i] = {
			// 	// 				"verses": [],
			// 	// 				"chapter": i + 1
			// 	// 			}
			// 	// 		}
			// 	// 	}
			// 	// 	refDb.get(book._id).then((doc) => {
			// 	// 		book._rev = doc._rev;
			// 	// 		book.scriptDirection = options.scriptDirection;
			// 	// 		refDb.put(book);
			// 	// 		return callback(null, `${fileName(options.usfmFile)}`)
			// 	// 	}, (err) => {
			// 	// 		refDb.put(book).then((doc) => {
			// 	// 			var missingChapterbook = [];
			// 	// 		(book.chapters).forEach((_value,index)=> {
			// 	// 			if(_value.verses.length===0){
			// 	// 			missingChapterbook = fileName(options.usfmFile)
			// 	// 			AutographaStore.warningMsg.push([fileName(options.usfmFile) , (index+1)])
			// 	// 			}
			// 	// 		})
			// 	// 		if(missingChapterbook !== fileName(options.usfmFile)){
			// 	// 			return callback(null, fileName(options.usfmFile));
			// 	// 		}
			// 	// 		else { 
			// 	// 			return callback(null) 
			// 	// 		}
			// 	// 		}, (err) => {
			// 	// 			// console.log("Error: While loading new refs. " + err);
			// 	// 			return callback(`${fileName(options.usfmFile)}`+ err);
			// 	// 		});
			// 	// 	});
			// 	// } else if (options.targetDb === 'target') {
			// 		console.log(book);
			// 		var bookId = book._id.split('_');
			// 		bookId = bookId[bookId.length - 1].toUpperCase();
			// 		var i, j, k;
			// 		for (i = 0; i < booksCodes.length; i++) {
			// 			if (bookId === booksCodes[i]) {
			// 				i++;
			// 				break;
			// 			}
			// 		}
			// 		db.get(i.toString()).then((doc) => {
			// 			for (i = 0; i < doc.chapters.length; i++) {
			// 				for (j = 0; j < book.chapters.length; j++) {
			// 					if(book.chapters[j] === undefined){
			// 						continue;
			// 					}
			// 					if (book.chapters[j].chapter === doc.chapters[i].chapter) {
	
			// 						var versesLen = Math.min(book.chapters[j].verses.length, doc.chapters[i].verses.length);
			// 						for (k = 0; k < versesLen; k++) {
			// 							var verseNum = book.chapters[j].verses[k].verse_number;
			// 							if (doc.chapters[i].verses[verseNum - 1] != undefined){
			// 								doc.chapters[i].verses[verseNum - 1].verse = book.chapters[j].verses[k].verse;
			// 								book.chapters[j].verses[k] = undefined;
			// 							}
			// 							// else{
			// 							// 	return callback(new Error(`${fileName(options.usfmFile)} ${AutographaStore.currentTrans["usfm-not-valid"]}`))
			// 							// }
			// 						}
			// 						//check for extra verses in the imported usfm here.
			// 						break;
			// 					}
			// 				}
			// 			}
			// 			db.put(doc).then((response) => {
			// 				this.resetLoader();
			// 				//swal({AutographaStore.currentTrans["btn-import"], AutographaStore.currentTrans["label-imported-book"], "success");
			// 				swal({
			// 					title: AutographaStore.currentTrans["btn-import"],
			// 					text:  AutographaStore.currentTrans["label-imported-book"],
			// 					icon: "success",
			// 					dangerMode: false,
			// 					closeOnClickOutside: false,
			// 					closeOnEsc: false
			// 				  })
			// 				  .then((action) => {
			// 					if(action){
			// 						window.location.reload();
			// 					}
			// 				  })

	        //             }).catch((err) => {
			// 				this.resetLoader();
			// 				swal(AutographaStore.currentTrans["dynamic-msg-error"], AutographaStore.currentTrans["dynamic-msg-went-wrong"], "error");
			// 			});
			// 			// var missingChapterbook = [];
			// 			// (book.chapters).find((_value, index) => {
			// 			// 	if (_value === undefined){
			// 			// 		missingChapterbook = fileName(options.usfmFile)
			// 			// 		AutographaStore.warningMsg.push([fileName(options.usfmFile) , (index+1)])
			// 			// 	}
			// 			// })
			// 			// db.put(doc).then((response) => {
			// 			// 	if(missingChapterbook !== fileName(options.usfmFile)){
			// 			// 		return callback(null, fileName(options.usfmFile));
			// 			// 	}
			// 			// 	else { 
			// 			// 		return callback(null) 
			// 			// 	}
			// 			// }, (err) => {
			// 			// 	return callback(`${AutographaStore.currentTrans["Error-whilesaving-db"]}` + err);
			// 			// });
			// 		});
			//    })


	replaceMarkers = (str) => {
		var patternsLine = patterns.split('\n');
		var pattern = '',
			replacement = '',
			pairFoundFlag = -1;
		for (var i = 0; i < patternsLine.length; i++) {
			if (str.length === 0)
				break
			if (patternsLine[i] === '' || patternsLine[i].startsWith('#'))
				continue;
	
			if (patternsLine[i].startsWith('>') && pairFoundFlag <= 0) {
				pattern = patternsLine[i].substr(1);
				pairFoundFlag = 0;
			} else if (patternsLine[i].endsWith('<') && pairFoundFlag === 0) {
				replacement = patternsLine[i].length === 1 ? '' : patternsLine[i].substr(0, patternsLine[i].length - 1);
				pairFoundFlag = 1;
			}
	
			if (pairFoundFlag === 1) {
				str = str.replace(new RegExp(pattern, 'gu'), replacement);
				pairFoundFlag = -1;
			}
		}
		return str;
	}

    uploadBook = async(projectId, projectName) => {
		//comment for Gitea now
        if (this.props.syncAdapter instanceof Gitea) {
            return await this.uploadBookGitea(projectId, projectName);
        } else {
            return await this.uploadBookParatext(projectId, projectName);
		}

		//need to uncomment above code and remove this when gitea will work fine
		// return await this.uploadBookParatext(projectId, projectName);
    };

	uploadBookGitea = async(projectId, projectName) => {
        const dir = path.join(app.getPath('userData'), 'door43_projects');
		let currentTrans = AutographaStore.currentTrans;
        let book = {};
        let _this = this;
        if(AutographaStore.door43Book[projectId] == null || Object.keys(AutographaStore.door43Book[projectId]).length === 0){
        	swal(currentTrans["dynamic-msg-error"], currentTrans["label-selection"], "error");
  			return
		}
		swal({
	        title: currentTrans["label-warning"],
	        text: currentTrans["label-uploading-warning"],
	        icon: "warning",
	        buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
	        dangerMode: false,
	        closeOnClickOutside: false,
	        closeOnEsc: false
	      })
	      .then(async(action) => {
	        if (action) {
				this.props.showLoader(true);
				await this.asyncForEach(AutographaStore.door43Book[projectId], async (bookId) => {
					try{
						console.log("getDoorBookData--->",projectId, bookId, this.state.selectedBranch, this.props.project.proj)
						let bookData =  await _this.props.syncAdapter.getDoorBookData(projectId, bookId, this.state.selectedBranch, this.props.project.proj);
						console.log("dir---->",dir);
						if (!fs.existsSync(dir)){
							fs.mkdirSync(dir);
						}
						console.log("bookData---->",bookData,projectName,bookId)
						if(bookData !== undefined || bookData !== null){
							if (!fs.existsSync(path.join(app.getPath('userData'), 'door43_projects', projectName))){
								fs.mkdirSync(path.join(app.getPath('userData'), 'door43_projects', projectName));
							}
							// if (bookId.match(/(\/)/g)){
							// 	folder = ((bookId).replace(/(\/)(.*)/g,""));
							// }
							else{
								if(fs.existsSync(path.join(app.getPath('userData'), 'door43_projects', projectName))){
									fs.writeFileSync(path.join(app.getPath('userData'), 'door43_projects', projectName, `${bookId}`), bookData, 'utf8');
								}
							}
						}
					}catch(err){
						console.log(err);
						return false
					}
					console.log("Ending------>",projectId, bookId);
					// let bookRevision = await _this.props.syncAdapter.getBookRevision(projectId, bookId);
					// let parser = new xml2js.Parser();
					// parser.parseString(bookRevision, (err, result) => {
					// 	let revision = result.RevisionInfo.ChapterInfo[0].$.revision;
					// 	let bookIndex = booksCodes.findIndex((book) => book === bookId)
					// 	db.get((bookIndex + 1).toString()).then( async (doc) => {
					// 		let xmlBook = fs.readFileSync(`${app.getPath('userData')}/door43_projects/${projectName}/${bookId.toUpperCase()}.xml`, 'utf8');
					// 		const xmlDoc = new DOMParser().parseFromString(xmlBook,"text/xml");
					// 		if (xmlDoc.evaluate) {
					// 			let chapterNodes =  xmlDoc.evaluate("//chapter", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
					// 			let verseNodes = xmlDoc.evaluate("//verse", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
	
					// 			let currChapter=chapterNodes.snapshotItem(0);
					// 			book[currChapter.attributes["number"].value-1] = [];
					// 			let currVerse = verseNodes.snapshotItem(0);
					// 			let v = 0;
					// 			let i = 0;
								
					// 			while(v < verseNodes.snapshotLength){
					// 				v++;
					// 					if(currVerse.attributes["number"].value === 1 && book[currChapter.attributes["number"].value-1].length !== 0){
					// 					i++;
					// 					currChapter = chapterNodes.snapshotItem(i);
					// 					book[currChapter.attributes["number"].value-1] = [];
					// 				}
					// 				let verse = doc.chapters[currChapter.attributes["number"].value-1].verses[currVerse.attributes["number"].value-1];

					// 					if(!currVerse.nextSibling){
					// 						currVerse.insertAdjacentText('afterend',verse.verse);
					// 					}
					// 					else if(currVerse.nextElementSibling && currVerse.nextElementSibling.nodeName === "note"){
					// 						if(currVerse.nextElementSibling.nextSibling && currVerse.nextElementSibling.nextSibling.nodeName === "#text"){
					// 							currVerse.nextElementSibling.nextSibling.remove();
					// 						}
					// 						currVerse.nextElementSibling.insertAdjacentText('afterend', verse.verse);
					// 					}else if(currVerse.nextSibling.nodeName === "#text"){
					// 						currVerse.nextSibling.remove();
					// 						currVerse.insertAdjacentText('afterend', verse.verse);
					// 					}else{
					// 						currVerse.insertAdjacentText('afterend', verse.verse);
					// 					}
					// 					book[currChapter.attributes["number"].value-1].push({verse_number: currVerse.attributes["number"].value, verse: currVerse.nextSibling !== null ? (currVerse.nextSibling.data !== undefined ? currVerse.nextSibling.data : "")   : ""})
					// 					currVerse = verseNodes.snapshotItem(v);

					// 			}
					// 			try{
					// 				_this.props.syncAdapter.updateBookData(projectId, bookId, revision, xmlDoc.getElementsByTagName("usx")[0].outerHTML);
					// 				fs.writeFileSync(`${app.getPath('userData')}/paratext_projects/${projectName}/${bookId}.xml`, xmlDoc.getElementsByTagName("BookText")[0].outerHTML, 'utf8');
					// 				swal(currentTrans["dynamic-msg-book-exported"], currentTrans["label-exported-book"], "success");
					// 			}catch(err){
					// 				swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
					// 			}finally{
					// 				this.props.showLoader(false);
					// 			}
					// 		}
					// 	}).catch((err) => {
					// 		this.props.showLoader(false);
					// 		swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
					// 	});
					// });
				})
			}
		  })
	};
    // uploadBookGitea = async(projectId, projectName) => {
    //     const currentTrans = AutographaStore.currentTrans;

    //     if (!await swal({
    //         title: currentTrans["label-warning"],
    //         text: currentTrans["label-uploading-warning"],
    //         icon: "warning",
    //         buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
    //         dangerMode: false,
    //         closeOnClickOutside: false,
    //         closeOnEsc: false
    //     })) {
    //         return;
    //     }

    //     this.props.showLoader(true);

    //     // try {
    //     //     const localPath = await this.props.syncAdapter.clone(projectId);
    //     //     const writtenBooks = await usfm_export.allBooksToUsfm(localPath);
    //     //     const writtenBookIds = writtenBooks.map(b => b.bookNumber);
    //     //     this.resetLoader();
    //     //     await swal(currentTrans["dynamic-msg-book-exported"], this.makeSyncReport(writtenBookIds), "success");
    //     // } catch(err) {
    //     //     console.log(err);
    //     //     this.resetLoader();
    //     //     await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
    //     // }
    // };

    uploadBookParatext = async(projectId, projectName) => {
        const dir = path.join(app.getPath('userData'), 'paratext_projects');
		let currentTrans = AutographaStore.currentTrans;
        let book = {};
        let _this = this;
        if(AutographaStore.paratextBook[projectId] == null || Object.keys(AutographaStore.paratextBook[projectId]).length === 0){
        	swal(currentTrans["dynamic-msg-error"], currentTrans["label-selection"], "error");
  			return
		}
		swal({
	        title: currentTrans["label-warning"],
	        text: currentTrans["label-uploading-warning"],
	        icon: "warning",
	        buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
	        dangerMode: false,
	        closeOnClickOutside: false,
	        closeOnEsc: false
	      })
	      .then(async(action) => {
	        if (action) {
				this.props.showLoader(true);
				await this.asyncForEach(AutographaStore.paratextBook[projectId], async (bookId) => {
					try{
						let bookData =  await _this.props.syncAdapter.getUsxBookData(projectId, bookId);
						if (!fs.existsSync(dir)){
							fs.mkdirSync(dir);
						}
						if(bookData !== undefined || bookData !== null){
							if (!fs.existsSync(path.join(app.getPath('userData'), 'paratext_projects', projectName))){
								fs.mkdirSync(path.join(app.getPath('userData'), 'paratext_projects', projectName));
							}
							if(fs.existsSync(path.join(app.getPath('userData'), 'paratext_projects', projectName))){
								fs.writeFileSync(path.join(app.getPath('userData'), 'paratext_projects', projectName, `${bookId}.xml`), bookData, 'utf8');
							}
						}
					}catch(err){
						console.log(err);
						return false
					}
					let bookRevision = await _this.props.syncAdapter.getBookRevision(projectId, bookId);
						let parser = new xml2js.Parser();
						parser.parseString(bookRevision, (err, result) => {
							let revision = result.RevisionInfo.ChapterInfo[0].$.revision;
							let bookIndex = booksCodes.findIndex((book) => book === bookId)
							db.get((bookIndex + 1).toString()).then( async (doc) => {
								let xmlBook = fs.readFileSync(`${app.getPath('userData')}/paratext_projects/${projectName}/${bookId.toUpperCase()}.xml`, 'utf8');
								const xmlDoc = new DOMParser().parseFromString(xmlBook,"text/xml");
								if (xmlDoc.evaluate) {
									let chapterNodes =  xmlDoc.evaluate("//chapter", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
									let verseNodes = xmlDoc.evaluate("//verse", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
		
									let currChapter=chapterNodes.snapshotItem(0);
									book[currChapter.attributes["number"].value-1] = [];
									let currVerse = verseNodes.snapshotItem(0);
									let v = 0;
									let i = 0;
									
									while(v < verseNodes.snapshotLength){
										v++;
										 if(currVerse.attributes["number"].value === 1 && book[currChapter.attributes["number"].value-1].length !== 0){
											i++;
											currChapter = chapterNodes.snapshotItem(i);
											book[currChapter.attributes["number"].value-1] = [];
										}
										let verse = doc.chapters[currChapter.attributes["number"].value-1].verses[currVerse.attributes["number"].value-1];

											if(!currVerse.nextSibling){
												currVerse.insertAdjacentText('afterend',verse.verse);
											}
											else if(currVerse.nextElementSibling && currVerse.nextElementSibling.nodeName === "note"){
												if(currVerse.nextElementSibling.nextSibling && currVerse.nextElementSibling.nextSibling.nodeName === "#text"){
													currVerse.nextElementSibling.nextSibling.remove();
												}
												currVerse.nextElementSibling.insertAdjacentText('afterend', verse.verse);
											}else if(currVerse.nextSibling.nodeName === "#text"){
												currVerse.nextSibling.remove();
												currVerse.insertAdjacentText('afterend', verse.verse);
											}else{
												currVerse.insertAdjacentText('afterend', verse.verse);
											}
											book[currChapter.attributes["number"].value-1].push({verse_number: currVerse.attributes["number"].value, verse: currVerse.nextSibling !== null ? (currVerse.nextSibling.data !== undefined ? currVerse.nextSibling.data : "")   : ""})
											currVerse = verseNodes.snapshotItem(v);

									}
									try{
										_this.props.syncAdapter.updateBookData(projectId, bookId, revision, xmlDoc.getElementsByTagName("usx")[0].outerHTML);
										fs.writeFileSync(`${app.getPath('userData')}/paratext_projects/${projectName}/${bookId}.xml`, xmlDoc.getElementsByTagName("BookText")[0].outerHTML, 'utf8');
										swal(currentTrans["dynamic-msg-book-exported"], currentTrans["label-exported-book"], "success");
									}catch(err){
										swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
									}finally{
										this.props.showLoader(false);
									}
								}
							}).catch((err) => {
								this.props.showLoader(false);
								swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
							});
					});
				})
			}
		  })
	};
	
	asyncForEach = async (array, callback) => {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array)
		}
	};

	makeSyncReport = bookIdList => {
		const justShowCount = bookIdList.length > 4;
		const form = justShowCount
			? "dynamic-msg-sync-book-count"
			: "dynamic-msg-sync-book-list";
		const param = justShowCount
			? bookIdList.length
			: bookIdList
				.sort()
				.map(id => booksNames[id - 1])
				.join("\n");
		return AutographaStore.currentTrans[form].replace('$', param);
	};

	getBranches = async (projectId, repoName) => {
		console.log(projectId, repoName);
		if(!this.state.open){
			this.props.showLoader(true);
			try{
				let branchesList = await this.props.syncAdapter.getBranchsList(projectId, repoName);
				console.log("branchesList----->",branchesList);
				branchesList = branchesList.map(branch => {
					// console.log(branch,"**********",branch.branchzid);
					// if (booksCodes.includes(book.id)){
					// console.log(branch,"-----",branch.branchz,"-----");
					return branch
					// }
				}).filter(branch => branch);
				//fetching book data done  and hiding the loader
				this.props.showLoader(false);
				this.setState({branchList: branchesList, open: true })
			}catch(err){

			}
			finally {
				this.props.showLoader(false);
			}
		}else{
			this.setState({ open: false })
		}	
		// if((this.state.branchList).length < 2){
			// console.log(projectId, repoName, this.state.branchList[0].branchzid[0])
			this.setState({ open: false })
			this.getGiteaBooks(projectId, repoName, this.state.branchList[0].branchz)
		// }
		// else{
		// 	this.setState({ open: false })
		// 	this.getGiteaBooks(projectId, repoName, this.state.branchList[0].branchzid)
		// }
	};

	getGiteaBooks = async (userName, projectName, branchName) => {
		console.log("getGiteaBooks",userName,branchName, projectName,this.state.open);
		// if(!this.state.open){
			console.log("Yooooooo")
			this.props.showLoader(true);
			try{
				let booksList = await this.props.syncAdapter.getBooksList( userName, projectName, branchName);
				// console.log("bookList =---->",booksList);
				this.setState({selectedBranch: branchName});
				console.log("selectedBranch----------->",this.state.selectedBranch);
				// const removePath = booksList[0]
				// booksList.shift()
				booksList = booksList.map(book => {
					// book = book.replace(removePath+"/",'');
					// console.log("removePath",book);
					// console.log(booksCodes);
					// if (booksCodes.includes(book.id)){
					// 	console.log(booksList,book,book.id);
					if (book.match(/\.(usfm|sfm)/i)){
						return [book]
					}
					// }
				}).filter(book => book);
				//fetching book data done  and hiding the loader
				this.props.showLoader(false);
				this.setState({bookList: booksList, open: true })

			}catch(err){

			}
			finally {
				this.props.showLoader(false);
			}
		// }else{
		// 	this.setState({ open: false })
		// }	
    };
	
	getBooks = async (projectId, projectName) => {
		if(!this.state.open){
			this.props.showLoader(true);
			try{
				let booksList = await this.props.syncAdapter.getBooksList(projectId);
				console.log("bookList =---->",booksList);
				booksList = booksList.map(book => {
					console.log(booksList,book);
					// console.log(booksCodes);
					if (booksCodes.includes(book.id)){
					// 	console.log(booksList,book,book.id);
						return book.id
					}
				}).filter(book => book);
				//fetching book data done  and hiding the loader
				this.props.showLoader(false);
				this.setState({bookList: booksList, open: true })

			}catch(err){

			}
			finally {
				this.props.showLoader(false);
			}
		}else{
			this.setState({ open: false })
		}	
    };

  	render (){
		  const {project, index} = this.props;
		  let folder = "", prevFolder = "";
		  console.log(AutographaStore.showSyncImportReport)
		  console.log(this.state.totalFiles,(this.state.totalFiles).length)
		  if((AutographaStore.showSyncImportReport) == true){
			  console.log("IF showSyncImportReport is TRUE---------->",this.state.totalFiles,this.props.showLoader)
				return(<ImportReport totalFiles={this.state.totalFiles} showLoader={this.props.showLoader} />)
			}
	  		return (
	  			<Panel eventKey={index+1}>
				    <Panel.Heading >
						<div style={{display:"flex"}}>
						<Panel.Title toggle onClick = {() => {this.getBranches(project.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title>
                      {/* <Panel.Title toggle onClick = {() => {this.getBooks(project.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title> */}
					  {/* <Panel.Title toggle onClick = {() => {this.getGiteaBooks(b.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title> */}
					  {/* <p>vipinpaul</p> */}
						{
							(this.state.branchList).length > 1 ? 
							<select style={{marginLeft: "66px"}} onClick = {(e) => { this.getGiteaBooks(project.projid[0], project.proj[0], e.target.value); console.log(JSON.stringify(e.target.value)); }} >{
								(this.state.branchList).map((branch,key) => (
									<option key={key} value={branch.branchz}>{branch.branchz}</option>
									// <p key={key} toggle onClick = {() => {this.getGiteaBooks(project.projid[0], project.proj[0], branch.branchzid)}}>{branch.branchz}</p>
								))}
								</select>
							:
							null
								// (this.state.branchList).map((branch,key) => (
								// 	<Panel.Title toggle onClick = {() => {this.getGiteaBooks(project.projid[0], project.proj[0], branch.branchzid)}}></Panel.Title>
								// ))
							
						}</div>
					{/* //   {(this.state.branchList).map((branch,key) => (
					// 	  <p key={key} toggle onClick = {() => {this.getGiteaBooks(project.projid[0], project.proj[0], branch.branchzid)}}>{branch.branchz}</p>
					//   ))} */}
                      {/*<Panel.Title toggle>{ project.proj[0] }</Panel.Title>*/}
				    </Panel.Heading>
				    <Panel.Body collapsible>
				    	<FormGroup id="project-list">
						    {
						    	this.state.bookList.map((res, i) => {
									// This condition is added to separate the file name and directory name
									if ((res[0]).match(/(\/)/g)){
										folder = ((res[0]).replace(/(\/)(.*)/g,""));
										if (folder !== prevFolder){
											prevFolder = folder;
											return(<div key={i}>
												<b>{res[0].replace(/(\/)(.*)/g,"")}</b>
											</div>)
										}
										return(<Checkbox id={res} inline key={i} value={res} onChange={(e) => {this.selectBook(project.projid[0], res, e)}}>{res[0].replace(/(.*)(\/)/g,"")}</Checkbox>)
									}
									else{
										return(<Checkbox id={res} inline key={i} value={res} onChange={(e) => {this.selectBook(project.projid[0], res, e)}}>{res}</Checkbox>)
									}
								})
								
							}
				    	</FormGroup>
						{	
							/*(this.props.syncAdapter instanceof Gitea || Object.keys(this.state.bookList).length > 0)*/  
							Object.keys(this.state.bookList).length > 0 &&
							<div style={{float: "right"}} className="btn-imp-group">
				    			<a href="javascript:void(0)"   className="margin-right-10 btn btn-success btn-import" onClick={() =>{ this.importBook(project.projid[0])} } disabled={this.state.isImporting ? true : false}>{this.state.importText}</a>
				    			<a href="javascript:void(0)" className = "margin-right-10 btn btn-success btn-upload" onClick={() =>{ this.uploadBook(project.projid[0], project.proj[0])} } disabled={this.state.isImporting ? true : false}>Upload</a>
							</div>
							// <div style={{float: "right"}} className="btn-imp-group">
				    		// 	<a href="javascript:void(0)"   className="margin-right-10 btn btn-success btn-import" onClick={() =>{ this.importBook(project.projid[0])} } disabled={this.state.isImporting ? true : false}>{this.state.importText}</a>
				    		// 	<a href="javascript:void(0)" className = "margin-right-10 btn btn-success btn-upload" onClick={() =>{ this.uploadBook(project.projid[0], project.proj[0])} } disabled={this.state.isImporting ? true : false}>Upload</a>
							// </div>
						}
						
				    </Panel.Body>
				</Panel>
			);
	};
}

// ProjectListRow.propTypes = {
//   project: PropTypes.object.isRequired
// };

export default ProjectListRow;