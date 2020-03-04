import React from 'react';
import StoreContextProvider from './context/StoreContext';
import Recorder from './components/Recorder';
import BottomBar from './components/BottomBar';
import Player from './components/AudioPlayer';
// import TexttoSpeech from './components/TexttoSpeech/TexttoSpeech';
import Timer from './components/Timer';

const AudioApp = (props) => {
	return (
		<div>
			<StoreContextProvider>
				<BottomBar isOpen={props} />
				<Recorder isOpen={props} />
				<Player />
				<Timer />
			</StoreContextProvider>
		</div>
	);
};

export default AudioApp;
