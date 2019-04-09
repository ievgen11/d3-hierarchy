import React, { Component } from 'react';
import Chart from '../containers/Chart';
import Selector from '../containers/Selector';

export default class Dashboard extends Component {
    render() {
        return (
            <div>
                <Selector/>
                <Chart />
            </div>
        );
    }
}
