import React, {useState, useEffect} from 'react';
import Viewer from '@bit/unfoldingword.resources.viewer';
import dbUtil from './util/DbUtil';
import Constant from './util/constants';
dbUtil.dbSetupAll();

function App(props) {
	let defaultContext = {
		username: 'STR',
		//username: 'unfoldingword',
		languageId: 'en',
		resourceId: 'ult',
		reference: {
			bookId: `${props.book ? Constant.bookCodeList[parseInt(props.book, 10) - 1].toLowerCase() : 'gen' }`,
			chapter: props.chapter ? props.chapter : '1',
		}
	};
	const [context, setContext] = useState(defaultContext);

	useEffect(() => {
		return () => setContext(defaultContext)
	})
	return (
		<Viewer
		  context={context}
			setContext={setContext}
			history={[]}
		/>
	);
};
export default App;