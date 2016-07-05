import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import React from "react";
import ReactDOM from "react-dom";
import {Route, IndexRoute, Link} from "react-router";
import Relay from "react-relay";
import injectTapEventPlugin from 'react-tap-event-plugin';
import {Relask, RedirectComponent} from "babel-loader!relask";
import "style!css!normalize.css/normalize.css";
import "style!css!./4008.css";
import Index from "./pages/Index";
import Login from "./pages/Login";
import Contact from "./pages/Contact";


injectTapEventPlugin();

const props = {
    queries: {viewer: () => Relay.QL` query { viewer }`},
    render: ({done, element, error, events, props, retry, routerProps, stale}) => {
        if (error) {
            for (let e of error.source.errors) {
                if (e.message == '401: Unauthorized') {
                    return <RedirectComponent to={'/login?next=' + routerProps.location.pathname}/>;
                } else if (e.message == '403: Forbidden') {
                    return (
                        <div>
                            <h1>Forbidden</h1>
                            <p>Access denied.</p>
                        </div>
                    );
                }
            }
        } else if (props) {
            return React.cloneElement(element, props);
        } else {
            return (<div>Loading</div>);
        }
    }
};

ReactDOM.render((
    <MuiThemeProvider>
        <Relask>
            <Route path="/">
                <IndexRoute {...props} component={Index}/>
                <Route {...props} path="/login" component={Login}/>
                <Route {...props} path="/contact" component={Contact}/>
            </Route>
        </Relask>
    </MuiThemeProvider>
), document.getElementById('app'));
