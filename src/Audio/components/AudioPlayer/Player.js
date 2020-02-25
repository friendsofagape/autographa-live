import React, { useState, useContext, useEffect } from 'react';
import AudioPlayer from 'react-h5-audio-player';
import { makeStyles } from '@material-ui/core/styles';
import { StoreContext } from '../../context/StoreContext';
import { classes } from 'istanbul-lib-coverage';
import AutographaStore from '../../../components/AutographaStore';

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
}));

const Player = (props) => {
    const { onselect, storeRecord } = useContext(StoreContext);
    const [ blobURL , setblobURL] = useState(null)
	useEffect(() => {
		if (AutographaStore.isPlaying === true) {
			storeRecord.map((value, index) => {
				if (value.verse === onselect) {
                    setblobURL(value.blobURL)
				}
			});
        }
        else
        {
            setblobURL(null)
        }
	});
	return (
		<div>
			{AutographaStore.isPlaying && (
				<div className={classes.root}>
					<AudioPlayer
						src={blobURL}
						onEnded={(e) => (AutographaStore.isPlaying=false)}
					/>
				</div>
			)}
		</div>
	);
};

export default Player;
