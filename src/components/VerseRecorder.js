import * as React from 'react';
import { StoreContext } from '../Audio/context/StoreContext';
import { useContext } from 'react';
import { useEffect } from 'react';
import AutographaStore from './AutographaStore';

function VerseRecorder() {
    const { onselect } = useContext(StoreContext);
	const { selectPrev } = useContext(StoreContext);
    
	return <div></div>
};

export default VerseRecorder
