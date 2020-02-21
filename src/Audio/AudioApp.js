import React from 'react';
import StoreContextProvider from './context/StoreContext';
import Recorder from './components/Recorder';
import BottomBar from './components/BottomBar';
import Player from './components/AudioPlayer';
// import TexttoSpeech from './components/TexttoSpeech/TexttoSpeech';
import Timer from './components/Timer';
// import ExportWebm from './core/ExportWebm';

const AudioApp = (props) => {
	return (
		<div>
			<StoreContextProvider>
				<BottomBar isOpen={props}/>
				<Recorder />
				<Player />
				<Timer />
			</StoreContextProvider>
		</div>
	);
};

export default AudioApp;
