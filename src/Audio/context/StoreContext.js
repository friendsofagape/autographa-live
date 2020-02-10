import React, { createContext, Component } from 'react';
import * as sampleBible from '../components/VerseGrid/verse';
import { default as localforage } from 'localforage';
import * as recSave from '../core/savetoIndex';
import * as verseRecorder from '../../components/VerseRecorder';
import * as downloadURL from '../core/downloadWebm';
import AutographaStore from '../../components/AutographaStore';

export const StoreContext = createContext();

class StoreContextProvider extends Component {
	state = {
		isOpen: true,
		onselect: 1,
		bible: sampleBible.default,
		record: false,
		recordedFiles: {},
		recVerse: [],
		isWarning: false,
		blob: '',
	};
	toggleOpen = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};
	
	selectPrev = (vId) => {
		AutographaStore.isWarning=false
		if (this.state.onselect > 1) {
			this.setState({ onselect: AutographaStore.vId - 1 });
			AutographaStore.vId = AutographaStore.vId - 1
			this.state.recVerse.map((value,index) => {
				if(value.toString() === AutographaStore.vId.toString()){
					console.log("Value",value,"onselect", AutographaStore.vId)
					AutographaStore.isWarning=true
				}
			})
		}
	};
	selectNext = (vId) => {
		AutographaStore.isWarning=false
		if (this.state.onselect <= ((AutographaStore.chunkGroup.length)-1)) {
			this.setState({ onselect: AutographaStore.vId + 1 });
			AutographaStore.vId = AutographaStore.vId + 1
			this.state.recVerse.map((value,index) => {
				if(value.toString()  === AutographaStore.vId.toString()){
					console.log("Value",value,"onselect", AutographaStore.vId)
					AutographaStore.isWarning=true
				}
			})
		}
	};
	resetVal = (value, event, index) => {
		this.setState({ onselect: value });
	};
	startRecording = () => {
		this.setState({ record: true });
	};
	stopRecording = () => {
		this.setState({ record: false });
		this.state.recVerse.push(this.state.onselect);
	};
	getDB = () => {
		let newURL;
		localforage
			.getItem(`${this.state.onselect}`)
			.then((value) => {
				// This code runs once the value has been loaded from the offline store.
				newURL = value;
				// console.log(value1.id)
				this.setState({
					blob: newURL,
				});
			})
			.catch((err) => {
				console.log(err);
			});
	};

	saveRecord = async (value, event) => {
		let save;
		value['verse'] = this.state.onselect;
		// if (this.state.isWarning === false)
		// 	this.state.recVerse.push(AutographaStore.vId);
		this.setState({ recordedFiles: value });
		save = await recSave.default(
			this.state.bible,
			this.state.recordedFiles,
			1,
			this.state.onselect,
		);
		this.getDB();
		AutographaStore.recVerse= this.state.recVerse
	};
	render() {
		console.log("onslect", this.state.onselect)
		console.log("warning", AutographaStore.isWarning)
		return (
			<StoreContext.Provider
				value={{
					...this.state,
					toggleOpen: this.toggleOpen,
					selectNext: this.selectNext,
					selectPrev: this.selectPrev,
					resetVal: this.resetVal,
					startRecording: this.startRecording,
					stopRecording: this.stopRecording,
					saveRecord: this.saveRecord,
					getDB: this.getDB,
				}}>
				{this.props.children}
			</StoreContext.Provider>
		);
	}
}

export default StoreContextProvider;
