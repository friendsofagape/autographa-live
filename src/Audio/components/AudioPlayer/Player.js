import React, { useState, useContext, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../context/StoreContext';
import AutographaStore from '../../../components/AutographaStore';
import ReactAudioPlayer from 'react-audio-player';

const useStyles = makeStyles((theme) => ({
	root: {
		flexGrow: 1,
	},
	formControl: {
		margin: theme.spacing(1),
		minWidth: 120,
		marginLeft: 150,
		float: 'left',
		marginTop: 20,
		position: 'static',
	},
	player:{
		flexGrow: 1,
		margin: theme.spacing(1),
	}
}));

const Player = (props) => {
	const classes = useStyles();
	return (
		<div>
			{AutographaStore.isPlaying && (
				<div className={classes.player} >
				<ReactAudioPlayer
					src={AutographaStore.blobURL}
					controls
				/>
				</div>
			)}
		</div>
	);
};

export default Player;
