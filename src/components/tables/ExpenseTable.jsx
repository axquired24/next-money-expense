import { useRef, useState } from "react";
import styles from "./ExpenseTable.module.css";

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

const ExpenseTable = ({rowValues, setRowValues}) => {
  const [useShortFormat, setUseShortFormat] = useState(false);

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

  const resetTable = () => {
    const cfirm = confirm("Reset table data?")
    if(cfirm) {
      setRowValues([])
    } // endif
  }

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
    <div className="space-x-4">
      <button type="button" onClick={toggleAmountFormat} 
        className="mt-2 font-medium bg-gray-800 px-3 py-2 rounded-md hover:opacity-90"
      >Ubah Format</button>
      <button type="button" 
        onClick={resetTable}
        className="mt-2 font-medium bg-gray-800 px-3 py-2 rounded-md hover:opacity-90"
      >Reset Table</button>
    </div>
  )

  return (
    <>
     { changeFormatBtn } 
     { tableElm } 
    </>
  );
}

export default ExpenseTable;
