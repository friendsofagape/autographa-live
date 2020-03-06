import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, AppBar, Slide, Zoom, Tooltip } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import ImportExportSharpIcon from '@material-ui/icons/ImportExportSharp';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import BackupIcon from '@material-ui/icons/Backup';
import Mic from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import BookIcon from '@material-ui/icons/Book';
import AutographaStore from '../../../components/AutographaStore';
import { StoreContext } from '../../context/StoreContext';
import LayersIcon from '@material-ui/icons/Layers';
import LayersClearIcon from '@material-ui/icons/LayersClear';
import swal from 'sweetalert';
import Timer from '../Timer';
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
}));

export default function Recorder(props) {
	const classes = useStyles();
	const {
		exportAudio,
		recVerse,
		setRecverse,
		fetchTimer,
		updateJSON,
		startRecording,
		stopRecording
	} = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
	let BookName = constants.booksList[parseInt(bookId, 10) - 1];

	useEffect(() => {
		if(props.isOpen.audioImport === true)
		importAudio()
	})
	const mountAudio = () => {
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
		AutographaStore.audioImport=false
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
	// const handleKeyPress = (event) => {
	// 	console.log(event.key)
	// 	if(event.key === ' '){
	// 	  console.log('enter press here! ')
	// 	  startRecording()
	// 	}
	//   }
	//   const handleKeyPressUp = (event) => {
	// 	console.log(event.key)
	// 	if(event.key === ' '){
	// 	  console.log('enter press down! ')
	// 	  stopRecording()
	// 	}
	//   }

	return (
		<div>
			{props.isOpen.isOpen && (
				<React.Fragment>
					<Slide
						direction='down'
						in={props.isOpen.isOpen}
						mountOnEnter
						unmountOnExit>
						<AppBar position='static' className={classes.appBar}>
							<Toolbar>
							{AutographaStore.layout !== 0 ?
								<IconButton
									edge='start'
									className={classes.menuButton}
									color='inherit'
									onClick={() => AutographaStore.layout !== 0 ? AutographaStore.layout = 0 : "" }
									aria-label='menu'>
									<LayersIcon />
								</IconButton> :
								<IconButton
									edge='start'
									className={classes.menuButton}
									color='inherit'
									onClick={() => AutographaStore.layout === 0 ? AutographaStore.layout = 1 : "" }
									aria-label='menu'>
									<LayersClearIcon />
								</IconButton>
							}
								
								
								{/* <div>
									<input
										type='text'
										id='one'
										onKeyDown={handleKeyPress}
										// onKeyUp={handleKeyPressUp}
									/>
								</div> */}
								<Typography
									variant='h6'
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
										<BookIcon />
										{BookName}
									</Fab>
									<Fab
										size='small'
										aria-label='chapter'
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
									<Fab
										aria-controls='menu-appbar'
										aria-haspopup='true'
										variant='extended'
										size='medium'
										className={classes.mic}
										onClick={mountAudio}>
										<Mic />
										Turn Off
									</Fab>
								</Tooltip>
							</Toolbar>
						</AppBar>
					</Slide>
				</React.Fragment>
			)}
		</div>
	);
}
