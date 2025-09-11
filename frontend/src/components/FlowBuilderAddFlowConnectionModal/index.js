import React, { useState, useEffect, useRef } from "react";

import { toast } from "react-toastify";

import { makeStyles } from "@material-ui/core/styles";
import { green } from "@material-ui/core/colors";
import Button from "@material-ui/core/Button";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import CircularProgress from "@material-ui/core/CircularProgress";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box
} from "@material-ui/core";

import api from "../../services/api";
import toastError from "../../errors/toastError";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
  },
  btnWrapper: {
    position: "relative",
  },
  buttonProgress: {
    color: green[500],
    position: "absolute",
    top: "50%",
    left: "50%",
    marginTop: -12,
    marginLeft: -12,
  },
}));

const FlowBuilderAddFlowConnectionModal = ({
  open,
  onSave,
  data,
  onUpdate,
  close,
}) => {
  const classes = useStyles();
  const isMounted = useRef(true);

  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      fetchFlows();
      if (data && data.flowId) {
        setSelectedFlow(data.flowId);
      } else {
        setSelectedFlow("");
      }
    }
    return () => {
      isMounted.current = false;
    };
  }, [open, data]);

  const fetchFlows = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/flowbuilder");
      setFlows(data.flows || []);
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    close();
    setSelectedFlow("");
  };

  const handleSave = () => {
    if (!selectedFlow) {
      toast.error("Selecione um fluxo para conectar");
      return;
    }

    const selectedFlowData = flows.find(flow => flow.id === selectedFlow);
    if (!selectedFlowData) {
      toast.error("Fluxo selecionado não encontrado");
      return;
    }

    const flowData = {
      flowId: selectedFlow,
      flowName: selectedFlowData.name,
    };

    onSave(flowData);
    handleClose();
  };

  const handleUpdate = () => {
    if (!selectedFlow) {
      toast.error("Selecione um fluxo para conectar");
      return;
    }

    const selectedFlowData = flows.find(flow => flow.id === selectedFlow);
    if (!selectedFlowData) {
      toast.error("Fluxo selecionado não encontrado");
      return;
    }

    const updatedData = {
      ...data,
      flowId: selectedFlow,
      flowName: selectedFlowData.name,
    };

    onUpdate(updatedData);
    handleClose();
  };

  return (
    <div className={classes.root}>
      <Dialog open={open} onClose={handleClose} fullWidth="sm" scroll="paper">
        <DialogTitle id="form-dialog-title">
          Conectar a outro fluxo
        </DialogTitle>
        <DialogContent dividers>
          {loading ? (
            <Box display="flex" justifyContent="center" p={2}>
              <CircularProgress />
            </Box>
          ) : flows.length === 0 ? (
            <Typography variant="body1" color="textSecondary" align="center">
              Nenhum fluxo foi criado ainda.
            </Typography>
          ) : (
            <FormControl fullWidth variant="outlined" margin="dense">
              <InputLabel>Selecione um fluxo</InputLabel>
              <Select
                value={selectedFlow}
                onChange={(e) => setSelectedFlow(e.target.value)}
                label="Selecione um fluxo"
              >
                {flows.map((flow) => (
                  <MenuItem key={flow.id} value={flow.id}>
                    {flow.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleClose}
            color="secondary"
            disabled={saving}
            variant="outlined"
          >
            Cancelar
          </Button>
          <Button
            onClick={data ? handleUpdate : handleSave}
            color="primary"
            disabled={saving || flows.length === 0}
            variant="contained"
            className={classes.btnWrapper}
          >
            {data ? "Atualizar" : "Salvar"}
            {saving && (
              <CircularProgress
                size={24}
                className={classes.buttonProgress}
              />
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
};

export default FlowBuilderAddFlowConnectionModal;
