import React from "react";
import PropTypes from "prop-types";
import MenuItem from "@material-ui/core/MenuItem";
import Menu from "./Menu";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import ArrowRightIcon from "@material-ui/icons/KeyboardArrowRight";
import withStyles from "@material-ui/core/styles/withStyles";
import classNames from "classnames";

const styles = {
  subMenuItem: {
    display: "flex",
    justifyContent: "space-between"
  }
};

@observer
class SubMenuItem extends React.Component {
  @observable menuOpen = false;
  @observable anchorElement = null;

  @action
  setAnchorElement = node => {
    this.anchorElement = node;
  };

  @action.bound
  handleItemClick(event) {
    if (!this.anchorElement) {
      this.setAnchorElement(event.currentTarget);
    }
    this.menuOpen = !this.menuOpen;
  }

  @action.bound
  handleSubMenuClose() {
    this.menuOpen = false;
  }

  render() {
    const { caption, menuItems, classes } = this.props;
    return (
      <React.Fragment>
        <MenuItem
          onClick={this.handleItemClick}
          className={classNames(classes.subMenuItem)}
        >
          {caption}
          <ArrowRightIcon />
        </MenuItem>
        <Menu
          open={this.menuOpen}
          menuItems={menuItems}
          anchorElement={this.anchorElement}
          onClose={this.handleSubMenuClose}
          anchorOrigin={{ vertical: "top", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "left" }}
        />
      </React.Fragment>
    );
  }
}

SubMenuItem.propTypes = {
  caption: PropTypes.string.isRequired,
  menuItems: PropTypes.array.isRequired
};

export default withStyles(styles)(SubMenuItem);
