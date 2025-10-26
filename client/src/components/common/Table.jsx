import React from 'react';

const Table = ({ data, columns, emptyMessage = 'No data available' }) => {
  if (!data || data.length === 0) {
    return <div className='text-center text-light'>{emptyMessage}</div>;
  }

  const getCellValue = (row, column) => {
    if (column.render) {
      return column.render(getNestedValue(row, column.key), row);
    }
    return getNestedValue(row, column.key);
  };

  const getNestedValue = (obj, path) => {
    return path.split('.').reduce((acc, part) => acc?.[part], obj);
  };

  return (
    <table className='table'>
      <thead>
        <tr>
          {columns.map((column) => (
            <th key={column.key}>{column.label}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {data.map((row, index) => (
          <tr key={row._id || row.id || index}>
            {columns.map((column) => (
              <td key={column.key}>{getCellValue(row, column)}</td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default Table;
