import React from "react";
import PropTypes from "prop-types";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "./Menu";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import withStyles from "@material-ui/core/styles/withStyles";
import classNames from "classnames";
import AutographaStore from "./AutographaStore";

const styles = {
  subMenuItem: {
    display: "flex",
    justifyContent: "space-between"
  }
};

const SubMenuItem = ({ caption, menuItems, classes }) =>{
  const [anchorEl, setAnchorEl] = React.useState(null);
  
  const handleItemClick = (event) => {
		setAnchorEl(event.currentTarget);
	};

	const handleSubMenuClose = () => {
		setAnchorEl(null);
		AutographaStore.translationhelpsRefresh = false;
	};

  // @action
  // setAnchorElement = node => {
  //   this.anchorElement = node;
  // };

  // @action.bound
  // handleItemClick(event) {
  //   if (!this.anchorElement) {
  //     this.setAnchorElement(event.currentTarget);
  //   }
  //   this.menuOpen = !this.menuOpen;
  // }

  // @action.bound
  // handleSubMenuClose() {
  //   this.menuOpen = false;
  // }
    return (
      <React.Fragment>
        <MenuItem
          onClick={handleItemClick}
          selected={AutographaStore.selectedTranslationhelplang.toString() === caption.key}
          className={classNames(classes.subMenuItem)}
        >
          {caption.caption}
          <ArrowRightIcon />
        </MenuItem>
        <Menu
          open={anchorEl}
          menuItems={menuItems}
          anchorElement={anchorEl}
          onClose={handleSubMenuClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        />
      </React.Fragment>
    );
  }

SubMenuItem.propTypes = {
  caption: PropTypes.string.isRequired,
  menuItems: PropTypes.array.isRequired
};

export default withStyles(styles)(SubMenuItem);
