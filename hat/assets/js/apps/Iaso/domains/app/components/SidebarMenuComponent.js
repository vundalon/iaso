import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { FormattedMessage } from 'react-intl';

import ExitIcon from '@material-ui/icons/ExitToApp';
import {
    withStyles,
    Box,
    Button,
    IconButton,
    Drawer,
    List,
    Divider,
    Typography,
} from '@material-ui/core';

import ArrowForwardIcon from '@material-ui/icons/ArrowForward';
import PropTypes from 'prop-types';

import { toggleSidebarMenu } from '../../../redux/sidebarMenuReducer';
import { SIDEBAR_WIDTH } from '../../../constants/uiConstants';

import MenuItem from './MenuItemComponent';
import LogoSvg from './LogoSvgComponent';
import LanguageSwitch from './LanguageSwitchComponent';

import commonStyles from '../../../styles/common';

import menuItems from '../../../constants/menu';

import MESSAGES from './messages';

import { userHasPermission, userHasOneOfPermissions } from '../../users/utils';

const styles = theme => ({
    ...commonStyles(theme),
    logo: {
        height: 35,
        width: 90,
    },
    toolbar: {
        ...theme.mixins.toolbar,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingLeft: theme.spacing(3),
        paddingRight: theme.spacing(3),
        height: 90,
    },
    menuButton: {
        marginLeft: 'auto',
    },
    list: {
        width: SIDEBAR_WIDTH,
    },
    user: {
        marginTop: 'auto',
        marginBottom: theme.spacing(3),
        marginLeft: theme.spacing(3),
        marginRight: theme.spacing(3),
    },
    userName: {
        margin: theme.spacing(1),
    },
});

class SidebarMenu extends PureComponent {
    onClick() {
        const { toggleSidebar } = this.props;
        toggleSidebar();
    }

    render() {
        const {
            classes,
            isOpen,
            toggleSidebar,
            location,
            currentUser,
        } = this.props;
        return (
            <Drawer anchor="left" open={isOpen} onClose={toggleSidebar}>
                <div className={classes.toolbar}>
                    <LogoSvg className={classes.logo} />
                    <IconButton
                        className={classes.menuButton}
                        color="inherit"
                        aria-label="Menu"
                        onClick={toggleSidebar}
                    >
                        <ArrowForwardIcon />
                    </IconButton>
                </div>
                <Divider />
                <List className={classes.list}>
                    {menuItems.map(menuItem => {
                        if (
                            (menuItem.permission &&
                                userHasPermission(
                                    menuItem.permission,
                                    currentUser,
                                )) ||
                            (menuItem.subMenu &&
                                userHasOneOfPermissions(
                                    menuItem.subMenu.map(sm => sm.permission),
                                    currentUser,
                                ))
                        ) {
                            return (
                                <MenuItem
                                    location={location}
                                    key={menuItem.key}
                                    menuItem={menuItem}
                                    onClick={path => this.onClick(path)}
                                    currentUser={currentUser}
                                />
                            );
                        }
                        return null;
                    })}
                </List>
                <Box className={classes.user}>
                    <LanguageSwitch />
                    <Typography
                        variant="body2"
                        color="textSecondary"
                        className={classes.userName}
                    >
                        {currentUser.user_name}
                    </Typography>
                    <Button
                        size="small"
                        color="inherit"
                        href="/logout-iaso"
                        aria-label={<FormattedMessage {...MESSAGES.logout} />}
                    >
                        <ExitIcon className={classes.smallButtonIcon} />
                        <FormattedMessage {...MESSAGES.logout} />
                    </Button>
                </Box>
            </Drawer>
        );
    }
}

SidebarMenu.propTypes = {
    classes: PropTypes.object.isRequired,
    isOpen: PropTypes.bool.isRequired,
    toggleSidebar: PropTypes.func.isRequired,
    location: PropTypes.object.isRequired,
    currentUser: PropTypes.object.isRequired,
};

const MapStateToProps = state => ({
    isOpen: state.sidebar.isOpen,
    currentUser: state.users.current,
});

const MapDispatchToProps = dispatch => ({
    toggleSidebar: () => dispatch(toggleSidebarMenu()),
});

export default withStyles(styles)(
    connect(MapStateToProps, MapDispatchToProps)(SidebarMenu),
);
