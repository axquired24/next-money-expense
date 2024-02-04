import axios from "axios";

const useApiHook = () => {
  const addExpense = async (records) => {
    try {
      const payload = records.map(({amount, uuid, desc, date}) => {
        return {
          fields: {
            amount,
            uuid,
            item_name: desc,
            date
          }
        }
      });

      await axios.post("/api/expense/add", payload)
      return true
    } catch (e) {
      return false
    }
  }

  return {
    addExpense
  }
}

export default useApiHook;
