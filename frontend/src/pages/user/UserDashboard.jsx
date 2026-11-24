import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import { useToast } from '../../context/ToastContext';
import { useAuth } from '../../context/AuthContext';
import {
  Store,
  Star,
  Search,
  Filter,
  RefreshCw,
  Sparkles,
  MapPin,
  CheckCircle2
} from 'lucide-react';

const UserDashboard = () => {
  const { user } = useAuth();
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  const [sortBy, setSortBy] = useState('name');
  const [sortOrder, setSortOrder] = useState('asc');

  // Rating in progress
  const [ratingStoreId, setRatingStoreId] = useState(null);

  const { toastSuccess, toastError } = useToast();

  const fetchStores = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        name: nameFilter || undefined,
        address: addressFilter || undefined,
        sortBy,
        sortOrder
      };

      const res = await api.get('/stores', { params });
      if (res.data.success) {
        setStores(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch stores directory.');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    nameFilter,
    addressFilter,
    sortBy,
    sortOrder,
    toastError
  ]);

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  // Submit or modify rating with immediate live UI update
  const handleRateStore = async (storeId, newRatingValue) => {
    setRatingStoreId(storeId);
    try {
      const res = await api.post('/ratings', {
        storeId,
        rating: newRatingValue
      });

      if (res.data.success) {
        const { userRating, averageRating, totalRatings } = res.data.data;

        // Instant optimistic live update of stores state
        setStores((prevStores) =>
          prevStores.map((s) => {
            if (s.id === storeId) {
              return {
                ...s,
                userRating,
                averageRating,
                totalRatings
              };
            }
            return s;
          })
        );

        toastSuccess(`Rating submitted: ${newRatingValue} star${newRatingValue > 1 ? 's' : ''}!`);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to submit rating.');
    } finally {
      setRatingStoreId(null);
    }
  };

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-bold text-slate-900 block text-sm">{row.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">ID: {row.id.substring(0, 8)}...</span>
        </div>
      )
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (row) => (
        <div className="flex items-start space-x-1.5 text-slate-600 max-w-sm">
          <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
          <span className="truncate block" title={row.address}>
            {row.address}
          </span>
        </div>
      )
    },
    {
      key: 'rating',
      label: 'Overall Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.averageRating !== null ? (
            <>
              <StarRating rating={row.averageRating} size="w-4 h-4" showValue={false} />
              <span className="font-bold text-slate-900 text-sm">{row.averageRating}</span>
              <span className="text-xs text-slate-400">({row.totalRatings} reviews)</span>
            </>
          ) : (
            <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 italic">
              No ratings yet
            </span>
          )}
        </div>
      )
    },
    {
      key: 'userRating',
      label: 'Your Rating (Click to Rate)',
      sortable: true,
      render: (row) => {
        const isRatingThis = ratingStoreId === row.id;

        return (
          <div className="flex flex-col space-y-1">
            <div className="flex items-center space-x-2">
              <StarRating
                rating={row.userRating || 0}
                interactive={true}
                disabled={isRatingThis}
                onRate={(starVal) => handleRateStore(row.id, starVal)}
                size="w-5 h-5"
                showValue={false}
              />
              {isRatingThis && (
                <div className="w-3.5 h-3.5 border-2 border-brand-600 border-t-transparent rounded-full animate-spin"></div>
              )}
            </div>

            <div className="text-[11px]">
              {row.userRating ? (
                <span className="text-emerald-700 font-semibold inline-flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>You rated {row.userRating} ★ (Click star to change)</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  Not Rated — Click a star to submit
                </span>
              )}
            </div>
          </div>
        );
      }
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-brand-600 to-indigo-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-brand-500/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-xs text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Customer Rating Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Store Directory & Reviews
          </h1>
          <p className="text-sm text-brand-100 mt-1 max-w-xl">
            Browse registered stores in your area, inspect community ratings, and submit or modify your ratings anytime.
          </p>
        </div>

        <button
          onClick={fetchStores}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-4 py-2.5 text-xs font-bold rounded-xl bg-white text-brand-700 hover:bg-brand-50 active:scale-95 transition shadow-sm"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Directory</span>
        </button>
      </div>

      {/* Filter and Search Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div className="text-sm text-slate-500">
          Showing <span className="font-bold text-slate-800">{stores.length}</span> stores
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition self-start sm:self-auto ${
            showFilters
              ? 'bg-brand-50 border-brand-300 text-brand-700'
              : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
          }`}
        >
          <Filter className="w-3.5 h-3.5" />
          <span>Filters by Name & Address</span>
        </button>
      </div>

      {showFilters && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Store Name
            </label>
            <input
              type="text"
              placeholder="e.g. Organic, Bakery..."
              value={nameFilter}
              onChange={(e) => {
                setNameFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Store Address
            </label>
            <input
              type="text"
              placeholder="e.g. Boulevard, Street..."
              value={addressFilter}
              onChange={(e) => {
                setAddressFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div className="flex items-end">
            <button
              onClick={() => {
                setSearch('');
                setNameFilter('');
                setAddressFilter('');
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Stores DataTable */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        searchPlaceholder="Search stores by name or address..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
        emptyMessage="No stores found matching your query."
      />
    </div>
  );
};

export default UserDashboard;
