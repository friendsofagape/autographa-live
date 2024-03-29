import React from "react";
import PropTypes from "prop-types";
import MuiMenu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { observer } from "mobx-react";
import SubMenuItem from "./SubMenuItem";
import AutographaStore from "./AutographaStore";

@observer
class CustomizedMenu extends React.Component {
  renderMenuItems = () => {
    const { menuItems } = this.props;
    return menuItems.map(menuItem => {
      if (menuItem.hasOwnProperty("subMenuItems")) {
        return (
          <SubMenuItem
            key={menuItem.key}
            caption={menuItem}
            menuItems={menuItem.subMenuItems}
          />
        );
      }

      return (
        <MenuItem key={menuItem.key} selected={AutographaStore.selectedTranslationhelpversion.toString() === menuItem.key} onClick={menuItem.onClick}>
          {menuItem.caption}
        </MenuItem>
      );
    });
  };

  render() {
    const { anchorElement, open, onClose, ...others } = this.props;
    return (
      <MuiMenu
        anchorEl={anchorElement}
        open={open}
        onClose={onClose}
        {...others}
      >
        {this.renderMenuItems()}
      </MuiMenu>
    );
  }
}

CustomizedMenu.propTypes = {
  open: PropTypes.bool.isRequired,
  menuItems: PropTypes.array.isRequired,
  anchorElement: PropTypes.any,
  onClose: PropTypes.func.isRequired
};

export default CustomizedMenu