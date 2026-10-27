'use client';

import React, { useState } from 'react';
import { Plus } from 'lucide-react';
import { useDashboard } from '@/context/DashboardContext';
import { Modal, Button, Input } from '@/components/ui';
import { TransactionCategory, TransactionStatus } from '@/types';

export function AddTransactionModal() {
  const {
    isAddTransactionOpen,
    setIsAddTransactionOpen,
    addTransaction,
    currencySymbol,
  } = useDashboard();

  const [name, setName] = useState('');
  const [category, setCategory] = useState<TransactionCategory>('Food & Dining');
  const [amount, setAmount] = useState('');
  const [status, setStatus] = useState<TransactionStatus>('Completed');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name || isNaN(num)) return;

    addTransaction({
      name,
      category,
      amount: -Math.abs(num),
      status,
      date: 'Today',
    });

    setName('');
    setAmount('');
    setIsAddTransactionOpen(false);
  };

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={() => setIsAddTransactionOpen(false)}
      title="Add New Expense"
      description="Record an expense to update your live budget"
      maxWidth="460px"
    >
      <form onSubmit={handleSubmit} style={{ padding: '24px' }}>
        <Input
          label="Transaction Description"
          placeholder="e.g. Starbucks Coffee, Target, Uber"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
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
              value={category}
              onChange={(e) => setCategory(e.target.value as TransactionCategory)}
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#111827',
                backgroundColor: '#FFFFFF',
                outline: 'none',
              }}
            >
              <option value="Food & Dining">Food & Dining</option>
              <option value="Shopping">Shopping</option>
              <option value="Entertainment">Entertainment</option>
              <option value="Transport">Transport</option>
              <option value="Others">Others</option>
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
              Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              placeholder="450.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                borderRadius: '12px',
                border: '1px solid #D1D5DB',
                fontSize: '14px',
                color: '#111827',
                outline: 'none',
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: '24px' }}>
          <label
            style={{
              display: 'block',
              fontSize: '13px',
              fontWeight: 600,
              color: '#374151',
              marginBottom: '6px',
            }}
          >
            Status
          </label>
          <div style={{ display: 'flex', gap: '12px' }}>
            {(['Completed', 'Pending'] as const).map((st) => {
              const isSelected = status === st;
              return (
                <button
                  type="button"
                  key={st}
                  onClick={() => setStatus(st)}
                  style={{
                    flex: 1,
                    padding: '8px 12px',
                    borderRadius: '8px',
                    fontSize: '13px',
                    fontWeight: 600,
                    border: isSelected ? '1px solid var(--primary-accent)' : '1px solid #E5E7EB',
                    backgroundColor: isSelected ? 'var(--primary-accent-light)' : '#FAFAFC',
                    color: isSelected ? 'var(--primary-accent)' : '#4B5563',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {st}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddTransactionOpen(false)}
          >
            Cancel
          </Button>
          <Button type="submit" variant="primary" leftIcon={<Plus size={16} strokeWidth={2.5} />}>
            Add Expense
          </Button>
        </div>
      </form>
    </Modal>
  );
}
