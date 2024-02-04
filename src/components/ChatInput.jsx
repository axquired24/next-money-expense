import { useRef, useState } from "react"
import {v4 as uuidv4} from 'uuid';
import useApiHook from "@/src/hooks/useApiHook";

const ChatInput = ({setRowValues}) => {
  const inputRef = useRef();
  const dateInputRef = useRef()
  const [errMsg, setErrMsg] = useState(null);
  const [isSyncing, setIsSyncing] = useState(false);
  const { addExpense } = useApiHook();

  const getDateValue = () => {
    return dateInputRef.current?.value
  }

  const removeUnusedStr = (str) => {
    const splitted = str.trim().split(": ")
    return splitted.length > 1 ? splitted[1] : splitted[0]
  }

  const splitAmountDesc = (str) => {
    let amount = 0, amountStr="", desc = "";
    const date = getDateValue()

    if( !str) {
      return null
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrMsg(null);
    const inputValue = inputRef.current?.value
    const dateValue = getDateValue()
    const valueInRow = inputValue.split(/\r?\n|\r|\n/g)
    const parsedValues = valueInRow.map(splitAmountDesc).filter(x => !! x)
    
    if(inputValue && dateValue) {
      setIsSyncing(true);
      const isOk = await addExpense(parsedValues)
      if (! isOk) {
        setErrMsg("Failed to sync with AirTable")
      } // endif
      setIsSyncing(false);

      setRowValues(prev => {
        return [
          ...prev,
          ...parsedValues
        ]
      })
    } else {
      setErrMsg("Please input all field")
    } // endif
  }

  const inputElm = (<form method="post" className="space-y-3" onSubmit={handleSubmit}>
    <div className="text-xl font-semibold">Input Chat</div>
    <div>
      <input ref={dateInputRef} 
        name="inputdate"
        type="date"
        className="px-3 py-2 input-bg-black" style={{colorScheme: "dark"}} />
    </div>
    <textarea ref={inputRef}
      className="p-4 input-bg-black"
      name="chat" id="chat" cols="60" rows="10"></textarea>
    <div className="text-red-500" hidden={! errMsg}>{errMsg}</div>
    <div className="space-x-4">
      <button type="submit" 
        disabled={isSyncing}
        className="mt-2 font-medium bg-blue-800 px-3 py-2 rounded-md hover:opacity-90"
      >
        { isSyncing ? "Loading ..." : "Tambah Data"}
      </button>
    </div>
  </form>)

  return inputElm
}

export default ChatInput;
