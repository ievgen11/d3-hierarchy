import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch } from '@rmwc/switch';
import { Typography } from '@rmwc/typography';
import { ThemeProvider } from '@rmwc/theme';

import selectors from '../redux/selectors';
import actions from '../redux/actions';

class ExpandedToggle extends Component {
    static propTypes = {
        toggleDataIsExpandedAction: PropTypes.func.isRequired,
        isExpanded: PropTypes.bool.isRequired
    };

    render() {
        const { toggleDataIsExpandedAction, isExpanded } = this.props;

        return (
            <ThemeProvider
                options={{
                    secondary: '#EF3D59'
                }}
            >
                <Switch
                    checked={isExpanded}
                    onChange={() => toggleDataIsExpandedAction()}
                    label={
                        <Typography
                            style={{ marginLeft: '12px' }}
                            use="subtitle1"
                            tag="span"
                        >
                            Expand when loaded
                        </Typography>
                    }
                />
            </ThemeProvider>
        );
    }
}

const mapStateToProps = state => ({
    isExpanded: selectors.getDataIsExpanded(state)
});

const mapDispatchToProps = dispatch => ({
    toggleDataIsExpandedAction: () => dispatch(actions.toggleDataIsExpanded())
});

export default connect(
    mapStateToProps,
    mapDispatchToProps
)(ExpandedToggle);
