import React from 'react';
import ReactDOM from 'react-dom';
import { dialog, remote } from 'electron';
import { observer } from "mobx-react"
import AutographaStore from "./AutographaStore"
const { Modal, Button, Col, Tabs, Tab } = require('react-bootstrap/lib');
const Constant = require("../util/constants");
const refDb = require(`${__dirname}/../util/data-provider`).referenceDb();
const session = require('electron').remote.session;
const i18n = new(require('../translations/i18n'));
const db = require(`${__dirname}/../util/data-provider`).targetDb();
import Statistic  from '../components/Statistic';
import { FormattedMessage } from 'react-intl';
import { Block, Value } from 'slate'
import Prism from 'prismjs';
import fs from 'fs';
import path from 'path';
import Plain from 'slate-plain-serializer'
import { Editor } from 'slate-react'


;Prism.languages.markdown=Prism.languages.extend("markup",{}),Prism.languages.insertBefore("markdown","prolog",{blockquote:{pattern:/^>(?:[\t ]*>)*/m,alias:"punctuation"},code:[{pattern:/^(?: {4}|\t).+/m,alias:"keyword"},{pattern:/``.+?``|`[^`\n]+`/,alias:"keyword"}],title:[{pattern:/\w+.*(?:\r?\n|\r)(?:==+|--+)/,alias:"important",inside:{punctuation:/==+$|--+$/}},{pattern:/(^\s*)#+.+/m,lookbehind:!0,alias:"important",inside:{punctuation:/^#+|#+$/}}],hr:{pattern:/(^\s*)([*-])([\t ]*\2){2,}(?=\s*$)/m,lookbehind:!0,alias:"punctuation"},list:{pattern:/(^\s*)(?:[*+-]|\d+\.)(?=[\t ].)/m,lookbehind:!0,alias:"punctuation"},"url-reference":{pattern:/!?\[[^\]]+\]:[\t ]+(?:\S+|<(?:\\.|[^>\\])+>)(?:[\t ]+(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\)))?/,inside:{variable:{pattern:/^(!?\[)[^\]]+/,lookbehind:!0},string:/(?:"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|\((?:\\.|[^)\\])*\))$/,punctuation:/^[\[\]!:]|[<>]/},alias:"url"},bold:{pattern:/(^|[^\\])(\*\*|__)(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^\*\*|^__|\*\*$|__$/}},italic:{pattern:/(^|[^\\])([*_])(?:(?:\r?\n|\r)(?!\r?\n|\r)|.)+?\2/,lookbehind:!0,inside:{punctuation:/^[*_]|[*_]$/}},url:{pattern:/!?\[[^\]]+\](?:\([^\s)]+(?:[\t ]+"(?:\\.|[^"\\])*")?\)| ?\[[^\]\n]*\])/,inside:{variable:{pattern:/(!?\[)[^\]]+(?=\]$)/,lookbehind:!0},string:{pattern:/"(?:\\.|[^"\\])*"(?=\)$)/}}}}),Prism.languages.markdown.bold.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.italic.inside.url=Prism.util.clone(Prism.languages.markdown.url),Prism.languages.markdown.bold.inside.italic=Prism.util.clone(Prism.languages.markdown.italic),Prism.languages.markdown.italic.inside.bold=Prism.util.clone(Prism.languages.markdown.bold); // prettier-ignore

const schema = {
    document: {
      nodes: [
        {
          match: [{ type: 'paragraph' }, { type: 'image' }],
        },
      ],
    },
    blocks: {
      paragraph: {
        nodes: [
          {
            match: { object: 'text' },
          },
        ],
      },
      image: {
        isVoid: true,
        data: {
          src: v => v && isUrl(v),
        },
      },
    },
  }
  

const initialValue = Value.fromJSON({
    "document": {
        
      "nodes": [
        {
          "object": "block",
          "type": "paragraph",
          "nodes": [
            {
              "object": "text",
              "leaves": [
                {
                  "text":
                    "The editor gives you full control over the logic you can add. For example, it's fairly common to want to add markdown-like shortcuts to editors. So that, when you start a line with \"> \" you get a blockquote that looks like this:"
                }
              ]
            }
          ]
        },
        {
          "object": "block",
          "type": "block-quote",
          "nodes": [
            {
              "object": "text",
              "leaves": [
                {
                  "text": "A wise quote."
                }
              ]
            }
          ]
        },
        {
          "object": "block",
          "type": "paragraph",
          "nodes": [
            {
              "object": "text",
              "leaves": [
                {
                  "text":
                    "Order when you start a line with \"## \" you get a level-two heading, like this:"
                }
              ]
            }
          ]
        },
        {
          "object": "block",
          "type": "heading-two",
          "nodes": [
            {
              "object": "text",
              "leaves": [
                {
                  "text": "Try it out!"
                }
              ]
            }
          ]
        },
        {
          "object": "block",
          "type": "paragraph",
          "nodes": [
            {
              "object": "text",
              "leaves": [
                {
                  "text":
                    "Try it out for yourself! Try starting a new line with \">\", \"-\", or \"#\"s."
                }
              ]
            }
          ]
        },
        
      ]
    }
  });




@observer
class TranslationPanel extends React.Component {
	constructor(props){
    	super(props);
   		i18n.isRtl().then((res) => {
      		if(res) AutographaStore.scriptDirection = "rtl"
    	});
        this.timeout =  0;
        this.state = {
            value: initialValue
        }
		   
    }
    componentDidMount(){
        let data = ""
        let that = this;
        fs.readFile(path.resolve(__dirname, 'sample.md'), 'utf8',  function (err,data) {
            if(err) {
                console.log(err)
                return
            }
            that.setState({value: Plain.deserialize(data)})
        })
    }
      

  	highlightRef(vId, refId, obj) {
		{/*var content = ReactDOM.findDOMNode(this);
		let verses = content.getElementsByClassName("verse-input")[0].querySelectorAll("span[id^=v]");
		var refContent = document.getElementsByClassName('ref-contents');
		for (var a=0; a< refContent.length; a++) {
		var refContent2 = refContent[a];
		for (var i = 0; i < AutographaStore.verses.length; i++) {
			var refDiv = refContent2.querySelectorAll('div[data-verse^='+'"'+"r"+(i+1)+'"'+']');
			if (refDiv != 'undefined') {
			refDiv[0].style="background-color:none;font-weight:none;padding-left:10px;padding-right:10px";
			}            
		};
		let chunk = document.getElementById(obj).getAttribute("data-chunk-group");
		if (chunk) {
			refContent2.querySelectorAll('div[data-verse^="r"]').style="background-color: '';font-weight: '';padding-left:10px;padding-right:10px";
			var limits = chunk.split("-").map(function(element) { return parseInt(element, 10) - 1; });
			for(var j=limits[0]; j<=limits[1];j++){
			refContent2.querySelectorAll("div[data-verse=r"+(j+1)+"]")[0].style = "background-color: rgba(11, 130, 255, 0.1);padding-left:10px;padding-right:10px;margin-right:10px";
			}
			$('div[data-verse="r' + (limits[0] + 1) + '"]').css({ "border-radius": "10px 10px 0px 0px" });
			$('div[data-verse="r' + (limits[1] + 1) + '"]').css({ "border-radius": "0px 0px 10px 10px" });
		}
		}*/}
      	let refContent = document.getElementsByClassName('ref-contents');
      	for(let l=0; l<AutographaStore.layout; l++){
        	let ref = refContent[l] ? refContent[l].querySelectorAll('div[data-verse^="r"]') : [];
        	for (let i=0; i < ref.length; i++) {
          		if (ref[i] != 'undefined') {
            		ref[i].style="background-color:none;font-weight:none;padding-left:10px;padding-right:10px";
          		}
        	};
        	if( refContent[l])
          		refContent[l].querySelectorAll('div[data-verse^='+'"'+"r"+(refId+1)+'"'+']')[0].style = "background-color: rgba(11, 130, 255, 0.1);padding-left:10px;padding-right:10px;border-radius: 10px";
      	}
  	}

	handleKeyUp =(e)=> {
		if(this.timeout) clearTimeout(this.timeout);
			this.timeout = setTimeout(() => {
				if(!AutographaStore.setDiff){
					this.props.onSave();
				}
			}, 3000);
	}
  	openStatPopup =() => {
        this.showReport();
        AutographaStore.showModalStat = true
    }
    showReport = () => {
        let emptyChapter = [];
        let incompleteVerseChapter = {};
        let multipleSpacesChapter = {};     
        db.get(AutographaStore.bookId.toString()).then((doc) =>{
            doc.chapters.forEach((chapter) => {
                let emptyVerse = [];
                let verseLength = chapter.verses.length;
                let incompleteVerse = [];
                let multipleSpaces = [];
                for(let i=0; i < verseLength; i++){
                    let verseObj = chapter.verses[i];
                    let checkSpace = verseObj["verse"].match(/\s\s+/g, ' ');
                    if(verseObj["verse"].length == 0){
                        emptyVerse.push(i);
                    }
                    else if(verseObj["verse"].length > 0 && verseObj["verse"].trim().split(" ").length === 1){
                        incompleteVerse.push(verseObj["verse_number"])
                    }
                    else if(checkSpace != null && checkSpace.length > 0) {
                        multipleSpaces.push(verseObj["verse_number"])
                    }
                }
                if(incompleteVerse.length > 0){
                    incompleteVerseChapter[chapter["chapter"]] = incompleteVerse;
                }
                if(multipleSpaces.length > 0){
                    multipleSpacesChapter[chapter["chapter"]] = multipleSpaces;
                }
                if(emptyVerse.length === verseLength){
                    emptyChapter.push(chapter["chapter"])
                }
            })
            AutographaStore.emptyChapter = emptyChapter;
            AutographaStore.incompleteVerse = incompleteVerseChapter;
            AutographaStore.multipleSpaces = multipleSpacesChapter;      
        })  
	}
	onChange = ({ value }) => {
		this.setState({ value })
	}
    
    getType = chars => {
        switch (chars) {
          case '*':
          case '-':
          case '+':
            return 'list-item'
          case '>':
            return 'block-quote'
          case '#':
            return 'heading-one'
          case '##':
            return 'heading-two'
          case '###':
            return 'heading-three'
          case '####':
            return 'heading-four'
          case '#####':
            return 'heading-five'
          case '######':
            return 'heading-six'
          default:
            return null
        }
    }
    
  
  	render (){
		
    	{/*let verseGroup = [];
    	const toggle = AutographaStore.toggle;

		for (let i = 0; i < AutographaStore.chunkGroup.length; i++) {
		let vid="v"+(i+1);
		verseGroup.push(<div key={i} id={`versediv${i+1}`} onClick={this.highlightRef.bind(this, vid, i)}>
			<span className='verse-num' key={i}>{(i+1)}</span>
			<span contentEditable={true} suppressContentEditableWarning={true} id={vid} data-chunk-group={AutographaStore.chunkGroup[i]} onKeyUp={this.handleKeyUp}>
			{AutographaStore.translationContent[i]}
			</span>
			</div>
		); 
		}
		const {tIns, tDel} = this.props;
		return (
			<div className="col-editor container-fluid">
				<div className="row">
				<div className="col-12 center-align">
					<p className="translation"><a href="javscript:;" style = {{fontWeight: "bold", pointerEvents: toggle ? "none" : "" }} onClick={() => this.openStatPopup()}><FormattedMessage id="label-translation" /></a></p>
				</div>
				</div>
				<div className="row">
				{tIns || tDel ? <div style={{textAlign: "center"}}><span style={{color: '#27b97e', fontWeight: 'bold'}}>(+) <span id="tIns">{tIns}</span></span> | <span style={{color: '#f50808', fontWeight: 'bold'}}> (-) <span id="tDel">{tDel}</span></span></div> : "" }
				<div id="input-verses" className={`col-12 col-ref verse-input ${AutographaStore.scriptDirection.toLowerCase()} ${tIns || tDel ? 'disable-input' : ''}`} dir={AutographaStore.scriptDirection} style={{pointerEvents: tIns || tDel ? 'none': ''}}>{verseGroup}</div>
				</div>
				<Statistic show={AutographaStore.showModalStat}  showReport = {this.showReport}/>
			</div>
        ) */}
        return (
            <Editor
        placeholder="Write some markdown..."
        value={this.state.value}
        renderMark={this.renderMark}
        decorateNode={this.decorateNode}
        onKeyDown={this.onKeyDown}
        onChange = {this.onChange}
        readOnly = {true}
      />
          )

    }
    renderNode = (props, editor, next) => {
        const { attributes, children, node } = props
        switch (node.type) {
          case 'block-quote':
            return <blockquote {...attributes}>{children}</blockquote>
          case 'bulleted-list':
            return <ul {...attributes}>{children}</ul>
          case 'heading-one':
            return <h1 {...attributes}>{children}</h1>
          case 'heading-two':
            return <h2 {...attributes}>{children}</h2>
          case 'heading-three':
            return <h3 {...attributes}>{children}</h3>
          case 'heading-four':
            return <h4 {...attributes}>{children}</h4>
          case 'heading-five':
            return <h5 {...attributes}>{children}</h5>
          case 'heading-six':
            return <h6 {...attributes}>{children}</h6>
          case 'list-item':
            return <li {...attributes}>{children}</li>
          default:
            return next()
        }
      }
    
      /**
       * On key down, check for our specific key shortcuts.
       *
       * @param {Event} event
       * @param {Editor} editor
       * @param {Function} next
       */
    
      onKeyDown = (event, editor, next) => {
        switch (event.key) {
          case ' ':
            return this.onSpace(event, editor, next)
          case 'Backspace':
            return this.onBackspace(event, editor, next)
          case 'Enter':
            return this.onEnter(event, editor, next)
          default:
            return next()
        }
      }
    
      /**
       * On space, if it was after an auto-markdown shortcut, convert the current
       * node into the shortcut's corresponding type.
       *
       * @param {Event} event
       * @param {Editor} editor
       * @param {Function} next
       */
    
      onSpace = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        if (selection.isExpanded) return next()
    
        const { startBlock } = value
        const { start } = selection
        const chars = startBlock.text.slice(0, start.offset).replace(/\s*/g, '')
        const type = this.getType(chars)
        if (!type) return next()
        if (type == 'list-item' && startBlock.type == 'list-item') return next()
        event.preventDefault()
    
        editor.setBlocks(type)
    
        if (type == 'list-item') {
          editor.wrapBlock('bulleted-list')
        }
    
        editor.moveFocusToStartOfNode(startBlock).delete()
      }
    
      /**
       * On backspace, if at the start of a non-paragraph, convert it back into a
       * paragraph node.
       *
       * @param {Event} event
       * @param {Editor} editor
       * @param {Function} next
       */
    
      onBackspace = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        if (selection.isExpanded) return next()
        if (selection.start.offset != 0) return next()
    
        const { startBlock } = value
        if (startBlock.type == 'paragraph') return next()
    
        event.preventDefault()
        editor.setBlocks('paragraph')
    
        if (startBlock.type == 'list-item') {
          editor.unwrapBlock('bulleted-list')
        }
      }
    
      /**
       * On return, if at the end of a node type that should not be extended,
       * create a new paragraph below it.
       *
       * @param {Event} event
       * @param {Editor} editor
       * @param {Function} next
       */
    
      onEnter = (event, editor, next) => {
        const { value } = editor
        const { selection } = value
        const { start, end, isExpanded } = selection
        if (isExpanded) return next()
    
        const { startBlock } = value
        if (start.offset == 0 && startBlock.text.length == 0)
          return this.onBackspace(event, editor, next)
        if (end.offset != startBlock.text.length) return next()
    
        if (
          startBlock.type != 'heading-one' &&
          startBlock.type != 'heading-two' &&
          startBlock.type != 'heading-three' &&
          startBlock.type != 'heading-four' &&
          startBlock.type != 'heading-five' &&
          startBlock.type != 'heading-six' &&
          startBlock.type != 'block-quote'
        ) {
          return next()
        }
    
        event.preventDefault()
        editor.splitBlock().setBlocks('paragraph')
    }
    
    countHash = (word) => {
        let newWord ='';
        let count = 0;
        for(let i=0; i < word.length; i++){
            if(word.charAt(i) === '#'){
                count++;
                continue;
            }else if(word.charAt(i) === ' '){
                break;
            }
        }
        return count;
    }
    getHeadText = (string, attributes) => {
        let headString = string.substr(this.countHash(string)+1)
        switch(this.countHash(string)){
            case 1:{
                return <h1 {...attributes}>{headString}</h1>
            }
            case 2:{
                return <h2 {...attributes}>{headString}</h2>
            }
            case 3:{
                return <h3 {...attributes}>{headString}</h3>
            }
            case 4:{
                return <h4 {...attributes}>{headString}</h4>
            }
            case 5:{
                return <h5 {...attributes}>{headString}</h5>
            }
            case 6:{
                return <h6 {...attributes}>{headString}</h6>
            }
        }
    }
    
    
    renderMark = (props, editor, next) => {
        const { children, mark, attributes } = props
        const { value } = editor;
        switch (mark.type) {
          case 'bold':
            if(children.props.children.startsWith("**")){
                return <strong {...attributes}>{children.props.children.match(/\*{2}(.*?)\*{2}/)[1]}</strong>
            }else if(children.props.children.startsWith("__")){
                return <strong {...attributes}>{children.props.children.match(/\_{2}(.*?)\_{2}/)[1]}</strong>
            }

          case 'code':
            return <code {...attributes}>{children}</code>
    
          case 'italic':
            if(children.props.children.startsWith("*")){
                return <em {...attributes}>{children.props.children.match(/\*{1}(.*?)\*{1}/)[1]}</em>
            }else if(children.props.children.startsWith("_")){
                return <em {...attributes}>{children.props.children.match(/\_{1}(.*?)\_{1}/)[1]}</em>
            }
    
          case 'underlined':
            return <u {...attributes}>{children}</u>
          case 'strikethrough':
            return <strike {...{ attributes }}>{children}</strike>
          case 'url':
            if(children.props.children.charAt(0) === '!'){
                return (<div><img src={children.props.children.match(/\(([^)]+)\)/)[1]}></img></div>)
            }else{
                return <a {...attributes} href={children.props.children.match(/\(([^)]+)\)/)[1]}>{children.props.children.match(/\[(.*?)\]/)[1]}</a>
            }
          case 'title': {
              if(children.props.children.startsWith("#")){
                return this.getHeadText(children.props.children, attributes)
              }
            //   console.log(this.countHash(children.props.children))
            //   if(new RegExp(/^#(?!#)(.*)/).test(children.props.children)){
            //       return <h1 {...attributes}>{children}</h1>
            //   }
            //   if(new RegExp(/^#{2}(?!#)(.*)/).test(children.props.children)){
            //     return <h2 {...attributes}>{children}</h2>
            //   }
            // //   if(new RegExp(/^>{1}(?!>)(.*)/).test(children.props.children)){
            // //       console.log("check or not")
                
            // //   }

            return (
              <span
                {...attributes}
                style={{
                  fontWeight: 'bold',
                  fontSize: '20px',
                  margin: '20px 0 10px 0',
                  display: 'inline-block',
                }}
              >
                {children}
              </span>
            )
          }
    
          case 'punctuation': {
            return (
              <span {...attributes} style={{ opacity: 0.2 }}>
                {children}
              </span>
            )
          }
    
          case 'list': {
            return (
              <span
                {...attributes}
                style={{
                  paddingLeft: '10px',
                  lineHeight: '10px',
                  fontSize: '20px',
                }}
              >
                {children}
              </span>
            )
          }
    
          case 'hr': {
            return (
              <span
                {...attributes}
                style={{
                  borderBottom: '2px solid #000',
                  display: 'block',
                  opacity: 0.2,
                }}
              >
                {children.props.children.substr(3)}
              </span>
            )
          }
          case 'blockquote':{
            return <blockquote {...attributes}>{children.props.children.substr(1)}</blockquote>
          }
    
          default: {
            return next()
          }
        }
      }
    
      /**
       * On change.
       *
       * @param {Editor} editor
       */
    
      onChange = ({ value }) => {
        this.setState({ value })
      }
    
      /**
       * Define a decorator for markdown styles.
       *
       * @param {Node} node
       * @param {Function} next
       * @return {Array}
       */
    
      decorateNode(node, editor, next) {
        const others = next() || []
        if (node.object != 'block') return others
    
        const string = node.text
        const texts = node.getTexts().toArray()
        const grammar = Prism.languages.markdown
        const tokens = Prism.tokenize(string, grammar)
        const decorations = []
        let startText = texts.shift()
        let endText = startText
        let startOffset = 0
        let endOffset = 0
        let start = 0
    
        function getLength(token) {
          if (typeof token == 'string') {
            return token.length
          } else if (typeof token.content == 'string') {
            return token.content.length
          } else {
            return token.content.reduce((l, t) => l + getLength(t), 0)
          }
        }
    
        for (const token of tokens) {
          startText = endText
          startOffset = endOffset
    
          const length = getLength(token)
          const end = start + length
    
          let available = startText.text.length - startOffset
          let remaining = length
    
          endOffset = startOffset + remaining
    
          while (available < remaining) {
            endText = texts.shift()
            remaining = length - available
            available = endText.text.length
            endOffset = remaining
          }
    
          if (typeof token != 'string') {
            const dec = {
              anchor: {
                key: startText.key,
                offset: startOffset,
              },
              focus: {
                key: endText.key,
                offset: endOffset,
              },
              mark: {
                type: token.type,
              },
            }
            decorations.push(dec)
          }
    
          start = end
        }
    
        return [...others, ...decorations]
      }
      
}

module.exports = TranslationPanel;