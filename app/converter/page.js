"use client"
import { useState } from "react"
import ChatInput from "@/src/components/ChatInput"
import ExpenseTable from "@/src/components/tables/ExpenseTable"

const Converter = () => {
  const [rowValues, setRowValues] = useState([{
    amount: null, amountStr: "", 
    desc: null, date: "",
    uuid: "null"
  }]);

  return (
      <div className="p-10 space-y-4">
        <ChatInput setRowValues={setRowValues} />
        <ExpenseTable rowValues={rowValues} setRowValues={setRowValues} />
      </div>
  );
}

export default Converter;
