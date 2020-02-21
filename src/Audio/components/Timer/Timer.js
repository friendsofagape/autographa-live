import React, { useState, useEffect } from 'react';
const formattedSeconds = (sec) =>
	Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);

export default function Timer() {
    const [secondsElapsed, setsecondsElapsed] = useState(0);
    const [timer, setTimer] = useState(false)

	// const handleStartClick = (status) => {
	// 	setTimer(status)
	// };
	useEffect(() => {
        let interval
        if(timer)
            interval = setInterval(() => setsecondsElapsed(secondsElapsed + 1), 1000);
        return () => clearInterval(interval)
	});

	// const handleStopClick = (status) => {
    //     setTimer(status)
	// 	// clearInterval(handleStartClick);
	// };

	// const handleResetClick = () => {
	// 	// clearInterval(handleStartClick);
	// 	setsecondsElapsed(0);
	// };

	return (
		<div className='stopwatch'>
			<h1 className='stopwatch-timer'>
				{formattedSeconds(secondsElapsed)}
			</h1>
		</div>
	);
}
