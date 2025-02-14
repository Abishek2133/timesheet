import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import axios from 'axios';
import Select from 'react-select';
import './AddTimesheet.css';

const AddTimesheet = () => {
  const [selectedMonth, setSelectedMonth] = useState('');
  const [timesheetData, setTimesheetData] = useState([]);
  const [availableProjects, setAvailableProjects] = useState([]);
  const [tableRowCount, setTableRowCount] = useState(1);
  const [showFirstHalf, setShowFirstHalf] = useState(true);

  useEffect(() => {
    generateTimesheetData(selectedMonth);
  }, [selectedMonth, showFirstHalf]);

  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('https://65c0706125a83926ab964c6f.mockapi.io/api/projectdetails/projects');
        const data = response.data;
        setAvailableProjects(data);
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };

    fetchProjects();
  }, []);

  const handleForward = () => {
    const nextMonth = new Date(selectedMonth);
    nextMonth.setMonth(nextMonth.getMonth() + (showFirstHalf ? 0 : 1));
    setSelectedMonth(nextMonth.toISOString().split('T')[0].slice(0, 7));
    setShowFirstHalf(!showFirstHalf);
  };

  const handleBackward = () => {
    const previousMonth = new Date(selectedMonth);
    previousMonth.setMonth(previousMonth.getMonth() - (showFirstHalf ? 1 : 0));
    setSelectedMonth(previousMonth.toISOString().split('T')[0].slice(0, 7));
    setShowFirstHalf(!showFirstHalf);
  };

  const generateTimesheetData = (selectedMonth) => {
    if (!selectedMonth) return;

    const currentYear = parseInt(selectedMonth.slice(0, 4));
    const daysInMonth = new Date(currentYear, parseInt(selectedMonth.slice(5, 7)), 0).getDate();
    const startDay = showFirstHalf ? 1 : 16;
    const totalDays = showFirstHalf ? 15 : daysInMonth - 15;

    const newTimesheetData = Array.from({ length: totalDays }, (_, i) => {
      const dayOfMonth = startDay + i;
      const date = new Date(currentYear, parseInt(selectedMonth.slice(5, 7)) - 1, dayOfMonth);
      return { date, entries: Array(tableRowCount).fill({ projectId: '', workHours: '' }) };
    });

    setTimesheetData(newTimesheetData);
  };

  const handleWorkHoursChange = (rowIndex, columnIndex, value) => {
    const newTimesheetData = [...timesheetData];

    if (!newTimesheetData[rowIndex]?.entries) {
      newTimesheetData[rowIndex].entries = [];
    }

    if (!newTimesheetData[rowIndex].entries[columnIndex]) {
      newTimesheetData[rowIndex].entries[columnIndex] = {};
    }

    newTimesheetData[rowIndex].entries[columnIndex].workHours = value;
    setTimesheetData(newTimesheetData);
  };

  const handleProjectChange = (rowIndex, columnIndex, selectedOption) => {
    const newTimesheetData = [...timesheetData];
    newTimesheetData[rowIndex].entries[columnIndex].projectId = selectedOption.value;
    setTimesheetData(newTimesheetData);
  };

  const handleAddRow = () => {
    setTableRowCount((prev) => prev + 1);
  };

  const handleRemoveRow = (rowIndex) => {
    const newTimesheetData = [...timesheetData];
    newTimesheetData.splice(rowIndex, 1);
    setTimesheetData(newTimesheetData);
    setTableRowCount((prev) => prev - 1);
  };

  return (
    <div className="AddTimesheet background-clr">
      <div className="AddTimesheet employeeEdit-container pt-4">
        <div>
          <p className='AddTimesheet fs-4 text-secondary'>Add Timesheet</p>
        </div>

        <div className="d-flex justify-content-between">
          <div className="m-1">
            <label htmlFor="fromMonth">Select Month and Year :  </label>
            <input
              type="month"
              id="fromMonth"
              className="mx-1"
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
            />
          </div>
          <div>
            <button
              className="AddTimesheet btn btn-primary"
              onClick={handleBackward}
            >
              <i className="bi bi-caret-left-fill"></i>Backward
            </button>
            <button
              className="AddTimesheet btn btn-primary ms-2"
              onClick={handleForward}
            >
              Forward
            </button>
          </div>
        </div>

        <div className=" table-responsive border border-1 rounded p-4 border-black my-4" style={{ position: 'relative', zIndex: 1 }}>
          <table className="table table-bordered text-center">
            <thead>
              <tr>
                <th style={{ backgroundColor: '#1C2FBA' }} className='text-white'>Date</th>
                {timesheetData.map((entry, rowIndex) => (
                  <th key={rowIndex}>
                    {entry.date.toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                    })}
                  </th>
                ))}
                <th></th>
              </tr>
              <tr>
                <th style={{ backgroundColor: '#1C2FBA' }} className='text-white'>Day</th>
                {timesheetData.map((entry, rowIndex) => (
                  <td key={rowIndex} style={{ backgroundColor: entry.date.getDay() === 0 ? 'gold' : '' }}>
                    {entry.date.toLocaleDateString('en-US', { weekday: 'short' })}
                  </td>
                ))}
                <td></td>
              </tr>
              {[...Array(tableRowCount)].map((_, rowIndex) => (
                <tr key={rowIndex}>
                  <th>
                    <div>
                      <Select
                        options={availableProjects.map((project) => ({
                          value: project.id,
                          label: project.title,
                        }))}
                        value={timesheetData[rowIndex]?.entries[0]?.projectId ? { value: timesheetData[rowIndex].entries[0].projectId, label: timesheetData[rowIndex].entries[0].projectId } : null}
                        onChange={(selectedOption) => handleProjectChange(rowIndex, 0, selectedOption)}
                        placeholder="Project ID"
                        className="AddTimesheet my-2" 
                      />
                    </div>
                  </th>
                  {timesheetData.map((entry, columnIndex) => (
                    <td key={columnIndex}>
                      <input
                        type="number"
                        className="AddTimesheet form-control" 
                        placeholder="0"
                        value={timesheetData[rowIndex]?.entries[columnIndex]?.workHours}
                        onChange={(e) => handleWorkHoursChange(rowIndex, columnIndex, e.target.value)}
                      />
                    </td>
                  ))}
                  <td>
                    <button
                      className="AddTimesheet btn btn-danger" 
                      onClick={() => handleRemoveRow(rowIndex)}
                    >
                      X
                    </button>
                  </td>
                </tr>
              ))}
            </thead>
          </table>
          <button
            className="AddTimesheet btn btn-success ms-2" 
            onClick={handleAddRow}
          >
            +
          </button>
        </div>

        <div>
          <span className='AddTimesheet fw-bold'>Total Hours Worked : </span> <span className='AddTimesheet fw-bold'>0</span>
        </div>
        <div className="d-flex justify-content-center" >
          <button className="AddTimesheet btn btn-success m-3 w-5" onClick={() => {}} style={{ width: '100px' }}>Save</button>
          <button className="AddTimesheet btn btn-secondary m-3 w-5" style={{ width: '100px' }}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default AddTimesheet;








