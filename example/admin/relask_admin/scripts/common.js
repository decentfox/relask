import AppBar from 'material-ui/AppBar';
import Drawer from "material-ui/Drawer";
import MenuItem from "material-ui/MenuItem";
import ActionHome from "material-ui/svg-icons/action/home";
import ActionExitToApp from "material-ui/svg-icons/action/exit-to-app";
import CommunicationEmail from "material-ui/svg-icons/communication/email";
import SocialPeople from "material-ui/svg-icons/social/people";
import {ToolbarTitle} from 'material-ui/Toolbar';
import DropDownMenu from 'material-ui/DropDownMenu';
import React, {PropTypes} from "react";
import Relay from "react-relay";
import {Link, withRouter} from "react-router";
import {RelayContainer, logout, RedirectComponent} from "babel-loader!relask";


@RelayContainer
export let BasePage = withRouter(class extends React.Component {
    static relay = {
        fragments: {
            viewer: () => Relay.QL`fragment on Viewer {
                admin {
                    title,
                },
                website,
                contact { 
                    name 
                },
                currentUser {
                    name,
                    email
                },
                isAuthenticated
            }`
        }
    };

    static contextTypes = {
        muiTheme: PropTypes.object.isRequired
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            drawerOpen: true
        }
    }

    toggleDrawer() {
        this.setState({drawerOpen: !this.state.drawerOpen});
    }

    logout() {
        logout();
        location.reload();
    }

    render() {
        if (!this.props.viewer.isAuthenticated)
            return (<RedirectComponent to="/login"/>);
        let theme = this.context.muiTheme;
        let topRight = (
            <div>
                <ToolbarTitle
                    onClick={() => {location.href = this.props.viewer.website}}
                    style={{cursor: 'pointer'}}
                    text={this.props.viewer.website}/>
                <DropDownMenu value={1}>
                    <MenuItem value={1} primaryText={this.props.viewer.currentUser.name}/>
                    <MenuItem value={2} leftIcon={(<CommunicationEmail/>)}>{this.props.viewer.currentUser.email}</MenuItem>
                    <MenuItem value={3} onClick={this.logout.bind(this)} leftIcon={(<ActionExitToApp/>)}>Logout</MenuItem>
                </DropDownMenu>
            </div>
        );
        return (
            <div>
                <AppBar
                    title={this.props.viewer.admin.title}
                    onLeftIconButtonTouchTap={this.toggleDrawer.bind(this)}
                    iconElementRight={topRight}
                />
                <Drawer
                    containerStyle={{marginTop: theme.appBar.height}}
                    open={this.state.drawerOpen}
                >
                    <MenuItem
                        linkButton
                        containerElement={<Link to="/"/>}
                        leftIcon={<ActionHome/>}
                        primaryText="Home"/>
                    <MenuItem
                        linkButton
                        containerElement={<Link to="/users"/>}
                        leftIcon={<SocialPeople/>}
                        primaryText="Users"/>
                    <MenuItem
                        linkButton
                        containerElement={<Link to="/contact"/>}
                        leftIcon={<CommunicationEmail/>}
                        primaryText="Email"/>
                </Drawer>
                <div style={{
                        marginLeft: this.state.drawerOpen ? theme.drawer.width : 0,
                        padding: theme.spacing.desktopGutterMore
                }}>
                    {this.props.children}
                </div>
            </div>
        );
    }
});
