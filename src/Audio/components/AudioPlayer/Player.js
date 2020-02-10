import React, { useState, useContext } from 'react';
import AudioPlayer from "react-h5-audio-player";
import { makeStyles } from "@material-ui/core/styles";
import { StoreContext } from '../../context/StoreContext';
import { classes } from 'istanbul-lib-coverage';

const useStyles = makeStyles(theme => ({
    root: {
        flexGrow: 1,
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
        marginLeft: 150,
        float: "left",
        marginTop: 20,
        position: "static"
    }
}))

const Player = () => {
    const { blob, onselect } = useContext(StoreContext)
    return (
        <div>
            {(blob.verse === onselect) && (
                <div className={classes.root} >
                    <AudioPlayer
                        className={classes.formControl}
                        src={blob.blobURL}
                        onPlay={e => console.log("onPlay")}
                    />
                </div>
            )}
        </div>
    );
}

export default Player;