import CircularProgress from 'material-ui/CircularProgress';
import FlatButton from "material-ui/FlatButton";
import Paper from "material-ui/Paper";
import ActionLock from "material-ui/svg-icons/action/lock";
import TextField from "material-ui/TextField";
import React from "react";
import Relay from "react-relay";
import {RelayContainer, RedirectComponent} from "babel-loader!relask";

import {BasePage} from "../common";


class LoginMutation extends Relay.Mutation {
    getMutation() {
        return Relay.QL`mutation { login }`;
    }

    getVariables() {
        return {
            login: this.props.login,
            password: this.props.password
        }
    }

    getFatQuery() {
        return Relay.QL`fragment on LoginMutationPayload {
            viewer {
                currentUser,
                isAuthenticated,
                contact
            },
            errors
        }`
    }

    getConfigs() {
        return [{
            type: 'FIELDS_CHANGE',
            fieldIDs: {
                viewer: this.props.viewer.id,
                errors: null
            }
        }];
    }

    static fragments = {
        viewer: () => Relay.QL`
            fragment on Viewer {
                id,
            }
        `
    };
}

@RelayContainer
export default class Login extends React.Component {
    static relay = {
        fragments: {
            viewer: () => Relay.QL`fragment on Viewer {
                isAuthenticated,
                ${BasePage.getFragment('viewer')},
                ${LoginMutation.getFragment('viewer')}
            }`
        }
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            submitting: false,
            errors: {}
        };
    }

    submitLogin() {
        this.setState({errors: {}, submitting: true});
        this.props.relay.commitUpdate(new LoginMutation({
            viewer: this.props.viewer,
            login: this.refs.login.getValue(),
            password: this.refs.password.getValue()
        }), {
            onSuccess: resp => {
                this.setState({submitting: false});
                let errors = JSON.parse(resp.login.errors);
                if (errors) {
                    this.setState({errors: errors});
                    this.refs[Object.keys(errors)[0]].select();
                }
            },
            onFailure: () => {
                this.setState({
                    errors: {password: 'Unknown error, please try again.'},
                    submitting: false});
            }
        });
    }

    render() {
        if (this.props.viewer.isAuthenticated) {
            if (this.props.location && this.props.location.query && this.props.location.query.next)
                return (
                    <RedirectComponent to={this.props.location.query.next}/>
                );
            else
                return (
                    <RedirectComponent to="/"/>
                );
        } else
            return (
                    <Paper
                        style={{
                            width: 384,
                            padding: 32,
                            margin: '0 auto',
                            textAlign: 'center'}} zDepth={5}>
                        <p>Please login:</p>
                        <TextField
                            ref="login"
                            floatingLabelText="Login"
                            fullWidth={true}
                            disabled={this.state.submitting}
                            errorText={this.state.errors.login}
                            onKeyDown={(event) => {
                                this.setState({errors: {}});
                                if (event.keyCode == 13) {
                                    this.refs.password.select();
                                }
                            }}/>
                        <TextField
                            ref="password"
                            floatingLabelText="Password"
                            type="password"
                            fullWidth={true}
                            disabled={this.state.submitting}
                            errorText={this.state.errors.password}
                            onKeyDown={(event) => {
                                if (event.keyCode == 13) {
                                    this.submitLogin();
                                } else {
                                    this.setState({errors: {}});
                                }
                            }}/>

                        <br/>
                        <br/>

                        <FlatButton
                            label="Submit"
                            primary={true}
                            disabled={this.state.submitting}
                            labelPosition="before"
                            icon={this.state.submitting ? (<CircularProgress size={0.3}/>) : (<ActionLock/>)}
                            onClick={this.submitLogin.bind(this)}/>
                    </Paper>
            )
    }
}
