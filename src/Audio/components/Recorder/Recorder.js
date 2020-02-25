import React, { useContext, useEffect, useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, AppBar, Slide, Zoom } from '@material-ui/core';
import Toolbar from '@material-ui/core/Toolbar';
import IconButton from '@material-ui/core/IconButton';
import MenuIcon from '@material-ui/icons/Menu';
import BackupIcon from '@material-ui/icons/Backup';
import Mic from '@material-ui/icons/Mic';
import Fab from '@material-ui/core/Fab';
import BookIcon from '@material-ui/icons/Book';
import AutographaStore from '../../../components/AutographaStore';
import { StoreContext } from '../../context/StoreContext';
import swal from 'sweetalert';
import Timer from '../Timer';
import Tooltip from 'material-ui/internal/Tooltip';
const constants = require('../../../util/constants');

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	appBar: {
		top: 0,
		position: 'fixed',
		background: '#3F5274',
		height: 68,
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
	const { exportAudio, storeRecord } = useContext(StoreContext);
	let bookId = AutographaStore.bookId.toString();
	let BookName = constants.booksList[parseInt(bookId, 10) - 1];
	const mountAudio = () => {
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
								<IconButton
									edge='start'
									className={classes.menuButton}
									color='inherit'
									aria-label='menu'>
									<MenuIcon />
								</IconButton>
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
								<Fab
									aria-controls='menu-appbar'
									aria-haspopup='true'
									size='medium'
									className={classes.mic}
									onClick={mountAudio}>
									<Mic />
								</Fab>
								<span>
									<Fab
										size='medium'
										aria-haspopup='true'
										className={classes.export}
										onClick={exportAudio}>
										<BackupIcon />
									</Fab>
								</span>
							</Toolbar>
						</AppBar>
					</Slide>
				</React.Fragment>
			)}
		</div>
	);
}
