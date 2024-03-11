const useEnv = () => {
  const getEnv = () => {
    return {
      AIRTABLE_TOKEN: process.env.AIRTABLE_TOKEN,
      NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
      TBOT_TOKEN: process.env.TBOT_TOKEN
    }
  }

  return {
    getEnv
  }
}

export default useEnv;
