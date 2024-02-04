const useEnv = () => {
  const getEnv = () => {
    return {
      AIRTABLE_TOKEN: process.env.AIRTABLE_TOKEN
    }
  }

  return {
    getEnv
  }
}

export default useEnv;
