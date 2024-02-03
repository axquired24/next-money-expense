"use client"
import { useRef, useState } from "react"
import {v4 as uuidv4} from 'uuid';
import styles from "./table.module.css"

const InnerRow = ({
  amount, amountStr, 
  desc, 
  date,
  useShortFormat=false,
  removeByDate
}) => {
  const removeItemByDate = () => {
    const cfirm = confirm("Remove all date on: " + date + " ?")
    if(cfirm) {
      removeByDate(date)
    } // endif
  }
  return (<tr className={amount > 0 ? "bg-green-800" : "bg-red-800"}>
    <td>
      <div className="flex justify-between">
        <span>{date}</span>
        <button hidden={! useShortFormat} type="button" className="px-2 rounded-full bg-red-900 hover:bg-yellow-800" onClick={removeItemByDate}>x</button>
      </div>
    </td><td>
      {useShortFormat ? amountStr : amount}
    </td>
    <td>{desc}</td>
  </tr>)
}
const Converter = () => {
  const inputRef = useRef()
  const dateInputRef = useRef()
  const [rowValues, setRowValues] = useState([{
    amount: null, amountStr: "", 
    desc: null, date: "",
    uuid: "null"
  }]);
  const [useShortFormat, setUseShortFormat] = useState(false);
  const [errMsg, setErrMsg] = useState(null);

  const toggleAmountFormat = () => {
    setUseShortFormat(prev => {
      return !prev
    })
  }

  const removeByDate = (date) => {
    setRowValues(prev => {
      const newValue = prev.filter(item => item.date !== date)
      return newValue
    })
  }

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
    
    if (str) {
      let splitStr = removeUnusedStr(str)
      splitStr = splitStr.split(" ")

      if (splitStr.length > 1) {
        try {
          amountStr = splitStr.shift()
          amount = parseFloat(amountStr.replace("k", "").replace(",", ".")) * 1000
        } catch (e) {
          console.error("error formatting", {amountStr, str}, e)
          amount = 0
        } // endif
        desc = splitStr.join(" ")
      } // endif

    } // endif

    return {
      amount,
      amountStr,
      desc,
      date,
      uuid: uuidv4()
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    setErrMsg(null)
    const inputValue = inputRef.current?.value
    const dateValue = getDateValue()
    const valueInRow = inputValue.split(/\r?\n|\r|\n/g)
    
    if(inputValue && dateValue) {
      setRowValues(prev => {
        return [
          ...prev,
          ...valueInRow.map(splitAmountDesc)
        ]
      })
    } else {
      setErrMsg("Please input all field")
    } // endif
  }

  const resetTable = () => {
    const cfirm = confirm("Reset table data?")
    if(cfirm) {
      setRowValues([])
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
        className="mt-2 font-medium bg-blue-800 px-3 py-2 rounded-md hover:opacity-90"
      >Tambah Data</button>
      <button type="button" 
        onClick={resetTable}
        className="mt-2 font-medium bg-blue-800 px-3 py-2 rounded-md hover:opacity-90"
      >Reset</button>
    </div>
  </form>)
  const tableElm = (
    <div className={styles.tableWrapper}>
      <table className="table-auto opacity-90 w-full lg:w-2/3">
        <thead>
          <tr>
            <th>Tanggal</th>
            <th>Nominal</th>
            <th>Deskripsi</th>
          </tr>
        </thead>
        <tbody>
          {
            rowValues.map(item => (
              <InnerRow key={item.uuid} {...item} 
                removeByDate={removeByDate}
                useShortFormat={useShortFormat} />
            ))
          }
        </tbody>
      </table>
    </div>
  )

  const changeFormatBtn = (
    <div>
      <button type="button" onClick={toggleAmountFormat} 
        className="mt-2 font-medium bg-gray-800 px-3 py-2 rounded-md hover:opacity-90"
      >Ubah Format</button>
    </div>
  )
  return (
      <div className="p-10 space-y-4">
        { inputElm }
        { changeFormatBtn }
        { tableElm }
        {/* {JSON.stringify(rowValues)} */}
      </div>
  );
}

export default Converter;
