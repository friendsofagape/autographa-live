import React from 'react';
import StoreContextProvider from './context/StoreContext';
import Recorder from './components/Recorder';
import BottomBar from './components/BottomBar';
import TranslationPanel from '../components/TranslationPanel';
import { AutographaStore } from '../components/AutographaStore';
import { VerseRecorder } from '../components/VerseRecorder';
import Player from './components/AudioPlayer';
import TexttoSpeech from './components/TexttoSpeech/TexttoSpeech';
// import ExportWebm from './core/ExportWebm';

const AudioApp = (props) => {
	return (
		<div>
			<StoreContextProvider>
				<BottomBar isOpen={props}/>
				<Recorder />
				<Player />
			</StoreContextProvider>
		</div>
	);
};

export default AudioApp;
