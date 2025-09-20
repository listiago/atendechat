import { WAMessage, AnyMessageContent } from "@whiskeysockets/baileys";
import * as Sentry from "@sentry/node";
import fs from "fs";
import { exec } from "child_process";
import path from "path";
import ffmpegPath from "@ffmpeg-installer/ffmpeg";
import AppError from "../../errors/AppError";
import GetTicketWbot from "../../helpers/GetTicketWbot";
import Ticket from "../../models/Ticket";
import { lookup } from "mime-types";
import formatBody from "../../helpers/Mustache";

interface Request {
  media: Express.Multer.File;
  ticket: Ticket;
  body?: string;
}

const publicFolder = path.resolve(__dirname, "..", "..", "..", "public");

const processAudio = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ab 128k -ar 44100 -f ipod ${outputAudio} -y`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erro no processamento de áudio:", error.message);
          console.error("STDERR:", stderr);
          reject(new Error(`Falha no processamento de áudio: ${error.message}`));
          return;
        }
        // Verificar se o arquivo de saída foi criado
        if (!fs.existsSync(outputAudio)) {
          reject(new Error("Arquivo de áudio processado não foi criado"));
          return;
        }
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

const processAudioFile = async (audio: string): Promise<string> => {
  const outputAudio = `${publicFolder}/${new Date().getTime()}.mp3`;
  return new Promise((resolve, reject) => {
    exec(
      `${ffmpegPath.path} -i ${audio} -vn -ar 44100 -ac 2 -b:a 192k ${outputAudio}`,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Erro no processamento de arquivo de áudio:", error.message);
          console.error("STDERR:", stderr);
          reject(new Error(`Falha no processamento de arquivo de áudio: ${error.message}`));
          return;
        }
        // Verificar se o arquivo de saída foi criado
        if (!fs.existsSync(outputAudio)) {
          reject(new Error("Arquivo de áudio processado não foi criado"));
          return;
        }
        fs.unlinkSync(audio);
        resolve(outputAudio);
      }
    );
  });
};

export const getMessageOptions = async (
  fileName: string,
  pathMedia: string,
  body?: string
): Promise<any> => {
  const mimeType = lookup(pathMedia) || "";
  const typeMessage = mimeType.split("/")[0];

  try {
    if (!mimeType) {
      throw new Error(`Tipo MIME não identificado para o arquivo: ${pathMedia}`);
    }
    let options: AnyMessageContent;

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: body ? body : "",
        fileName: fileName
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      // Corrigir lógica de detecção de tipo de áudio
      const typeAudio = fileName.includes("audio-record-site") ||
                       mimeType.includes("ogg") ||
                       mimeType.includes("webm") ||
                       mimeType.includes("mp4");

      const convert = await processAudio(pathMedia);
      if (typeAudio) {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          caption: body ? body : null,
          ptt: true
        };
      } else {
        options = {
          audio: fs.readFileSync(convert),
          mimetype: mimeType,
          caption: body ? body : null,
          ptt: false
        };
      }
    } else if (typeMessage === "document") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: body ? body : null,
        fileName: fileName,
        mimetype: mimeType
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: body ? body : null
      };
    }

    return options;
  } catch (e) {
    Sentry.captureException(e);
    console.error("Erro ao processar mídia:", e.message);
    throw new AppError(`Erro ao processar mídia: ${e.message}`);
  }
};

const SendWhatsAppMedia = async ({
  media,
  ticket,
  body
}: Request): Promise<WAMessage> => {
  try {
    const wbot = await GetTicketWbot(ticket);

    const pathMedia = media.path;
    const typeMessage = media.mimetype.split("/")[0];
    let options: AnyMessageContent;
    const bodyMessage = formatBody(body, ticket.contact);

    if (typeMessage === "video") {
      options = {
        video: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname
        // gifPlayback: true
      };
    } else if (typeMessage === "audio") {
      // Corrigir lógica de detecção de tipo de áudio
      const typeAudio = media.originalname.includes("audio-record-site") ||
                       media.mimetype.includes("ogg") ||
                       media.mimetype.includes("webm") ||
                       media.mimetype.includes("mp4");

      if (typeAudio) {
        const convert = await processAudio(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: "audio/mp4",
          ptt: true
        };
      } else {
        const convert = await processAudioFile(media.path);
        options = {
          audio: fs.readFileSync(convert),
          mimetype: media.mimetype,
          ptt: false
        };
      }
    } else if (typeMessage === "document" || typeMessage === "text") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname,
        mimetype: media.mimetype
      };
    } else if (typeMessage === "application") {
      options = {
        document: fs.readFileSync(pathMedia),
        caption: bodyMessage,
        fileName: media.originalname,
        mimetype: media.mimetype
      };
    } else {
      options = {
        image: fs.readFileSync(pathMedia),
        caption: bodyMessage
      };
    }

    const sentMessage = await wbot.sendMessage(
      `${ticket.contact.number}@${ticket.isGroup ? "g.us" : "s.whatsapp.net"}`,
      {
        ...options
      }
    );

    await ticket.update({ lastMessage: bodyMessage });

    return sentMessage;
  } catch (err) {
    Sentry.captureException(err);
    console.error("Erro ao enviar mídia:", err.message);
    throw new AppError("ERR_SENDING_WAPP_MSG");
  }
};

export default SendWhatsAppMedia;
