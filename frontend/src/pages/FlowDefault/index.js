import React, { useState, useEffect, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Paper,
  Grid,
  Button,
  Typography,
  Card,
  CardContent,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Box,
} from "@material-ui/core";
import { WhatsAppsContext } from "../../context/WhatsApp/WhatsAppsContext";
import { AuthContext } from "../../context/Auth/AuthContext";
import api from "../../services/api";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";

const useStyles = makeStyles((theme) => ({
  mainPaper: {
    flex: 1,
    padding: theme.spacing(2),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  card: {
    marginBottom: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 200,
    width: "100%",
  },
}));

const FlowDefault = () => {
  const classes = useStyles();
  const { whatsApps } = useContext(WhatsAppsContext);
  const { user } = useContext(AuthContext);

  const [selectedWhatsApp, setSelectedWhatsApp] = useState("");
  const [flows, setFlows] = useState([]);
  const [selectedFlow, setSelectedFlow] = useState("");
  const [currentFlowDefault, setCurrentFlowDefault] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchFlows = async () => {
      try {
        const { data } = await api.get("/flowbuilder");
        setFlows(data.flows);
      } catch (err) {
        toastError(err);
      }
    };
    fetchFlows();
  }, []);

  useEffect(() => {
    const fetchCurrentFlowDefault = async () => {
      try {
        const { data } = await api.get("/flowdefault");
        // data is an array of whatsapps with flowIdWelcome
        if (selectedWhatsApp) {
          const whatsappData = data.find(w => w.id === selectedWhatsApp);
          if (whatsappData) {
            setSelectedFlow(whatsappData.flowIdWelcome || "");
          }
        } else {
          // If no WhatsApp selected, find the first one with a flow configured
          const configuredWhatsapp = data.find(w => w.flowIdWelcome);
          if (configuredWhatsapp) {
            setSelectedWhatsApp(configuredWhatsapp.id);
            setSelectedFlow(configuredWhatsapp.flowIdWelcome || "");
          }
        }
      } catch (err) {
        toastError(err);
      }
    };
    fetchCurrentFlowDefault();
  }, [selectedWhatsApp]);

  const handleSave = async () => {
    if (!selectedWhatsApp || !selectedFlow) {
      toast.error("Selecione um WhatsApp e um fluxo");
      return;
    }
    setLoading(true);
    try {
      await api.put("/flowdefault", {
        whatsappId: selectedWhatsApp,
        flowIdWelcome: selectedFlow,
      });
      toast.success("Fluxo padrão salvo com sucesso");
      // Refresh the data
      const { data } = await api.get("/flowdefault");
      const whatsappData = data.find(w => w.id === selectedWhatsApp);
      if (whatsappData) {
        setSelectedFlow(whatsappData.flowIdWelcome || "");
      }
    } catch (err) {
      toastError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <MainContainer>
      <MainHeader>
        <Title>Fluxo Padrão</Title>
      </MainHeader>
      <Paper className={classes.mainPaper}>
        <Typography variant="h6" gutterBottom>
          Selecione o WhatsApp para configurar:
        </Typography>
        <FormControl className={classes.formControl}>
          <InputLabel>WhatsApp</InputLabel>
          <Select
            value={selectedWhatsApp}
            onChange={(e) => setSelectedWhatsApp(e.target.value)}
          >
            {whatsApps.map((whatsApp) => (
              <MenuItem key={whatsApp.id} value={whatsApp.id}>
                {whatsApp.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {selectedWhatsApp && (
          <Card className={classes.card}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Fluxo de boas-vindas
              </Typography>
              <Typography variant="body2" color="textSecondary" gutterBottom>
                Este fluxo será disparado automaticamente para novos contatos que não estão na lista e enviarem mensagem pela primeira vez.
              </Typography>
              <FormControl className={classes.formControl}>
                <InputLabel>Selecione o fluxo</InputLabel>
                <Select
                  value={selectedFlow}
                  onChange={(e) => setSelectedFlow(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Nenhum</em>
                  </MenuItem>
                  {flows.map((flow) => (
                    <MenuItem key={flow.id} value={flow.id}>
                      {flow.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Box mt={2}>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? "Salvando..." : "Salvar"}
                </Button>
              </Box>
            </CardContent>
          </Card>
        )}
      </Paper>
    </MainContainer>
  );
};

export default FlowDefault;
