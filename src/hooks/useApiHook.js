import axios from "axios";

const useApiHook = () => {
  const fwdToWebhookSite = async ({
      data
  }) => {
    const headers = {
      'Accept-Encoding': 'application/json',
      'Content-Type': 'application/json'
    }
    data.a_from = process.env.NEXT_PUBLIC_BASE_URL

    const url = process.env.WEBHOOKSITE_URL
    const axiosBase = await axios.post(url, data, headers).catch(e => {
      console.log("Error in fwdToWebhookSite", e)
    })
    return axiosBase
  }

  return {
    fwdToWebhookSite
  }
}

export default useApiHook;
