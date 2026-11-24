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
  Store,
  PlusCircle,
  Filter,
  UserCheck,
  UserPlus,
  RefreshCw,
  Mail,
  MapPin,
  Star
} from 'lucide-react';

const StoreManagement = () => {
  const [stores, setStores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [pagination, setPagination] = useState({ page: 1, limit: 10, total: 0, totalPages: 1 });

  // Filtering & Sorting
  const [search, setSearch] = useState('');
  const [nameFilter, setNameFilter] = useState('');
  const [addressFilter, setAddressFilter] = useState('');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modals & Available Owners
  const [addStoreModalOpen, setAddStoreModalOpen] = useState(false);
  const [availableOwners, setAvailableOwners] = useState([]);
  const [ownerMode, setOwnerMode] = useState('existing'); // 'existing' | 'new'

  // Store Form State
  const [storeForm, setStoreForm] = useState({
    name: '',
    email: '',
    address: '',
    ownerId: '',
    newOwner: {
      name: '',
      email: '',
      password: '',
      address: ''
    }
  });
  const [formErrors, setFormErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

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
      toastError(err.response?.data?.message || 'Failed to fetch stores.');
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

  const fetchAvailableOwners = async () => {
    try {
      const res = await api.get('/users/available-owners');
      if (res.data.success) {
        setAvailableOwners(res.data.data);
        if (res.data.data.length > 0 && !storeForm.ownerId) {
          setStoreForm((prev) => ({ ...prev, ownerId: res.data.data[0].id }));
        }
      }
    } catch (err) {
      console.error('Failed to load available owners:', err);
    }
  };

  useEffect(() => {
    fetchStores();
  }, [fetchStores]);

  useEffect(() => {
    if (addStoreModalOpen) {
      fetchAvailableOwners();
    }
  }, [addStoreModalOpen]);

  const handleSort = (columnKey) => {
    if (sortBy === columnKey) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(columnKey);
      setSortOrder('asc');
    }
  };

  const handleAddStoreSubmit = async (e) => {
    e.preventDefault();
    const errors = {};

    const nameErr = validateName(storeForm.name);
    if (nameErr) errors.name = nameErr;

    const emailErr = validateEmail(storeForm.email);
    if (emailErr) errors.email = emailErr;

    const addrErr = validateAddress(storeForm.address);
    if (addrErr) errors.address = addrErr;

    if (ownerMode === 'existing') {
      if (!storeForm.ownerId) {
        errors.ownerId = 'Please select a Store Owner.';
      }
    } else {
      const ownerNameErr = validateName(storeForm.newOwner.name);
      if (ownerNameErr) errors.ownerName = ownerNameErr;

      const ownerEmailErr = validateEmail(storeForm.newOwner.email);
      if (ownerEmailErr) errors.ownerEmail = ownerEmailErr;

      const ownerPassErr = validatePassword(storeForm.newOwner.password);
      if (ownerPassErr) errors.ownerPassword = ownerPassErr;

      const ownerAddrErr = validateAddress(storeForm.newOwner.address);
      if (ownerAddrErr) errors.ownerAddress = ownerAddrErr;
    }

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        name: storeForm.name.trim(),
        email: storeForm.email.trim(),
        address: storeForm.address.trim()
      };

      if (ownerMode === 'existing') {
        payload.ownerId = storeForm.ownerId;
      } else {
        payload.owner = {
          name: storeForm.newOwner.name.trim(),
          email: storeForm.newOwner.email.trim(),
          password: storeForm.newOwner.password,
          address: storeForm.newOwner.address.trim()
        };
      }

      const res = await api.post('/stores', payload);
      if (res.data.success) {
        toastSuccess(`Store "${res.data.data.name}" registered successfully.`);
        setAddStoreModalOpen(false);
        setStoreForm({
          name: '',
          email: '',
          address: '',
          ownerId: '',
          newOwner: { name: '', email: '', password: '', address: '' }
        });
        setFormErrors({});
        fetchStores();
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to register store.';
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

  const columns = [
    {
      key: 'name',
      label: 'Store Name',
      sortable: true,
      render: (row) => (
        <div>
          <span className="font-semibold text-slate-900 block">{row.name}</span>
          {row.owner && (
            <span className="text-[11px] text-slate-400">
              Owner: <span className="text-slate-600 font-medium">{row.owner.name}</span>
            </span>
          )}
        </div>
      )
    },
    {
      key: 'email',
      label: 'Email Address',
      sortable: true,
      render: (row) => <span className="text-slate-600 font-medium">{row.email}</span>
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
      key: 'rating',
      label: 'Overall Rating',
      sortable: true,
      render: (row) => (
        <div className="flex items-center space-x-2">
          {row.averageRating !== null ? (
            <>
              <StarRating rating={row.averageRating} size="w-4 h-4" showValue={false} />
              <span className="font-bold text-slate-800 text-sm">
                {row.averageRating}
              </span>
              <span className="text-xs text-slate-400">
                ({row.totalRatings} review{row.totalRatings !== 1 ? 's' : ''})
              </span>
            </>
          ) : (
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-500 italic">
              No ratings yet
            </span>
          )}
        </div>
      )
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Store Management
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Manage stores, monitor customer ratings, and link store owners.
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
            onClick={() => setAddStoreModalOpen(true)}
            className="inline-flex items-center space-x-2 px-4 py-2 text-xs font-semibold rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white shadow-md shadow-emerald-500/20 active:scale-95 transition"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Add Store</span>
          </button>
        </div>
      </div>

      {/* Advanced Filter Panel */}
      {showAdvancedFilters && (
        <div className="p-4 bg-white rounded-2xl border border-slate-200/80 shadow-xs grid grid-cols-1 sm:grid-cols-3 gap-3 animate-fadeIn">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-1">
              Filter by Name
            </label>
            <input
              type="text"
              placeholder="e.g. Bakery"
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
              Filter by Address
            </label>
            <input
              type="text"
              placeholder="e.g. High Street"
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

      {/* Store DataTable */}
      <DataTable
        columns={columns}
        data={stores}
        loading={loading}
        search={search}
        onSearchChange={(val) => {
          setSearch(val);
          setPagination((prev) => ({ ...prev, page: 1 }));
        }}
        searchPlaceholder="Quick search stores by name or address..."
        sortBy={sortBy}
        sortOrder={sortOrder}
        onSort={handleSort}
        pagination={pagination}
        onPageChange={(p) => setPagination((prev) => ({ ...prev, page: p }))}
      />

      {/* Add Store Modal */}
      <Modal
        isOpen={addStoreModalOpen}
        onClose={() => setAddStoreModalOpen(false)}
        title="Register New Store"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleAddStoreSubmit} className="space-y-5">
          {/* Section 1: Store Information */}
          <div className="space-y-3.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              1. Store Details
            </h4>

            <Input
              id="store-name"
              label="Store Name"
              required
              placeholder="e.g. The Grand Artisan Bakery Shop"
              value={storeForm.name}
              onChange={(e) => {
                setStoreForm({ ...storeForm, name: e.target.value });
                if (formErrors.name) setFormErrors({ ...formErrors, name: null });
              }}
              error={formErrors.name}
              minLength={20}
              maxLength={60}
              showCharCount={true}
              hint="Strict requirement: 20 to 60 characters."
            />

            <Input
              id="store-email"
              label="Store Contact Email"
              type="email"
              required
              placeholder="store@example.com"
              value={storeForm.email}
              onChange={(e) => {
                setStoreForm({ ...storeForm, email: e.target.value });
                if (formErrors.email) setFormErrors({ ...formErrors, email: null });
              }}
              error={formErrors.email}
            />

            <Input
              id="store-address"
              label="Store Address"
              type="textarea"
              rows={2}
              required
              placeholder="e.g. 102 High Street, Downtown District, Metropolis"
              value={storeForm.address}
              onChange={(e) => {
                setStoreForm({ ...storeForm, address: e.target.value });
                if (formErrors.address) setFormErrors({ ...formErrors, address: null });
              }}
              error={formErrors.address}
              maxLength={400}
              showCharCount={true}
            />
          </div>

          {/* Section 2: Owner Assignment Mode */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              2. Store Owner Assignment
            </h4>

            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setOwnerMode('existing')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  ownerMode === 'existing'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <UserCheck className={`w-4 h-4 ${ownerMode === 'existing' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">Assign Existing Owner</span>
                  <span className="text-[10px] text-slate-500">Select unassigned Store Owner</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setOwnerMode('new')}
                className={`p-3 rounded-xl border text-left transition flex items-center space-x-2.5 ${
                  ownerMode === 'new'
                    ? 'border-brand-500 bg-brand-50/50 text-brand-900 ring-2 ring-brand-500/10'
                    : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                }`}
              >
                <UserPlus className={`w-4 h-4 ${ownerMode === 'new' ? 'text-brand-600' : 'text-slate-400'}`} />
                <div>
                  <span className="text-xs font-bold block">Create New Owner</span>
                  <span className="text-[10px] text-slate-500">Creates owner in single transaction</span>
                </div>
              </button>
            </div>

            {ownerMode === 'existing' ? (
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Select Store Owner <span className="text-rose-500">*</span>
                </label>
                {availableOwners.length > 0 ? (
                  <select
                    value={storeForm.ownerId}
                    onChange={(e) => {
                      setStoreForm({ ...storeForm, ownerId: e.target.value });
                      if (formErrors.ownerId) setFormErrors({ ...formErrors, ownerId: null });
                    }}
                    className="w-full px-3.5 py-2.5 text-sm bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition"
                  >
                    <option value="">-- Choose an available Store Owner --</option>
                    {availableOwners.map((owner) => (
                      <option key={owner.id} value={owner.id}>
                        {owner.name} ({owner.email})
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-800">
                    No unassigned Store Owner accounts found. Please choose <strong>Create New Owner</strong> above.
                  </div>
                )}
                {formErrors.ownerId && (
                  <p className="text-xs text-rose-600 mt-1">{formErrors.ownerId}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3 bg-slate-50/70 p-4 rounded-xl border border-slate-200/80">
                <Input
                  id="owner-name"
                  label="Owner Full Name"
                  required
                  placeholder="e.g. Arthur Pendelton Kingsman"
                  value={storeForm.newOwner.name}
                  onChange={(e) => setStoreForm({
                    ...storeForm,
                    newOwner: { ...storeForm.newOwner, name: e.target.value }
                  })}
                  error={formErrors.ownerName}
                  minLength={20}
                  maxLength={60}
                  showCharCount={true}
                  hint="Must be between 20 and 60 characters long."
                />

                <Input
                  id="owner-email"
                  label="Owner Login Email"
                  type="email"
                  required
                  placeholder="owner@example.com"
                  value={storeForm.newOwner.email}
                  onChange={(e) => setStoreForm({
                    ...storeForm,
                    newOwner: { ...storeForm.newOwner, email: e.target.value }
                  })}
                  error={formErrors.ownerEmail}
                />

                <Input
                  id="owner-password"
                  label="Owner Initial Password"
                  type="password"
                  required
                  placeholder="8 to 16 characters with uppercase and special symbol"
                  value={storeForm.newOwner.password}
                  onChange={(e) => setStoreForm({
                    ...storeForm,
                    newOwner: { ...storeForm.newOwner, password: e.target.value }
                  })}
                  error={formErrors.ownerPassword}
                  maxLength={16}
                  hint="8–16 chars, 1+ uppercase letter, 1+ special character."
                />

                <Input
                  id="owner-address"
                  label="Owner Physical Address"
                  type="textarea"
                  rows={2}
                  required
                  placeholder="e.g. 12 King George Way, Downtown"
                  value={storeForm.newOwner.address}
                  onChange={(e) => setStoreForm({
                    ...storeForm,
                    newOwner: { ...storeForm.newOwner, address: e.target.value }
                  })}
                  error={formErrors.ownerAddress}
                  maxLength={400}
                  showCharCount={true}
                />
              </div>
            )}
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setAddStoreModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-5 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-sm transition disabled:opacity-50"
            >
              {submitting ? 'Creating...' : 'Register Store'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default StoreManagement;
