import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';
import StarRating from '../../components/common/StarRating';
import { useToast } from '../../context/ToastContext';
import {
  Store,
  Star,
  Users,
  Calendar,
  Mail,
  MapPin,
  RefreshCw,
  ShoppingBag,
  TrendingUp,
  Award
} from 'lucide-react';

const OwnerDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [ratingsList, setRatingsList] = useState([]);
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  const { toastError, toastSuccess } = useToast();

  const fetchDashboard = useCallback(async () => {
    setLoading(true);
    try {
      const res = await api.get('/stores/owner/dashboard');
      if (res.data.success) {
        setDashboardData(res.data.data);
        setRatingsList(res.data.data.ratings || []);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch store dashboard.');
    } finally {
      setLoading(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  // Filter & sort the ratings table locally
  const filteredAndSortedRatings = React.useMemo(() => {
    let result = [...ratingsList];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (r) =>
          r.userName?.toLowerCase().includes(q) ||
          r.userEmail?.toLowerCase().includes(q) ||
          r.userAddress?.toLowerCase().includes(q)
      );
    }

    const isAsc = sortOrder === 'asc';
    result.sort((a, b) => {
      if (sortBy === 'rating') {
        return isAsc ? a.rating - b.rating : b.rating - a.rating;
      }
      if (sortBy === 'userName') {
        return isAsc
          ? a.userName.localeCompare(b.userName)
          : b.userName.localeCompare(a.userName);
      }
      if (sortBy === 'userEmail') {
        return isAsc
          ? a.userEmail.localeCompare(b.userEmail)
          : b.userEmail.localeCompare(a.userEmail);
      }
      // default createdAt
      return isAsc
        ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    return result;
  }, [ratingsList, search, sortBy, sortOrder]);

  const columns = [
    {
      key: 'userName',
      label: 'Customer Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.userName}</span>
          <span className="text-xs text-slate-400 max-w-xs truncate block" title={row.userAddress}>
            {row.userAddress}
          </span>
        </div>
      )
    },
    {
      key: 'userEmail',
      label: 'Customer Email',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 font-medium">{row.userEmail}</span>
      )
    },
    {
      key: 'rating',
      label: 'Submitted Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-2">
          <StarRating rating={row.rating} size="w-4 h-4" showValue={false} />
          <span className="font-bold text-slate-800 text-sm">{row.rating} / 5</span>
        </div>
      )
    },
    {
      key: 'createdAt',
      label: 'Submitted Date',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-1.5 text-slate-500 text-xs">
          <Calendar className="w-3.5 h-3.5 text-slate-400" />
          <span>{new Date(row.createdAt).toLocaleDateString()} at {new Date(row.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      )
    }
  ];

  if (loading && !dashboardData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="w-8 h-8 border-3 border-amber-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="text-sm font-medium text-slate-500">Loading your store dashboard...</p>
      </div>
    );
  }

  const store = dashboardData?.store;
  const avgRating = dashboardData?.averageRating;
  const totalReviews = dashboardData?.totalRatings || 0;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
            <ShoppingBag className="w-3.5 h-3.5 text-amber-600" />
            <span>Store Owner Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {store?.name || 'Your Store Dashboard'}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-2">
            <span className="flex items-center space-x-1">
              <Mail className="w-3.5 h-3.5 text-slate-400" />
              <span>{store?.email}</span>
            </span>
            <span className="flex items-center space-x-1">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span>{store?.address}</span>
            </span>
          </div>
        </div>

        <button
          onClick={fetchDashboard}
          disabled={loading}
          className="inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 active:scale-95 transition shadow-2xs self-start"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-amber-600' : ''}`} />
          <span>Refresh</span>
        </button>
      </div>

      {/* Prominent Average Rating Display & Total Reviews Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Prominent Rating Spotlight Card */}
        <div className="md:col-span-2 bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-amber-500/20 relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 rounded-full bg-white/5 pointer-events-none"></div>

          <div>
            <div className="flex items-center space-x-2 text-amber-100 text-xs font-semibold uppercase tracking-wider mb-2">
              <Award className="w-4 h-4 text-amber-200" />
              <span>Store Overall Reputation</span>
            </div>
            <h2 className="text-lg font-bold text-white">Average Customer Rating</h2>
          </div>

          <div className="my-6 flex flex-col sm:flex-row sm:items-baseline gap-4 sm:gap-6">
            <div className="text-5xl sm:text-6xl font-black tracking-tight text-white flex items-baseline space-x-1">
              <span>{avgRating !== null ? avgRating : '0.0'}</span>
              <span className="text-xl sm:text-2xl text-amber-200 font-bold">/ 5.0</span>
            </div>

            <div className="space-y-1">
              <StarRating
                rating={avgRating || 0}
                size="w-7 h-7"
                showValue={false}
              />
              <p className="text-xs text-amber-100 font-medium">
                {avgRating !== null
                  ? `Based on ${totalReviews} verified customer review${totalReviews !== 1 ? 's' : ''}`
                  : 'No customer reviews submitted yet.'}
              </p>
            </div>
          </div>

          <div className="pt-4 border-t border-white/10 flex items-center justify-between text-xs text-amber-100">
            <span>Customer satisfaction rating updated in real-time</span>
            <span className="font-semibold text-white">Live Status: Active</span>
          </div>
        </div>

        {/* Total Customers Reviewed Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center border border-amber-100 mb-4">
              <Users className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Total Ratings Submitted
            </p>
            <p className="text-4xl font-extrabold text-slate-900 mt-2">
              {totalReviews}
            </p>
            <p className="text-xs text-slate-500 mt-2 leading-relaxed">
              Every submitted customer review for your store is listed below with user credentials and timestamp.
            </p>
          </div>

          <div className="pt-4 border-t border-slate-100 text-xs text-slate-400">
            Updated automatically when users rate your store.
          </div>
        </div>
      </div>

      {/* Ratings Submissions Table */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Customer Ratings & Reviews
            </h3>
            <p className="text-xs text-slate-500">
              List of all users who have submitted ratings for your store.
            </p>
          </div>
        </div>

        <DataTable
          columns={columns}
          data={filteredAndSortedRatings}
          loading={loading}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder="Search customer by name, email, or address..."
          sortBy={sortBy}
          sortOrder={sortOrder}
          onSort={handleSort}
          emptyMessage="No customer reviews have been submitted for your store yet."
        />
      </div>
    </div>
  );
};

export default OwnerDashboard;
