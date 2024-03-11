import {v4 as uuidv4} from 'uuid';

const useChatLogic = () => {
  const removeUnusedStr = (str) => {
    const splitted = str.trim().split(": ")
    return splitted.length > 1 ? splitted[1] : splitted[0]
  }

  const getToday = () => {
    return new Date().toISOString().split('T')[0];
  }

  const splitAmountDesc = (str) => {
    let amount = 0, amountStr="", desc = "";
    const date = getToday()

    if (!str) {
      return null;
    } // endif
    
    let splitStr = removeUnusedStr(str)
    splitStr = splitStr.split(" ")

    if (splitStr.length < 2) {
      return null
    } // endif

    try {
      amountStr = splitStr.shift()
      amount = parseFloat(amountStr.replace("k", "").replace(",", ".")) * 1000

      if(isNaN(amount)) {
        return null
      } // endif

    } catch (e) {
      console.error("error formatting", {amountStr, str}, e)
      amount = 0
    } // endif
    desc = splitStr.join(" ")

    return {
      amount,
      amountStr,
      desc,
      date,
      uuid: uuidv4()
    }
  }

  
  /**
   * Formats the chat message by splitting it into rows and parsing the values.
   *
   * @param {string} chat - The chat message to be formatted.
   * @returns {Array} - An array of parsed values.
   * 
   * sample response
   * {
        "amount": -35000,
        "amountStr": "-35k",
        "desc": "bawang",
        "date": "2024-03-11",
        "uuid": "15215a6e-9169-4009-b374-6edfbae98287"
    }
   */
  
  const formatMsg = (chat) => {
    const valueInRow = chat.split(/\r?\n|\r|\n/g)
    const parsedValues = valueInRow.map(splitAmountDesc).filter(x => !! x)

    return parsedValues
  }

  const prepareForSheetRows = (parsedValues) => {
    // date, amount, desc
    return parsedValues.map((value) => {
      return [value.date, value.amount, value.desc]
    });
  }

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('id-ID', { 
      style: 'currency', 
      currency: 'IDR',
      maximumFractionDigits: 2,
      minimumFractionDigits: 0 
    }).format(amount);
  }

  const generateChatSummary = (parsedValues) => {
    let positiveSum = 0;
    let negativeSum = 0;

    parsedValues.forEach((value) => {
      if (value.amount > 0) {
        positiveSum += value.amount;
      } else {
        negativeSum += value.amount;
      }
    });

    const reply = [
      "Siap bos, ini ringkasannya:",
      "Total pengeluaran: **" + formatCurrency(negativeSum) + "**",
      "Total pemasukan: **" + formatCurrency(positiveSum) + "**"
    ].join("\n");

    return reply
  }

  return {
    formatMsg,
    generateChatSummary,
    prepareForSheetRows
  }
}

export default useChatLogic;
