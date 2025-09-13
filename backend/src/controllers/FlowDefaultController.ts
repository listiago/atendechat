import { Request, Response } from "express";
import Whatsapp from "../models/Whatsapp";

export const createFlowDefault = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, flowIdWelcome } = req.body;
  const { companyId } = req.user;

  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });

  if (!whatsapp) {
    return res.status(404).json({ error: "WhatsApp not found" });
  }

  await whatsapp.update({ flowIdWelcome });

  return res.status(200).json(whatsapp);
};

export const updateFlow = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { whatsappId, flowIdWelcome } = req.body;
  const { companyId } = req.user;

  const whatsapp = await Whatsapp.findOne({
    where: { id: whatsappId, companyId }
  });

  if (!whatsapp) {
    return res.status(404).json({ error: "WhatsApp not found" });
  }

  await whatsapp.update({ flowIdWelcome });

  return res.status(200).json(whatsapp);
};

export const getFlows = async (
  req: Request,
  res: Response
): Promise<Response> => {
  const { companyId } = req.user;

  const whatsapps = await Whatsapp.findAll({
    where: { companyId },
    attributes: ['id', 'name', 'flowIdWelcome']
  });

  return res.status(200).json(whatsapps);
};
