
import React from 'react';
import Dialog from '@material-ui/core/Dialog';
import DialogContent from '@material-ui/core/DialogContent';
import DialogTitle from '@material-ui/core/DialogTitle';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import Badge from '@material-ui/core/Badge';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableRow from '@material-ui/core/TableRow';

const formatProperty = (property) => {
    if (property.startsWith("http://") || property.startsWith("https://")) {
        return <a href={property}>{property}</a>;
    }
    return property;
}

export const NeoGraphItemInspectModal = ({ open, handleClose, title, object, textAlign = "left" }) => {
    return (
        <div>
            <Dialog maxWidth={"lg"} open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
                <DialogTitle id="form-dialog-title">
                    {title}
                    <IconButton onClick={handleClose} style={{ padding: "3px", marginLeft: "20px", float: "right" }}>
                        <Badge badgeContent={""} >
                            <CloseIcon />
                        </Badge>
                    </IconButton>
                </DialogTitle>
                <DialogContent>
                    {object &&
                        <TableContainer>
                            <Table size="small">
                                <TableBody>
                                    {Object.keys(object).length == 0 ?
                                        <i>(No properties)</i> :
                                        Object.keys(object).map((key) => (
                                            <TableRow key={key}>
                                                <TableCell component="th" scope="row">
                                                    {key}
                                                </TableCell>
                                                <TableCell align={textAlign}>{formatProperty(object[key].toString())}</TableCell>
                                            </TableRow>
                                        ))}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    }
                </DialogContent>
            </Dialog>
        </div >
    );
}

export default (NeoGraphItemInspectModal);


