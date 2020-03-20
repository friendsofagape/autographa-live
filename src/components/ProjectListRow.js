import React, { PropTypes } from 'react';
import swal from 'sweetalert';
import AutographaStore from "./AutographaStore";
import * as usfm_export from "../util/json_to_usfm";
import * as usfm_import from "../util/usfm_import";
import Gitea from "../helpers/giteaAdapter"
import { Panel,  FormGroup, Checkbox } from 'react-bootstrap/lib';
import xml2js from 'xml2js';
import Paratext from '../helpers/paratextAdapter';
import { autoUpdater } from 'electron';
const db = require(`${__dirname}/../util/data-provider`).targetDb();
const refDb = require(`${__dirname}/../util/data-provider`).referenceDb();
const booksCodes = require(`${__dirname}/../util/constants.js`).bookCodeList;
const booksNames = require(`${__dirname}/../util/constants.js`).booksList;
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');

class ProjectListRow extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			userName: '',
			branchList: [],
			bookList: [],
			selectedBook: [],
			selectedBranch: '',
			importText: AutographaStore.currentTrans["btn-import"],
			isImporting: false,
			open: false
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
				let filteredArray = this.state.selectedBook.map(id => {
					if (id !== bookId) {
						return id
					}
				}).filter(id => id);
    			this.setState({selectedBook: filteredArray});
				AutographaStore.door43Book[projId] = filteredArray
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

	getGiteaBranches = async (projectId, repoName) => {
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
		console.log(this.state.branchList[0].branchz);
		// if((this.state.branchList).length < 2){
			// console.log(projectId, repoName, this.state.branchList[0].branchzid[0])
			this.setState({ open: false })
			this.getGiteaBooks(projectId, repoName, (this.state.branchList[0].branchz[0]))
		// }
		// else{
		// 	this.setState({ open: false })
		// 	this.getGiteaBooks(projectId, repoName, this.state.branchList[0].branchzid)
		// }
	};

	getGiteaBooks = async (userName, projectName, branchName) => {
		this.setState({ userName: userName });
		console.log("getGiteaBooks",userName,branchName, projectName,this.state.open);
		// if(!this.state.open){
			console.log("Yooooooo")
			this.props.showLoader(true);
			try{
				let booksList = await this.props.syncAdapter.getBooksList( userName, projectName, branchName);
				// console.log("bookList =---->",booksList);
				this.setState({selectedBranch: branchName});
				console.log("selectedBranch----------->",this.state.selectedBranch);

				let folder = "",prevFolder = "";
				let books = [];
				for (let i = 0; i < (booksList.length); i++) {
					if (booksList[i].match(/\.(usfm|sfm)/i)){
						// console.log(booksList[i]);
						if (booksList[i].match(/(\/)/g)){
							folder = (booksList[i].replace(/\/(?:.(?!\/))+$/g,""));
							if (folder !== prevFolder){
								prevFolder = folder;
								books.push(folder);
							}
							// books.push(booksList[i].replace(/(.*)(\/)/g,""));
						}
						// else{
						books.push(booksList[i]);							
						// }
					}
				}
				// console.log("booksList--->",books);
				//fetching book data done  and hiding the loader
				this.props.showLoader(false);
				this.setState({bookList: books, open: true })

			}catch(err){

			}
			finally {
				this.props.showLoader(false);
			}
		// }else{
		// 	this.setState({ open: false })
		// }	
    };

	importBook = (projectId) => {
		//comment for Gitea now
		console.log(this.props.syncAdapter,projectId);
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
						book[currChapter.attributes["number"].value] = [];
						let currVerse = verseNodes.iterateNext();
						while(currVerse){
							if(currVerse.attributes["number"].value == 1 && book[currChapter.attributes["number"].value].length != 0){
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
									if ((temp.attributes.getNamedItem("style").nodeValue).match(/p|(q(\d)?)/g) && currVerse.parentElement.lastChild.previousSibling === currVerse) {
										verseText += " "+temp.textContent;
									}
									temp = temp.nextElementSibling;
								}
								book[currChapter.attributes["number"].value].push({verse_number: currVerse.attributes["number"].value, verse: verseText});
							}
							currVerse = verseNodes.iterateNext();
						}
					}
					//get bookIndex from const 
					let bookCode = booksCodes.findIndex((book) => book === bookId);
					db.get((bookCode + 1).toString()).then((doc) => {
	                    for (let i = 0; i < doc.chapters.length; i++) {
	                        for (let j = 1; j <= Object.keys(book).length; j++) {
	                            if (j === doc.chapters[i].chapter) {
									var versesLen = Math.min(book[j].length, doc.chapters[i].verses.length);
									for (let k = 0; k < versesLen; k++) {
										var verseNum = book[j][k].verse_number;
										if (verseNum.match((/\W/gm))){
											let verseNumber = verseNum.match(/\d+/g);
											doc.chapters[i].verses[parseInt(verseNumber[0], 10) - 1] = ({
												"verse_number": parseInt(verseNumber[0], 10),
												"verse": book[j][k].verse
											});

											// Here instead of i = verseNumber[1], used i = verseNumber[0] so that won't miss any number
											// If the number is 1,3, therefore the verseNumber[1] will be 3 and will miss number 2

											for (let count = (parseInt(verseNumber[0]))+1; count <= verseNumber[(verseNumber.length)-1]; count++) {
												doc.chapters[i].verses[count - 1] = ({
													"verse_number": parseInt(count, 10),
													"verse": "",
													"joint_verse": parseInt(verseNumber[0])
												});
											}
										} else {
											doc.chapters[i].verses[verseNum - 1] = ({
												"verse_number": parseInt(verseNum, 10),
												"verse": book[j][k].verse
											});
										}
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
 	        	})
	        }
	    });
  	};

    importBookGitea = async (projectId) => {
		
		console.log("Inside Gitea Import", AutographaStore.door43Book);
		console.log(this.state.selectedBook)
        const langCode = 'NA';
		const langVersion = 'NA';
		let localPath = [];
        const currentTrans = AutographaStore.currentTrans;
        if (!await swal({
            title: currentTrans["label-warning"],
            text: currentTrans["label-override-text"],
            icon: "warning",
            buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
            dangerMode: false,
            closeOnClickOutside: false,
            closeOnEsc: false
        })) {
            return;
        }
		console.log("After Return")
		this.props.showLoader(true);
		console.log(this.state.selectedBranch);
		let branch = this.state.selectedBranch;
		let projectName = this.props.project.proj[0];

		// This function is for backing up the current data in Translation pane
		// this.backupTranslation(projectId, branch, projectName);
		console.log('gitea_projects',this.endpoint,this.state.userName,this.props.syncAdapter.endpoint);
		const folderPath = path.join(app.getPath('userData'), 'gitea_projects',this.props.syncAdapter.endpoint,this.state.userName,projectName,branch);
		console.log(folderPath);
		// const dir = path.join(folderPath, projectName);
		let filePath = "";
        try {
			let doc = await db.get('targetBible');
			let bookData = "";
			console.log(doc)
			console.log("In try");
			try{
				console.log(AutographaStore.door43Book[projectId]);
				Promise.all(AutographaStore.door43Book[projectId].map(async(bookId) => {
					console.log("Try 350");
					bookData = await this.props.syncAdapter.getDoorBookData(projectId, bookId, branch, projectName);
					// console.log("bookData--->",bookData);
					if (!fs.existsSync(folderPath)){
						fs.mkdirSync(folderPath, { recursive: true }, (err) => {
							if (err) throw err;
						});
					}
					// if (!fs.existsSync(dir)){
					// 	fs.mkdirSync(dir);
					// }
					if(bookData !== undefined || bookData !== null){
						// if (!fs.existsSync(path.join(dir, branch))){
						// 	fs.mkdirSync(path.join(dir, branch));
						// }
						console.log(projectId, bookId,bookId[0], branch, projectName, bookData);
						// To check whether the file is inside a directory in gitea
						if (bookId.match(/(\/)/g)){
							let folderSplit = bookId.split("\/");
							console.log(folderSplit);
							let folder = "";
							for (let i = 0; i <= (folderSplit.length)-2; i++) {
								folder = path.join(folder,folderSplit[i]);
								console.log(folder);
							}
							let fileName = folderSplit[(folderSplit.length)-1];
							// let folder = (bookId.replace(/\/(?:.(?!\/))+$/g,""));
							// let fileName = (bookId.replace(/(.*)(\/)/g,""));
							console.log(folder,fileName);
							if (!fs.existsSync(path.join(folderPath, folder))){
								fs.mkdirSync(path.join(folderPath, folder), { recursive: true }, (err) => {
									if (err) throw err;
								});
							}
							fs.writeFileSync(path.join(folderPath, folder, fileName), bookData, 'utf8');
							filePath = path.join(folderPath, folder, fileName);
							console.log("ilepth==",filePath);
							localPath.push(filePath);
							filePath = "";
							
							// if(fs.existsSync(folderPath)){
							// 	if(!fs.existsSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder))){
							// 		fs.mkdirSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder));
							// 	}
							// 	fs.writeFileSync(path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder, fileName), bookData, 'utf8');
							// 	filePath = path.join(app.getPath('userData'), 'gitea_projects', projectName, branch, folder, fileName);
							// 	console.log("ilepth==",filePath);
							// 	localPath.push(filePath);
							// }
						}
						else {
							if (!fs.existsSync(folderPath)){
								fs.mkdirSync(folderPath, { recursive: true }, (err) => {
									if (err) throw err;
								});
							}
							fs.writeFileSync(path.join(folderPath, `${bookId}`), bookData, 'utf8');
							filePath = path.join(folderPath, `${bookId}`);
							console.log("ilepth=elseif=",filePath);
							localPath.push(filePath);
							filePath = "";
						}
					}
					console.log("Before get report",localPath);
					// await this.getReport(doc, filePath);
				})).then(async() => {
					console.log(localPath, doc.targetLang, doc.targetVersion)
					// const results = await usfm_import.importTranslationFiles(localPath, doc.targetLang, doc.targetVersion);
					// console.log("results",results);
					// const importedBooks = results.map(r => r.id);
					usfm_import.importTranslationFiles(localPath, doc.targetLang, doc.targetVersion)
					.then(async(res)=> {
						// console.log(res)
						this.resetLoader();
						await swal(currentTrans["btn-import"], this.makeSyncReport(res), "success");
					}).finally(()=>{
						window.location.reload();
					});
				});			
			} catch(err) {
				this.resetLoader();
				await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
			}
        } catch(err) {
			this.resetLoader();
            await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-enter-translation"])
        }

        // window.location.reload();
    };

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
        const currentTrans = AutographaStore.currentTrans;

        if (!await swal({
            title: currentTrans["label-warning"],
            text: currentTrans["label-uploading-warning"],
            icon: "warning",
            buttons: [currentTrans["btn-cancel"], currentTrans["btn-ok"]],
            dangerMode: false,
            closeOnClickOutside: false,
            closeOnEsc: false
        })) {
            return;
        }

		this.props.showLoader(true);
		let branch = this.state.selectedBranch;
		let repo = this.props.project.proj[0];
		// updateDoorBookData(projectId, repo, contents, bookId);
        try {
			Promise.all(AutographaStore.door43Book[projectId].map(async(bookId) => {
				let bookData = await this.props.syncAdapter.getDoorBookData(projectId, bookId, branch, projectName);
				// console.log(bookData);
				let book = {};
            	let bookArray = {'GEN':"1",'EXO':"2",'LEV':"3",'NUM':"4",'DEU':"5",'JOS':"6",'JDG':"7",'RUT':"8",'1SA':"9",'2SA':"10",'1KI':"11",'2KI':"12",'1CH':"13",'2CH':"14",'EZR':"15",'NEH':"16",'EST':"17",'JOB':"18",'PSA':"19",'PRO':"20",'ECC':"21",'SNG':"22",'ISA':"23",'JER':"24",'LAM':"25",'EZK':"26",'DAN':"27",'HOS':"28",'JOL':"29",'AMO':"30",'OBA':"31",'JON':"32",'MIC':"33",'NAM':"34",'HAB':"35",'ZEP':"36",'HAG':"37",'ZEC':"38",'MAL':"39",'MAT':"40",'MRK':"41",'LUK':"42",'JHN':"43",'ACT':"44",'ROM':"45",'1CO':"46",'2CO':"47",'GAL':"48",'EPH':"49",'PHP':"50",'COL':"51",'1TH':"52",'2TH':"53",'1TI':"54",'2TI':"55",'TIT':"56",'PHM':"57",'HEB':"58",'JAS':"59",'1PE':"60",'2PE':"61",'1JN':"62",'2JN':"63",'3JN':"64",'JUD':"65",'REV':"66"}
				let usfmBibleBook = false,
					foundBook = false;
				let validLineCount = 0;
				var content = bookData.split("\n");
				console.log("content",content);
				content.map(async(line) => {
					// Logic to tell if the input file is a USFM book of the Bible.
					if (!usfmBibleBook || !foundBook) {
						if (validLineCount > 5) {
							this.resetLoader();
            				await swal(currentTrans["dynamic-msg-error"], currentTrans["usfm-bookid-missing"], "error");
							return null
						}
						validLineCount++;
						var splitLine = line.split(/ +/);
						console.log(splitLine);
						if (!line) {
							validLineCount--;
							//Do nothing for empty lines.
						} else if (splitLine[0] === '\\id') {
							if (booksCodes.includes(splitLine[1].toUpperCase()))
								usfmBibleBook = true;
								book.bookCode = splitLine[1].toUpperCase();
						} else if (splitLine[0] === '\\mt') {
							book.bookName = splitLine[1];
							foundBook = true;
						} else if (splitLine[0] === '\\c') {
							// Didn't get book name (\mt) and enter into this condition
							// then this file doesn't have book name.
							foundBook = true;
						}
					}
				});
				
				if (book.bookCode) {
					// let bookIndex = booksCodes.findIndex((book) => book === bookCode);
					book.bookNumber = bookArray[book.bookCode];
					book.bookName = (book.bookName) === undefined ? book.bookCode : book.bookName;
					const usfmDoc = await usfm_export.toUsfmDoc(book, false);
					console.log(usfmDoc);
					// db.get((bookIndex + 1).toString()).then( async (doc) => {
					// 	console.log(doc)
					// });
					// updateDoorBookData(projectId, repo, contents, bookId, branch);
				}
			}));
            // const localPath = await this.props.syncAdapter.clone(projectId);
            // const writtenBooks = await usfm_export.allBooksToUsfm(localPath);
            // const writtenBookIds = writtenBooks.map(b => b.bookNumber);
            // this.resetLoader();
            // await swal(currentTrans["dynamic-msg-book-exported"], this.makeSyncReport(writtenBookIds), "success");
        } catch(err) {
            this.resetLoader();
            await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
        }
	};

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
								// fs.writeFileSync(path.join(app.getPath('userData'), 'paratext_projects', projectName, `${bookId}_new.xml`), bookData, 'utf8');
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
							let bookIndex = booksCodes.findIndex((book) => book === bookId);
							db.get((bookIndex + 1).toString()).then( async (doc) => {
								let xmlBook = fs.readFileSync(`${app.getPath('userData')}/paratext_projects/${projectName}/${bookId.toUpperCase()}.xml`, 'utf8');
								const xmlDoc = new DOMParser().parseFromString(xmlBook,"text/xml");
								if (xmlDoc.evaluate) {
									let chapterNodes =  xmlDoc.evaluate("//chapter", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
									let verseNodes = xmlDoc.evaluate("//verse", xmlDoc, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE, null);
									let dbVerses;
									let currChapter=chapterNodes.snapshotItem(0);
									let currVerse;
									let v = 0;
									let i = 0;
									let count;
									let verseNumber;
									let verses;
									let dbContent = ["test"];
									let verseCount = 1;
									while(v < verseNodes.snapshotLength){
										currVerse = verseNodes.snapshotItem(v);
										let xmlVerseNum = (currVerse.attributes["number"].value).match(/^(\d+)/g);
										v++;
										// verseCount + 1 is used to check the length of the dbContent
										if(xmlVerseNum == 1 && (doc.chapters[currChapter.attributes["number"].value]).length != 0 && (verseCount + 1) > dbContent.length){
											currChapter = chapterNodes.snapshotItem(i);
											dbVerses = doc.chapters[currChapter.attributes["number"].value-1].verses;
											i++;
											count = 0;
											verseCount = 0;
											dbContent = [];
											for (const verse of dbVerses) {
												count = count + 1;
												if (count < (dbVerses).length && dbVerses[count].joint_verse) {
													// Finding out the join verses and get their verse number(s)
													verseNumber = dbVerses[count].joint_verse + "-" + dbVerses[count].verse_number;
													verses = dbVerses[(dbVerses[count].joint_verse)-1].verse;
													continue;
												} else {
													if (verseNumber) {
														// Push join verse number (1-3) and content.
														dbContent.push({
															"verse_number" : verseNumber,
															"verse" : verses
														});
														verseNumber = undefined;
														verses = undefined;
													} else {
														// Push verse number and content.
														dbContent.push({
															"verse_number" : verse.verse_number,
															"verse" : verse.verse
														});
													}
												}
											}
										} else {
											if (xmlVerseNum == 1 && (verseCount + 1) <= dbContent.length) {
												v = v-2;
												currVerse = verseNodes.snapshotItem(v);
											}
										}
	
										if (dbContent[verseCount] !== undefined && verseCount < dbContent.length) {
											let dbVerseNum;
											if (String(dbContent[verseCount].verse_number).match(/\W/gm)){
												let dbVerseNum1 = String(dbContent[verseCount].verse_number).match(/^(\d+)/g);
												dbVerseNum = dbVerseNum1[0];
											} else {
												dbVerseNum = (dbContent[verseCount].verse_number)
											}
											if (parseInt(xmlVerseNum[0],10) >= parseInt(dbVerseNum,10)) {
												if(!currVerse.nextSibling){
													currVerse.insertAdjacentText('afterend', dbContent[verseCount].verse);
													currVerse.attributes["number"].value = dbContent[verseCount].verse_number;
												}
												else if(currVerse.nextElementSibling && currVerse.nextElementSibling.nodeName === "note"){
													if(currVerse.nextElementSibling.nextSibling && currVerse.nextElementSibling.nextSibling.nodeName === "#text"){
														currVerse.nextElementSibling.nextSibling.remove();
													}
													currVerse.insertAdjacentText('afterend', dbContent[verseCount].verse);
													currVerse.attributes["number"].value = dbContent[verseCount].verse_number;
												}else if(currVerse.nextSibling.nodeName === "#text"){
													currVerse.nextSibling.remove();
													currVerse.insertAdjacentText('afterend', dbContent[verseCount].verse);
													currVerse.attributes["number"].value = dbContent[verseCount].verse_number;
												}else{
													currVerse.insertAdjacentText('afterend', dbContent[verseCount].verse);
													currVerse.attributes["number"].value = dbContent[verseCount].verse_number;
												}											
												if ((verseCount + 1) <= dbContent.length) {
													verseCount++;
												}
											} else if(parseInt(xmlVerseNum[0],10) < parseInt(dbVerseNum,10) && xmlVerseNum == 1 && (verseCount + 1) <= dbContent.length) {
												// Add new verse node for extra/unjoined verses
												for (let j = verseCount;j < dbContent.length;j++) {
													let newClone = currVerse.cloneNode([true]);
													newClone.attributes["number"].value = dbContent[j].verse_number;
													// Node can be added on the basis parentNode
													if (currVerse.parentNode.nodeName === "para") {
														currVerse.parentNode.appendChild(newClone);
													} else {
														currVerse.parentNode.insertBefore(newClone, chapterNodes.snapshotItem(i));
													}
													newClone.insertAdjacentText('afterend', dbContent[j].verse);												
												}
												verseCount = dbContent.length;
												v = v + 1; 
											} else {
												if (currVerse.nextSibling) {
													currVerse.nextSibling.remove();
												}
												if (currVerse) {
													currVerse.remove();
												}
											}
										} else {
											if (currVerse.nextSibling) {
												currVerse.nextSibling.remove();
											}
											if (currVerse) {
												currVerse.remove();
											}
										}
									}
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

	getBooks = async (projectId, projectName) => {
		if(!this.state.open){
			this.props.showLoader(true);
			try{
				let booksList = await this.props.syncAdapter.getBooksList(projectId);
				booksList = booksList.map(book => {
					if (booksCodes.includes(book.id)){
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
	  		return (
	  			<Panel eventKey={index+1}>
				    <Panel.Heading >
					{(this.props.syncAdapter instanceof Gitea) ? 
						<div style={{display:"flex"}}>
							<Panel.Title toggle onClick = {() => {this.getGiteaBranches(project.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title> 
							{
							(this.state.branchList).length > 1 ? 
								<select style={{marginLeft: "66px"}} value = {this.state.selectedBranch} onChange = {(e) => { this.getGiteaBooks(project.projid[0], project.proj[0], e.target.value); console.log(JSON.stringify(e.target.value)); }} >{
									(this.state.branchList).map((branch,key) => (
										<option key={key} value={branch.branchz}>{branch.branchz}</option>
										// <p key={key} toggle onClick = {() => {this.getGiteaBooks(project.projid[0], project.proj[0], branch.branchzid)}}>{branch.branchz}</p>
									))}
								</select>
							:
							null							
						}
						</div>:
					 <Panel.Title toggle onClick = {() => {this.getBooks(project.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title>
					 }
                      
                      {/*<Panel.Title toggle>{ project.proj[0] }</Panel.Title>*/}
				    </Panel.Heading>
				    <Panel.Body collapsible>
				    	<FormGroup id="project-list">
						{
							this.state.bookList.map((res, i) => {
								// Paratext bookList doesn't have file extension
								if (res.match(/\.(usfm|sfm)/i) || (this.props.syncAdapter instanceof Paratext)){
									return(<Checkbox id={res} inline key={i} value={res} onChange={(e) => {this.selectBook(project.projid[0], res, e)}}>{res.replace(/(.*)(\/)/g,"")}</Checkbox>)
								}
								else{
									return(<div key={i}><b>{res}</b></div>)
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