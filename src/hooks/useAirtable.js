import useEnv from "./useEnv";
import axios from 'axios';
import Airtable from "airtable";

const { getEnv } = useEnv();
const useAirtable = () => {
  const AIRTABLE_API_KEY = getEnv().AIRTABLE_TOKEN;
  let AIRTABLE_BASE_ID = 'appcqwUljxdhvaljU';

  const setAirTableBaseID = (airBaseID) => {
    AIRTABLE_BASE_ID = airBaseID;
  }

  const getAirBase = () => {
    return new Airtable({ apiKey: AIRTABLE_API_KEY }).base(AIRTABLE_BASE_ID);
  }
  
  async function getTableStructure(tableName) {
    try {
      const base = getAirBase();
      const table = base(tableName);
  
      // Use the 'select' method to get the table structure
      const records = await table.select({}).firstPage();

      // Extract the fields from each record
      const fields = records.map(record => record.fields);
      return fields
    } catch (error) {
      console.error(error);
      return null
    }
  }

  async function addRecords(tableName, recordsToAdd) {
    try {
      const base = getAirBase();
      const table = base(tableName);
  
      // Use the 'create' method to add records
      const createdRecords = await table.create(recordsToAdd);
      const recordIds = createdRecords.map(record => record.id);
  
      console.log('Records added:', recordIds);
      return recordIds;
    } catch (error) {
      console.error('Error adding records:', error);
      return null;
    }
  }


  return {
    setAirTableBaseID,
    addRecords,
    getTableStructure
  }
}

export default useAirtable;
