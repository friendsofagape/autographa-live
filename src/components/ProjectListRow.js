import React, { PropTypes } from 'react';
import swal from 'sweetalert';
import AutographaStore from "./AutographaStore";
import * as usfm_export from "../util/json_to_usfm";
import * as usfm_import from "../util/usfm_import";
import Wacs from "../helpers/wacsAdapter"
import { Panel,  FormGroup, Checkbox, Button } from 'react-bootstrap/lib';
import xml2js from 'xml2js';
const db = require(`${__dirname}/../util/data-provider`).targetDb();
const booksCodes = require(`${__dirname}/../util/constants.js`).bookCodeList;
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');
const dir = path.join(app.getPath('userData'), 'paratext_projects');


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
		// console.log(projId, bookId, obj.target.checked)
		if(obj.target.checked) {
			this.state.selectedBook.push(bookId)
			AutographaStore.paratextBook[projId] = this.state.selectedBook
		}else{
			this.state.selectedBook = this.state.selectedBook.filter(id => id !== bookId )
			AutographaStore.paratextBook[projId] = this.state.selectedBook
		}
	}
	resetLoader = () => {
		this.props.showLoader(false);						
	    this.setState({importText: AutographaStore.currentTrans["btn-import"], isImporting: false})
    };

	importBook = (projectId) => {
		if (this.props.paratextObj instanceof Wacs) {
			return this.importBookWacs(projectId);
		} else {
			return this.importBookParatext(projectId);
		}
	};

  	importBookParatext = (projectId) => {
  		if(AutographaStore.paratextBook[projectId] == null || Object.keys(AutographaStore.paratextBook[projectId]).length == 0){
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
 	        		let bookData = await this.props.paratextObj.getUsxBookData(projectId, bookId);
		            let book = {};
                	let verse = [];
                	let chapters = {};
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
							console.log(err);
							this.resetLoader();
							swal(AutographaStore.currentTrans["dynamic-msg-error"], AutographaStore.currentTrans["dynamic-msg-went-wrong"], "error");
						});
                	});
					// console.log(book)
 	        	})
	        }
	    });
  	};

    importBookWacs = async (projectId) => {
        const langCode = 'NA';
        const langVersion = 'NA';
        const currentTrans = AutographaStore.currentTrans;

        if (await swal({
            title: currentTrans["label-warning"],
            text: currentTrans["label-override-text"],
            icon: "warning",
            buttons: [currentTrans["btn-ok"], currentTrans["btn-cancel"]],
            dangerMode: false,
            closeOnClickOutside: false,
            closeOnEsc: false
        })) {
            return;
        }

        this.props.showLoader(true);

        try {
            const localPath = await this.props.paratextObj.clone(projectId);

            await usfm_import.importTranslation(localPath, langCode, langVersion);

            this.resetLoader();
            await swal({
                title: currentTrans["btn-import"],
                text:  currentTrans["label-imported-book"],
                icon: "success",
                dangerMode: false,
                closeOnClickOutside: false,
                closeOnEsc: false
            });
        } catch(err) {
            console.log(err);
            this.resetLoader();
            await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
        }

        window.location.reload();
    };

    uploadBook = async(projectId, projectName) => {
        if (this.props.paratextObj instanceof Wacs) {
            return await this.uploadBookWacs(projectId, projectName);
        } else {
            return await this.uploadBookParatext(projectId, projectName);
        }
    };

    uploadBookWacs = async(projectId, projectName) => {
        const currentTrans = AutographaStore.currentTrans;

        if (await swal({
            title: currentTrans["label-warning"],
            text: currentTrans["label-uploading-warning"],
            icon: "warning",
            buttons: [currentTrans["btn-ok"], currentTrans["btn-cancel"]],
            dangerMode: false,
            closeOnClickOutside: false,
            closeOnEsc: false
        })) {
            return;
        }

        this.props.showLoader(true);

        try {
            const localPath = await this.props.paratextObj.clone(projectId);

            const writtenBooks = await usfm_export.allBooksToUsfm(localPath);

            const pushResult = await this.props.paratextObj.commitAndPush(localPath);

            this.resetLoader();
            await swal(currentTrans["dynamic-msg-book-exported"], currentTrans["label-exported-book"], "success");
        } catch(err) {
            console.log(err);
            this.resetLoader();
            await swal(currentTrans["dynamic-msg-error"], currentTrans["dynamic-msg-went-wrong"], "error");
        }
    }

    uploadBookParatext = async(projectId, projectName) => {
		let currentTrans = AutographaStore.currentTrans;
        let book = {};
        let _this = this;
        if(AutographaStore.paratextBook[projectId] == null || Object.keys(AutographaStore.paratextBook[projectId]).length == 0){
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
					console.log(book)
					try{
						let bookData =  await _this.props.paratextObj.getUsxBookData(projectId, bookId);
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
					let bookRevision = await _this.props.paratextObj.getBookRevision(projectId, bookId);
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
										 if(currVerse.attributes["number"].value == 1 && book[currChapter.attributes["number"].value-1].length != 0){
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
										let uploadedRes = await _this.props.paratextObj.updateBookData(projectId, bookId, revision, xmlDoc.getElementsByTagName("usx")[0].outerHTML);
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
	}
	
	asyncForEach = async (array, callback) => {
		for (let index = 0; index < array.length; index++) {
			await callback(array[index], index, array)
		}
	}

    getBooks = async (projectId, projectName) => {
		console.log(this.state.open)
		if(!this.state.open){
			this.props.showLoader(true);
			let _this = this;
			try{
				let booksList = await this.props.paratextObj.getBooksList(projectId);
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
    }
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
							(this.props.paratextObj instanceof Wacs || Object.keys(this.state.bookList).length > 0) &&
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
ProjectListRow.propTypes = {
  project: PropTypes.object.isRequired
};
export default ProjectListRow;