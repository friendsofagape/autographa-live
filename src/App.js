import React, {useState} from 'react';
import Viewer from '@bit/unfoldingword.resources.viewer';

import dbUtil from './util/DbUtil';

dbUtil.dbSetupAll();

const defaultContext = {
	username: 'STR',
};

function App() {
	const [context, setContext] = useState(defaultContext);
	return (
		<Viewer
		  context={context}
			setContext={setContext}
			history={[]}
		/>
	);
};

export default App;