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
import PlayCircleFilledIcon from '@material-ui/icons/PlayCircleFilled';
import BackupIcon from '@material-ui/icons/Backup';
import { StoreContext } from '../../context/StoreContext';
import { ReactMicPlus } from 'react-mic-plus';
import Player from '../AudioPlayer';
import VerseRecorder from '../../../components/VerseRecorder';
import AutographaStore from '../../../components/AutographaStore';
import swal from 'sweetalert';
import TexttoSpeech from '../TexttoSpeech/TexttoSpeech';
const path = ``;

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
	},
	grow: {
		flexGrow: 1,
	},
	fab: {
		zIndex: 1,
		top: -40,
		right: -700,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	fab1: {
		zIndex: 1,
		top: -40,
		right: -700,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	export: {
		zIndex: 1,
		top: -40,
		right: -700,
		margin: theme.spacing(2),
		marginLeft: -7,
	},
	player: {
		[theme.breakpoints.up('xl')]: {
			display: 'block',
			width: 300,
			color: 'blue',
			float: 'right',
			position: 'static',
			marginLeft: 1200,
		},
		display: 'block',
		width: 300,
		color: 'blue',
		float: 'right',
		position: 'static',
		marginLeft: 720,
		marginRight:-15,
		right: 60
		
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
}));

function BottomBar(props) {
	const classes = useStyles();
	const [show, setShow] = useState(false);
	const { record, blob, onselect } = useContext(StoreContext);
	const { selectNext } = useContext(StoreContext);
	const { selectPrev, resetVal, exportAudio, storeRecord } = useContext(StoreContext);
	const {
		startRecording,
		stopRecording,
		saveRecord,
		getDB,
		recVerse,
	} = useContext(StoreContext);
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
					storeRecord.map((value, index) => {
						if(value.verse === onselect){
							storeRecord.splice(index,1)
						}
					})
					AutographaStore.recVerse = recVerse;
					AutographaStore.isPlaying = false;
					AutographaStore.isWarning = false;
					AutographaStore.reRecord = false;
					AutographaStore.currentSession = true;
					swal(`Verse${onselect} recording has been deleted!`, {
						icon: 'success',
					});
					resetVal(AutographaStore.vId);
				} else {
					AutographaStore.isWarning = true;
					AutographaStore.reRecord = false;
					swal(`Verse${onselect} recording is safe`);
				}
			});
		}
	}

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
					<Slide direction='up' in={props} mountOnEnter unmountOnExit>
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
								<span>
									<Fab
										className={classes.export}
										onClick={exportAudio}>
										<BackupIcon />
									</Fab>
								</span>
								<div className={classes.oscilloscopescrim}>
									{!record && (
										<div className={classes.scrim} />
									)}
								</div>
								{/* <span>
									<TexttoSpeech currentRefverse={props.isOpen.currentRefverse}  />
								</span> */}
								<span>
									{record === false && (
										<Fab
											color='secondary'
											aria-label='start'
											className={classes.fab}
											onClick={startRecording}>
											<Mic />
										</Fab>
									)}
								</span>
								<span>
									{record === true && (
										<Fab
											color='primary'
											aria-label='stop'
											className={classes.fab}
											onClick={stopRecording}>
											<StopIcon />
										</Fab>
									)}
								</span>
								<span>
									<Fab
										color='primary'
										aria-label='previous'
										className={classes.fab}
										onClick={selectPrev}>
										<SkipPreviousIcon />
									</Fab>
								</span>
								<span>
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
								</span>
								<span>
									{AutographaStore.isWarning === true && (
										<Fab
											aria-label='delete'
											className={classes.fab1}
											onClick={deleteRecordedVerse}>
											<DeleteForeverIcon />
										</Fab>
									)}
								</span>
								<span className={classes.player}>
									<Player
										isPlaying={props.isOpen.isPlaying}
									/>
								</span>
							</Toolbar>
						</AppBar>
					</Slide>
					<VerseRecorder />
				</React.Fragment>
			)}
		</div>
	);
}
export default BottomBar;
