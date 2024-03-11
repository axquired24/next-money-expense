import axios from "axios";
import useEnv from './useEnv';

const useTelegram = () => {
  const {getEnv} = useEnv();

  const baseURL = getEnv().NEXT_PUBLIC_BASE_URL;
  let tokenBot = getEnv().TBOT_TOKEN;

  function updateTokenBot(newToken) {
    tokenBot = newToken;
  }

  async function sendMessageToSupergroup({chatId, message, message_thread_id=null}) {
    const payload = {
      chat_id: chatId,
      text: message,
      parse_mode: "markdown"
    };
    const URL = "https://api.telegram.org/bot" + tokenBot + "/sendMessage"

    if (message_thread_id) {
      payload.is_topic_message = true;
      payload.message_thread_id = message_thread_id;
    }

    try {
      const response = await axios.post(
        URL,
        payload,
        {
          headers: {
        "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      return data;
    } catch (error) {
      console.error("Error sending message:", error);
      throw error;
    }
  }

  async function enableWebhook() {
    try {
      const response = await axios.post(
        "https://api.telegram.org/bot" + tokenBot + "/setWebhook",
        {
          url: baseURL + "/api/tcallback"
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const data = response.data;
      console.log({ data });
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
      console.log({ data });
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
    const { message } = body;
    const { chat, text, message_thread_id } = message;
    const payload = {
      chatId: chat.id,
      message: text,
      message_thread_id
    }
    return await sendMessageToSupergroup(payload)
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
