'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Search,
  X,
  AlertCircle,
} from 'lucide-react';
import { Modal, Button } from '@/components/ui';
import { useDashboard } from '@/context/DashboardContext';

interface AccountItem {
  id: number;
  type: string;
  code: string;
  name: string;
  accountLabel?: string;
  category: 'EXPENSE' | 'INCOME';
}

export function AccountsManager() {
  const { expenseAccounts, incomeAccounts, refreshAccounts } = useDashboard();

  const [activeTab, setActiveTab] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingId, setEditingId] = useState<number | null>(null);

  // Form Fields
  const [formCategory, setFormCategory] = useState<'EXPENSE' | 'INCOME'>('EXPENSE');
  const [formType, setFormType] = useState('OPEX');
  const [formCode, setFormCode] = useState('');
  const [formName, setFormName] = useState('');

  // Status & Error
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete State
  const [deletingAccount, setDeletingAccount] = useState<AccountItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Normalize accounts from context
  const normalizedExpenses: AccountItem[] = useMemo(() => {
    return expenseAccounts.map((a) => ({
      id: Number(a.id),
      type: a.type,
      code: a.code,
      name: a.name,
      accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
      category: 'EXPENSE' as const,
    }));
  }, [expenseAccounts]);

  const normalizedIncomes: AccountItem[] = useMemo(() => {
    return incomeAccounts.map((a) => ({
      id: Number(a.id),
      type: a.type,
      code: a.code,
      name: a.name,
      accountLabel: a.accountLabel || `${a.code} - ${a.name}`,
      category: 'INCOME' as const,
    }));
  }, [incomeAccounts]);

  const currentList = activeTab === 'EXPENSE' ? normalizedExpenses : normalizedIncomes;

  // Filter accounts by search query
  const filteredList = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return currentList;
    return currentList.filter(
      (a) =>
        a.code.toLowerCase().includes(q) ||
        a.name.toLowerCase().includes(q) ||
        a.type.toLowerCase().includes(q) ||
        (a.accountLabel && a.accountLabel.toLowerCase().includes(q))
    );
  }, [currentList, searchQuery]);

  const openCreateModal = () => {
    setModalMode('create');
    setEditingId(null);
    setFormCategory(activeTab);
    setFormType(activeTab === 'EXPENSE' ? 'OPEX' : 'PROJECT');
    setFormCode('');
    setFormName('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (account: AccountItem) => {
    setModalMode('edit');
    setEditingId(account.id);
    setFormCategory(account.category);
    setFormType(account.type);
    setFormCode(account.code);
    setFormName(account.name);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleCategoryChange = (cat: 'EXPENSE' | 'INCOME') => {
    setFormCategory(cat);
    if (cat === 'EXPENSE') {
      if (formType === 'CONTRIBUTION') setFormType('OPEX');
    } else {
      if (formType === 'OPEX' || formType === 'CAPEX') setFormType('PROJECT');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanCode = formCode.trim().toUpperCase();
    const cleanName = formName.trim();

    if (!cleanCode || !cleanName) {
      setErrorMessage('Account Code and Name are required.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/accounts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            category: formCategory,
            type: formType,
            code: cleanCode,
            name: cleanName,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create account');
        }
      } else {
        const res = await fetch('/api/accounts', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: editingId,
            category: formCategory,
            type: formType,
            code: cleanCode,
            name: cleanName,
          }),
        });

        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update account');
        }
      }

      await refreshAccounts();
      setIsModalOpen(false);
    } catch (err) {
      setErrorMessage((err as Error).message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingAccount) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/accounts?id=${encodeURIComponent(deletingAccount.id)}&category=${encodeURIComponent(
          deletingAccount.category
        )}`,
        { method: 'DELETE' }
      );
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete account');
      }

      await refreshAccounts();
      setDeletingAccount(null);
    } catch (err) {
      alert((err as Error).message || 'Failed to delete account');
    } finally {
      setIsDeleting(false);
    }
  };

  const getTypeBadgeStyle = (type: string) => {
    switch (type) {
      case 'OPEX':
        return { bg: '#EFF6FF', text: '#2563EB', border: '#DBEAFE' };
      case 'CAPEX':
        return { bg: '#FAF5FF', text: '#9333EA', border: '#F3E8FF' };
      case 'PROJECT':
        return { bg: '#FFF7ED', text: '#EA580C', border: '#FFEDD5' };
      case 'CONTRIBUTION':
        return { bg: '#ECFDF5', text: '#16A34A', border: '#D1FAE5' };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', border: '#E5E7EB' };
    }
  };

  return (
    <div
      className="dashboard-card"
      style={{
        backgroundColor: '#FFFFFF',
        borderRadius: '16px',
        border: '1px solid #ECEEF2',
        boxShadow: '0 2px 6px rgba(0, 0, 0, 0.02)',
        padding: '24px',
      }}
    >
      {/* Header with Title and Add Account Button */}
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
          marginBottom: '20px',
        }}
      >
        <div>
          <h2
            className="section-card-title"
            style={{
              fontSize: '18px',
              fontWeight: 800,
              color: '#111827',
              letterSpacing: '-0.02em',
              margin: '0 0 4px 0',
            }}
          >
            Chart of Accounts Directory
          </h2>
          <p className="section-card-desc" style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Configure and manage operational Expense Accounts and Income Accounts
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '9px 16px',
            borderRadius: '10px',
            backgroundColor: 'var(--primary-accent)',
            color: '#FFFFFF',
            fontSize: '13px',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(255, 92, 22, 0.25)',
            transition: 'all 0.15s ease',
          }}
        >
          <Plus size={16} />
          <span>Add Account</span>
        </button>
      </div>

      {/* Control Bar: Tabs + Search */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
          marginBottom: '18px',
          paddingBottom: '16px',
          borderBottom: '1px solid #F3F4F6',
        }}
      >
        {/* Tabs */}
        <div
          style={{
            display: 'flex',
            backgroundColor: '#F3F4F6',
            borderRadius: '10px',
            padding: '4px',
            gap: '4px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setActiveTab('EXPENSE');
              setSearchQuery('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'EXPENSE' ? 700 : 500,
              backgroundColor: activeTab === 'EXPENSE' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'EXPENSE' ? '#DC2626' : '#6B7280',
              boxShadow: activeTab === 'EXPENSE' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Expense Accounts</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: activeTab === 'EXPENSE' ? '#FEE2E2' : '#E5E7EB',
                color: activeTab === 'EXPENSE' ? '#DC2626' : '#4B5563',
              }}
            >
              {normalizedExpenses.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('INCOME');
              setSearchQuery('');
            }}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              padding: '7px 14px',
              borderRadius: '8px',
              border: 'none',
              fontSize: '13px',
              fontWeight: activeTab === 'INCOME' ? 700 : 500,
              backgroundColor: activeTab === 'INCOME' ? '#FFFFFF' : 'transparent',
              color: activeTab === 'INCOME' ? '#16A34A' : '#6B7280',
              boxShadow: activeTab === 'INCOME' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <span>Income Accounts</span>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 700,
                padding: '1px 6px',
                borderRadius: '9999px',
                backgroundColor: activeTab === 'INCOME' ? '#D1FAE5' : '#E5E7EB',
                color: activeTab === 'INCOME' ? '#16A34A' : '#4B5563',
              }}
            >
              {normalizedIncomes.length}
            </span>
          </button>
        </div>

        {/* Search Input */}
        <div style={{ position: 'relative', width: '240px', maxWidth: '100%' }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              color: '#9CA3AF',
            }}
          />
          <input
            type="text"
            placeholder={`Search ${activeTab === 'EXPENSE' ? 'expense' : 'income'} accounts...`}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '8px 12px 8px 34px',
              borderRadius: '8px',
              border: '1px solid #E5E7EB',
              fontSize: '12.5px',
              outline: 'none',
              backgroundColor: '#FFFFFF',
              color: '#111827',
            }}
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'transparent',
                border: 'none',
                color: '#9CA3AF',
                cursor: 'pointer',
              }}
            >
              <X size={13} />
            </button>
          )}
        </div>
      </div>

      {/* Accounts Table */}
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: '#F9FAFB', borderBottom: '1px solid #E5E7EB' }}>
              <th
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  width: '100px',
                }}
              >
                Code
              </th>
              <th
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                }}
              >
                Account Name
              </th>
              <th
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  width: '140px',
                }}
              >
                Classification
              </th>
              <th
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                }}
              >
                Full Account Label
              </th>
              <th
                style={{
                  padding: '10px 14px',
                  fontSize: '12px',
                  fontWeight: 600,
                  color: '#6B7280',
                  textAlign: 'right',
                  width: '110px',
                }}
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredList.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  style={{
                    padding: '36px 16px',
                    textAlign: 'center',
                    color: '#9CA3AF',
                    fontSize: '13.5px',
                  }}
                >
                  {searchQuery.trim()
                    ? `No accounts matching "${searchQuery}".`
                    : `No ${activeTab === 'EXPENSE' ? 'expense' : 'income'} accounts configured.`}
                </td>
              </tr>
            ) : (
              filteredList.map((account) => {
                const badge = getTypeBadgeStyle(account.type);
                return (
                  <tr
                    key={account.id}
                    style={{
                      borderBottom: '1px solid #F3F4F6',
                      transition: 'background-color 0.15s ease',
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                    onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          fontFamily: 'monospace',
                          fontSize: '12.5px',
                          fontWeight: 700,
                          padding: '3px 7px',
                          borderRadius: '6px',
                          backgroundColor: '#F3F4F6',
                          color: '#1F2937',
                          border: '1px solid #E5E7EB',
                        }}
                      >
                        {account.code}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13.5px', fontWeight: 600, color: '#111827' }}>
                      {account.name}
                    </td>
                    <td style={{ padding: '12px 14px' }}>
                      <span
                        style={{
                          display: 'inline-block',
                          fontSize: '11.5px',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '6px',
                          backgroundColor: badge.bg,
                          color: badge.text,
                          border: `1px solid ${badge.border}`,
                        }}
                      >
                        {account.type}
                      </span>
                    </td>
                    <td style={{ padding: '12px 14px', fontSize: '13px', color: '#6B7280' }}>
                      {account.accountLabel || `${account.code} - ${account.name}`}
                    </td>
                    <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(account)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#FFFFFF',
                            color: '#4B5563',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Edit Account"
                        >
                          <Pencil size={13} />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingAccount(account)}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '28px',
                            height: '28px',
                            borderRadius: '6px',
                            border: '1px solid #FEE2E2',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Delete Account"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Account Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsModalOpen(false);
        }}
        title={modalMode === 'create' ? `Add ${formCategory === 'EXPENSE' ? 'Expense' : 'Income'} Account` : `Edit Account`}
        description={
          modalMode === 'create'
            ? 'Define a new account code and name for transaction classification'
            : `Update configuration for account #${editingId}`
        }
        maxWidth="460px"
        isStatic={true}
      >
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMessage && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FCA5A5',
                color: '#991B1B',
                fontSize: '12.5px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={15} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Category selection (only visible on create) */}
            {modalMode === 'create' && (
              <div>
                <label
                  style={{
                    display: 'block',
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#374151',
                    marginBottom: '6px',
                  }}
                >
                  Account Category
                </label>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('EXPENSE')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: formCategory === 'EXPENSE' ? '2px solid #DC2626' : '1px solid #D1D5DB',
                      backgroundColor: formCategory === 'EXPENSE' ? '#FEF2F2' : '#FFFFFF',
                      color: formCategory === 'EXPENSE' ? '#DC2626' : '#4B5563',
                    }}
                  >
                    Expense Account
                  </button>
                  <button
                    type="button"
                    onClick={() => handleCategoryChange('INCOME')}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      border: formCategory === 'INCOME' ? '2px solid #16A34A' : '1px solid #D1D5DB',
                      backgroundColor: formCategory === 'INCOME' ? '#ECFDF5' : '#FFFFFF',
                      color: formCategory === 'INCOME' ? '#16A34A' : '#4B5563',
                    }}
                  >
                    Income Account
                  </button>
                </div>
              </div>
            )}

            {/* Classification Type */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Classification Type
              </label>
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                }}
              >
                {formCategory === 'EXPENSE' ? (
                  <>
                    <option value="OPEX">OPEX (Operating Expenditure)</option>
                    <option value="CAPEX">CAPEX (Capital Expenditure)</option>
                    <option value="PROJECT">PROJECT (Direct Project Cost)</option>
                  </>
                ) : (
                  <>
                    <option value="PROJECT">PROJECT (Service Revenue / Direct Income)</option>
                    <option value="CONTRIBUTION">CONTRIBUTION (Partner Capital Contribution)</option>
                  </>
                )}
              </select>
            </div>

            {/* Account Code */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Account Code <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. 6100, MKT, SAL"
                value={formCode}
                onChange={(e) => setFormCode(e.target.value.toUpperCase())}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  fontFamily: 'monospace',
                  fontWeight: 600,
                  color: '#111827',
                  outline: 'none',
                }}
              />
              <span style={{ fontSize: '11.5px', color: '#8A92A6', marginTop: '3px', display: 'block' }}>
                Unique short identifier (alphanumeric, e.g. 6100 or OP-DEV)
              </span>
            </div>

            {/* Account Name */}
            <div>
              <label
                style={{
                  display: 'block',
                  fontSize: '13px',
                  fontWeight: 600,
                  color: '#374151',
                  marginBottom: '6px',
                }}
              >
                Account Name <span style={{ color: '#DC2626' }}>*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. Office Rent, Marketing & Advertising"
                value={formName}
                onChange={(e) => setFormName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #D1D5DB',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                }}
              />
            </div>
          </div>

          {/* Modal Actions */}
          <div
            style={{
              marginTop: '24px',
              display: 'flex',
              justifyContent: 'flex-end',
              gap: '10px',
            }}
          >
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Saving...'
                : modalMode === 'create'
                ? 'Create Account'
                : 'Save Changes'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deletingAccount}
        onClose={() => {
          if (!isDeleting) setDeletingAccount(null);
        }}
        title="Delete Account"
        maxWidth="420px"
        isStatic={true}
      >
        <div style={{ padding: '20px 24px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '12px',
              padding: '12px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FEE2E2',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={20} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 700, color: '#991B1B' }}>
                Permanently delete account {deletingAccount?.code}?
              </div>
              <div style={{ fontSize: '12.5px', color: '#B91C1C', marginTop: '4px', lineHeight: 1.4 }}>
                &ldquo;{deletingAccount?.name}&rdquo; will be permanently removed from your chart of accounts.
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '20px' }}>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingAccount(null)}
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13px',
                fontWeight: 600,
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(220, 38, 38, 0.3)',
              }}
            >
              {isDeleting ? 'Deleting...' : 'Yes, Delete'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
