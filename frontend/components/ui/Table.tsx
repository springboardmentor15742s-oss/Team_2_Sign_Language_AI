import React from 'react';

export const Table: React.FC<React.TableHTMLAttributes<HTMLTableElement>> = ({ children, className, ...props }) => (
  <div className="w-full overflow-x-auto rounded-lg border border-slate-800">
    <table className="w-full text-left text-sm text-slate-300" {...props}>
      {children}
    </table>
  </div>
);

export const TableHeader: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <thead className="bg-slate-900/90 text-xs uppercase font-semibold text-slate-400 border-b border-slate-800" {...props}>
    {children}
  </thead>
);

export const TableBody: React.FC<React.HTMLAttributes<HTMLTableSectionElement>> = ({ children, ...props }) => (
  <tbody className="divide-y divide-slate-800 bg-slate-950/40" {...props}>
    {children}
  </tbody>
);

export const TableRow: React.FC<React.HTMLAttributes<HTMLTableRowElement>> = ({ children, ...props }) => (
  <tr className="hover:bg-slate-900/50 transition-colors" {...props}>
    {children}
  </tr>
);

export const TableCell: React.FC<React.TdHTMLAttributes<HTMLTableCellElement>> = ({ children, className, ...props }) => (
  <td className="px-4 py-3 align-middle" {...props}>
    {children}
  </td>
);
