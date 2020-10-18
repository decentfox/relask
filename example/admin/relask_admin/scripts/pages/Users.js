import React from "react";
import Relay from "react-relay";
import {
    Table,
    TableBody,
    TableHeader,
    TableHeaderColumn,
    TableRow,
    TableRowColumn
} from "material-ui/Table";
import {RelayContainer} from "babel-loader!relask";
import {BasePage} from "../common";


@RelayContainer
export default class Users extends React.Component {
    static columns = Relay.QL`
        fragment on User {
            login,
            password,
            name
        }`;

    static field = 'users';

    static get relay() {return {
        fragments: {
            viewer: () => Relay.QL`fragment on Viewer {
                admin {
                    users(first: 2) {
                        edges {
                            node {
                                id,
                                ${this.columns}
                            }
                        }
                    },
                },
                ${BasePage.getFragment('viewer')},
            }`
        }
    }};

    static columnLabels = {
        'login': 'Login',
        'name': 'Name'
    };

    constructor(props, context) {
        super(props, context);
    }

    mapColumns(mapper) {
        return this.constructor.columns.children.map(({fieldName, type}) => {
            if (type != 'ID') return mapper(fieldName);
        });
    }

    render() {
        return (
            <BasePage viewer={this.props.viewer}>
                <Table>
                    <TableHeader>
                        <TableRow>
                            {this.mapColumns(column => (
                                <TableHeaderColumn>
                                    {this.constructor.columnLabels[column] || column}
                                </TableHeaderColumn>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {this.props.viewer.admin.users.edges.map(({node: user}) => (
                                <TableRow>
                                    {this.mapColumns(column => (
                                        <TableRowColumn>
                                            {user[column]}
                                        </TableRowColumn>
                                    ))}
                                </TableRow>
                            )
                        )}
                    </TableBody>
                </Table>
            </BasePage>
        )
    }
}
