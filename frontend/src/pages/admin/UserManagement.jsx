import React, { useState, useEffect, useCallback } from 'react';
import api from '../../api/client';
import DataTable from '../../components/common/DataTable';
import Modal from '../../components/common/Modal';
import Input from '../../components/common/Input';
import StarRating from '../../components/common/StarRating';
import { useToast } from '../../context/ToastContext';
import {
  validateName,
  validateEmail,
  validatePassword,
  validateAddress
} from '../../utils/validators';
import {
  UserPlus,
  Eye,
  Shield,
  ShoppingBag,
  UserCheck,
  Filter,
  RefreshCw,
  Store,
  Calendar,
  Mail,
  MapPin
} from 'lucide-react';

const UserManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [emailFilter, setEmailFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals
  const [addUserModalOpen, setAddUserModalOpen] = useState(false);
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedUserDetails, setSelectedUserDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);

  // New User Form State
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    address: '',
    role: 'USER'
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  const { toastSuccess, toastError } = useToast();

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit,
        search,
        role: roleFilter || undefined,
        name: nameFilter || undefined,
        email: emailFilter || undefined,
        address: addressFilter || undefined,
        sortBy,
        sortOrder
      };

      const res = await api.get('/users', { params });
      if (res.data.success) {
        setUsers(res.data.data);
        setPagination(res.data.pagination);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to fetch users list.');
    } finally {
      setLoading(false);
    }
  }, [
    pagination.page,
    pagination.limit,
    search,
    roleFilter,
    nameFilter,
    emailFilter,
    addressFilter,
    sortBy,
    sortOrder,
    toastError
  ]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const handleViewDetails = async (userId) => {
    setDetailsModalOpen(true);
    setLoadingDetails(true);
    try {
      const res = await api.get(`/users/${userId}`);
      if (res.data.success) {
        setSelectedUserDetails(res.data.data);
      }
    } catch (err) {
      toastError(err.response?.data?.message || 'Failed to load user details.');
      setDetailsModalOpen(false);
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleFormChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (formErrors[field]) {
      setFormErrors((prev) => ({ ...prev, [field]: null }));
    }
  };

  const handleAddUserSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const nameErr = validateName(formData.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(formData.email);
    if (emailErr) errors.email = emailErr;

    const passErr = validatePassword(formData.password);
    if (passErr) errors.password = passErr;

    const addrErr = validateAddress(formData.address);
    if (addrErr) errors.address = addrErr;

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const res = await api.post('/users', {
        name: formData.name.trim(),
        email: formData.email.trim(),
        password: formData.password,
        address: formData.address.trim(),
        role: formData.role
      });

      if (res.data.success) {
        toastSuccess(`User "${res.data.data.name}" created successfully.`);
        setAddUserModalOpen(false);
        setFormData({
          name: '',
          email: '',
          password: '',
          address: '',
          role: 'USER'
        });
        setFormErrors({});
        fetchUsers();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to create user.';
      toastError(msg);
      if (err.response?.data?.errors) {
        const bErrors = {};
        err.response.data.errors.forEach((e) => {
          bErrors[e.field] = e.message;
        });
        setFormErrors(bErrors);
      }
    } finally {
      setSubmitting(false);
    }
  };

  const clearFilters = () => {
    setSearch('');
    setRoleFilter('');
    setNameFilter('');
    setEmailFilter('');
    setAddressFilter('');
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const columns = [
    {
      key: 'name',
      label: 'Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          <span className="text-[11px] text-slate-400 font-mono">ID: {row.id.substring(0, 8)}...</span>
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 font-medium">{row.email}</span>
      )
    },
    {
      key: 'address',
      label: 'Address',
      sortable: true,
      render: (row) => (
        <span className="text-slate-600 max-w-xs truncate block" title={row.address}>
          {row.address}
        </span>
      )
    },
    {
      key: 'role',
      label: 'Role',
      sortable: true,
      render: (row) => {
        const roleBadges = {
          ADMIN: {
            label: 'ADMIN',
            bg: 'bg-rose-50 text-rose-700 border-rose-200',
            icon: Shield
          },
          STORE_OWNER: {
            label: 'STORE OWNER',
            bg: 'bg-amber-50 text-amber-700 border-amber-200',
            icon: ShoppingBag
          },
          USER: {
            label: 'USER',
            bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
            icon: UserCheck
          }
        };
        const cfg = roleBadges[row.role] || roleBadges.USER;
        const Icon = cfg.icon;

        return (
          <div className="flex flex-col items-start gap-1">
            <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${cfg.bg}`}>
              <Icon className="w-3 h-3" />
              <span>{cfg.label}</span>
            </span>
            {row.role === 'STORE_OWNER' && row.store && (
              <span className="text-[11px] text-amber-800 font-medium">
                Store: {row.store.name} ({row.store.averageRating !== null ? `${row.store.averageRating} ★` : 'No ratings'})
              </span>
            )}
          </div>
        );
      }
    },
    {
      key: 'actions',
      label: 'Actions',
      sortable: false,
      render: (row) => (
        <button
          onClick={() => handleViewDetails(row.id)}
          className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 rounded-lg transition"
          title="View Details"
        >
          <Eye className="w-3.5 h-3.5" />
          <span>View Details</span>
        </button>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            User Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Browse, filter, inspect, and register users across all roles.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`inline-flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold rounded-xl border transition ${
              showAdvancedFilters
                ? 'bg-brand-50 border-brand-300 text-brand-700'
                : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            <Filter className="w-3.5 h-3.5" />
            <span>Filters</span>
          </button>

          <button
            onClick={() => setAddUserModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-brand-600 hover:bg-brand-700 text-white shadow-md shadow-brand-500/20 active:scale-95 transition"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add User</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Role
            </label>
            <select
              value={roleFilter}
              onChange={(e) => {
                setRoleFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            >
              <option value="">All Roles</option>
              <option value="ADMIN">Admin</option>
              <option value="STORE_OWNER">Store Owner</option>
              <option value="USER">Normal User</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bennett"
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
              Filter by Email
            </label>
            <input
              type="text"
              placeholder="e.g. @stores.com"
              value={emailFilter}
              onChange={(e) => {
                setEmailFilter(e.target.value);
                setPagination((prev) => ({ ...prev, page: 1 }));
              }}
              className="w-full text-xs py-2 px-3 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Address
            </label>
            <input
              type="text"
              placeholder="e.g. Metropolis"
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
              onClick={clearFilters}
              className="w-full py-2 px-3 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
            >
              Reset Filters
            </button>
          </div>
        </div>
      )}

      {/* Users DataTable */}
      <DataTable
        columns={columns}
        data={users}
        loading={loading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        searchPlaceholder="Quick search by name, email, or address..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Add User Modal */}
      <Modal
        isOpen={addUserModalOpen}
        onClose={() => setAddUserModalOpen(false)}
        title="Add New User Account"
      >
        <form onSubmit={handleAddUserSubmit} className="space-y-4">
          <Input
            id="modal-name"
            label="Full Name"
            required
            placeholder="e.g. Alexander Montgomery Bennett"
            value={formData.name}
            onChange={(e) => handleFormChange('name', e.target.value)}
            error={formErrors.name}
            minLength={20}
            maxLength={60}
            showCharCount={true}
            hint="Strict requirement: 20 to 60 characters."
          />

          <Input
            id="modal-email"
            label="Email Address"
            type="email"
            required
            placeholder="user@example.com"
            value={formData.email}
            onChange={(e) => handleFormChange('email', e.target.value)}
            error={formErrors.email}
          />

          <Input
            id="modal-password"
            label="Initial Password"
            type="password"
            required
            placeholder="8 to 16 characters with uppercase and special symbol"
            value={formData.password}
            onChange={(e) => handleFormChange('password', e.target.value)}
            error={formErrors.password}
            maxLength={16}
            hint="8–16 characters, 1+ uppercase letter, 1+ special character."
          />

          <Input
            id="modal-address"
            label="Address"
            type="textarea"
            rows={2}
            required
            placeholder="Enter physical address..."
            value={formData.address}
            onChange={(e) => handleFormChange('address', e.target.value)}
            error={formErrors.address}
            maxLength={400}
            showCharCount={true}
          />

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Assigned Role <span className="text-rose-500">*</span>
            </label>
            <select
              value={formData.role}
              onChange={(e) => handleFormChange('role', e.target.value)}
              className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition shadow-2xs"
            >
              <option value="USER">Normal User (Consumer / Reviewer)</option>
              <option value="STORE_OWNER">Store Owner (Store Manager)</option>
              <option value="ADMIN">System Administrator</option>
            </select>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddUserModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Create User'}
            </button>
          </div>
        </form>
      </Modal>

      {/* User Details Modal (Displays Store & Dynamically Calculated Average Rating for Store Owners) */}
      <Modal
        isOpen={detailsModalOpen}
        onClose={() => {
          setDetailsModalOpen(false);
          setSelectedUserDetails(null);
        }}
        title="User Account Details"
        maxWidth="max-w-2xl"
      >
        {loadingDetails || !selectedUserDetails ? (
          <div className="py-12 text-center text-slate-400">
            <div className="w-6 h-6 border-2 border-brand-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
            <p className="text-xs font-medium">Loading user profile...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* User Basic Info */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 flex items-start justify-between">
              <div>
                <h4 className="text-base font-bold text-slate-900">{selectedUserDetails.name}</h4>
                <div className="flex items-center space-x-3 text-xs text-slate-500 mt-1">
                  <span className="flex items-center space-x-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{selectedUserDetails.email}</span>
                  </span>
                  <span className="flex items-center space-x-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Member since {new Date(selectedUserDetails.createdAt).toLocaleDateString()}</span>
                  </span>
                </div>
                <div className="flex items-start space-x-1 text-xs text-slate-600 mt-2">
                  <MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 flex-shrink-0" />
                  <span>{selectedUserDetails.address}</span>
                </div>
              </div>

              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                selectedUserDetails.role === 'ADMIN'
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : selectedUserDetails.role === 'STORE_OWNER'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : 'bg-emerald-50 text-emerald-700 border-emerald-200'
              }`}>
                {selectedUserDetails.role}
              </span>
            </div>

            {/* Dynamic Store & Rating Section for STORE_OWNER */}
            {selectedUserDetails.role === 'STORE_OWNER' && (
              <div className="border border-amber-200 bg-amber-50/40 rounded-2xl p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-amber-100 pb-3">
                  <div className="flex items-center space-x-2">
                    <Store className="w-5 h-5 text-amber-700" />
                    <h5 className="text-sm font-bold text-amber-900">
                      Associated Store & Rating Analytics
                    </h5>
                  </div>
                  {selectedUserDetails.store && (
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                      Active Store
                    </span>
                  )}
                </div>

                {selectedUserDetails.store ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="bg-white p-3 rounded-xl border border-amber-100">
                        <span className="text-slate-400 block mb-0.5">Store Name</span>
                        <span className="font-semibold text-slate-800 text-sm">{selectedUserDetails.store.name}</span>
                      </div>
                      <div className="bg-white p-3 rounded-xl border border-amber-100">
                        <span className="text-slate-400 block mb-0.5">Store Email</span>
                        <span className="font-semibold text-slate-800">{selectedUserDetails.store.email}</span>
                      </div>
                    </div>

                    {/* Prominent Average Rating Display */}
                    <div className="bg-white p-4 rounded-xl border border-amber-100 flex items-center justify-between">
                      <div>
                        <span className="text-xs text-slate-500 font-medium block">
                          Store Average Customer Rating
                        </span>
                        <div className="mt-1 flex items-center space-x-3">
                          <StarRating
                            rating={selectedUserDetails.store.averageRating}
                            size="w-6 h-6"
                            showValue={false}
                          />
                          <span className="text-2xl font-black text-slate-800">
                            {selectedUserDetails.store.averageRating !== null
                              ? `${selectedUserDetails.store.averageRating} / 5.0`
                              : 'No ratings yet'}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-400 block">Total Reviews</span>
                        <span className="text-lg font-bold text-slate-800">
                          {selectedUserDetails.store.totalRatings}
                        </span>
                      </div>
                    </div>

                    {/* Recent reviews list */}
                    {selectedUserDetails.store.ratings && selectedUserDetails.store.ratings.length > 0 && (
                      <div>
                        <p className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                          Recent Submitted Ratings ({selectedUserDetails.store.ratings.length})
                        </p>
                        <div className="max-h-40 overflow-y-auto space-y-1.5 divide-y divide-slate-100 bg-white p-3 rounded-xl border border-amber-100">
                          {selectedUserDetails.store.ratings.map((r) => (
                            <div key={r.id} className="pt-1.5 first:pt-0 flex items-center justify-between text-xs">
                              <div>
                                <span className="font-semibold text-slate-800">{r.user.name}</span>
                                <span className="text-slate-400 ml-2">({r.user.email})</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <span className="font-bold text-amber-600">{r.rating} ★</span>
                                <span className="text-[10px] text-slate-400">
                                  {new Date(r.createdAt).toLocaleDateString()}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-xs text-amber-800 italic">
                    No store is currently linked to this Store Owner account. You can assign one in Store Management.
                  </p>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={() => setDetailsModalOpen(false)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default UserManagement;
