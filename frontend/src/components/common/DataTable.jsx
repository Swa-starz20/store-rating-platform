import React from 'react';
import { ChevronUp, ChevronDown, ChevronsUpDown, ChevronLeft, ChevronRight, Search } from 'lucide-react';

/**
 * Reusable DataTable component with sorting, searching, and pagination
 * @param {Array} columns - [{ key, label, sortable, render }]
 * @param {Array} data - Array of row objects
 * @param {string} search - current search query
 * @param {function} onSearchChange - callback for search query change
 * @param {string} searchPlaceholder - placeholder string
 * @param {string} sortBy - current sort column key
 * @param {string} sortOrder - 'asc' | 'desc'
 * @param {function} onSort - callback(columnKey)
 * @param {Object} pagination - { page, limit, total, totalPages }
 * @param {function} onPageChange - callback(newPage)
 * @param {boolean} loading - loading state
 * @param {ReactNode} extraFilters - optional additional filter elements
 */
const DataTable = ({
  columns = [],
  data = [],
  search = '',
  onSearchChange,
  searchPlaceholder = 'Search records...',
  sortBy = '',
  sortOrder = 'asc',
  onSort,
  pagination,
  onPageChange,
  loading = false,
  extraFilters = null,
  emptyMessage = 'No records found matching your criteria.'
}) => {
  const handleSortClick = (columnKey, sortable) => {
    if (!sortable || !onSort) return;
    onSort(columnKey);
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
      {/* Top Bar: Search and Extra Filters */}
      {(onSearchChange || extraFilters) && (
        <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex flex-col md:flex-row md:items-center justify-between gap-3">
          {onSearchChange && (
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={searchPlaceholder}
                className="w-full pl-10 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-2xs"
              />
            </div>
          )}
          {extraFilters && (
            <div className="flex flex-wrap items-center gap-2.5">
              {extraFilters}
            </div>
          )}
        </div>
      )}

      {/* Table Container */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-sm">
          <thead>
            <tr className="bg-slate-50/80 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {columns.map((col) => (
                <th
                  key={col.key}
                  onClick={() => handleSortClick(col.key, col.sortable)}
                  className={`py-3.5 px-4 ${
                    col.sortable ? 'cursor-pointer hover:bg-slate-100 select-none' : ''
                  } ${col.headerClassName || ''}`}
                >
                  <div className="inline-flex items-center space-x-1.5">
                    <span>{col.label}</span>
                    {col.sortable && (
                      <span className="text-slate-400">
                        {sortBy === col.key ? (
                          sortOrder === 'asc' ? (
                            <ChevronUp className="w-3.5 h-3.5 text-brand-600 font-bold" />
                          ) : (
                            <ChevronDown className="w-3.5 h-3.5 text-brand-600 font-bold" />
                          )
                        ) : (
                          <ChevronsUpDown className="w-3.5 h-3.5" />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <div className="inline-flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-brand-500 border-t-transparent rounded-full animate-spin"></div>
                    <span className="text-sm font-medium">Loading data...</span>
                  </div>
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-12 text-center text-slate-400">
                  <p className="text-sm font-medium">{emptyMessage}</p>
                </td>
              </tr>
            ) : (
              data.map((row, index) => (
                <tr
                  key={row.id || index}
                  className="hover:bg-slate-50/80 transition-colors duration-100 group"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`py-3.5 px-4 text-slate-700 ${col.cellClassName || ''}`}>
                      {col.render ? col.render(row, index) : row[col.key] || '—'}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      {pagination && pagination.totalPages > 1 && (
        <div className="p-4 border-t border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500">
          <div>
            Showing <span className="font-semibold text-slate-700">{(pagination.page - 1) * pagination.limit + 1}</span> to{' '}
            <span className="font-semibold text-slate-700">
              {Math.min(pagination.page * pagination.limit, pagination.total)}
            </span>{' '}
            of <span className="font-semibold text-slate-700">{pagination.total}</span> entries
          </div>
          <div className="flex items-center space-x-1">
            <button
              onClick={() => onPageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <div className="px-3 py-1 font-medium text-slate-700">
              Page {pagination.page} of {pagination.totalPages}
            </div>
            <button
              onClick={() => onPageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              className="p-1.5 rounded-lg border border-slate-200 bg-white text-slate-600 hover:bg-slate-100 disabled:opacity-40 disabled:cursor-not-allowed transition"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DataTable;
