import axios from 'axios';
import moment from 'moment';
import {v4 as uuidv4} from 'uuid';

const useChatLogic = () => {
  const removeUnusedStr = (str) => {
    const splitted = str.trim().split(": ")
    return splitted.length > 1 ? splitted[1] : splitted[0]
  }

  const splitAmountDesc = (str) => {
    let amount = 0, amountStr="", desc = "";

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
    if (! chat) {
      return []
    } // endif
    const valueInRow = chat.split(/\r?\n|\r|\n/g)
    const parsedValues = valueInRow.map(splitAmountDesc).filter(x => !! x)

    return parsedValues
  }

  function mapCategoryByDescription (amount=0, desc="") {
    const categories = {
      BelanjaSerumah: "-Belanja Serumah",
      Hiburan: "-Hiburan",
      Bayi: "-Bayi",
      Gift: "-Gift",
      TabunganRumah: "-Tabungan Rumah",
      BukanBulanan: "-Bukan Bulanan"
    }
    const categoriesList = Object.entries(categories).map(item => item[1]) || []

    const tags = {
      BelanjaSerumah: "#bulanan",
      Hiburan: "#hiburan",
      Pio: "#pio",
      Bayi: "#bayi",
      Gift: "#gift",
      TabunganRumah: "#rumah",
      BukanBulanan: "#bukanbulanan"
    }
    const tagsList = Object.entries(tags).map(item => item[1]) || []

    let finalCategory = ""
    if(amount < 0) {
      finalCategory = categories.BelanjaSerumah
    } // endif

    tagsList.forEach((tag) => {
      if(desc.includes(tag)) {
        switch(tag) {
          case tags.Bayi:
          case tags.Pio:
            finalCategory = categories.Bayi
            break;
          
          case tags.Hiburan:
            finalCategory = categories.Hiburan
            break;

          case tags.Gift:
            finalCategory = categories.Gift
            break;

          case tags.TabunganRumah:
            finalCategory = categories.TabunganRumah
            break;

          case tags.BukanBulanan:
            finalCategory = categories.BukanBulanan
            break;

          default:
            break;

        }
      } // endif
    })

    return finalCategory
  }

  const prepareForSheetRows = (parsedValues, date, photoFileId=null) => {
    const momentDate = moment(date * 1000)
    // date, amount, desc
    return parsedValues.map((value, idx) => {
      const currentDate = momentDate.add(1, "second")
      const formattedDate = currentDate.format("YYYY-MM-DD HH:mm:ss")

      const categoryStr = mapCategoryByDescription(value.amount, value.desc)
      
      // Map Utang
      let utangNotes = ""
      const utangTags = ["#utangsuami", "#utangistri", "#pio"]
      if(utangTags.some(tag => value.desc.includes(tag))) {
        utangNotes = "Belum Bayar"
      } // endif

      // Map Photo
      let photoLink = ""
      if(idx === 0 && photoFileId) {
        const previewUrl = process.env.NEXT_PUBLIC_BASE_URL + "/photo?file_id=" + photoFileId
        photoLink = `=HYPERLINK("${previewUrl}", "Lihat Foto")`
      }
      return [formattedDate, value.amount, value.desc, categoryStr, utangNotes, photoLink]
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
      "Siap bos! Ringkasan:",
      "Minus: *" + formatCurrency(negativeSum) + "*",
      "Plus: *" + formatCurrency(positiveSum) + "*",
      "Data Masuk: " + parsedValues.length
    ].join("\n");

    return reply
  }

  const getTextAndPhotoId = (message) => {
    let text = message?.text
    let photoFileId = null
    let photos = []
    
    if(message?.photo?.length > 0) {
      photos = message.photo
      text = message?.caption
    } // endif

    if(message?.document?.length > 0) {
      photos = message.document
      text = message?.caption
    } // endif

    if (photos.length > 0) {
      const selectedPhoto = message.photo.sort((a,b) => b.file_size - a.file_size)[0]
      photoFileId = selectedPhoto.file_id
    } // endif

    return {text, photoFileId}
  }

  return {
    formatMsg,
    generateChatSummary,
    prepareForSheetRows,
    getTextAndPhotoId
  }
}

export default useChatLogic;
