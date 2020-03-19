import React from 'react';
import StoreContextProvider from './context/StoreContext';
import RecorderNav from './components/RecorderNav';
import BottomBar from './components/BottomBar';
import Player from './components/AudioPlayer';
// import TexttoSpeech from './components/TexttoSpeech/TexttoSpeech';
import Timer from './components/Timer';
import mergePause from './core/mergePause';

const AudioApp = (props) => {
	return (
		<div>
			<StoreContextProvider>
				<BottomBar isOpen={props} />
				<RecorderNav isOpen={props} />
				<Player />
				<Timer />
			</StoreContextProvider>
		</div>
	);
};

export default AudioApp;
