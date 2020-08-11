import React from "react";
import PropTypes from "prop-types";
import MuiMenu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { observer } from "mobx-react";
import SubMenuItem from "./SubMenuItem";

@observer
class Menucustom extends React.Component {
  renderMenuItems = () => {
    const { menuItems } = this.props;
    return menuItems.map(menuItem => {
      if (menuItem.hasOwnProperty("subMenuItems")) {
        return (
          <SubMenuItem
            key={menuItem.key}
            caption={menuItem.caption}
            menuItems={menuItem.subMenuItems}
          />
        );
      }

      return (
        <MenuItem key={menuItem.key} onClick={menuItem.onClick}>
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

Menucustom.propTypes = {
  open: PropTypes.bool.isRequired,
  menuItems: PropTypes.array.isRequired,
  anchorElement: PropTypes.any,
  onClose: PropTypes.func.isRequired
};

export default Menucustom
/* Example of menuItems:
[
    {
        'key': 'item1',
        'caption': 'Item 1',
        'onClick': (event) => function () {
        }
    },
    {
        'key': 'item2',
        'caption': 'Item 2',
        'onClick': (event) => function () {
        }
    },
    {
        'key': 'item3',
        'caption': 'Item 3',
        'subMenuItems': [
            {
                'key': 'item1',
                'caption': 'Item 1',
                'onClick': (event) => function () {
                }
            },
            {
                'key': 'item2',
                'caption': 'Item 2',
                'onClick': (event) => function () {
                }
            }
        ]
    }
];
 */
