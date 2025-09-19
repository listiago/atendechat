import React, { useState, useEffect, useRef } from "react";

import * as Yup from "yup";
import { Formik, FieldArray, Form, Field } from "formik";
import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteOutlineIcon from "@material-ui/icons/DeleteOutline";
import CircularProgress from "@material-ui/core/CircularProgress";
import Select from "@material-ui/core/Select";
import MenuItem from "@material-ui/core/MenuItem";
import FormControl from "@material-ui/core/FormControl";
import InputLabel from "@material-ui/core/InputLabel";

import { i18n } from "../../translate/i18n";

import api from "../../services/api";
import toastError from "../../errors/toastError";
import { Stack } from "@mui/material";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap"
  },
  textField: {
    marginRight: theme.spacing(1),
    flex: 1
  },

  extraAttr: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  },

  btnWrapper: {
    position: "relative"
  },

  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12
  }
}));

const FlowBuilderIntervalModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [timerValue, setTimerValue] = useState(0)
  const [timerUnit, setTimerUnit] = useState('seconds')
  const [activeModal, setActiveModal] = useState(false)

  useEffect(() => {
    if(open === 'edit'){
      // Parse existing data - if it's just a number, assume seconds
      if (data.data.sec) {
        if (typeof data.data.sec === 'string' && data.data.sec.includes(':')) {
          // Format: "value:unit"
          const [value, unit] = data.data.sec.split(':');
          setTimerValue(parseInt(value));
          setTimerUnit(unit);
        } else {
          // Legacy format - just seconds
          setTimerValue(parseInt(data.data.sec));
          setTimerUnit('seconds');
        }
      }
      setActiveModal(true)
    } else if(open === 'create'){
      setTimerValue(0)
      setTimerUnit('seconds')
      setActiveModal(true)
    }
    return () => {
      isMounted.current = false;
    };
  }, [open]);
  

  const handleClose = () => {
    close(null)
    setActiveModal(false)
  };

  const handleSaveContact = async values => {
    if(!timerValue || parseInt(timerValue) <= 0){
      return toast.error('Adicione o valor de intervalo')
    }

    // Validation based on unit
    const maxLimits = {
      seconds: 86400, // 24 hours in seconds
      minutes: 1440,  // 24 hours in minutes
      hours: 24,      // 24 hours
      days: 30        // 30 days max
    };

    if(parseInt(timerValue) > maxLimits[timerUnit]){
      return toast.error(`Máximo de tempo atingido: ${maxLimits[timerUnit]} ${timerUnit}`)
    }

    // Format the data as "value:unit"
    const formattedValue = `${timerValue}:${timerUnit}`;

    if(open === 'edit'){
      onUpdate({
        ...data,
        data: { sec: formattedValue }
      });
    } else if(open === 'create'){
      onSave({
        sec: formattedValue
      })
    }
    handleClose()

  };

  return (
    <div className={classes.root}>
      <Dialog open={activeModal} onClose={handleClose} fullWidth="md" scroll="paper">
        <DialogTitle id="form-dialog-title">
          {open === 'create' ? `Adicionar um intervalo ao fluxo`: `Editar intervalo`}
        </DialogTitle>        
            <Stack>
              <DialogContent dividers>
                <Stack direction="row" spacing={2} style={{ width: "100%" }}>
                  <TextField
                    label={'Valor do tempo'}
                    name="timerValue"
                    type="number"
                    value={timerValue}
                    onChange={(e) => setTimerValue(e.target.value)}
                    autoFocus
                    variant="outlined"
                    InputProps={{ inputProps: { min: 0 } }}
                    margin="dense"
                    className={classes.textField}
                    style={{ flex: 2 }}
                  />
                  <FormControl variant="outlined" margin="dense" style={{ flex: 1 }}>
                    <InputLabel>Unidade</InputLabel>
                    <Select
                      value={timerUnit}
                      onChange={(e) => setTimerUnit(e.target.value)}
                      label="Unidade"
                    >
                      <MenuItem value="seconds">Segundos</MenuItem>
                      <MenuItem value="minutes">Minutos</MenuItem>
                      <MenuItem value="hours">Horas</MenuItem>
                      <MenuItem value="days">Dias</MenuItem>
                    </Select>
                  </FormControl>
                </Stack>
              </DialogContent>
              <DialogActions>
                <Button
                  onClick={handleClose}
                  color="secondary"
                  variant="outlined"
                >
                  {i18n.t("contactModal.buttons.cancel")}
                </Button>
                <Button
                  type="submit"
                  color="primary"
                  variant="contained"
                  className={classes.btnWrapper}
                  onClick={() => handleSaveContact()}
                >
                  {open === 'create' ? `Adicionar` : 'Editar'}                  
                </Button>
              </DialogActions>
            </Stack>
      </Dialog>
    </div>
  );
};

export default FlowBuilderIntervalModal;
