import axios from "axios";

const useApiHook = () => {
  const fwdToWebhookSite = async ({
      method,
      data
  }) => {
    const axiosConfig = {
      method,
      url: process.env.WEBHOOKSITE_URL,
      data,
      headers: {
        'Accept-Encoding': 'application/json',
        'Content-Type': 'application/json'
      }
    }

    return await axios.create(axiosConfig).catch(e => console.error("Axios fwdToWebhookSite Error", e))
  }

  return {
    fwdToWebhookSite
  }
}

export default useApiHook;
