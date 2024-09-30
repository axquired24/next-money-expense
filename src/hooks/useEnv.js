const useEnv = () => {
  const getEnv = () => {
    return {
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      WEBHOOKSITE_URL: process.env.WEBHOOKSITE_URL,
      TBOT_TOKEN: process.env.TBOT_TOKEN
    }
  }

  return {
    getEnv
  }
}

export default useEnv;
