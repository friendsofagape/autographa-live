import React, { PropTypes } from 'react';
import swal from 'sweetalert';
import AutographaStore from "./AutographaStore";
import * as usfm_export from "../util/json_to_usfm";
import * as usfm_import from "../util/usfm_import";
import Gitea from "../helpers/giteaAdapter"
import { Panel,  FormGroup, Checkbox } from 'react-bootstrap/lib';
import xml2js from 'xml2js';
const db = require(`${__dirname}/../util/data-provider`).targetDb();
const booksCodes = require(`${__dirname}/../util/constants.js`).bookCodeList;
const booksNames = require(`${__dirname}/../util/constants.js`).booksList;
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');


class ProjectListRow extends React.Component {
	
	constructor(props){
		super(props);
		this.state = {
			bookList: [],
			selectedBook: [],
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
		if(obj.target.checked) {
			this.state.selectedBook.push(bookId)
			AutographaStore.paratextBook[projId] = this.state.selectedBook
		}else{
			this.setState({selectedBook: this.state.selectedBook.filter(id => id !== bookId)})
			AutographaStore.paratextBook[projId] = this.state.selectedBook
		}
	}
	resetLoader = () => {
		this.props.showLoader(false);						
	    this.setState({importText: AutographaStore.currentTrans["btn-import"], isImporting: false})
    };

	importBook = (projectId) => {
		//comment for Gitea now

		// if (this.props.syncAdapter instanceof Gitea) {
		// 	return this.importBookGitea(projectId);
		// } else {
		// 	return this.importBookParatext(projectId);
		// }

		//need to remove and uncomment above code when gitea will work fine
		return this.importBookParatext(projectId);

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
									verseText += " "+temp.textContent;
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
        const langCode = 'NA';
        const langVersion = 'NA';
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

        this.props.showLoader(true);

        try {
            const localPath = await this.props.syncAdapter.clone(projectId);

            const results = await usfm_import.importTranslation(localPath, langCode, langVersion);
            const importedBooks = results.map(r => r.id);

            this.resetLoader();
            await swal(currentTrans["btn-import"], this.makeSyncReport(importedBooks), "success");
        } catch(err) {
            this.resetLoader();
            await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
        }

        window.location.reload();
    };

    uploadBook = async(projectId, projectName) => {
		//comment for Gitea now
        // if (this.props.syncAdapter instanceof Gitea) {
        //     return await this.uploadBookGitea(projectId, projectName);
        // } else {
        //     return await this.uploadBookParatext(projectId, projectName);
		// }

		//need to uncomment above code and remove this when gitea will work fine
		return await this.uploadBookParatext(projectId, projectName);
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

        try {
            const localPath = await this.props.syncAdapter.clone(projectId);
            const writtenBooks = await usfm_export.allBooksToUsfm(localPath);
            const writtenBookIds = writtenBooks.map(b => b.bookNumber);
            this.resetLoader();
            await swal(currentTrans["dynamic-msg-book-exported"], this.makeSyncReport(writtenBookIds), "success");
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
						let bookIndex = booksCodes.findIndex((book) => book === bookId);
						db.get((bookIndex + 1).toString()).then( async (doc) => {
							const xmlDoc = new DOMParser().parseFromString(bookData,"text/xml");
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
								let verseCount = 0;
								while(v < verseNodes.snapshotLength){
									currVerse = verseNodes.snapshotItem(v);
									let xmlVerseNum = (currVerse.attributes["number"].value).match(/^(\d+)/g);
									v++;
									// verseCount + 1 is used to check the length of the dbContent
									if(xmlVerseNum == 1 && (doc.chapters[currChapter.attributes["number"].value]).length != 0 && (verseCount + 1) === dbContent.length){
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
										if (xmlVerseNum == 1 && (verseCount + 1) !== dbContent.length) {
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
											if ((verseCount + 1) !== dbContent.length) {
												verseCount++;
											}
										} else if(parseInt(xmlVerseNum[0],10) < parseInt(dbVerseNum,10) && xmlVerseNum == 1 && (verseCount + 1) !== dbContent.length) {
											// Add new verse node
											for (let i = verseCount;i < dbContent.length;i++) {
												console.log("i--->",i,dbContent[i]);
												console.log(currVerse.parentNode.nodeName);
												let newClone = currVerse.cloneNode([true]);
												newClone.attributes["number"].value = dbContent[i].verse_number;
												console.log("newClone---->",newClone);
												currVerse.parentNode.appendChild(newClone);
												newClone.insertAdjacentText('afterend', dbContent[i].verse);												
											}
											verseCount = (dbContent.length) - 1;
											v = v + 1; 
									 	} else {
											currVerse.nextSibling.remove();
											currVerse.remove();
										}
									} else {
										currVerse.nextSibling.remove();
										currVerse.remove();
									}
								}
							}
							if (!fs.existsSync(dir)){
								fs.mkdirSync(dir);
							}
							if(bookData !== undefined || bookData !== null){
								if (!fs.existsSync(path.join(app.getPath('userData'), 'paratext_projects', projectName))){
									fs.mkdirSync(path.join(app.getPath('userData'), 'paratext_projects', projectName));
								}
								if(fs.existsSync(path.join(app.getPath('userData'), 'paratext_projects', projectName))){
									fs.writeFileSync(path.join(app.getPath('userData'), 'paratext_projects', projectName, `${bookId}.xml`), bookData, 'utf8');
									fs.writeFileSync(path.join(app.getPath('userData'), 'paratext_projects', projectName, `${bookId}_new.xml`), bookData, 'utf8');
									fs.writeFileSync(path.join(app.getPath('userData'), 'paratext_projects', projectName, `${bookId}_new.xml`), xmlDoc.getElementsByTagName("BookText")[0].outerHTML, 'utf8');
								}
							}
						});	
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
									let currChapter=chapterNodes.snapshotItem(0);
									book[currChapter.attributes["number"].value-1] = [];
									let currVerse = verseNodes.snapshotItem(0);
									let v = 0;
									let i = 0;
									
									while(v < verseNodes.snapshotLength){
										v++;
										 if(currVerse.attributes["number"].value == 1 && book[currChapter.attributes["number"].value-1].length != 0){
											i++;
											currChapter = chapterNodes.snapshotItem(i);
											book[currChapter.attributes["number"].value-1] = [];
										}
										let verse_num = ((currVerse.attributes["number"].value).match(/^(\d+)/gm));
										let verse = doc.chapters[currChapter.attributes["number"].value-1].verses[parseInt(verse_num[0])-1];
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
										// _this.props.syncAdapter.updateBookData(projectId, bookId, revision, xmlDoc.getElementsByTagName("usx")[0].outerHTML);
										// fs.writeFileSync(`${app.getPath('userData')}/paratext_projects/${projectName}/${bookId}.xml`, xmlDoc.getElementsByTagName("BookText")[0].outerHTML, 'utf8');
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
                      <Panel.Title toggle onClick = {() => {this.getBooks(project.projid[0],  project.proj[0])}}>{ project.proj[0] }</Panel.Title>
                      {/*<Panel.Title toggle>{ project.proj[0] }</Panel.Title>*/}
				    </Panel.Heading>
				    <Panel.Body collapsible>
				    	<FormGroup id="project-list">
						    {
						    	this.state.bookList.map((res, i) => {
						    		return(<Checkbox id={res} inline key={i} value={res} onChange={(e) => {this.selectBook(project.projid[0], res, e)}}>{res}</Checkbox>)
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