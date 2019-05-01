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
                                    base08: '#EF3D59',
                                    base09: '#E17A47',
                                    base0A: '#EFC958',
                                    base0B: '#EF3D59',
                                    base0C: '#4AB19D',
                                    base0D: '#4AB19D',
                                    base0E: '#EF3D59',
                                    base0F: '#E17A47'
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
