import React, { Component } from 'react';
import JsonTree from 'react-json-tree';
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

import {
    SELECTED_COLOR,
    HOVER_COLOR,
    LEAF_COLOR,
    NODE_COLOR
} from '../constants/colors';

class DataInspector extends Component {
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
                    <DialogContent
                        style={{ width: '500px', maxHeight: '500px' }}
                    >
                        {isOpen ? (
                            <JsonTree
                                invertTheme
                                data={data.toJS()}
                                theme={{
                                    base00: '#000000',
                                    base01: '#303030',
                                    base02: '#505050',
                                    base03: '#b0b0b0',
                                    base04: '#d0d0d0',
                                    base05: '#e0e0e0',
                                    base06: '#f5f5f5',
                                    base07: '#ffffff',
                                    base08: LEAF_COLOR,
                                    base09: NODE_COLOR,
                                    base0A: SELECTED_COLOR,
                                    base0B: LEAF_COLOR,
                                    base0C: HOVER_COLOR,
                                    base0D: HOVER_COLOR,
                                    base0E: LEAF_COLOR,
                                    base0F: NODE_COLOR
                                }}
                            />
                        ) : null}
                    </DialogContent>
                    <DialogActions>
                        <DialogButton action="close">Close</DialogButton>
                    </DialogActions>
                </Dialog>
                <Button onClick={() => this.setState(() => ({ isOpen: true }))}>
                    Inspect Data
                </Button>
            </>
        );
    }
}

const mapStateToProps = state => ({
    data: selectors.getData(state)
});

export default connect(mapStateToProps)(DataInspector);
