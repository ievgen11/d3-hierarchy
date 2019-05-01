import React, { Component } from 'react';
import { ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';

import Hierarchy from '../containers/Hierarchy';
import DataGenerator from '../containers/DataGenerator';
import DataInspector from '../containers/DataInspector';
import ExpandedToggle from '../containers/ExpandedToggle';

export default class extends Component {
    render() {
        return (
            <ThemeProvider
                options={{
                    primary: '#EF3D59',
                    secondary: 'rgba(255, 255, 255, 1)',
                    onSecondary: '#000'
                }}
            >
                <div className="page">
                    <section className="section">
                        <Typography use="headline4" tag="h1">
                            D3 Hierarchy
                        </Typography>
                        <Typography use="body1" tag="p">
                            An example of how <b>Redux + Immutable + Material + D3.js </b>
                            can work together to create a clean and robust
                            application
                        </Typography>
                    </section>
                    <section className="section">
                        <Hierarchy />
                    </section>
                    <section className="section">
                        <ExpandedToggle />
                    </section>
                    <section className="section">
                        <DataGenerator /> <DataInspector />
                    </section>
                </div>
            </ThemeProvider>
        );
    }
}
