import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Button } from '@rmwc/button';

import actions from '../redux/actions';

class DataGenerator extends Component {
    static propTypes = {
        getDataAction: PropTypes.func.isRequired
    };

    render() {
        const { getDataAction } = this.props;

        return (
            <Button raised onClick={() => getDataAction()}>
                Generate
            </Button>
        );
    }
}

const mapDispatchToProps = dispatch => ({
    getDataAction: () => dispatch(actions.getData())
});

export default connect(
    null,
    mapDispatchToProps
)(DataGenerator);
