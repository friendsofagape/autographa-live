import React from 'react';
import Tabs from 'react-bootstrap/lib/Tabs';
import Tab from 'react-bootstrap/lib/Tab';
import AutographaStore from "./AutographaStore" 
import { FormattedMessage } from 'react-intl';
import { version } from '../../package.json';
const Modal = require('react-bootstrap/lib/Modal');


var AboutUsModel = function(props) {
    let closeAboutUs = () => AutographaStore.showModalAboutUs = false
    return (  
    <Modal show={props.show} onHide={closeAboutUs} id="tab-about">
        <Modal.Header closeButton>
            <Modal.Title><FormattedMessage id="tooltip-about" /></Modal.Title>
        </Modal.Header>
        <Modal.Body>
            <Tabs defaultActiveKey={1} id="uncontrolled-tab-example">
                <Tab eventKey={1} title={<FormattedMessage id="label-overview-tab"/>}>
                    <div className="row">
                        <div className="col-xs-6">
                            <img src="../assets/images/autographa_lite_large.png" className="img-circle" alt="Cinque Terre" width="215" height="200" />
                        </div>
        <div className="col-xs-6" style={{padding:"5px"}}>
                            <h3><FormattedMessage id="app-name" /></h3>
                            <p><FormattedMessage id="label-version" /> <span>{ version }</span></p>
        <p><FormattedMessage id="label-hosted-url" /></p>
	<p>https://github.com/friendsofagape/autographa-live.git</p>
                        </div>
                    </div>
                </Tab>
                <Tab eventKey={2} title={<FormattedMessage id="label-license-tab"/>}>
        <div style={{overflowY: "scroll", height: "255px"}}>
        <h4>GNU General Public License v3.0</h4>
	<p>Autographa Live, A Bible translation editor for everyone.<br />
	Copyright (C) 2019  Friends of Agape</p>
      <p>This program is free software: you can redistribute it and/or modify
      it under the terms of the GNU General Public License as published by
      the Free Software Foundation, either version 3 of the License, or
      (at your option) any later version.</p>
	<p>This program is distributed in the hope that it will be useful,
      but WITHOUT ANY WARRANTY; without even the implied warranty of
      MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
      GNU General Public License for more details.</p>
	<p>see https://www.gnu.org/licenses/.</p>
	<p>You may contact us via issues on GitHub.</p>
	</div>
      </Tab>
        </Tabs>
        </Modal.Body>
	</Modal>
    )
}

export default  AboutUsModel;
