import React, {useState, useEffect} from 'react';
import Viewer from '@bit/unfoldingword.resources.viewer';
import Constant from './util/constants';
import { Offline, Online } from "react-detect-offline";

function App(props) {
	let defaultContext = {
		// username: 'STR',
		// username: 'unfoldingword',
		username: 'Door43-Catalog',
		languageId: 'en',
		resourceId: 'ult',
		reference: {
			bookId: `${props.book ? Constant.bookCodeList[parseInt(props.book, 10) - 1].toLowerCase() : 'gen' }`,
			chapter: props.chapter ? props.chapter : '1',
		}
	};
	const [context, setContext] = useState(defaultContext);

	useEffect(() => {
		setContext(defaultContext)
	}, [props.book])
	useEffect(() => {
		setContext(defaultContext)
	}, [props.chapter])
	return (
		<div>
		<Online>
		<Viewer
		  context={context}
			setContext={setContext}
			history={[]}
		/>
		</Online>
		<Offline>
			<p className="offline"> Wait for Internet Connection </p>
		</Offline>
		</div>
	);
};
export default App;