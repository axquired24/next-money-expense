import axios from "axios";
import useEnv from './useEnv';
import useChatLogic from './useChatLogic';
import useGsheet from './useGsheet';
import { extractReceiptData } from "@/app/api/telegram/readimage-ai/ReadImageUsingAI";

const useTelegram = () => {
  const { getEnv } = useEnv();
  const { formatMsg, generateChatSummary, prepareForSheetRows, getTextAndPhotoId } = useChatLogic();
  const { addToSheet } = useGsheet();

  const baseURL = getEnv().NEXT_PUBLIC_BASE_URL;
  let tokenBot = getEnv().TBOT_TOKEN;

  function updateTokenBot(newToken) {
    tokenBot = newToken;
  }

  async function sendMessageToSupergroup({
    chat_id, 
    message, 
    message_thread_id=null,
    reply_parameters=null
  }) {
    const payload = {
      chat_id,
      text: message,
      parse_mode: "markdown"
    };
    const URL = "https://api.telegram.org/bot" + tokenBot + "/sendMessage"

    if (message_thread_id) {
      payload.is_topic_message = true;
      payload.message_thread_id = message_thread_id;
    } // endif

    if (reply_parameters) {
      // chat_id & message_id
      payload.reply_parameters = reply_parameters
    } // endif

    try {
      const response = await axios.post(
        URL,
        payload,
        {
          headers: { "Content-Type": "application/json" }
        }
      );

      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error sending message:", error?.response);
      throw error;
    }
  }

  async function enableWebhook(debug=false) {
    let url = baseURL + "/api/telegram/callback"
    if(debug) {
      url = process.env.WEBHOOKSITE_URL
    } // endif

    try {
      const response = await axios.post(
        "https://api.telegram.org/bot" + tokenBot + "/setWebhook",
        {
          url
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      data.webhook_url = url
      return data;
    } catch (error) {
      console.error("Error enabling webhook:", error);
      throw error;
    }
  }

  async function removeWebhook() {
    try {
      const response = await axios.post(
        "https://api.telegram.org/bot" + tokenBot + "/deleteWebhook"
      );

      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error removing webhook:", error);
      throw error;
    }
  }

  async function fetchTelegramMessage() {
    try {
      const response = await axios.get(
        "https://api.telegram.org/bot" + tokenBot + "/getUpdates"
      );

      const data = response.data.result;
      return data;
    } catch (error) {
      console.error("Error fetching telegram message:", error?.response);
      throw error;
    }
  }

  async function processTelegramCallback(body) {
    const { message, update_id } = body;
    const { chat, message_thread_id, date } = message
    const reply_to_message = message?.reply_to_message
    const { text, photoFileId } = getTextAndPhotoId(message);
    

    const emptyReply = "gak ada teks apa2 bos.\nupdateID " + update_id
    const payload = {
      chat_id: chat.id,
      message: emptyReply,
      message_thread_id
    }

    if (reply_to_message) {
      payload.reply_parameters = {
        chat_id: reply_to_message.chat.id,
        message_id: reply_to_message.message_id
      }
    } // endif

    async function respError(payloadParam) {
      await sendMessageToSupergroup(payloadParam)
      return [
        {"isError": true}
      ]
    }
    
    try {
      let isHavingTextToProcess = true
      if (! text) {
        isHavingTextToProcess = false
      } // endif
      const parsedValues = formatMsg(text)

      if (parsedValues.length < 1) {
        isHavingTextToProcess = false
      } // endif

      let sheetRowFromImg = []
      if (photoFileId) {
        // Notify processing image
        payload.message = "Nota lagi di proses Bos!"
        await sendMessageToSupergroup(payload)
        sheetRowFromImg = await processPhoto(photoFileId, message)
      } // endif

      if (! isHavingTextToProcess) {
        if(sheetRowFromImg.length > 0) {
          return sheetRowFromImg
        } else {
          return respError(payload)
        } // endif
      } // endif
  
      // Prepare content for google sheet
      const sheetRows = prepareForSheetRows(parsedValues, date, photoFileId)
      console.log({sheetRows})
      const isRowAdded = await addToSheet({rows: sheetRows})
  
      // Prepare reply to channel
      let reply = generateChatSummary(parsedValues)
      reply += "\n\nGoogle Sheet: " + (isRowAdded ? "Success" : "Failed")
      payload.message = reply
  
      await sendMessageToSupergroup(payload)

      return [...sheetRows, ...sheetRowFromImg];
    } catch (e) {
      payload.message = "Error BOSKU!, updateID " + update_id
      return respError(payload)
    }

  }

  const getFileUrl = async (photoFileId) => {
    const fileDetailApiUrl = `https://api.telegram.org/bot${process.env.TBOT_TOKEN}/getFile?file_id=${photoFileId}`
    try {
      const fileDetailApi = await axios.get(fileDetailApiUrl)
      const filePath = fileDetailApi?.data?.result?.file_path
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TBOT_TOKEN}/${filePath}`
      return fileUrl
    } catch (e) { 
      console.log(e)
      return ""
    }

  }

  const getFilePreviewUrl = (photoFileId) => {
    return process.env.NEXT_PUBLIC_BASE_URL + "/photo?file_id=" + photoFileId
  }

  const processPhoto = async (photoFileId, message) => {
    const fileUrl = getFilePreviewUrl(photoFileId)
    const extractedValues = await extractReceiptData(fileUrl)
    const { chat, message_thread_id, date } = message

    const payload = {
      chat_id: chat.id,
      message: "",
      message_thread_id
    }

    if (extractedValues[0] === "kosong") {
      payload.message = "Yah, nota gabisa dibaca Bos!"
      await sendMessageToSupergroup(payload)
      return false
    } // endif

    const parsedValues = formatMsg(extractedValues.join("\n"))

    // Prepare content for google sheet
    const sheetRows = prepareForSheetRows(parsedValues, date)
    console.log({sheetRows})
    const isRowAdded = await addToSheet({rows: sheetRows})

    // Prepare reply to channel
    const replies = [
      "Nota diproses: " + fileUrl + "\n",
      ...extractedValues,
      "\n--------------",
      generateChatSummary(parsedValues),
      "\nGoogle Sheet: " + (isRowAdded ? "Success" : "Failed")
    ]
    payload.message = replies.join("\n")

    await sendMessageToSupergroup(payload)
    return sheetRows;
  }

  return {
    enableWebhook,
    removeWebhook,
    updateTokenBot,
    fetchTelegramMessage,
    sendMessageToSupergroup,
    processTelegramCallback,
    getFileUrl
  };
};

export default useTelegram;
