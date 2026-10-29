'use client';

import React, { useState } from 'react';
import {
  Pencil,
  Trash2,
  Copy,
  Check,
  Calendar,
  CreditCard,
  Landmark,
  Tag,
  Hash,
  ArrowDownLeft,
  ArrowUpRight,
  Save,
  X,
  FileText,
} from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { Transaction, TransactionCategory } from '@/types';
import { formatINR } from '@/lib/formatters';
import { useDashboard } from '@/context/DashboardContext';

interface TransactionDetailModalProps {
  transaction: Transaction | null;
  isOpen: boolean;
  onClose: () => void;
}

export function TransactionDetailModal({
  transaction,
  isOpen,
  onClose,
}: TransactionDetailModalProps) {
  const { updateTransaction, deleteTransaction, expenseAccounts, incomeAccounts } = useDashboard();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<TransactionCategory>('OPEX');
  const [editAccount, setEditAccount] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRemarks, setEditRemarks] = useState('');

  // Sync edit form when opening or changing transaction
  const [prevTxId, setPrevTxId] = useState<string | null>(null);
  if (transaction && transaction.id !== prevTxId) {
    setPrevTxId(transaction.id);
    setEditName(transaction.name);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditCategory(transaction.category);
    setEditAccount(transaction.account || '');
    setEditPaymentMethod(transaction.paymentMethod || 'Bank Transfer');
    setEditDate(transaction.date);
    setEditRemarks(transaction.remarks || '');
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }

  if (!transaction) return null;

  const isExpense = transaction.amount < 0;
  const currentAccounts = isExpense ? expenseAccounts : incomeAccounts;

  const handleCopyId = async () => {
    try {
      await navigator.clipboard.writeText(transaction.id);
      setCopiedId(true);
      setTimeout(() => setCopiedId(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDelete = async () => {
    if (!transaction) return;
    setIsDeleting(true);
    const success = await deleteTransaction(transaction.id);
    setIsDeleting(false);
    if (success) {
      setShowDeleteConfirm(false);
      setIsEditing(false);
      onClose();
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(editAmount);
    if (!editName.trim() || isNaN(num) || num <= 0) return;

    setIsSaving(true);
    const finalAmount = isExpense ? -Math.abs(num) : Math.abs(num);

    const success = await updateTransaction(transaction.id, {
      name: editName.trim(),
      category: editCategory,
      amount: finalAmount,
      date: editDate.trim() || transaction.date,
      account: editAccount.trim() || transaction.account,
      paymentMethod: editPaymentMethod.trim() || transaction.paymentMethod,
      remarks: editRemarks.trim() || undefined,
    });

    setIsSaving(false);
    if (success) {
      setIsEditing(false);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => {
        setIsEditing(false);
        setShowDeleteConfirm(false);
        onClose();
      }}
      title={isEditing ? 'Edit Transaction' : 'Transaction Details'}
      maxWidth="500px"
    >
      <div style={{ padding: '20px 24px' }}>
        {/* Subheader Toolbar with Edit & Delete Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '18px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '4px 10px',
                borderRadius: '9999px',
                fontSize: '11.5px',
                fontWeight: 700,
                backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5',
                color: isExpense ? '#DC2626' : '#16A34A',
                border: isExpense ? '1px solid #FEE2E2' : '1px solid #D1FAE5',
              }}
            >
              {isExpense ? <ArrowDownLeft size={13} /> : <ArrowUpRight size={13} />}
              {isExpense ? 'Outflow (Expense)' : 'Inflow (Income)'}
            </span>
            <span
              style={{
                fontSize: '11.5px',
                fontWeight: 600,
                color: '#6B7280',
                backgroundColor: '#F3F4F6',
                padding: '4px 8px',
                borderRadius: '6px',
              }}
            >
              {transaction.category}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <button
              type="button"
              onClick={() => {
                setShowDeleteConfirm(false);
                setIsEditing(!isEditing);
              }}
              title={isEditing ? 'Cancel editing' : 'Edit transaction'}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                borderRadius: '8px',
                border: '1px solid #E5E7EB',
                backgroundColor: isEditing ? '#F3F4F6' : '#FFFFFF',
                color: isEditing ? '#111827' : '#374151',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              {isEditing ? (
                <>
                  <X size={13} />
                  <span>Cancel</span>
                </>
              ) : (
                <>
                  <Pencil size={13} color="var(--primary-accent)" />
                  <span>Edit</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => setShowDeleteConfirm(!showDeleteConfirm)}
              title="Delete transaction"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 11px',
                borderRadius: '8px',
                border: '1px solid #FEE2E2',
                backgroundColor: showDeleteConfirm ? '#FEE2E2' : '#FEF2F2',
                color: '#DC2626',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                boxShadow: '0 1px 2px rgba(0, 0, 0, 0.04)',
              }}
            >
              <Trash2 size={13} color="#DC2626" />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Delete Confirmation Alert Banner */}
        {showDeleteConfirm && (
          <div
            style={{
              padding: '12px 14px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              border: '1px solid #FCA5A5',
              marginBottom: '16px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trash2 size={15} color="#DC2626" />
              <div style={{ fontSize: '12.5px', fontWeight: 600, color: '#991B1B' }}>
                Are you sure you want to permanently delete this transaction?
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setShowDeleteConfirm(false)}
                style={{
                  padding: '5px 11px',
                  borderRadius: '6px',
                  border: '1px solid #D1D5DB',
                  backgroundColor: '#FFFFFF',
                  color: '#374151',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleDelete}
                style={{
                  padding: '5px 12px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  boxShadow: '0 1px 2px rgba(220, 38, 38, 0.25)',
                }}
              >
                {isDeleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        )}

        {/* View Mode */}
        {!isEditing ? (
          <div>
            {/* Amount Hero Card */}
            <div
              style={{
                padding: '20px',
                borderRadius: '14px',
                backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5',
                border: isExpense ? '1px solid #FEE2E2' : '1px solid #D1FAE5',
                textAlign: 'center',
                marginBottom: '20px',
              }}
            >
              <div
                style={{
                  fontSize: '12px',
                  fontWeight: 600,
                  color: isExpense ? '#991B1B' : '#065F46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '4px',
                }}
              >
                {isExpense ? 'Total Debit Amount' : 'Total Credit Amount'}
              </div>
              <div
                style={{
                  fontSize: '28px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: isExpense ? '#DC2626' : '#16A34A',
                }}
              >
                {formatINR(transaction.amount, { showSign: true, decimals: 2 })}
              </div>
            </div>

            {/* Transaction Title / Description */}
            <div style={{ marginBottom: '18px' }}>
              <div
                style={{
                  fontSize: '11.5px',
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '5px',
                }}
              >
                Description / Memo
              </div>
              <div
                style={{
                  fontSize: '15px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: '1.4',
                }}
              >
                {transaction.name}
              </div>
            </div>

            {/* Key-Value Details Grid */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '12px',
                paddingTop: '16px',
                borderTop: '1px solid #F3F4F6',
              }}
            >
              {/* Date */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <Calendar size={13} color="#9CA3AF" />
                  <span>TRANSACTION DATE</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                  {transaction.date}
                </div>
              </div>

              {/* Classification */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <Tag size={13} color="#9CA3AF" />
                  <span>CLASSIFICATION</span>
                </div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#111827' }}>
                  {transaction.category}
                </div>
              </div>

              {/* Account */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <Landmark size={13} color="#9CA3AF" />
                  <span>CHART OF ACCOUNT</span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={transaction.account || 'Standard General Account'}
                >
                  {transaction.account || 'Standard General Account'}
                </div>
              </div>

              {/* Payment Method */}
              <div
                style={{
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <CreditCard size={13} color="#9CA3AF" />
                  <span>PAYMENT METHOD</span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: 600,
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={transaction.paymentMethod || 'Bank Transfer'}
                >
                  {transaction.paymentMethod || 'Bank Transfer'}
                </div>
              </div>

              {/* Transaction ID */}
              <div
                style={{
                  gridColumn: 'span 2',
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Hash size={13} color="#9CA3AF" />
                    <span>RECORD ID</span>
                  </div>
                  <button
                    type="button"
                    onClick={handleCopyId}
                    style={{
                      border: 'none',
                      background: 'transparent',
                      color: copiedId ? '#16A34A' : '#9CA3AF',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '3px',
                      fontSize: '10.5px',
                    }}
                    title="Copy Transaction ID"
                  >
                    {copiedId ? <Check size={12} /> : <Copy size={12} />}
                    <span>{copiedId ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>
                <div
                  style={{
                    fontSize: '12px',
                    fontWeight: 600,
                    color: '#374151',
                    fontFamily: 'monospace',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                  title={transaction.id}
                >
                  {transaction.id}
                </div>
              </div>

              {/* Remarks */}
              <div
                style={{
                  gridColumn: 'span 2',
                  padding: '12px',
                  backgroundColor: '#F9FAFB',
                  borderRadius: '10px',
                  border: '1px solid #F3F4F6',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: '#6B7280',
                    marginBottom: '4px',
                  }}
                >
                  <FileText size={13} color="#9CA3AF" />
                  <span>REMARKS / NOTES</span>
                </div>
                <div
                  style={{
                    fontSize: '13px',
                    fontWeight: transaction.remarks ? 500 : 400,
                    color: transaction.remarks ? '#111827' : '#9CA3AF',
                    fontStyle: transaction.remarks ? 'normal' : 'italic',
                    lineHeight: 1.45,
                    wordBreak: 'break-word',
                  }}
                >
                  {transaction.remarks || 'No remarks added'}
                </div>
              </div>
            </div>

            {/* Footer Close Button */}
            <div
              style={{
                marginTop: '24px',
                display: 'flex',
                justifyContent: 'flex-end',
              }}
            >
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  onClose();
                }}
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSave}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <Input
                label="Description / Name"
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                placeholder="e.g. Office Rent, Consulting Fee"
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <Input
                  label="Amount (INR)"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={editAmount}
                  onChange={(e) => setEditAmount(e.target.value)}
                  placeholder="0.00"
                  required
                />

                <Input
                  label="Date"
                  type="text"
                  value={editDate}
                  onChange={(e) => setEditDate(e.target.value)}
                  placeholder="e.g. Nov 24, 2024"
                  required
                />
              </div>

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
                  Category
                </label>
                <select
                  value={editCategory}
                  onChange={(e) => setEditCategory(e.target.value as TransactionCategory)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                >
                  {isExpense ? (
                    <>
                      <option value="OPEX">OPEX (Operating Expense)</option>
                      <option value="CAPEX">CAPEX (Capital Expenditure)</option>
                      <option value="PROJECT">PROJECT (Direct Project Cost)</option>
                    </>
                  ) : (
                    <>
                      <option value="PROJECT">PROJECT (Revenue / Income)</option>
                      <option value="CONTRIBUTION">CONTRIBUTION (Partner Capital)</option>
                    </>
                  )}
                </select>
              </div>

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
                  Account / Classification
                </label>
                {currentAccounts.length > 0 ? (
                  <select
                    value={editAccount}
                    onChange={(e) => setEditAccount(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #E5E7EB',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      color: '#111827',
                      outline: 'none',
                    }}
                  >
                    {currentAccounts.map((acc) => {
                      const label = acc.accountLabel || `${acc.code} - ${acc.name}`;
                      return (
                        <option key={acc.id ?? label} value={label}>
                          {label}
                        </option>
                      );
                    })}
                  </select>
                ) : (
                  <Input
                    value={editAccount}
                    onChange={(e) => setEditAccount(e.target.value)}
                    placeholder="e.g. 6100 - Rent & Utilities"
                  />
                )}
              </div>

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
                  Payment Method
                </label>
                <select
                  value={editPaymentMethod}
                  onChange={(e) => setEditPaymentMethod(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #E5E7EB',
                    backgroundColor: '#FFFFFF',
                    fontSize: '13.5px',
                    color: '#111827',
                    outline: 'none',
                  }}
                >
                  <option value="Bank Transfer">Bank Transfer</option>
                  <option value="Corporate Card">Corporate Card</option>
                  <option value="Debit Card">Debit Card</option>
                  <option value="UPI Direct">UPI Direct</option>
                  <option value="UPI / Online">UPI / Online</option>
                  <option value="Cash">Cash</option>
                  <option value="Cheque">Cheque</option>
                </select>
              </div>

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
                  Remarks <span style={{ color: '#9CA3AF', fontWeight: 400 }}>(Optional)</span>
                </label>
                <Input
                  value={editRemarks}
                  onChange={(e) => setEditRemarks(e.target.value)}
                  placeholder="e.g. Approved by board, invoice #1029, tax deductible"
                />
              </div>

              {/* Form Buttons */}
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '10px',
                }}
              >
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(true)}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #FEE2E2',
                    backgroundColor: '#FEF2F2',
                    color: '#DC2626',
                    fontSize: '13px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  <Trash2 size={14} color="#DC2626" />
                  <span>Delete Transaction</span>
                </button>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={isSaving}>
                    <Save size={15} style={{ marginRight: '6px' }} />
                    {isSaving ? 'Saving...' : 'Save Changes'}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}
