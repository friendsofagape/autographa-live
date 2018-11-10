import React, { PropTypes } from 'react';
import ProjectListRow from './ProjectListRow';
import { FormattedMessage } from 'react-intl';

const ProjectList = ({ projects, showLoader, paratextObj }) => {
    return (
        projects.length > 0 ?
        
        <div id="projectList" style={{height: '400px', overflowY: 'auto', marginTop: '10px'}}><span style={{color: '#0b82ff',fontWeight: 'bold' }}>Available Projects</span>
            {
                projects.map((project, i) => {
                    return (<ProjectListRow key = { i } index = {i} project = { project } showLoader = { showLoader} paratextObj = {paratextObj}/>)
                })
            }
        </div>  : <div style={{marginTop: '10px' }}><FormattedMessage id="label-no-project" /></div>
    );
};

ProjectList.propTypes = {
    projects: PropTypes.array.isRequired
};

export default ProjectList;