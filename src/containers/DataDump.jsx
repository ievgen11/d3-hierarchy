import React, { Component } from 'react';
import ReactJson from 'react-json-view';
import { Button } from '@rmwc/button';
import {
    Dialog,
    DialogContent,
    DialogActions,
    DialogButton
} from '@rmwc/dialog';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import selectors from '../redux/selectors';

class DataDump extends Component {
    static propTypes = {
        data: PropTypes.object
    };

    constructor(props) {
        super(props);

        this.state = {
            isOpen: false
        };
    }

    render() {
        const { data } = this.props;
        const { isOpen } = this.state;

        return (
            <>
                <Dialog
                    open={isOpen}
                    onClose={() => this.setState(() => ({ isOpen: false }))}
                >
                    <DialogContent>
                        {isOpen ? <ReactJson src={data.toJS()} /> : null}
                    </DialogContent>
                    <DialogActions>
                        <DialogButton action="close">Close</DialogButton>
                    </DialogActions>
                </Dialog>
                <Button onClick={() => this.setState(() => ({ isOpen: true }))}>Inspect Data</Button>
            </>
        );
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state)
});

export default connect(mapStateToProps)(DataDump);
