import axios from "axios";
import useEnv from './useEnv';
import useChatLogic from './useChatLogic';
import useGsheet from './useGsheet';

const useTelegram = () => {
  const { getEnv } = useEnv();
  const { formatMsg, generateChatSummary, prepareForSheetRows } = useChatLogic();
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

  async function enableWebhook() {
    try {
      const response = await axios.post(
        "https://api.telegram.org/bot" + tokenBot + "/setWebhook",
        {
          url: baseURL + "/api/telegram/callback"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
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
    const { chat, text, message_thread_id, reply_to_message } = message

    const emptyReply = "Kok bukan data duit? Cuekin ah.\nupdateID " + update_id
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

    // return payload
    
    try {
      if (! text) {
        return await sendMessageToSupergroup(payload)
      } // endif
      const parsedValues = formatMsg(text)

      if (parsedValues.length < 1) {
        return await sendMessageToSupergroup(payload)
      } // endif
  
      // Prepare content for google sheet
      const sheetRows = prepareForSheetRows(parsedValues)
      const isRowAdded = await addToSheet({rows: sheetRows})
  
      // Prepare reply to channel
      let reply = generateChatSummary(parsedValues)
      reply += "\n\nGoogle Sheet: " + (isRowAdded ? "Success" : "Failed")
      payload.message = reply
  
      return await sendMessageToSupergroup(payload)
    } catch (e) {
      payload.message = "Error BOSKU!, updateID " + update_id
      return await sendMessageToSupergroup(payload)
    }

  }

  return {
    enableWebhook,
    removeWebhook,
    updateTokenBot,
    fetchTelegramMessage,
    sendMessageToSupergroup,
    processTelegramCallback
  };
};

export default useTelegram;
