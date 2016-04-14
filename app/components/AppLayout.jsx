import React from 'react';

// COMPONENTS
import Menu from './Menu';
import MenuItem from './Menu/MenuItem';

function AppLayout(props) {
  return (
    <div>
      <Menu>
        <MenuItem to="/">Home</MenuItem>
        <MenuItem to="portfolio">Portfolio</MenuItem>
        <MenuItem to="blog">Blog</MenuItem>
      </Menu>
      {props.children}
    </div>
  );
}

AppLayout.propTypes = {
  children: React.PropTypes.node,
};

export default AppLayout;