import React from 'react';
import AutographaStore from "./AutographaStore";

export class Ahref extends React.Component {
    handleClick = (event) => {
        const openedExternally = require('electron').shell.openExternal(this.props.href);
        if (openedExternally) {
            event.preventDefault();
        }
    };

    render = () => (
        <a href={this.props.href} onClick={this.handleClick} target="_blank">
            {`${AutographaStore.currentTrans[this.props.i18n].replace("$", this.props.href)}`}
        </a>
    );
}
