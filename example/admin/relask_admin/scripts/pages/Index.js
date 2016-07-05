import React from "react";
import Relay from "react-relay";
import {Link} from "react-router";
import {RelayContainer} from "babel-loader!relask";
import {BasePage} from "../common";


@RelayContainer
export default class Index extends React.Component {
    static relay = {
        fragments: {
            viewer: () => Relay.QL`fragment on Viewer {
                ${BasePage.getFragment('viewer')},
            }`
        }
    };

    render() {
        return (
            <BasePage viewer={this.props.viewer}>
                Hello, world!
            </BasePage>
        )
    }
}
