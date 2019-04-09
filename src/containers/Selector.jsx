import React, { Component } from 'react';
import { withRouter } from 'react-router-dom';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import selectors from '../redux/selectors';

class Selector extends Component {
    static propTypes = {
        selectedValue: PropTypes.string
    };

    constructor(props) {
        super(props);

        this.state = {
            selectedValue: ''
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.selectedValue !== prevProps.selectedValue) {
            if (this.props.selectedValue === '') {
                return this.setState({ selectedValue: ''});
            }

            this.setState({ selectedValue: this.props.selectedValue})
        }
    }

    render() {
        const { setSelectedValue, resetSelectedValue } = this.props;
        const { selectedValue } = this.state;

        return (
            <div>
                <input
                    onChange={event =>
                        this.setState({ selectedValue: event.target.value })
                    }
                    value={selectedValue}
                />
                {this.props.selectedValue !== '' ? (
                    <button onClick={() => {
                        resetSelectedValue();
                        this.setState({ selectedValue: ''});
                    }}>
                        Clear
                    </button>
                ) : (
                    <button onClick={() => setSelectedValue(selectedValue)}>
                        Select
                    </button>
                )}
            </div>
        );
    }
}

const mapStateToProps = state => ({
    selectedValue: selectors.getSelectedValue(state)
});

const mapDispatchToProps = dispatch => ({
    setSelectedValue: value => dispatch(actions.setSelectedValue(value)),
    resetSelectedValue: () => dispatch(actions.resetSelectedValue())
});

const ConnectedSelector = withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps
    )(Selector)
);

export default ConnectedSelector;
