import React from 'react';
import * as mobx from "mobx";
import {FormattedMessage} from 'react-intl';
import AutographaStore from "./AutographaStore";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import Typography from "@material-ui/core/Typography";

const numberFormat = require("../util/getNumberFormat")
const { Tabs, Tab, Modal, Col, Row, Nav, NavItem, Panel, PanelGroup } = require('react-bootstrap/lib');
const path = require("path");
const fs = require("fs");
var appPath = path.join(__dirname,'..','..');
let flag = false;

class ImportReport extends React.Component {
    constructor(props) {
		super(props);
		this.state = {
			refList: [],
			refListEdit: [],
			bibleReference: true,
			visibleList: true,
			myBible: "",
			appLang: AutographaStore.appLang,
			message: "",
			hideAlert: "hidemessage",
			showLoader: false,
			refIndex: 0,
			refName: "",
            showMsg: false,
            show:false,
			msgId: "",
			filepath: "",
			modalBody: "",
			title: "",
			sync: {
				syncProvider: "",
				endpoint: "",
				username: "",
				password: ""
			},
			projectData: [],
            syncAdapter: null,
			activeKey: -1,
			successFile: [],
            errorFile: [],
            warningTitle: "",
            successTitle:"",
            errorTitle:"",
            expanded: "",
            totalFile: [],
            warningFile: [],
            tabKey: 1
        };
    }

    componentDidMount(){
        if( AutographaStore.settingImportReport===true || AutographaStore.showSyncImportReport === true){
            this.ImportReport();
        }
    }
    ImportReport(){
        console.log("Imside Importreport*********",this.props.totalFiles);
        this.setState({totalFile : this.props.totalFiles});
        let date = new Date();
        let res = mobx.toJS(AutographaStore.successFile);
        res.map((value) => {
            this.setState(prevState => ({
                successFile: [...prevState.successFile, (value)],
                successTitle: AutographaStore.currentTrans["tooltip-import-title"]
            }))
        })
        const chapterMissing = mobx.toJS(AutographaStore.warningMsg);
        let objWarnArray = [];
        let preValue = undefined;
        let book = "";
        let chapters = [];
        chapterMissing.map((value) => { 
            if (value[0] !== preValue){
                if (value[0] !== preValue && preValue !== undefined ){
                    const obj = {'filename':book, 'chapter':chapters};
                    objWarnArray.push(obj);
                    book = "";
                    chapters = [];
                }
        book = value[0];
        chapters.push(value[1])
        preValue = value[0];
        }
        else{
            chapters.push(value[1])
        }          
        });
        if (book !== "" && chapters.length !== 0){
        const obj = {'filename':book, 'chapter':chapters};
        objWarnArray.push(obj);
            if (this.state.warningTitle === ""){
                this.setState({warningTitle:"WarningFiles"});
            }
        }
        let finalWarnArray = Array.from(new Set(objWarnArray));
        this.setState({ warningFile: finalWarnArray })
        // return res;

        var errorpath = `${appPath}/report/error${date.getDate()}${date.getMonth()+1}${date.getFullYear()}.log`;
        let err = mobx.toJS(AutographaStore.errorFile);
        err.map((value) => {
            fs.appendFile(errorpath, value+"\n" , (value) => {
                if (value) {
                    console.log(AutographaStore.errorFile);
                }else{
                    console.log("succesfully created error.log file")
                }
            });
            let newErr = value.toString().replace("Error:","");
            this.setState(prevState => ({
                errorFile: [...prevState.errorFile, (newErr)],
                errorTitle: AutographaStore.currentTrans["tooltip-error-title"]
            }))
        })
        
        this.props.showLoader(false);
        this.setState({show: true});
        AutographaStore.showModalSettings = false;
    }

    handleClose = () => {
        this.setState({show: false});
        AutographaStore.settingImportReport = false
        AutographaStore.showSyncImportReport = false
        this.setState({
            successFile: [],
            errorFile: [],
            warningTitle: "",
            successTitle:"",
            errorTitle:"",
            totalFile: [],
            warningFile: [],
        })
        AutographaStore.warningMsg = []
        AutographaStore.successFile = []
        AutographaStore.errorFile = []
    }

    handleChange = panel => (event, isExpanded) => {
        if (isExpanded === undefined && flag === false){
            isExpanded = true;
            flag = true;
        }
        else if(isExpanded === undefined && flag === true){
            isExpanded = false;
            flag = false;
        }
        this.setState({expanded: (isExpanded ? panel : false) });
    }

    handleErrChange = panel => (event, isExpanded) => {
        if (isExpanded === undefined && flag === false){
            isExpanded = true;
            flag = true;
        }
        else if(isExpanded === undefined && flag === true){
            isExpanded = false;
            flag = false;
        }
        this.setState({expanded: (isExpanded ? panel : false) });
    }

    handleTabSelect = tabKey => {
        this.setState({ tabKey: tabKey });
    };

    render () {
        return (
            <Modal className="import-report" show={this.state.show} onHide={this.handleClose}>
            <Modal.Header className="head" closeButton>
            <Modal.Title><FormattedMessage id="modal-import-report" /></Modal.Title>
            </Modal.Header>
            <div>
            <Tabs activeKey={this.state.tabKey} style={{ width: "auto" }} onSelect={this.handleTabSelect} id="controlled-tab-example">
              <Tab eventKey={1} title={<div className="success-title"><FormattedMessage id="tooltip-import-title" /> ({this.state.successFile.length + this.state.warningFile.length}/{this.state.totalFile.length})</div>}>
               <Modal.Body className={this.state.successTitle ? "imported-files" : ""} onDoubleClick={this.handleChange('panel')}>
               <div style={{ position: "absolute", top: "-4px", right: "39px" }} >
                    {this.state.warningTitle ? (
                      <ExpandMoreIcon onClick={this.handleErrChange("panel")} style={{ borderRadius: "35%", backgroundColor: "#a59f9f"}}/>) : ("")
                    }
                </div>
                {this.state.successFile.map((success,key) => (
                    <div id={key} key={key} style={{width:"200px", textAlign:"center", float: "left", margin:"2px 1px 2px 1px"}}>
                        <ExpansionPanelSummary 
                            aria-controls="panel1a-content"
                            id="panel1a-header"
                            style={{backgroundColor: "lightgreen"}}>
                            <Typography>{success}</Typography>
                        </ExpansionPanelSummary>
                    </div>
                ))}
                {this.state.warningFile.map((_warning,key) => (
                        <div id={key} key={key} style={{width:"200px", textAlign:"center", display: "inline-block", margin:"1px"}}>
                            <ExpansionPanel expanded={this.state.expanded === ('panel'+key) || this.state.expanded === 'panel' } onChange={this.handleChange('panel'+key)}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                style={{backgroundColor: "yellow"}}
                            >
                                <Typography>{_warning.filename}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Typography>
                                <FormattedMessage id="usfm-warning1-chapter" /> {numberFormat.getNumberFormat(_warning.chapter)} <FormattedMessage id="usfm-warning2-chapter" />
                                </Typography>
                            </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </div>
                    ))}
                    {this.state.successFile.length + this.state.warningFile.length === 0 ? (<div style={{ textAlign: "center" }}><FormattedMessage id="tooltip-noimport-title" /></div>) : ("")}
                </Modal.Body>
                </Tab>

                <Tab eventKey={2} title={<div className="error-title">{<FormattedMessage id="tooltip-error-title" />} ({this.state.errorFile.length + "/" + this.state.totalFile.length}) </div>}>
                <Modal.Body className={this.state.errorTitle ? "error-files" : ""}>
                    <div style={{ position: "absolute", top: "-4px", right: "39px" }}>
                        {this.state.errorTitle ? ( <ExpandMoreIcon onClick={this.handleErrChange("Errpanel")} style={{ borderRadius: "35%", backgroundColor: "#a59f9f" }}/> ) : ( "" )}
                    </div>        
                    {this.state.errorFile.map((err,key) => (
                        <div id={key} key={key} style={{width:"200px", textAlign:"center", display: "inline-block", margin:"1px"}}>
                            <ExpansionPanel expanded={this.state.expanded === ('Errpanel'+key) || this.state.expanded === 'Errpanel' } onChange={this.handleErrChange('Errpanel'+key)}>
                            <ExpansionPanelSummary
                                expandIcon={<ExpandMoreIcon />}
                                aria-controls="panel1a-content"
                                id="panel1a-header"
                                style={{backgroundColor: "red"}}
                            >
                                <Typography>{err.match(/(.*)(\.usfm|\.sfm)(.*)/i)[1]+err.match(/(.*)(\.usfm|\.sfm)(.*)/i)[2]}</Typography>
                            </ExpansionPanelSummary>
                            <ExpansionPanelDetails>
                                <Typography>
                                {err.match(/(.*)(\.usfm|\.sfm)(.*)/i)[3]}
                                </Typography>
                            </ExpansionPanelDetails>
                            </ExpansionPanel>
                        </div>
                    ))}
                    {this.state.errorFile.length === 0 ? (<div style={{ textAlign: "center" }}><FormattedMessage id="tooltip-noerror-title" /> </div>) : ("")}
                </Modal.Body>
                </Tab>
            </Tabs>
            </div>
            <Modal.Footer />
            </Modal>
        );
    };
}

export default ImportReport;