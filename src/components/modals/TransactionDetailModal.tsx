'use client';

import React, { useState, useMemo } from 'react';
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
  Clock,
  ShieldCheck,
  FolderKanban,
} from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { Transaction, TransactionCategory } from '@/types';
import { formatINR } from '@/lib/formatters';
import { useDashboard } from '@/context/DashboardContext';
import { useAuth } from '@/context/AuthContext';

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
  const { updateTransaction, deleteTransaction, expenseAccounts, incomeAccounts, projects } = useDashboard();
  const { isAdmin } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editAmount, setEditAmount] = useState('');
  const [editCategory, setEditCategory] = useState<TransactionCategory>('OPEX');
  const [editAccount, setEditAccount] = useState('');
  const [editProjectId, setEditProjectId] = useState('');
  const [editProjectName, setEditProjectName] = useState('');
  const [editPaymentMethod, setEditPaymentMethod] = useState('');
  const [editDate, setEditDate] = useState('');
  const [editRemarks, setEditRemarks] = useState('');
  const [editIsApproved, setEditIsApproved] = useState(false);

  // Sync edit form when opening or changing transaction
  const [prevTxId, setPrevTxId] = useState<string | null>(null);
  if (transaction && transaction.id !== prevTxId) {
    setPrevTxId(transaction.id);
    setEditName(transaction.name);
    setEditAmount(Math.abs(transaction.amount).toString());
    setEditCategory(transaction.category);
    setEditAccount(transaction.account || '');
    setEditProjectId(transaction.projectId ? String(transaction.projectId) : '');
    setEditProjectName(transaction.projectName || '');
    setEditPaymentMethod(transaction.paymentMethod || 'Bank Transfer');
    setEditDate(transaction.date);
    setEditRemarks(transaction.remarks || '');
    setEditIsApproved(Boolean(transaction.is_approved));
    setIsEditing(false);
    setShowDeleteConfirm(false);
  }

  const isEditProjectRevenue = useMemo(() => {
    return Boolean(
      editAccount && (editAccount.includes('4000') || editAccount.toLowerCase().includes('project revenue'))
    );
  }, [editAccount]);

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

  const handleApprove = async () => {
    if (!transaction) return;
    setIsApproving(true);
    await updateTransaction(transaction.id, { is_approved: true });
    setIsApproving(false);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(editAmount);
    if (!editName.trim() || isNaN(num) || num <= 0) return;

    setIsSaving(true);
    const finalAmount = isExpense ? -Math.abs(num) : Math.abs(num);

    const chosenProject = isEditProjectRevenue
      ? projects.find((p) => String(p.id) === String(editProjectId))
      : null;

    const updates: Partial<Transaction> = {
      name: editName.trim(),
      category: editCategory,
      amount: finalAmount,
      date: editDate.trim() || transaction.date,
      account: editAccount.trim() || transaction.account,
      paymentMethod: editPaymentMethod.trim() || transaction.paymentMethod,
      remarks: editRemarks.trim() || undefined,
      projectId: isEditProjectRevenue ? (chosenProject ? chosenProject.id : null) : null,
      projectName: isEditProjectRevenue ? (chosenProject ? chosenProject.name : null) : null,
    };

    if (isAdmin) {
      updates.is_approved = editIsApproved;
    }

    const success = await updateTransaction(transaction.id, updates);

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
      isStatic={true}
    >
      <div style={{ padding: '16px 20px' }}>
        {/* Subheader Toolbar with Edit & Delete Buttons */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '14px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
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
            {transaction.is_approved ? (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#16A34A',
                  backgroundColor: '#ECFDF5',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #D1FAE5',
                }}
              >
                <Check size={12} strokeWidth={2.5} />
                <span>Approved</span>
              </span>
            ) : (
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  fontSize: '11.5px',
                  fontWeight: 600,
                  color: '#D97706',
                  backgroundColor: '#FFFBEB',
                  padding: '4px 8px',
                  borderRadius: '6px',
                  border: '1px solid #FDE68A',
                }}
              >
                <Clock size={12} strokeWidth={2.5} />
                <span>Pending Approval</span>
              </span>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {isAdmin && !transaction.is_approved && !isEditing && (
              <button
                type="button"
                onClick={handleApprove}
                disabled={isApproving}
                title="Approve this transaction (Admin only)"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '6px 12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: '#16A34A',
                  color: '#FFFFFF',
                  fontSize: '12px',
                  fontWeight: 600,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  boxShadow: '0 1px 2px rgba(22, 163, 74, 0.25)',
                }}
              >
                <Check size={13} strokeWidth={2.5} />
                <span>{isApproving ? 'Approving...' : 'Approve'}</span>
              </button>
            )}
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
                padding: '14px 18px',
                borderRadius: '12px',
                backgroundColor: isExpense ? '#FEF2F2' : '#ECFDF5',
                border: isExpense ? '1px solid #FEE2E2' : '1px solid #D1FAE5',
                textAlign: 'center',
                marginBottom: '14px',
              }}
            >
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 600,
                  color: isExpense ? '#991B1B' : '#065F46',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '2px',
                }}
              >
                {isExpense ? 'Total Debit Amount' : 'Total Credit Amount'}
              </div>
              <div
                style={{
                  fontSize: '24px',
                  fontWeight: 800,
                  letterSpacing: '-0.02em',
                  color: isExpense ? '#DC2626' : '#16A34A',
                }}
              >
                {formatINR(transaction.amount, { showSign: true, decimals: 2 })}
              </div>
            </div>

            {/* Transaction Title / Description */}
            <div style={{ marginBottom: '14px' }}>
              <div
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  color: '#6B7280',
                  textTransform: 'uppercase',
                  letterSpacing: '0.04em',
                  marginBottom: '4px',
                }}
              >
                Description / Memo
              </div>
              <div
                style={{
                  fontSize: '14.5px',
                  fontWeight: 700,
                  color: '#111827',
                  lineHeight: '1.35',
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
                gap: '10px',
                paddingTop: '12px',
                borderTop: '1px solid #F3F4F6',
              }}
            >
              {/* Date */}
              <div
                style={{
                  padding: '10px 12px',
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

              {/* Approval Status */}
              <div
                style={{
                  padding: '10px 12px',
                  backgroundColor: transaction.is_approved ? '#F0FDF4' : '#FFFBEB',
                  borderRadius: '10px',
                  border: transaction.is_approved ? '1px solid #DCFCE7' : '1px solid #FEF3C7',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    fontSize: '11px',
                    fontWeight: 600,
                    color: transaction.is_approved ? '#166534' : '#92400E',
                    marginBottom: '4px',
                  }}
                >
                  <ShieldCheck size={13} color={transaction.is_approved ? '#16A34A' : '#D97706'} />
                  <span>APPROVAL STATUS</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '6px' }}>
                  <div style={{ fontSize: '13px', fontWeight: 700, color: transaction.is_approved ? '#16A34A' : '#D97706' }}>
                    {transaction.is_approved ? 'Approved' : 'Pending Approval'}
                  </div>
                  {isAdmin && !transaction.is_approved && (
                    <button
                      type="button"
                      disabled={isApproving}
                      onClick={handleApprove}
                      style={{
                        padding: '3px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#16A34A',
                        color: '#FFFFFF',
                        border: 'none',
                        fontSize: '11px',
                        fontWeight: 600,
                        cursor: 'pointer',
                        boxShadow: '0 1px 2px rgba(22, 163, 74, 0.2)',
                      }}
                    >
                      {isApproving ? '...' : 'Approve Now'}
                    </button>
                  )}
                </div>
              </div>

              {/* Classification */}
              <div
                style={{
                  padding: '10px 12px',
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
                  padding: '10px 12px',
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

              {/* Tagged Project (Active when project is tagged or account is 4000 Revenue) */}
              {(Boolean(transaction.projectName) || Boolean(transaction.account && (transaction.account.includes('4000') || transaction.account.toLowerCase().includes('project revenue')))) && (
                <div
                  style={{
                    gridColumn: 'span 2',
                    padding: '10px 12px',
                    backgroundColor: '#F0FDF4',
                    borderRadius: '10px',
                    border: '1px solid #DCFCE7',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '11px',
                      fontWeight: 600,
                      color: '#166534',
                      marginBottom: '4px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <FolderKanban size={13} color="#16A34A" />
                      <span>TAGGED PROJECT (4000 REVENUE)</span>
                    </div>
                  </div>
                  <div
                    style={{
                      fontSize: '13.5px',
                      fontWeight: 700,
                      color: transaction.projectName ? '#15803D' : '#6B7280',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    {transaction.projectName ? (
                      <>
                        <span>📁 {transaction.projectName}</span>
                        {transaction.projectId && (
                          <span
                            style={{
                              fontSize: '11px',
                              fontWeight: 600,
                              padding: '2px 7px',
                              borderRadius: '5px',
                              backgroundColor: '#DCFCE7',
                              color: '#166534',
                              border: '1px solid #BBF7D0',
                            }}
                          >
                            Project #{transaction.projectId}
                          </span>
                        )}
                      </>
                    ) : (
                      <span style={{ fontStyle: 'italic', fontSize: '12.5px', color: '#6B7280' }}>
                        No specific project tagged yet
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Payment Method */}
              <div
                style={{
                  padding: '10px 12px',
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
                  padding: '10px 12px',
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
                  padding: '10px 12px',
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
                    lineHeight: 1.4,
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
                marginTop: '16px',
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
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
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

              {/* Project Selection / Tagging (Active when Account is 4000 - Project Revenue) */}
              {isEditProjectRevenue && (
                <div
                  style={{
                    padding: '12px 14px',
                    borderRadius: '10px',
                    backgroundColor: '#F0FDF4',
                    border: '1.5px solid #BBF7D0',
                  }}
                >
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      fontSize: '13px',
                      fontWeight: 700,
                      color: '#166534',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                      <FolderKanban size={14} color="#16A34A" />
                      Associated Project (4000)
                    </span>
                    <span style={{ fontSize: '11px', color: '#15803D', fontWeight: 600 }}>Revenue Tagging</span>
                  </label>
                  <select
                    value={editProjectId}
                    onChange={(e) => {
                      const pid = e.target.value;
                      setEditProjectId(pid);
                      const chosen = projects.find((p) => String(p.id) === pid);
                      setEditProjectName(chosen ? chosen.name : '');
                    }}
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #86EFAC',
                      backgroundColor: '#FFFFFF',
                      fontSize: '13.5px',
                      fontWeight: 600,
                      color: editProjectId ? '#14532D' : '#4B5563',
                      outline: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="">-- No project tagged --</option>
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        📁 {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}

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

              {isAdmin && (
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '12px 14px',
                    backgroundColor: editIsApproved ? '#ECFDF5' : '#FFFBEB',
                    borderRadius: '8px',
                    border: editIsApproved ? '1px solid #D1FAE5' : '1px solid #FDE68A',
                  }}
                >
                  <input
                    type="checkbox"
                    id="editIsApproved"
                    checked={editIsApproved}
                    onChange={(e) => setEditIsApproved(e.target.checked)}
                    style={{ width: '16px', height: '16px', cursor: 'pointer', accentColor: '#16A34A' }}
                  />
                  <label
                    htmlFor="editIsApproved"
                    style={{
                      fontSize: '13px',
                      fontWeight: 600,
                      color: editIsApproved ? '#065F46' : '#92400E',
                      cursor: 'pointer',
                    }}
                  >
                    Approved by Administrator
                  </label>
                </div>
              )}

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
