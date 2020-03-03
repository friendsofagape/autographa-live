import React, {
	useState,
	useEffect,
	useCallback,
	createContext,
	useContext,
} from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Slide from '@material-ui/core/Slide';
import AppBar from '@material-ui/core/AppBar';
import Toolbar from '@material-ui/core/Toolbar';
import Fab from '@material-ui/core/Fab';
import Mic from '@material-ui/icons/Mic';
import StopIcon from '@material-ui/icons/Stop';
import SkipPreviousIcon from '@material-ui/icons/SkipPrevious';
import SkipNextIcon from '@material-ui/icons/SkipNext';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import SaveIcon from '@material-ui/icons/Save';
import GetAppIcon from '@material-ui/icons/GetApp';
import BackupIcon from '@material-ui/icons/Backup';
import { StoreContext } from '../../context/StoreContext';
import { ReactMicPlus } from 'react-mic-plus';
import RaisedButton from 'material-ui/RaisedButton';
import Player from '../AudioPlayer';
import AutographaStore from '../../../components/AutographaStore';
import swal from 'sweetalert';
import TexttoSpeech from '../TexttoSpeech/TexttoSpeech';
import Recorder from '../Recorder';
import { Box, Tooltip, Zoom } from '@material-ui/core';
const { app } = require('electron').remote;
const fs = require('fs');
const constants = require('../../../util/constants');
const path = require('path');
const formattedSeconds = (sec) =>
	Math.floor(sec / 60) + ':' + ('0' + (sec % 60)).slice(-2);

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
	},
	marginTop: 200,
	button: {
		margin: theme.spacing(1),
		float: 'left',
		marginTop: 18,
	},
	input: {
		display: 'none',
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
		marginLeft: 150,
		float: 'left',
		marginTop: 20,
		position: 'static',
	},
	appBar: {
		top: 'auto',
		bottom: 0,
		background: '#3F5274',
		height: 65,
	},
	grow: {
		flexGrow: 1,
	},
	fab: {
		zIndex: 1,
		top: -40,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	fab2: {
		zIndex: 1,
		top: -40,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	fab1: {
		zIndex: 1,
		top: -40,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	player: {
		color: 'black',
		float: 'left',
		position: 'absolute',
		width: 270,
	},
	save: {
		float: 'right',
		position: 'absolute',
	},
	bottomIcons: {
		position: 'absolute',
	},
	oscilloscopescrim: {
		height: 125,
		marginTop: -135,
		scrim: {
			height: 'inherit',
			opacity: 0.4,
			backgroundRepeat: 'repeat',
		},
	},
	oscilloscope: {
		width: 10,
	},
	shadow: {
		position: 'absolute',
		top: -27,
		width: 64,
		height: 64,
		background: 'rgba(0,0,0,.3)',
	},
	totaltime: {
		float: 'right',
		position: 'absolute',
	},
}));

function BottomBar(props) {
	const classes = useStyles();
	const { record, blob, onselect } = useContext(StoreContext);
	const { selectNext } = useContext(StoreContext);
	const {
		selectPrev,
		resetVal,
		storeRecord,
		reduceTimer,
		totalTime,
		setOnselect,
		exportAudio,
	} = useContext(StoreContext);
	const {
		startRecording,
		stopRecording,
		saveRecord,
		resetTimer,
		recVerse,
		recVerseTime
	} = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
	let BookName = constants.booksList[parseInt(bookId, 10) - 1];
	var newfilepath = path.join(app.getPath('userData'), 'recordings', BookName, `Chapter${AutographaStore.chapterId}`, `output.json`)
	function onStop(recordedBlob) {
		saveRecord(recordedBlob);
	}
	function deleteRecordedVerse() {
		if (AutographaStore.isWarning === true) {
			swal({
				title:
					'Are you sure you want to Delete the Recording of this verse?',
				text: 'Once deleted, you will not be able to recover!',
				icon: 'warning',
				buttons: true,
				dangerMode: true,
			}).then((willDelete) => {
				if (willDelete) {
					recVerse.splice(recVerse.indexOf(onselect), 1);
					recVerseTime.map((value, index) => {
						if (value.verse === onselect) {
							recVerseTime.splice(index, 1);
							reduceTimer(value.totaltime);
						}
					});
					resetTimer();
					let recordedJSON = { ...recVerseTime }
					if (fs.existsSync(newfilepath)) {
						fs.writeFile( newfilepath , JSON.stringify(recordedJSON), 'utf8', function (err) {
							if (err) {
								console.log("An error occured while writing JSON Object to File.");
								return console.log(err);
							}
						 
							console.log("JSON file has been saved.");
						});
					}
					AutographaStore.recVerse = recVerse;
					AutographaStore.isPlaying = false;
					AutographaStore.isWarning = false;
					AutographaStore.reRecord = false;
					AutographaStore.currentSession = true;
					swal(`Verse${AutographaStore.vId} recording has been deleted!`, {
						icon: 'success',
					});
					resetVal(AutographaStore.vId);
				} else {
					AutographaStore.isWarning = true;
					AutographaStore.reRecord = false;
					swal(`Verse${AutographaStore.vId} recording is safe`);
				}
			});
		}
	}

	useEffect(() => {
		if (AutographaStore.vId !== onselect) {
			setOnselect(AutographaStore.vId);
			resetTimer();
		}
	}, [AutographaStore.vId]);

	useEffect(() => {
		// var timerID = setInterval(() => stopRecording(), 6000);
		// return function cleanup() {
		// 	clearInterval(timerID);
		// };
		AutographaStore.isWarning === true
			? (AutographaStore.currentSession = false)
			: (AutographaStore.currentSession = true);
		if (record === true) {
			AutographaStore.currentSession = false;
		}
	});

	return (
		<div>
			{props.isOpen.isOpen && (
				<React.Fragment>
					<Recorder isOpen={AutographaStore.AudioMount} />
					<Slide
						direction='up'
						in={props.isOpen.isOpen}
						mountOnEnter
						unmountOnExit>
						<AppBar
							position='fixed'
							color='primary'
							className={classes.appBar}>
							<Toolbar>
								<ReactMicPlus
									className={classes.oscilloscope}
									visualSetting='oscilloscope'
									record={record}
									onStop={onStop}
									strokeColor='#000000'
									backgroundColor='#3F5274'
									nonstop={true}
								/>
								{/* <div className={classes.oscilloscopescrim}>
									{!record && (
										<div className={classes.scrim} />
									)}
								</div> */}
								{/* <span>
									<TexttoSpeech currentRefverse={props.isOpen.currentRefverse}  />
								</span> */}
								<span
									className={classes.bottomIcons}
									style={{ right: '50%' }}>
									<span>
										<Tooltip
											title='Goto Previous Verse'
											TransitionComponent={Zoom}>
											<Fab
												color='primary'
												aria-label='previous'
												className={classes.fab}
												onClick={selectPrev}>
												<SkipPreviousIcon />
											</Fab>
										</Tooltip>
									</span>
									<span>
										<Fab
											aria-label='start'
											style={{ left: '42%' }}
											className={classes.shadow}>
											""
										</Fab>
										{record === false && (
											<Tooltip
												title='Start Recording'
												TransitionComponent={Zoom}>
												<Fab
													color='secondary'
													aria-label='start'
													className={classes.fab}
													onClick={startRecording}>
													<Mic />
												</Fab>
											</Tooltip>
										)}
									</span>
									<span>
										{record === true && (
											<Tooltip
												title='Stop Recording'
												TransitionComponent={Zoom}>
												<Fab
													color='secondary'
													aria-label='stop'
													className={classes.fab2}
													onClick={stopRecording}>
													<StopIcon />
												</Fab>
											</Tooltip>
										)}
									</span>
								</span>
								<span
									style={{
										right: '30%',
										left: '50%',
										position: 'absolute',
									}}>
									<span>
										<Tooltip
											title='Goto Next Verse'
											TransitionComponent={Zoom}>
											<Fab
												color='primary'
												aria-label='next'
												hidden={
													AutographaStore.currentSession ===
													true
												}
												className={classes.fab}
												onClick={selectNext}>
												<SkipNextIcon />
											</Fab>
										</Tooltip>
									</span>
									<span>
										{AutographaStore.isWarning === true && (
											<Tooltip
												title='Delete Current Verse'
												TransitionComponent={Zoom}>
												<Fab
													aria-label='delete'
													className={classes.fab}
													onClick={
														deleteRecordedVerse
													}>
													<DeleteForeverIcon />
												</Fab>
											</Tooltip>
										)}
									</span>
								</span>
								<span className={classes.player}>
									<Player
										isPlaying={props.isOpen.blob}
									/>
								</span>
								<span
									className={classes.totaltime}
									style={{ left: '80%' }}>
									<Box fontSize={13} fontStyle='italic'>
										Total Time recorded:{' '}
										{formattedSeconds(totalTime)}s
									</Box>
								</span>
								<span
									className={classes.save}
									style={{ left: '91.5%' }}>
									<Tooltip
									backgroundcolor='black'
										title={
											<span
												style={{
													fontSize: '11px',
												}}>
												Export Currently Recorded
												Chapter
											</span>
										}
										TransitionComponent={Zoom}>
										<Fab
											variant='extended'
											size='medium'
											aria-label='Export'
											onClick={exportAudio}>
											<BackupIcon
												style={{ marginRight: '5px' }}
											/>
											Export
										</Fab>
									</Tooltip>
								</span>
							</Toolbar>
						</AppBar>
					</Slide>
				</React.Fragment>
			)}
		</div>
	);
}
export default BottomBar;
