import React from "react";
import Relay from "react-relay";
import {RelayContainer} from "babel-loader!relask";
import {BasePage} from "../common";


@RelayContainer
export default class Contact extends React.Component {
    static relay = {
        fragments: {
            viewer: () => Relay.QL`fragment on Viewer {
                contact { email },
                ${BasePage.getFragment('viewer')},
            }`
        }
    };

    render() {
        return (
            <BasePage viewer={this.props.viewer}>
                <p>Contact Email: {this.props.viewer.contact.email}</p>
            </BasePage>
        );
    }
}
