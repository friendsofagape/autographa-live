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
// import TexttoSpeech from '../TexttoSpeech/TexttoSpeech';
import IconButton from '@material-ui/core/IconButton';
import LayersIcon from '@material-ui/icons/Layers';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import FontSlider from '../FontSlider/FontSlider';
import Recorder from '../Recorder';
import { Box, Tooltip, Zoom, useTheme } from '@material-ui/core';
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
		marginRight: -67,
		marginLeft: 69,
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
		height: 72,
	},
	grow: {
		flexGrow: 1,
	},
	fab: {
		zIndex: 1,
		margin: theme.spacing(2),
		marginLeft: -7,
		backgroundColor: 'rgba(346, 279, 296, 0.87)',
		top: 3
	},
	start: {
		zIndex: 1,
		margin: theme.spacing(2),
		marginLeft: -7,
		top: 3
	},
	fab2: {
		zIndex: 1,
		margin: theme.spacing(2),
		marginLeft: -7,
		top: 3
	},
	fab1: {
		zIndex: 1,
		margin: theme.spacing(2),
		marginLeft: -7,
		top: 3
	},
	player: {
		color: 'black',
		float: 'left',
		position: 'absolute',
		width: 257,
		marginLeft: 190,
		height: 64,
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
		top: 15,
		width: 64,
		height: 64,
		background: 'rgba(0,0,0,.5)',
	},
	totaltime: {
		float: 'right',
		position: 'absolute',
	},
}));

function BottomBar(props) {
	const classes = useStyles();
	const theme = useTheme();
	const [spacekey, setspacekey] = useState(false);
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
		recVerseTime,
	} = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
	let BookName = constants.booksList[parseInt(bookId, 10) - 1];
	var newfilepath = path.join(
		app.getPath('userData'),
		'recordings',
		BookName,
		`Chapter${AutographaStore.chapterId}`,
		`output.json`,
	);
	const transitionDuration = {
		enter: theme.transitions.duration.enteringScreen,
		exit: theme.transitions.duration.leavingScreen,
	};
	function onStop(recordedBlob) {
		saveRecord(recordedBlob);
		console.log(recordedBlob);
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
					let recordedJSON = { ...recVerseTime };
					if (fs.existsSync(newfilepath)) {
						fs.writeFile(
							newfilepath,
							JSON.stringify(recordedJSON),
							'utf8',
							function(err) {
								if (err) {
									console.log(
										'An error occured while writing JSON Object to File.',
									);
									return console.log(err);
								}

								console.log('JSON file has been saved.');
							},
						);
					}
					AutographaStore.recVerse = recVerse;
					AutographaStore.isPlaying = false;
					AutographaStore.isWarning = false;
					AutographaStore.reRecord = false;
					AutographaStore.currentSession = true;
					swal(
						`Verse${AutographaStore.vId} recording has been deleted!`,
						{
							icon: 'success',
						},
					);
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
		//check for joint verse

		// if(AutographaStore.jointVerse[onselect])
		// console.log(AutographaStore.jointVerse[onselect])
		AutographaStore.isWarning === true
			? (AutographaStore.currentSession = false)
			: (AutographaStore.currentSession = true);
		if (record === true) {
			AutographaStore.currentSession = false;
		}
	});
	// For space press and hold
	function handleButtonPress(event) {
		if (event.key === ' ' && record === false) {
			setspacekey(true);
		}
		if (spacekey === true || event.type === 'mousedown') {
			startRecording();
			setspacekey(false);
		}
	}

	function handleButtonRelease(event) {
		if (record === true) {
			stopRecording();
			setspacekey(false);
		}
	}

	return (
		<div>
			{props.isOpen.isOpen && (
				<React.Fragment>
					<Recorder
						isOpen={AutographaStore.AudioMount}
						audioImport={AutographaStore.audioImport}
					/>
					<Slide
						direction='up'
						in={props.isOpen.isOpen}
						mountOnEnter
						unmountOnExit>
						<AppBar
							hidden={AutographaStore.showModalBooks}
							position='fixed'
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
								<FontSlider />
								<RaisedButton
									edge='start'
									className={classes.menuButton}
									color='inherit'
									backgroundColor= {AutographaStore.layout !== 0 ? 'rgba(0,0,0,.5)' : "" }
									onClick={() => AutographaStore.layout !== 0 ? AutographaStore.layout = 0 : "" }
									aria-label='1x'>
									1x&nbsp; <i className="fa fa-columns fa-lg" />
								</RaisedButton>
								<RaisedButton
									edge='start'
									className={classes.menuButton}
									color='inherit'
									backgroundColor= {AutographaStore.layout === 0 ? 'rgba(0,0,0,.5)' : "" }
									onClick={() => AutographaStore.layout === 0 ? AutographaStore.layout = 1 : "" }
									aria-label='2x'>
									2x&nbsp; <i className="fa fa-columns fa-lg" />
								</RaisedButton>
								<span
									className={classes.bottomIcons}
									style={{ right: '50%' }}>
									<span>
										<Tooltip
											title='Goto Previous Verse'
											TransitionComponent={Zoom}>
											<Fab
												aria-label='previous'
												className={classes.fab}
												onClick={selectPrev}>
												<SkipPreviousIcon style={{ fontSize: '1.8rem' }} />
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
										{/* {record === false && ( */}
										<Tooltip
											title='Start Recording'
											TransitionComponent={Zoom}>
											<Fab
												color='secondary'
												aria-label='start'
												className={classes.start}
												onKeyDown={handleButtonPress}
												onKeyUp={handleButtonRelease}
												onMouseDown={handleButtonPress}
												onMouseUp={handleButtonRelease}>
												<Mic style={{ fontSize: '1.8rem' }} />
											</Fab>
										</Tooltip>
										{/* )} */}
									</span>
									{/* <span>
										{record === true && (
											<Tooltip
												title='Stop Recording'
												TransitionComponent={Zoom}>
												<Fab
													color='secondary'
													aria-label='stop'
													className={classes.fab2}
													onClick={handleButtonRelease}>
													<StopIcon />
												</Fab>
											</Tooltip>
										)}
									</span> */}
								</span>
								<span
									style={{
										right: '30%',
										left: '50%',
										position: 'absolute',
									}}>
									{AutographaStore.currentSession ===
										false && (
										<span>
											<Zoom
												in={AutographaStore.currentSession === false}
												timeout={transitionDuration}
												style={{
													transitionDelay: `${
														AutographaStore.currentSession === false
															? transitionDuration.exit
															: 0
													}ms`,
												}}
												unmountOnExit>
												<Tooltip
													title='Goto Next Verse'
													TransitionComponent={Zoom}>
													<Fab
														aria-label='next'
														className={classes.fab}
														onClick={selectNext}>
														<SkipNextIcon style={{ fontSize: '1.8rem' }}/>
													</Fab>
												</Tooltip>
											</Zoom>
										</span>
									)}
									<span>
										{AutographaStore.isWarning === true && (
											<Zoom
												in={AutographaStore.isWarning}
												timeout={transitionDuration}
												style={{
													transitionDelay: `${
														AutographaStore.isWarning
															? transitionDuration.exit
															: 0
													}ms`,
												}}
												unmountOnExit>
												<Tooltip
													title='Delete Current Verse'
													TransitionComponent={Zoom}>
													<Fab
														color='secondary'
														size='large'
														aria-label='delete'
														className={
															classes.start
														}
														onClick={
															deleteRecordedVerse
														}>
														<DeleteForeverIcon style={{ fontSize: '1.8rem' }} />
													</Fab>
												</Tooltip>
											</Zoom>
										)}
									</span>
								</span>
								<span style={{ left:'47%' }} className={classes.player}>
									<Player isPlaying={props.isOpen.blob} />
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
