import React from 'react';

interface TableProps {
  children: React.ReactNode;
  className?: string;
}

export const Table: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <table className={`w-full table-auto ${className}`}>
      {children}
    </table>
  );
};

export const TableHeader: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <thead className={className}>
      {children}
    </thead>
  );
};

export const TableBody: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <tbody className={className}>
      {children}
    </tbody>
  );
};

export const TableRow: React.FC<TableProps> = ({ children, className = '' }) => {
  return (
    <tr className={className}>
      {children}
    </tr>
  );
};

interface TableCellProps extends TableProps {
  isHeader?: boolean;
}

export const TableCell: React.FC<TableCellProps> = ({ children, className = '', isHeader = false }) => {
  const Component = isHeader ? 'th' : 'td';
  return (
    <Component className={className}>
      {children}
    </Component>
  );
};