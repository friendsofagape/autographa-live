import React from 'react';
import { observer } from "mobx-react"
import AutographaStore from "./AutographaStore"
import Statistic  from '../components/Statistic';
import { FormattedMessage } from 'react-intl';
import { ContextMenu, MenuItem, ContextMenuTrigger } from 'react-contextmenu';
import '../assets/stylesheets/context-menu.css';
import * as mobx from 'mobx'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/Stop';
import { Tooltip, Zoom } from '@material-ui/core';
import ConcatAudio from '../Audio/core/ConcatAudio';
import FontSelect from "./FontSelect";
let audio = new ConcatAudio();
const { app } = require('electron').remote;
const path = require('path');
const fs = require('fs');
const constants = require('../util/constants');
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
    
    componentDidMount(){
        // highlighter on recorder mode
		this.highlighttrans(AutographaStore.vId)
	}
	componentDidUpdate(){
		this.highlighttrans(AutographaStore.vId)
		    if(AutographaStore.AudioMount===true){
                this.highlightRef(`v${AutographaStore.vId}`, AutographaStore.vId-1)
            }
	}  

  	highlightRef(vId, refId, obj) {
		if(AutographaStore.layout !== 0) {
			let refContent = document.getElementsByClassName('ref-contents');
			for(let l=0; l<AutographaStore.layout; l++){
			  let ref = refContent[l] ? refContent[l].querySelectorAll('div[data-verse^="r"]') : [];
			  for (let i=0; i < ref.length; i++) {
					if (ref[i] !== 'undefined') {
					  ref[i].style="background-color:none;font-weight:none;padding-left:10px;padding-right:10px";
					}
			  };
			  if( refContent[l]){
				  refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].style = "background-color: rgba(11, 130, 255, 0.1);padding-left:10px;padding-right:10px;border-radius: 10px";
				  AutographaStore.currentRefverse = (refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].childNodes[1].innerHTML).toString()
			  }
		  }
		  let focusIn = document.getElementById(vId);
		  focusIn.focus();
  
		  // To sync highlight withtranslation pannel
		}
		if(AutographaStore.AudioMount===true)
		  this.highlighttrans(vId, refId,  obj);
    }
    
    highlighttrans (vId) {
		let recordedVerse = mobx.toJS(AutographaStore.recVerse)
        if(AutographaStore.isRecording === false && AutographaStore.isPlaying === false){
			let newVId;
            if(typeof vId === 'string') newVId = vId.match(/\d+/g)
			else newVId = vId
            if(newVId[0]){
                AutographaStore.vId = parseInt(newVId[0])
                if(AutographaStore.recVerse !== null && AutographaStore.vId !== undefined){
                        if (recordedVerse.indexOf(AutographaStore.vId) !== -1) {
                            AutographaStore.isWarning = true;
							AutographaStore.currentSession = false;
							this.lastSavedtime()
                        }
                        if (recordedVerse.indexOf(AutographaStore.vId) === -1){
                            AutographaStore.isWarning = false;
                            AutographaStore.currentSession = true;
                        }
                }
            }
        }
        let num = AutographaStore.vId
		let refContent = document.getElementsByClassName('verse-input');
      	for(let l=0; l<=AutographaStore.layout; l++){
			let ref = refContent[l] ? refContent[l].querySelectorAll('div') : [];
        	for (let i=0; i < ref.length; i++) {
          		if (ref[i] !== 'undefined') {
            		ref[i].style="background-color:none;font-weight:none;padding-left:10px;padding-right:10px;whitespace:pre-wrap;"
          		}
			};
			if( refContent[l])
			if(num<=0){
				num = 1
			}
			if(AutographaStore.AudioMount === true && (num > 0)) {
				if(refContent[l] !== undefined)
				refContent[l].querySelectorAll('div')[num-1].style = "background-color: rgba(11, 250, 15, 0.1);padding-left:10px;padding-right:10px;border-radius: 10px;whitespace:pre-wrap;";
			}
        }
	}

	lastSavedtime = () => {
		let bookId = AutographaStore.bookId.toString();
		let BookName = constants.booksList[parseInt(bookId, 10) - 1];
		var newfilepath = path.join(
					app.getPath('userData'),
					'recordings',
					BookName,
					`Chapter${AutographaStore.chapterId}`,
					`output.json`,
				);
				    if (fs.existsSync(newfilepath)) {
				    	fs.readFile(
				    		newfilepath,
				    		// callback function that is called when reading file is done
				    		function(err, data) {
				    			// json data
				    			var jsonData = data;
				    			// parse json
				    			var jsonParsed = JSON.parse(jsonData);
				    			// access elements
				    			for (var key in jsonParsed) {
				    				if (jsonParsed.hasOwnProperty(key)) {
				    					var val = jsonParsed[key];
				    					if(val.verse === AutographaStore.vId){
                                            AutographaStore.savedTime = val.totaltime
				    					}
                                    
				    				}
				    			}
				    		},
				    	);
				    }
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
    
    fetchAudio = () => {
		let newfilepath, merged, output;
		let audiomp3 = []
		let bookId = AutographaStore.bookId.toString();
		let recordedVerse = mobx.toJS(AutographaStore.recVerse)
		let BookName = constants.booksList[parseInt(bookId, 10) - 1];
			if (AutographaStore.isPlaying === true) {
				recordedVerse.map((versenum, index) => {
					if (versenum === AutographaStore.vId) {
						// eslint-disable-next-line react-hooks/exhaustive-deps
						newfilepath = path.join(
							app.getPath('userData'),
							'recordings',
							BookName,
							`Chapter${AutographaStore.chapterId}`,
							`verse${versenum}.mp3`,
						);
						AutographaStore.blobURL = newfilepath
					}
				});
			}

	}
  
  	render (){
        let recordedVerse = mobx.toJS(AutographaStore.recVerse)
		let verseId = mobx.toJS(AutographaStore.vId)
		let AudioMount = mobx.toJS(AutographaStore.AudioMount)
		let recflag;
		let verseGroup = [];
    	const toggle = AutographaStore.toggle;
		for (let i = 0; i < AutographaStore.chunkGroup.length; i++) {
        let vid="v"+(i+1);
        if(recordedVerse !== null){
			recordedVerse.map((recVerse, index) => {
				if((recVerse-1) === i){
					recflag = (recVerse-1)
                }
			})
		}

		verseGroup.push(<div key={i} id={`versediv${i+1}`} onClick={this.highlightRef.bind(this, vid, i)} style={{cursor: "text", whiteSpace: "pre-wrap", fontFamily: AutographaStore.fontselected}}>
        {AudioMount && ((recflag === i  && AutographaStore.AudioMount === true) ? (
					<span onClick ={this.fetchAudio}>
                            {(AutographaStore.isPlaying===false)  && (
                                <Tooltip
								title='Play/Stop'
								TransitionComponent={Zoom}>
                    	        <PlayCircleOutlineIcon
                    	        edge='start'
                    	        tabIndex={-1}
                    	        style={{ color: 'red', cursor: 'pointer' }}
                    	        onClick={ () => (i+1 === verseId)? AutographaStore.isPlaying = true : AutographaStore.isPlaying = false }
						    /></Tooltip>)}
                    	    {((i+1 === verseId) && (AutographaStore.isPlaying===true))  ? (
                    	        <StopIcon 
                    	        edge='start'
                    	        tabIndex={-1}
                    	        style={{ cursor: 'pointer' }}
                    	        onClick={ () => AutographaStore.isPlaying =false }
						        /> ) : 
						        <PlayCircleOutlineIcon
                    	        edge='start'
                    	        tabIndex={-1}
						        hidden={ AutographaStore.isPlaying===false }
                    	        style={{ color: 'red', cursor: 'pointer' }}
                    	        onClick={ () => AutographaStore.isPlaying = true }/>
                            }
					</span>) : <span style={{ marginRight:'10px' }}></span>)}
				{(recflag !== i  && AudioMount === true) ? (<span style={{marginRight:'10px'}}></span>): ""}
			{AudioMount ?
            <React.Fragment>
            <span className={ AudioMount? 'verse-num-onaudio' : 'verse-num' } key={i}>{(i+1)}</span>
			<span contentEditable={!AudioMount} suppressContentEditableWarning={true} id={vid} style={{cursor: AudioMount? "pointer" : "text", whiteSpace: "pre-wrap", fontFamily: AutographaStore.fontselected}} data-chunk-group={AutographaStore.chunkGroup[i]} onKeyUp={this.handleKeyUp}>
			{AutographaStore.jointVerse[i] === undefined ? AutographaStore.translationContent[i] : <FormattedMessage id="label-joint-with-the-preceding-verse(s)"/>}
			</span>
            </React.Fragment>
            :
            (<ContextMenuTrigger id={(AutographaStore.jointVerse[i] === undefined ? "true" : "false")} disable={(i+1) === 1 ? true : false } verseId = {parseInt(i,10)+1}  collect = {props => props}>
            <span className={ AudioMount ? 'verse-num-onaudio' : 'verse-num' } key={i}>{(i+1)}</span>
			<span contentEditable={AutographaStore.jointVerse[i] === undefined ? true : false} suppressContentEditableWarning={true} id={vid} data-chunk-group={AutographaStore.chunkGroup[i]} style={{cursor: AudioMount? "pointer" : "text", whiteSpace: "pre-wrap", fontFamily: AutographaStore.fontselected}} onKeyUp={this.handleKeyUp}>
			{AutographaStore.jointVerse[i] === undefined ? AutographaStore.translationContent[i] : <FormattedMessage id="label-joint-with-the-preceding-verse(s)"/>}
			</span>
			</ContextMenuTrigger>)}
			</div>
		); 
		}
		const {tIns, tDel} = this.props;
		return (
			<div className="col-editor container-fluid trans-margin" style={{width: AutographaStore.layout===0? "200%" : ""}}>
				<div className="row">
				<div className="col-12 center-align">
					<p className="translation" style={{lineHeight:"68px"}}><a href="javscript:;" style = {{fontWeight: "bold", pointerEvents: toggle ? "none" : "" }} onClick={() => AudioMount ? "" : this.openStatPopup()}><FormattedMessage id="label-translation" /></a>
					<div style={{ width: 200, float:"right", paddingTop:"10px" }}><FontSelect /></div>
					</p>
				</div>
				</div>
				<div className="row">
				{tIns || tDel ? <div style={{textAlign: "center"}}><span style={{color: '#27b97e', fontWeight: 'bold'}}>(+) <span id="tIns">{tIns}</span></span> | <span style={{color: '#f50808', fontWeight: 'bold'}}> (-) <span id="tDel">{tDel}</span></span></div> : "" }
				<div id="input-verses" className={`col-12 col-ref verse-input ${AutographaStore.scriptDirection.toLowerCase()} ${tIns || tDel ? 'disable-input' : ''}`} dir={AutographaStore.scriptDirection} style={{pointerEvents: tIns || tDel ? 'none': '', paddingBottom: (AudioMount) ? '70px' : '' }}>{verseGroup}</div>
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