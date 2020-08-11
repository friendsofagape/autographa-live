import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import BookIcon from '@material-ui/icons/Book';
import { IconButton, Zoom, Tooltip, makeStyles } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import AutographaStore from './AutographaStore';
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import Menucustom from "./Menu";
import SubMenuItem from "./SubMenuItem";
import App from '../App';

const StyledMenu = withStyles({
	paper: {
		border: '1px solid #d3d4d5',
	},
})((props) => (
	<Menu
		elevation={0}
		getContentAnchorEl={null}
		anchorOrigin={{
			vertical: 'bottom',
			horizontal: 'top',
		}}
		transformOrigin={{
			vertical: 'top',
			horizontal: 'center',
		}}
		{...props}
	/>
));
const menuItems = [
	{
	  key: "1",
	  caption: "English",
	  subMenuItems: [
		  {
			key: "2",
			caption: "English ult",
			onClick: () => {}
		  },
		  {
			key: "3",
			caption: "English udb",
			onClick: () => {}
		  },
		]
	},
	{
		key: "4",
		caption: "Hindi",
		subMenuItems: [
			{
			  key: "5",
			  caption: "Hindi udb",
			  onClick: () => {}
			},
			{
			  key: "6",
			  caption: "Hindi irv",
			  onClick: () => {}
			},
		  ]
	  },
	  {
		key: "7",
		caption: "Bengali",
		subMenuItems: [
			{
			  key: "8",
			  caption: "Bengali irv",
			  onClick: () => {}
			},
			{
			  key: "9",
			  caption: "Bengali udb",
			  onClick: () => {}
			},
		  ]
	  },
	  {
		key: "10",
		caption: "Malayalam",
		subMenuItems: [
			{
			  key: "11",
			  caption: "Malayalam ult",
			  onClick: () => {}
			},
			{
			  key: "12",
			  caption: "Malayalam udb",
			  onClick: () => {}
			},
		  ]
	  },
	  {
		key: "13",
		caption: "Gujarati",
		subMenuItems: [
			{
			  key: "14",
			  caption: "Gujarati irv",
			  onClick: () => {}
			},
			{
			  key: "3",
			  caption: "Gujarati udb",
			  onClick: () => {}
			},
		  ]
	  },
	  {
		key: "1",
		caption: "Oriya",
		subMenuItems: [
			{
			  key: "2",
			  caption: "Oriya irv",
			  onClick: () => {}
			},
			{
			  key: "3",
			  caption: "Oriya udb",
			  onClick: () => {}
			},
		  ]
	  },
	  {
		key: "1",
		caption: "Tamil",
		onClick: () => {},
	  },
	  {
		key: "1",
		caption: "Kannada",
		subMenuItems: [
			{
			  key: "2",
			  caption: "Kannada irv",
			  onClick: () => {}
			},
			{
			  key: "3",
			  caption: "Kannada udb",
			  onClick: () => {}
			},
		  ]
	  },
  ];
const StyledMenuItem = withStyles((theme) => ({
	root: {
		'&:focus': {
			backgroundColor: theme.palette.primary.main,
			'& .MuiListItemIcon-root, & .MuiListItemText-primary': {
				color: theme.palette.common.white,
			},
		},
	},
}))(MenuItem);

const useStylesBootstrap = makeStyles((theme) => ({
	tooltip: {
		backgroundColor: theme.palette.common.black,
	},
}));

function BootstrapTooltip(props) {
	const bootsrapclasses = useStylesBootstrap();

	return <Tooltip classes={bootsrapclasses} {...props} />;
}

const language = [
	{"id": 0 , "name": "English-ULT", "languageId": "en", "resourceId": "ult"}, 
	{"id": 1 , "name": "Hindi-UDB", "languageId": "hi", "resourceId": "irv"}, 
	{"id": 2 , "name": "Bengali-IRV", "languageId": "bn", "resourceId": "irv"}, 
	{"id": 3 , "name": "Malayalam-IRV", "languageId": "ml", "resourceId": "irv"}, 
	{"id": 4 , "name": "Gujarati", "languageId": "gu", "resourceId": "ulb"}, 
	{"id": 5 , "name": "Oriya", "languageId": "or", "resourceId": "ulb"}, 
	{"id": 6 , "name": "Tamil", "languageId": "ta", "resourceId": "ulb"}, 
	{"id": 7 , "name": "Kannada", "languageId": "kn", "resourceId": "ulb"}, 
	{"id": 8 , "name": "Telugu", "languageId": "te", "resourceId": "ulb"}
]

export default function TranslationHelpsMenu() {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
		AutographaStore.translationhelpsRefresh = false;
	};
	const changeLanguage= (lang, resource) => {
		AutographaStore.translationHelplanguageId = lang;
		AutographaStore.translationHelpresourceId = resource;
		AutographaStore.translationhelpsRefresh = true;
		let interval;
		interval = setInterval(
			() => (AutographaStore.translationhelpsRefresh = false),
			1000,
		);
		return () => clearInterval(interval);
	};
	// const changeLanguageToEng = () => {
	// 	AutographaStore.translationHelplanguageId = 'en';
	// 	AutographaStore.translationHelpresourceId = 'ult';
	// 	AutographaStore.translationhelpsRefresh = true;
	// 	let interval;
	// 	interval = setInterval(
	// 		() => (AutographaStore.translationhelpsRefresh = false),
	// 		1000,
	// 	);
	// 	return () => clearInterval(interval);
	// };

	return (
		<React.Fragment>
			<span>
				<BootstrapTooltip
					title={
						<span style={{ fontSize: '10px' }}>
							<FormattedMessage id='tooltip-change-translationhelpslanguage'>
								{(message) => message}
							</FormattedMessage>
						</span>
					}
					TransitionComponent={Zoom}>
					<span>
						<IconButton
							disabled={AutographaStore.toggle}
							aria-controls='customized-menu'
							aria-haspopup='true'
							variant='contained'
							color='inherit'
							style={{ transform: 'rotateX(180deg)' }}
							onClick={handleClick}>
							<ArrowDropDownCircleIcon />
						</IconButton>
					</span>
				</BootstrapTooltip>
				{/* <StyledMenu
					id='customized-menu'
					anchorEl={anchorEl}
					keepMounted
					open={Boolean(anchorEl)}
					onClose={handleClose}>
					{language.map((value, index) => {
						return (
							<StyledMenuItem onClick={()=> {changeLanguage(value.languageId,value.resourceId)}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary={value.name} />
					</StyledMenuItem>
						)
					})}
				</StyledMenu> */}
				<Menucustom
        		  open={Boolean(anchorEl)}
        		  menuItems={menuItems}
        		  anchorElement={anchorEl}
        		  onClose={handleClose}
        		/>
			</span>
			{/* {refresh === false && (
                <App
				onLanguagechange={AutographaStore.translationHelplanguageId}
				onResourceChange={AutographaStore.translationHelpresourceId}
				book={AutographaStore.bookId.toString()}
				chapter={AutographaStore.chapterId.toString()}
				onChangeBook={onChangeBook}
				onChangeChapter={onChangeChapter}
			/>
            )} */}
		</React.Fragment>
	);
}
