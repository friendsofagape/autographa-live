import React from 'react';
import { observer } from "mobx-react"
import AutographaStore from "./AutographaStore"
import Statistic  from '../components/Statistic';
import { FormattedMessage } from 'react-intl';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../assets/stylesheets/context-menu.css';
const i18n = new(require('../translations/i18n'))();
const db = require(`${__dirname}/../util/data-provider`).targetDb();
let verseId = 0;

@observer
class TranslationPanel extends React.Component {
	constructor(props){
    	super(props);
   		i18n.isRtl().then((res) => {
      		if(res) AutographaStore.scriptDirection = "rtl"
    	});
   		this.timeout =  0;
  	}

  	highlightRef(vId, refId, obj) {
      	let refContent = document.getElementsByClassName('ref-contents');
      	for(let l=0; l<AutographaStore.layout; l++){
        	let ref = refContent[l] ? refContent[l].querySelectorAll('div[data-verse^="r"]') : [];
        	for (let i=0; i < ref.length; i++) {
          		if (ref[i] !== 'undefined') {
            		ref[i].style="background-color:none;font-weight:none;padding-left:10px;padding-right:10px";
          		}
        	};
        	if( refContent[l])
          		refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].style = "background-color: rgba(11, 130, 255, 0.1);padding-left:10px;padding-right:10px;border-radius: 10px";
        }
        let focusIn = document.getElementById(vId);
        focusIn.focus();
  	}

	handleKeyUp =(e)=> {
		if(this.timeout) clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				if(!AutographaStore.setDiff){
					this.props.onSave();
				}
			}, 3000);
	}
  	openStatPopup =() => {
        this.showReport();
        AutographaStore.showModalStat = true
    }
    showReport = () => {
        let emptyChapter = [];
        let incompleteVerseChapter = {};
        let multipleSpacesChapter = {};     
        db.get(AutographaStore.bookId.toString()).then((doc) =>{
            doc.chapters.forEach((chapter) => {
                let emptyVerse = [];
                let verseLength = chapter.verses.length;
                let incompleteVerse = [];
                let multipleSpaces = [];
                for(let i=0; i < verseLength; i++){
					let verseObj = chapter.verses[i];
                    let checkSpace = verseObj["verse"].match(/\s\s+/g, ' ');
                    if(verseObj["verse"].length === 0){
                        emptyVerse.push(i);
                    }
                    else if(verseObj["verse"].length > 0 && verseObj["verse"].trim().split(" ").length === 1){
                        incompleteVerse.push(verseObj["verse_number"])
                    }
                    else if(checkSpace != null && checkSpace.length > 0) {
                        multipleSpaces.push(verseObj["verse_number"])
                    }
                }
                if(incompleteVerse.length > 0){
                    incompleteVerseChapter[chapter["chapter"]] = incompleteVerse;
                }
                if(multipleSpaces.length > 0){
                    multipleSpacesChapter[chapter["chapter"]] = multipleSpaces;
                }
                if(emptyVerse.length === verseLength){
                    emptyChapter.push(chapter["chapter"])
                }
            })
            AutographaStore.emptyChapter = emptyChapter;
            AutographaStore.incompleteVerse = incompleteVerseChapter;
            AutographaStore.multipleSpaces = multipleSpacesChapter;      
        })  
	}
	
	addJoint = (event, data) => {
		let verseNumber = data.verseId;
		db.get(AutographaStore.bookId.toString()).then((doc) => {
			let verses = doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses;
			let jointVerse;
			// Preceeding verse is joint verse then check for preceeding verse without joint
			if (verses[verseNumber - 2].joint_verse){
				jointVerse = verses[verseNumber - 2].joint_verse;
			}
			else {
				jointVerse = (verseNumber - 1);
			}
			// Add joint by adding the content to preceeding verse
			doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses[jointVerse - 1] = ({
				"verse_number": jointVerse,
				"verse": verses[jointVerse - 1].verse + " " + verses[verseNumber - 1].verse
			});
			doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses[verseNumber - 1] = ({
				"verse_number": verseNumber,
				"verse": "",
				"joint_verse": jointVerse
			});
			// Change the "joint_verse" number to current verse for next verse, if they are join verses 
			for ( let i = 0;(verses.length) > (verseNumber + i) && (verses[verseNumber + i].joint_verse === verseNumber); i++){
				doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses[verseNumber + i] = ({
					"verse_number": (verseNumber + 1 + i),
					"verse": "",
					"joint_verse": jointVerse
				});
			}
			db.put(doc, function (err, response) {
				if (err) {
					return console.log(err);
				} else {
					window.location.reload()
				}
			});
		});
	}

	removeJoint = (event, data) => {
		let verseNumber = data.verseId;
		db.get(AutographaStore.bookId.toString()).then((doc) => {
			let verses = doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses;
			doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses[verseNumber - 1] = ({
				"verse_number": verseNumber,
				"verse": ""
			});
			for ( let i = 0;(verses.length) > (verseNumber + i) && (verses[verseNumber + i].joint_verse); i++){
				doc.chapters[parseInt(AutographaStore.chapterId, 10) - 1].verses[verseNumber + i] = ({
					"verse_number": (verseNumber + 1 + i),
					"verse": "",
					"joint_verse": verseNumber
				});
			}
			db.put(doc, function (err, response) {
				if (err) {
					return console.log(err);
				} else {
					window.location.reload()
				}
			});
		});
	}
  
  	render (){
		let verseGroup = [];
    	const toggle = AutographaStore.toggle;
		for (let i = 0; i < AutographaStore.chunkGroup.length; i++) {
		let vid="v"+(i+1);
		verseGroup.push(<div key={i} id={`versediv${i+1}`} onClick={this.highlightRef.bind(this, vid, i)} style={{cursor: "text", whiteSpace: "pre-wrap"}}>
			<ContextMenuTrigger id={(i+1) === 1 ? undefined : (AutographaStore.jointVerse[i] === undefined ? "true" : "false")} verseId = {parseInt(i,10)+1}  collect = {props => props}><span className='verse-num' key={i}>{(i+1)}</span>
			<span contentEditable={AutographaStore.jointVerse[i] === undefined ? true : false} suppressContentEditableWarning={true} id={vid} data-chunk-group={AutographaStore.chunkGroup[i]} onKeyUp={this.handleKeyUp}>
			{AutographaStore.jointVerse[i] === undefined ? AutographaStore.translationContent[i] : <FormattedMessage id="label-joint-with-the-preceding-verse(s)"/>}
			</span>
			</ContextMenuTrigger>
			</div>
		); 
		}
		const {tIns, tDel} = this.props;
		return (
			<div className="col-editor container-fluid trans-margin">
				<div className="row">
				<div className="col-12 center-align">
					<p className="translation"><a href="javscript:;" style = {{fontWeight: "bold", pointerEvents: toggle ? "none" : "" }} onClick={() => this.openStatPopup()}><FormattedMessage id="label-translation" /></a></p>
				</div>
				</div>
				<div className="row">
				{tIns || tDel ? <div style={{textAlign: "center"}}><span style={{color: '#27b97e', fontWeight: 'bold'}}>(+) <span id="tIns">{tIns}</span></span> | <span style={{color: '#f50808', fontWeight: 'bold'}}> (-) <span id="tDel">{tDel}</span></span></div> : "" }
				<div id="input-verses" className={`col-12 col-ref verse-input ${AutographaStore.scriptDirection.toLowerCase()} ${tIns || tDel ? 'disable-input' : ''}`} dir={AutographaStore.scriptDirection} style={{pointerEvents: tIns || tDel ? 'none': ''}}>{verseGroup}</div>
				</div>
				<ContextMenu id={"false"}>
					<MenuItem
						onClick={this.removeJoint}
					>
					<FormattedMessage id="label-unjoin-this-verse" />
					</MenuItem>
				</ContextMenu>
				<ContextMenu id={"true"}>
					<MenuItem
						onClick={this.addJoint}
					>
					<FormattedMessage id="label-join-to-preceding-verse" />
					</MenuItem>
				</ContextMenu>
				<Statistic show={AutographaStore.showModalStat}  showReport = {this.showReport}/>
			</div>
		) 
  	}
}

export default TranslationPanel;