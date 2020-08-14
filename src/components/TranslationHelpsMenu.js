import React from 'react';
import { withStyles } from '@material-ui/core/styles';
import Button from '@material-ui/core/Button';
import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import ArrowDropDownCircleIcon from '@material-ui/icons/ArrowDropDownCircle';
import { IconButton, Zoom, Tooltip, makeStyles } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import AutographaStore from './AutographaStore';
import Menucustom from "./Menu";

const useStylesBootstrap = makeStyles((theme) => ({
	tooltip: {
		backgroundColor: theme.palette.common.black,
	},
}));

function BootstrapTooltip(props) {
	const bootsrapclasses = useStylesBootstrap();

	return <Tooltip classes={bootsrapclasses} {...props} />;
}

export default function TranslationHelpsMenu() {
	const [anchorEl, setAnchorEl] = React.useState(null);
	const handleClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleClose = () => {
		setAnchorEl(null);
		AutographaStore.translationhelpsRefresh = false;
	};
	const changeLanguage= (lang, resource, version, langkey) => {
		AutographaStore.translationHelplanguageId = lang;
		AutographaStore.translationHelpresourceId = resource;
		AutographaStore.translationhelpsRefresh = true;
		AutographaStore.selectedTranslationhelpversion = version
		AutographaStore.selectedTranslationhelplang = langkey
		let interval;
		interval = setInterval(
			() => {
				(AutographaStore.translationhelpsRefresh = false)
			},
			1000,
		);
		setAnchorEl(null);
		return () => clearInterval(interval);
	};

	const menuitems = [
		{
		  key: "1",
		  caption: "English",
		  subMenuItems: [
			  {
				key: "2",
				caption: "English ult",
				onClick: () => {changeLanguage("en","ult",2,1)}
			  },
			  {
				key: "3",
				caption: "English udb",
				onClick: () => {changeLanguage("en","udb",3,1)}
			  },
			]
		},
		{
			key: "4",
			caption: "Hindi",
			subMenuItems: [
				{
				  key: "5",
				  caption: "Hindi ulb",
				  onClick: () => {changeLanguage("hi","ulb",5,4)}
				},
				{
				  key: "6",
				  caption: "Hindi irv",
				  onClick: () => {changeLanguage("hi","irv",6,4)}
				},
			  ]
		  },
		  {
			key: "7",
			caption: "Bengali",
			subMenuItems: [
				{
				  key: "8",
				  caption: "Bengali ulb",
				  onClick: () => {changeLanguage("bn","ulb",8,7)}
				},
				{
				  key: "9",
				  caption: "Bengali irv",
				  onClick: () => {changeLanguage("bn","irv",9,7)}
				},
			  ]
		  },
		  {
			key: "10",
			caption: "Malayalam",
			subMenuItems: [
				{
				  key: "11",
				  caption: "Malayalam ulb",
				  onClick: () => {changeLanguage("ml","ulb",11,10)}
				},
				{
				  key: "12",
				  caption: "Malayalam irv",
				  onClick: () => {changeLanguage("ml","irv",12,10)}
				},
			  ]
		  },
		  {
			key: "13",
			caption: "Gujarati",
			subMenuItems: [
				{
				  key: "14",
				  caption: "Gujarati ulb",
				  onClick: () => {changeLanguage("gu","ulb",14,13)}
				},
				{
				  key: "15",
				  caption: "Gujarati irv",
				  onClick: () => {changeLanguage("gu","irv",15,13)}
				},
			  ]
		  },
		  {
			key: "16",
			caption: "Oriya",
			subMenuItems: [
				{
				  key: "17",
				  caption: "Oriya ulb",
				  onClick: () => {changeLanguage("or","ulb",17,16)}
				},
				{
				  key: "18",
				  caption: "Oriya irv",
				  onClick: () => {changeLanguage("or","irv",18,16)}
				},
			  ]
		  },
		  {
			key: "19",
			caption: "Tamil",
			onClick: () => {changeLanguage("ta","irv",19,19)},
		  },
		  {
			key: "20",
			caption: "Kannada",
			subMenuItems: [
				{
				  key: "21",
				  caption: "Kannada ulb",
				  onClick: () => {changeLanguage("kn","ulb",21,20)}
				},
				{
				  key: "22",
				  caption: "Kannada irv",
				  onClick: () => {changeLanguage("kn","irv",22,20)}
				},
			  ]
		  },
		  {
			key: "24",
			caption: "Assamese",
			subMenuItems: [
				{
				  key: "25",
				  caption: "Assamese ulb",
				  onClick: () => {changeLanguage("as","ulb",25,24)}
				},
				{
				  key: "26",
				  caption: "Assamese irv",
				  onClick: () => {changeLanguage("as","irv",26,24)}
				},
			  ]
		  },
		  {
			key: "27",
			caption: "Punjabi",
			subMenuItems: [
				{
				  key: "28",
				  caption: "Punjabi ulb",
				  onClick: () => {changeLanguage("pa","ulb",28,27)}
				},
				{
				  key: "29",
				  caption: "Punjabi irv",
				  onClick: () => {changeLanguage("pa","irv",29,27)}
				},
			  ]
		  },
		  {
			key: "30",
			caption: "Marathi",
			subMenuItems: [
				{
				  key: "31",
				  caption: "Marathi ulb",
				  onClick: () => {changeLanguage("mr","ulb",31,30)}
				},
				{
				  key: "32",
				  caption: "Marathi irv",
				  onClick: () => {changeLanguage("mr","irv", 32,30)}
				},
			  ]
		  },
		//   {
		// 	key: "33",
		// 	caption: "Nagamese",
		// 	subMenuItems: [
		// 		{
		// 		  key: "34",
		// 		  caption: "Nagamese ulb",
		// 		  onClick: () => {changeLanguage("ng","ulb")}
		// 		},
		// 		{
		// 		  key: "35",
		// 		  caption: "Nagamese irv",
		// 		  onClick: () => {changeLanguage("ng","irv")}
		// 		},
		// 	  ]
		//   },
	  ];
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
				<Menucustom
        		  open={Boolean(anchorEl)}
        		  menuItems={menuitems}
        		  anchorElement={anchorEl}
        		  onClose={handleClose}
        		/>
			</span>
		</React.Fragment>
	);
}
