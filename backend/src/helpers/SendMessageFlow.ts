import Whatsapp from "../models/Whatsapp";
import GetWhatsappWbot from "./GetWhatsappWbot";
import fs from "fs";

import { getMessageOptions } from "../services/WbotServices/SendWhatsAppMedia";

export type MessageData = {
  number: number | string;
  body: string;
  mediaPath?: string;
};

export const SendMessageFlow = async (
  whatsapp: Whatsapp,
  messageData: MessageData,
  isFlow: boolean = false,
  isRecord: boolean = false
): Promise<any> => {
  try {
    const wbot = await GetWhatsappWbot(whatsapp);
    const chatId = `${messageData.number}@s.whatsapp.net`;

    let message;

    if (messageData.mediaPath) {
      // CORREÇÃO: Usar getMessageOptions para processar mídia corretamente
      const fileName = messageData.mediaPath.split('/').pop() || 'media';
      const options = await getMessageOptions(
        fileName,
        messageData.mediaPath,
        messageData.body
      );

      if (options) {
        message = await wbot.sendMessage(chatId, { ...options });
      } else {
        throw new Error('Falha ao processar mídia no flow');
      }
    } else {
      // Send text message
      const body = `\u200e${messageData.body}`;
      message = await wbot.sendMessage(chatId, { text: body });
    }

    return message;
  } catch (err: any) {
    console.error('Error sending message flow:', err);
    throw new Error(err);
  }
};
