import React from 'react';
import { Penghuni } from '../../api/api';
import { Table, TableHeader, TableBody, TableRow, TableCell } from '../ui/Table';

interface PenghuniTableProps {
  penghunis: Penghuni[];
  onEdit: (penghuni: Penghuni) => void;
  onDelete: (penghuni: Penghuni) => void;
}

const PenghuniTable: React.FC<PenghuniTableProps> = ({ penghunis, onEdit, onDelete }) => {
  if (penghunis.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg dark:bg-white/[0.03]">
        <p className="text-gray-500 dark:text-gray-400">Tidak ada data penghuni yang tersedia</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-white/[0.05] dark:bg-white/[0.03]">
      <div className="max-w-full overflow-x-auto">
        <Table>
          {/* Table Header */}
          <TableHeader className="border-b border-gray-100 dark:border-white/[0.05]">
            <TableRow>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Nama
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Program Studi
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Angkatan
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                No HP
              </TableCell>
              <TableCell
                isHeader
                className="px-5 py-3 font-medium text-gray-500 text-start text-xs dark:text-gray-400"
              >
                Aksi
              </TableCell>
            </TableRow>
          </TableHeader>

          {/* Table Body */}
          <TableBody className="divide-y divide-gray-100 dark:divide-white/[0.05]">
            {penghunis.map((penghuni) => {
              return (
                <TableRow key={penghuni.id}>
                  <TableCell className="px-5 py-4 sm:px-6 text-start">
                    <div className="flex items-center gap-3">
                      <div>
                        <span className="block font-medium text-gray-800 text-sm dark:text-white/90">
                          {penghuni.nama}
                        </span>
                        <span className="block text-gray-500 text-xs dark:text-gray-400">
                          Mahasiswa
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {penghuni.prodi}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {penghuni.angkatan}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-start text-sm dark:text-gray-400">
                    {penghuni.noHp}
                  </TableCell>
                  <TableCell className="px-4 py-3 text-gray-500 text-sm dark:text-gray-400">
                    <div className="flex space-x-2">
                      <button
                        className="px-3 py-1 bg-yellow-100 text-yellow-700 rounded-md hover:bg-yellow-200 transition-colors dark:bg-yellow-900/30 dark:text-yellow-500 dark:hover:bg-yellow-900/50"
                        onClick={() => onEdit(penghuni)}
                      >
                        Edit
                      </button>
                      <button
                        className="px-3 py-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors dark:bg-red-900/30 dark:text-red-500 dark:hover:bg-red-900/50"
                        onClick={() => onDelete(penghuni)}
                      >
                        Hapus
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default PenghuniTable;