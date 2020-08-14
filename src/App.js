import React, {useState, useEffect} from 'react';
import Viewer from 'translation-helps-patch';
import Constant from './util/constants';
import { Offline, Online } from "react-detect-offline";
import { FormattedMessage } from 'react-intl';
import AutographaStore from './components/AutographaStore';

function App(props) {
	let defaultContext = {
		// username: 'STR',
		// username: 'unfoldingword',
		username: 'Door43-Catalog',
		languageId: AutographaStore.translationHelplanguageId,
		resourceId: AutographaStore.translationHelpresourceId,
		reference: {
			bookId: `${props.book ? Constant.bookCodeList[parseInt(props.book, 10) - 1].toLowerCase() : 'gen' }`,
			chapter: props.chapter ? props.chapter : '1',
		}
	};
	const [context, setContext] = useState(defaultContext);
	const [viewerComponent, setViewerComponent] = useState(<></>);
	
	useEffect(() => {
		let _bookID = Constant.bookCodeList.indexOf(defaultContext.reference.bookId.toUpperCase())
		props.onChangeBook(_bookID+1)
		setContext(defaultContext)
    }, [props.book])

	useEffect(() => {
		props.onChangeChapter(defaultContext.reference.chapter);
		setContext(defaultContext)
	}, [props.chapter])
	
	useEffect(() => {
		setContext(defaultContext)
	}, [props.onLanguagechange])
	useEffect(() => {
		setContext(defaultContext)
    }, [props.onResourceChange])
	useEffect(() => {
		const viewer = (
			<Viewer {...props}
				context={context}
				history={[]}
				setContext={setContext}
			/>
		  );
		  setViewerComponent(viewer);
    }, [context])

	return (
		<div>
		<Online>{viewerComponent}</Online>
		<Offline>
            <FormattedMessage id="dynamic-msg-offline">
            {(message) =>
            <p className="offline" dangerouslySetInnerHTML={{__html: message}}></p>}
            </FormattedMessage>
        </Offline>
        </div>
    );
};
export default App;