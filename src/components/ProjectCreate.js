import React from 'react';
import {TextField} from "material-ui";

export class ProjectCreate extends React.Component {
    constructor(props) {
        super(props);
        this.state = {projectName: ""};
    }

    onProjectNameChange = e => {
        const cleanedValue = e.target.value.replace(/\W/g, "");
        this.setState({projectName: cleanedValue});
        //e.target.value = cleanedValue;
    };

    onButtonClick = () => {
        if (this.state.projectName) {
            this.props.syncAdapter.create(this.state.projectName)
                .then(this.props.onCreate)
                .then(() => this.setState({projectName: ""}));
        }
    };

    render() {
        const syncAdapter = this.props.syncAdapter;
        const canCreate = syncAdapter && typeof(syncAdapter['create']) === "function";
        if (!canCreate) {
            return null;
        }

        return (
            <div id="newProject" style={{marginTop: '10px'}}>
                <span style={{color: '#0b82ff', fontWeight: 'bold'}}>Create New Project</span>
                <div>
                    <div style={{float: "left"}}>
                        {
                            <TextField
                                hintText="Name"
                                name="newProjectName"
                                id="newProjectName"
                                onChange={this.onProjectNameChange}
                                value={this.state.projectName}
                            />
                        }
                    </div>
                    <div className="btn-imp-group" style={{float: "right"}}>
                        <a
                            href="javascript:void(0)"
                            className="margin-right-10 btn btn-success"
                            onClick={this.onButtonClick}
                            disabled={!this.state.projectName}
                        >
                            Create
                        </a>
                    </div>
                    <div style={{clear: "both"}}/>
                </div>
            </div>
        );
    };
}
