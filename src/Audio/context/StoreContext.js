import React, { createContext, Component } from 'react';
import * as sampleBible from '../components/VerseGrid/verse';
import { default as localforage } from 'localforage';
import * as verseRecorder from '../../components/VerseRecorder';
import * as downloadURL from '../core/downloadWebm';
import AutographaStore from '../../components/AutographaStore';
import swal from 'sweetalert';
import mergeAudios from '../core/mergeAudios'
const constants = require('../../util/constants');
let saveRec = require('../core/savetodir');

export const StoreContext = createContext();

class StoreContextProvider extends Component {
	state = {
		isOpen: true,
		onselect: 1,
		bible: sampleBible.default,
		record: false,
		recordedFiles: {},
		storeRecord: [],
		recVerse: [],
		isWarning: false,
		blob: '',
	};
	toggleOpen = () => {
		this.setState({ isOpen: !this.state.isOpen });
	};

	selectPrev = (vId) => {
		AutographaStore.isWarning = false;
		AutographaStore.isPlaying = false;
		AutographaStore.currentSession = true;
		if (this.state.onselect > 1 && AutographaStore.isRecording === false) {
			this.setState({ onselect: AutographaStore.vId - 1 });
			AutographaStore.vId = AutographaStore.vId - 1;
			this.state.recVerse.map((value, index) => {
				if (value.toString() === AutographaStore.vId.toString()) {
					AutographaStore.isWarning = true;
					AutographaStore.currentSession = false;
				}
			});
		} else {
			swal({
				title: 'Are you sure?',
				text: 'You want stop the currently recording verse',
				icon: 'warning',
				buttons: true,
				dangerMode: true,
			}).then((willDelete) => {
				if (willDelete) {
					this.stopRecording();
					AutographaStore.currentSession = false;
					swal('Stopped Recording!', {
						icon: 'success',
					});
				}
			});
		}
	};
	selectNext = (vId) => {
		// if(AutographaStore.currentSession === false && AutographaStore.isWarning === false) {
		// }
		AutographaStore.currentSession = true;
		AutographaStore.isPlaying = false;
		AutographaStore.isWarning = false;
		if (
			this.state.onselect <= AutographaStore.chunkGroup.length - 1 &&
			AutographaStore.isRecording === false
		) {
			this.setState({ onselect: AutographaStore.vId + 1 });
			AutographaStore.vId = AutographaStore.vId + 1;
			this.state.recVerse.map((value, index) => {
				if (value.toString() === AutographaStore.vId.toString()) {
					AutographaStore.isWarning = true;
					AutographaStore.currentSession = false;
				}
			});
		} else {
			if (this.state.onselect <= AutographaStore.chunkGroup.length - 1) {
				swal({
					title: 'Are you sure?',
					text: 'You want stop the currently recording verse',
					icon: 'warning',
					buttons: true,
					dangerMode: true,
				}).then((willDelete) => {
					if (willDelete) {
						this.stopRecording();
						swal('Stopped Recording!', {
							icon: 'success',
						});
					}
				});
			}
		}
	};
	resetVal = (value, event, index) => {
		this.setState({ onselect: value });
	};
	startRecording = () => {
		if (AutographaStore.isWarning === false) {
			this.setState({ record: true });
			AutographaStore.isRecording = true;
		}
	};
	stopRecording = () => {
		AutographaStore.currentSession = false;
		AutographaStore.isRecording = false;
		this.setState({ record: false });
		if (AutographaStore.isWarning === false) {
			this.state.recVerse.push(this.state.onselect);
			AutographaStore.isWarning = true;
		}
	};

	saveRecord = async (value, event) => {
		let save,
			book = {};
		value['verse'] = this.state.onselect;
		let chapter = 'Chapter' + AutographaStore.chapterId;
		book.bookNumber = AutographaStore.bookId.toString();
		book.bookName = constants.booksList[parseInt(book.bookNumber, 10) - 1];
		this.setState({ recordedFiles: value });
		this.state.storeRecord.push(value);
		save = await saveRec.recSave(
			book,
			this.state.recordedFiles,
			chapter,
			this.state.onselect,
		);
		AutographaStore.recVerse = this.state.recVerse;
	};

	exportAudio = async () => {
		let save,
			book = {};
		let chapter = 'Chapter' + AutographaStore.chapterId;
		book.bookNumber = AutographaStore.bookId.toString();
		book.bookName = constants.booksList[parseInt(book.bookNumber, 10) - 1];
		save = await mergeAudios(
			book,
			chapter,
			this.state.recVerse,
			this.state.storeRecord
		);
		if(save)
		console.log(save)
	};

	render() {
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
					exportAudio: this.exportAudio
				}}>
				{this.props.children}
			</StoreContext.Provider>
		);
	}
}

export default StoreContextProvider;
