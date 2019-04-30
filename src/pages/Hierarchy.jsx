import React, { Component } from 'react';
import { ThemeProvider } from '@rmwc/theme';
import { Typography } from '@rmwc/typography';
import Hierarchy from '../containers/Hierarchy';
import UpdateButton from '../containers/UpdateButton';

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
                            About
                        </Typography>
                        <Typography use="body1" tag="p">
                            About text
                        </Typography>
                        <UpdateButton />
                    </section>
                    <section className="section">
                        <Hierarchy />
                    </section>
                </div>
            </ThemeProvider>
        );
    }
}
