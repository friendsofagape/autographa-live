import React from 'react';
import { observer } from "mobx-react"
import AutographaStore from "./AutographaStore"
import Statistic  from '../components/Statistic';
import { FormattedMessage } from 'react-intl';
import * as mobx from 'mobx'
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/Stop';
import { Tooltip, Zoom } from '@material-ui/core';
import ConcatAudio from '../Audio/core/ConcatAudio';
let audio = new ConcatAudio();
const { app } = require('electron').remote;
const path = require('path');
const constants = require('../util/constants');
const i18n = new(require('../translations/i18n'))();
const db = require(`${__dirname}/../util/data-provider`).targetDb();

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
		this.highlighttrans(AutographaStore.vId)
	}
	componentDidUpdate(){
		this.highlighttrans(AutographaStore.vId)
		if(AutographaStore.AudioMount===true){
        this.highlightRef(`v${AutographaStore.vId}`, AutographaStore.vId-1)
        }
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
        	if( refContent[l]){
                refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].style = "background-color: rgba(11, 130, 255, 0.1);padding-left:10px;padding-right:10px;border-radius: 10px";
                AutographaStore.currentRefverse = (refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].childNodes[1].innerHTML).toString()
			}
		}
        let focusIn = document.getElementById(vId);
		focusIn.focus();
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
      	for(let l=0; l<AutographaStore.layout; l++){
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
						audiomp3.push(newfilepath)
					}
				});
				console.log("audiomp3",audiomp3)
				audio
					.fetchAudio( ...audiomp3 )
					.then((buffers) => {
						// => [AudioBuffer, AudioBuffer]
						merged = audio.concatAudio(buffers);
						console.log('buff', merged);
					})
					.then(() => {
						// => AudioBuffer
						output = audio.export(merged, 'audio/mp3');
					})
					.then(() => {
						AutographaStore.blobURL = output.url
						console.log('out', AutographaStore.blobURL);
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
		verseGroup.push(
		<div key={i} id={`versediv${i+1}`} onClick={this.highlightRef.bind(this, vid, i)} style={{cursor: "text", whiteSpace: "pre-wrap"}}>
				{ AutographaStore.AudioMount && ((recflag === i  && AutographaStore.AudioMount === true) ? (
					<span onClick ={ this.fetchAudio}>
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
					</span>) : <span style={{ marginRight:'10px' }}></span>
                )}
				{(recflag !== i  && AutographaStore.AudioMount === true) ? (<span style={{marginRight:'10px'}}></span>): ""}
			<span className={ AutographaStore.AudioMount? 'verse-num-onaudio' : 'verse-num' } key={i}>{(i+1)}</span>
			<span contentEditable={!AutographaStore.AudioMount} suppressContentEditableWarning={true} id={vid} style={{cursor: AudioMount? "pointer" : "text", whiteSpace: "pre-wrap"}} data-chunk-group={AutographaStore.chunkGroup[i]} onKeyUp={this.handleKeyUp}>
			{AutographaStore.translationContent[i]}
			</span>
			</div>
		); 
		}
		const {tIns, tDel} = this.props;
		return (
			<div className="col-editor container-fluid trans-margin">
				<div className="row">
				<div className="col-12 center-align">
					<p className="translation"><a href="javscript:;" style = {{fontWeight: "bold", pointerEvents: toggle ? "none" : "" }} onClick={() => AudioMount? "" : this.openStatPopup()}><FormattedMessage id="label-translation" /></a></p>
				</div>
				</div>
				<div className="row">
				{tIns || tDel ? <div style={{textAlign: "center"}}><span style={{color: '#27b97e', fontWeight: 'bold'}}>(+) <span id="tIns">{tIns}</span></span> | <span style={{color: '#f50808', fontWeight: 'bold'}}> (-) <span id="tDel">{tDel}</span></span></div> : "" }
				<div id="input-verses" className={`col-12 col-ref verse-input ${AutographaStore.scriptDirection.toLowerCase()} ${tIns || tDel ? 'disable-input' : ''}`} dir={AutographaStore.scriptDirection} style={{pointerEvents: tIns || tDel ? 'none': ''}} style={{ paddingBottom: (AudioMount) ? '70px' : '' }}>{verseGroup}</div>
				</div>
				<Statistic show={AutographaStore.showModalStat}  showReport = {this.showReport}/>
			</div>
		) 
  	}
}

export default TranslationPanel;