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
				<StyledMenu
					id='customized-menu'
					anchorEl={anchorEl}
					keepMounted
					open={Boolean(anchorEl)}
					onClose={handleClose}>
					<StyledMenuItem onClick={()=> {changeLanguage('en','ult')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='English' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('hi','udb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Hindi' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('bn','irv')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Bengali' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('ml','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Malayalam' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('gu','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Gujarati' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('or','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Oriya' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('ta','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Tamil' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('kn','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Kannada' />
					</StyledMenuItem>
					<StyledMenuItem onClick={()=> {changeLanguage('te','ulb')}}>
						<ListItemIcon>
							<BookIcon fontSize='small' />
						</ListItemIcon>
						<ListItemText primary='Telugu' />
					</StyledMenuItem>
				</StyledMenu>
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
