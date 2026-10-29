"use client";

import React, { useState } from "react";
import { usePathname } from "next/navigation";
import { Plus, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useDashboard } from "@/context/DashboardContext";
import { Modal, Button, Input } from "@/components/ui";
import { TransactionCategory } from "@/types";

type EntryType = "expense" | "income";

export function AddTransactionModal() {
  const pathname = usePathname();
  const {
    isAddTransactionOpen,
    setIsAddTransactionOpen,
    addTransactionType,
    addTransaction,
    currencySymbol,
    expenseAccounts,
    incomeAccounts,
  } = useDashboard();

  const [entryType, setEntryType] = useState<EntryType>("expense");
  const [name, setName] = useState("");
  const [selectedAccount, setSelectedAccount] = useState<string>("");
  const [category, setCategory] = useState<TransactionCategory>("OPEX");
  const [amount, setAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Bank Transfer");
  const [remarks, setRemarks] = useState("");

  const currentAccounts =
    entryType === "expense" ? expenseAccounts : incomeAccounts;

  const handleEntryTypeChange = (type: EntryType) => {
    setEntryType(type);
    const list = type === "expense" ? expenseAccounts : incomeAccounts;
    if (list.length > 0) {
      const first = list[0];
      setSelectedAccount(`${first.type}-${first.code}`);
      setCategory(first.category);
      setName(first.name);
    } else {
      setSelectedAccount("");
      setCategory(type === "expense" ? "OPEX" : "CONTRIBUTION");
      setName("");
    }
  };

  const [prevOpen, setPrevOpen] = useState(false);
  const [prevAccountsLength, setPrevAccountsLength] = useState(0);

  // Synchronize modal open state and entry type
  if (isAddTransactionOpen && !prevOpen) {
    setPrevOpen(true);
    const targetType: EntryType =
      addTransactionType || (pathname === "/incomes" ? "income" : "expense");
    setEntryType(targetType);
    const list = targetType === "expense" ? expenseAccounts : incomeAccounts;
    if (list.length > 0) {
      const first = list[0];
      setSelectedAccount(`${first.type}-${first.code}`);
      setCategory(first.category);
      setName(first.name);
    } else {
      setSelectedAccount("");
      setCategory(targetType === "expense" ? "OPEX" : "CONTRIBUTION");
      setName("");
    }
  } else if (!isAddTransactionOpen && prevOpen) {
    setPrevOpen(false);
  }

  // Synchronize selectedAccount when accounts load asynchronously from DB
  if (
    currentAccounts.length > 0 &&
    currentAccounts.length !== prevAccountsLength
  ) {
    setPrevAccountsLength(currentAccounts.length);
    const exists = currentAccounts.some(
      (a) => `${a.type}-${a.code}` === selectedAccount,
    );
    if (!selectedAccount || !exists) {
      const first = currentAccounts[0];
      setSelectedAccount(`${first.type}-${first.code}`);
      setCategory(first.category);
      if (!name) setName(first.name);
    }
  }

  const handleAccountChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setSelectedAccount(val);
    const found = currentAccounts.find((a) => `${a.type}-${a.code}` === val);
    if (found) {
      setCategory(found.category);
      if (
        !name ||
        currentAccounts.some(
          (a) => a.name === name || name.startsWith("Capital Contribution"),
        )
      ) {
        setName(found.name);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const num = parseFloat(amount);
    if (!name || isNaN(num) || num <= 0) return;

    // Positive for income, negative for expense
    const finalAmount =
      entryType === "expense" ? -Math.abs(num) : Math.abs(num);

    const found = currentAccounts.find(
      (a) => `${a.type}-${a.code}` === selectedAccount,
    );
    const accountLabel = found
      ? found.code !== "OT" &&
        found.code !== "FD" &&
        found.code !== "TR" &&
        found.code !== "SH" &&
        found.code !== "EN" &&
        found.code !== "INV"
        ? `${found.code} - ${found.name}`
        : found.name
      : selectedAccount;

    addTransaction({
      name,
      category,
      amount: finalAmount,
      date: "Today",
      account: accountLabel,
      paymentMethod,
      remarks: remarks.trim() || undefined,
    });

    setName("");
    setAmount("");
    setRemarks("");
    setIsAddTransactionOpen(false);
  };

  return (
    <Modal
      isOpen={isAddTransactionOpen}
      onClose={() => setIsAddTransactionOpen(false)}
      title={entryType === "expense" ? "Log New Expense" : "Record New Income"}
      description="Record an entry to keep your chart of accounts"
      maxWidth="480px"
    >
      <form onSubmit={handleSubmit} style={{ padding: "24px" }}>
        {/* Toggle Type */}
        <div
          style={{
            display: "flex",
            backgroundColor: "#F3F4F6",
            borderRadius: "12px",
            padding: "4px",
            marginBottom: "20px",
            gap: "4px",
          }}
        >
          <button
            type="button"
            onClick={() => handleEntryTypeChange("expense")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 12px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor:
                entryType === "expense" ? "#FFFFFF" : "transparent",
              color: entryType === "expense" ? "#DC2626" : "#6B7280",
              boxShadow:
                entryType === "expense" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <ArrowUpRight
              size={16}
              color={entryType === "expense" ? "#DC2626" : "#6B7280"}
            />
            Expense (Debit)
          </button>
          <button
            type="button"
            onClick={() => handleEntryTypeChange("income")}
            style={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              padding: "9px 12px",
              borderRadius: "9px",
              fontSize: "13px",
              fontWeight: 700,
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s ease",
              backgroundColor:
                entryType === "income" ? "#FFFFFF" : "transparent",
              color: entryType === "income" ? "#16A34A" : "#6B7280",
              boxShadow:
                entryType === "income" ? "0 1px 3px rgba(0,0,0,0.08)" : "none",
            }}
          >
            <ArrowDownRight
              size={16}
              color={entryType === "income" ? "#16A34A" : "#6B7280"}
            />
            Income (Credit)
          </button>
        </div>

        {/* Account Selector */}
        <div style={{ marginBottom: "16px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            Account / Classification
          </label>
          <select
            value={selectedAccount}
            onChange={handleAccountChange}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "12px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              color: "#111827",
              backgroundColor: "#FFFFFF",
              outline: "none",
            }}
          >
            {Array.from(new Set(currentAccounts.map((a) => a.type))).map(
              (group) => (
                <optgroup key={group} label={group}>
                  {currentAccounts
                    .filter((a) => a.type === group)
                    .map((acc) => (
                      <option
                        key={`${acc.type}-${acc.code}`}
                        value={`${acc.type}-${acc.code}`}
                      >
                        {acc.code !== "OT" &&
                        acc.code !== "FD" &&
                        acc.code !== "TR" &&
                        acc.code !== "SH" &&
                        acc.code !== "EN" &&
                        acc.code !== "INV"
                          ? `${acc.code} - ${acc.name}`
                          : acc.name}
                      </option>
                    ))}
                </optgroup>
              ),
            )}
          </select>
        </div>

        {/* Transaction Description */}
        <Input
          label="Transaction Description"
          placeholder={
            entryType === "expense"
              ? "e.g. Salaries & Wages - Oct"
              : "e.g. Capital Contribution"
          }
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
        />

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "12px",
            marginBottom: "16px",
          }}
        >
          {/* Amount */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Amount ({currencySymbol})
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              placeholder="50000.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid #D1D5DB",
                fontSize: "14px",
                color: "#111827",
                outline: "none",
              }}
            />
          </div>

          {/* Payment Method */}
          <div>
            <label
              style={{
                display: "block",
                fontSize: "13px",
                fontWeight: 600,
                color: "#374151",
                marginBottom: "6px",
              }}
            >
              Payment Method
            </label>
            <select
              value={paymentMethod}
              onChange={(e) => setPaymentMethod(e.target.value)}
              style={{
                width: "100%",
                padding: "11px 14px",
                borderRadius: "12px",
                border: "1px solid #D1D5DB",
                fontSize: "14px",
                color: "#111827",
                backgroundColor: "#FFFFFF",
                outline: "none",
              }}
            >
              <option value="Bank Transfer">Bank Transfer</option>
              <option value="Corporate Card">Corporate Card</option>
              <option value="Debit Card">Debit Card</option>
              <option value="UPI Direct">UPI Direct</option>
              <option value="Cheque">Cheque</option>
              <option value="Cash">Cash</option>
            </select>
          </div>
        </div>

        {/* Remarks (Optional) */}
        <div style={{ marginBottom: "20px" }}>
          <label
            style={{
              display: "block",
              fontSize: "13px",
              fontWeight: 600,
              color: "#374151",
              marginBottom: "6px",
            }}
          >
            Remarks{" "}
            <span style={{ color: "#9CA3AF", fontWeight: 400 }}>
              (Optional)
            </span>
          </label>
          <input
            type="text"
            placeholder="Add note, invoice #, vendor ref, etc."
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            style={{
              width: "100%",
              padding: "11px 14px",
              borderRadius: "12px",
              border: "1px solid #D1D5DB",
              fontSize: "14px",
              color: "#111827",
              outline: "none",
            }}
          />
        </div>

        {/* Actions */}
        <div
          style={{ display: "flex", justifyContent: "flex-end", gap: "10px" }}
        >
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsAddTransactionOpen(false)}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            leftIcon={<Plus size={16} strokeWidth={2.5} />}
            style={{
              backgroundColor: entryType === "expense" ? "#DC2626" : "#16A34A",
              borderColor: entryType === "expense" ? "#DC2626" : "#16A34A",
              color: "#FFFFFF",
              boxShadow:
                entryType === "expense"
                  ? "0 4px 14px rgba(220, 38, 38, 0.35)"
                  : "0 4px 14px rgba(22, 163, 74, 0.35)",
            }}
          >
            {entryType === "expense" ? "Log Expense" : "Log Income"}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
