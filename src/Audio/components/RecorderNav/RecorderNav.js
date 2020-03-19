import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, AppBar, Slide, Zoom, Tooltip } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import BackupIcon from '@material-ui/icons/Backup';
import SettingsIcon from '@material-ui/icons/Settings';
import Mic from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import BookIcon from '@material-ui/icons/Book';
import AutographaStore from '../../../components/AutographaStore';
import { StoreContext } from '../../context/StoreContext';
import swal from 'sweetalert';
import Timer from '../Timer';
import Loader from '../Loader/Loader';
const db = require(`${__dirname}/../../../util/data-provider`).targetDb();
const constants = require('../../../util/constants');
const { app } = require('electron').remote;
const fs = require('fs');
const path = require('path');

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		top: 0,
		position: 'fixed',
		background: '#3F5274',
		height: 65,
	},
	menuButton: {
		marginRight: theme.spacing(2),
	},
	title: {
		flexGrow: 1,
		marginLeft: 9,
	},
	soundWave: {
		maxWidth: 300,
		position: 'static',
		float: 'right',
		marginLeft: 462,
	},
	recorderToggle: {
		backgroundColor: 'white',
		color: 'red',
	},
	mic: {
		background: '#f9f1f1',
		right: 260,
	},
	TexttoSpeech: {
		marginLeft: 20,
	},
	Icons: {
		marginRight: theme.spacing(1),
	},
	extendedIcon: {
		[theme.breakpoints.up('xl')]: {
			right: 500,
		},
		right: 260,
	},
	chapter: {
		[theme.breakpoints.up('xl')]: {
			right: 495,
		},
		right: 257,
	},
	export: {
		right: 120,
	},
	save: {
		float: 'right',
		position: 'absolute',
	},
}));

export default function RecorderNav(props) {
	const classes = useStyles();
	const [chapter, setChapter] = useState(AutographaStore.chapterId);
	const [isOpen, SetisOpen] = useState(false);
	const [done, setdone] = useState(false);
	const {
		exportAudio,
		recVerse,
		setRecverse,
		fetchTimer,
		updateJSON,
		startRecording,
		stopRecording,
		findBook,
		findChapter,
		isLoading,
		record
	} = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
	let BookName = constants.booksList[parseInt(bookId, 10) - 1];
	const [book, setbook] = useState(BookName);

	useEffect(() => {
		if (props.isOpen.audioImport === true) {
			importAudio();
		}
		if (chapter.toString() !== AutographaStore.chapterId.toString() &&
			isOpen === true
		) {
			window.location.reload();
		}
		if (isOpen === true) {
			if (AutographaStore.chunkGroup.length === recVerse.length) {
				// Get the existing data
				let existing = localStorage.getItem(BookName);
				// If no existing data, create an array
				// Otherwise, convert the localStorage string to an array
				existing = existing ? existing.split(',') : [];
				// Add new data to localStorage Array
				if (existing.indexOf(chapter.toString()) === -1) {
					existing.push(chapter);
					localStorage.setItem(BookName, existing.toString());
				}
				setdone(true);
			} else setdone(false);
			let existingValue = localStorage.getItem(BookName);
			// If no existing data, create an array
			// Otherwise, convert the localStorage string to an array
			existingValue = existingValue ? existingValue.split(',') : [];
			AutographaStore.recordedChapters = existingValue;
		}
	});

	const mountAudio = () => {
		setChapter(AutographaStore.chapterId);
		if (AutographaStore.isAudioSave !== true)
			recVerse.length === 0
				? (AutographaStore.isAudioSave = true)
				: (AutographaStore.isAudioSave = false);
		if (AutographaStore.isAudioSave === true) {
			swal({
				title: 'Are you sure?',
				text: 'You want to trigger off Audio Recording!',
				icon: 'warning',
				buttons: true,
				dangerMode: true,
			}).then((willDelete) => {
				if (willDelete) {
					AutographaStore.AudioMount = false;
					SetisOpen(false);
					localStorage.setItem('AudioMount', false);
					window.location.reload();
				} else {
					swal('Continue Recording Process');
				}
			});
		} else {
			swal({
				title: 'Cannot switch off Audio',
				text:
					'You have some newly recorded verses, Please export them to proceed!',
				icon: 'error',
				buttons: true,
				dangerMode: true,
			});
		}
	};

	const importAudio = () => {
		clearTimeout();
		localStorage.setItem('AudioMount', true);
		SetisOpen(true);
		setbook(BookName);
		setChapter(AutographaStore.chapterId);
		AutographaStore.audioImport = false;
		var newfilepath = path.join(
			app.getPath('userData'),
			'recordings',
			BookName,
			`Chapter${AutographaStore.chapterId}`,
			`output.json`,
		);
		if (fs.existsSync(newfilepath)) {
			fs.readFile(
				newfilepath,
				// callback function that is called when reading file is done
				function(err, data) {
					// json data
					var jsonData = data;
					// parse json
					var jsonParsed = JSON.parse(jsonData);
					// access elements
					for (var key in jsonParsed) {
						if (jsonParsed.hasOwnProperty(key)) {
							var val = jsonParsed[key];
							setRecverse(val.verse);
							fetchTimer(val.totaltime);
							updateJSON(val);
						}
					}
				},
			);
		}
	};

	const openmic = () => {
		const { shell } = require('electron');
		shell.openExternal('ms-settings:sound');
		shell.openExternal('x-apple.systempreferences:')
	};
	return (
		<div>
			{(isLoading === true) ? (<Loader />) : "" }
			{props.isOpen.isOpen && (
				<React.Fragment>
					<Slide
						direction='down'
						in={props.isOpen.isOpen}
						mountOnEnter
						unmountOnExit>
						<AppBar
							position='static'
							hidden={AutographaStore.showModalBooks === true}
							className={classes.appBar}>
							<Toolbar>
								<img
									alt='Brand'
									src={require('../../../assets/images/logo.png')}
								/>
								<Typography
									variant='h5'
									className={classes.title}>
									Recorder
								</Typography>
								<span
									style={{
										right: '30%',
										left: '50%',
										position: 'absolute',
									}}>
									<Fab
										size='medium'
										className={classes.extendedIcon}
										variant='extended'>
										<BookIcon className={classes.Icons} />
										{BookName}
									</Fab>
									<Fab
										size='small'
										aria-label='chapter'
										onClick={findChapter}
										disabled={isLoading===true}
										className={classes.chapter}>
										{AutographaStore.chapterId}
									</Fab>
								</span>
								<span
									style={{
										right: '50%',
										left: '48%',
										position: 'absolute',
									}}>
									<Timer open={props.isOpen.isOpen} />
								</span>
								<Tooltip
									title='Turn-Off Recording Mode'
									TransitionComponent={Zoom}>
									<span>
									<Fab
										aria-controls='menu-appbar'
										aria-haspopup='true'
										aria-label="add"
										size='medium'
										disabled={isLoading===true}
										className={classes.mic}
										onClick={mountAudio}>
										<Mic style={{ fontSize: '1.8rem' }} />
									</Fab>
									</span>
								</Tooltip>
								<span
									className={classes.save}
									style={{ left: '87%' }}>
									<Tooltip
										backgroundcolor='black'
										title={
											<span
												style={{ fontSize: '11px' }}>
												Export Currently Recorded
												Chapter
											</span>
										}
										TransitionComponent={Zoom}>
										<span>
										<Fab
											size='medium'
											aria-label='Export'
											disabled={isLoading===true}
											onClick={exportAudio}>
											<BackupIcon style={{ fontSize: '1.8rem' }}/>
										</Fab>
										</span>
									</Tooltip>
								</span>
								<span
									style={{
										right: '100%',
										left: '96%',
										position: 'absolute',
									}}>
									<Tooltip
										title='Mic Settings'
										TransitionComponent={Zoom}>
										<IconButton
											aria-controls='menu-appbar'
											aria-haspopup='true'
											size='medium'
											color='inherit'
											onClick={openmic}>
											<SettingsIcon />
										</IconButton>
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
