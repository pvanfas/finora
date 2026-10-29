"use client";

import React, { useState } from "react";
import { DashboardShell } from "@/components/layout/DashboardShell";
import { SpendingBreakdown } from "@/components/dashboard/SpendingBreakdown";
import { Download, FileText, CheckCircle2, FileDown } from "lucide-react";
import { Button } from "@/components/ui";
import { useDashboard } from "@/context/DashboardContext";
import { exportCsvReport, exportPdfReport } from "@/lib";

export default function ReportsPage() {
  const { transactions } = useDashboard();
  const [downloadingCsvId, setDownloadingCsvId] = useState<string | null>(null);
  const [downloadingPdfId, setDownloadingPdfId] = useState<string | null>(null);

  const reports = [
    {
      id: "all-time",
      title: "Complete Transaction Ledger",
      type: "ALL" as const,
      count: transactions.length,
    },
    {
      id: "expenses-audit",
      title: "Categorized Expense Audit",
      type: "EXPENSE" as const,
      count: transactions.filter((t) => t.amount < 0).length,
    },
    {
      id: "revenue-inflows",
      title: "Inflows & Capital Contributions",
      type: "INCOME" as const,
      count: transactions.filter((t) => t.amount > 0).length,
    },
  ];

  const handleDownloadCsv = (
    type: "ALL" | "EXPENSE" | "INCOME",
    title: string,
    id: string,
  ) => {
    setDownloadingCsvId(id);
    try {
      exportCsvReport(transactions, type, title);
    } finally {
      setTimeout(() => setDownloadingCsvId(null), 1500);
    }
  };

  const handleDownloadPdf = async (
    type: "ALL" | "EXPENSE" | "INCOME",
    title: string,
    id: string,
  ) => {
    setDownloadingPdfId(id);
    try {
      await exportPdfReport(transactions, type, title);
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setTimeout(() => setDownloadingPdfId(null), 1200);
    }
  };

  return (
    <DashboardShell>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Header */}
        <div className="page-header-responsive">
          <h1
            style={{
              fontSize: "24px",
              fontWeight: 800,
              color: "#111827",
              letterSpacing: "-0.02em",
            }}
          >
            Financial Reports
          </h1>
        </div>

        {/* Main Content Grid */}
        <div className="responsive-two-col-grid">
          {/* Available Statements Card */}
          <div
            className="dashboard-card"
            style={{
              backgroundColor: "#FFFFFF",
              borderRadius: "16px",
              border: "1px solid #ECEEF2",
            }}
          >
            <h2
              style={{
                fontSize: "17px",
                fontWeight: 700,
                color: "#111827",
                marginBottom: "16px",
                letterSpacing: "-0.02em",
              }}
            >
              Available Statements
            </h2>

            <div
              style={{ display: "flex", flexDirection: "column", gap: "12px" }}
            >
              {reports.map((r) => {
                const isCsvDownloaded = downloadingCsvId === r.id;
                const isPdfDownloaded = downloadingPdfId === r.id;

                return (
                  <div key={r.id} className="report-item-row">
                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "14px",
                        minWidth: 0,
                        flex: "1 1 auto",
                      }}
                    >
                      <div
                        style={{
                          width: "40px",
                          height: "40px",
                          borderRadius: "10px",
                          backgroundColor: "var(--primary-accent-light)",
                          color: "var(--primary-accent)",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          flexShrink: 0,
                        }}
                      >
                        <FileText size={18} />
                      </div>

                      <div style={{ minWidth: 0, flex: "1 1 auto" }}>
                        <div
                          style={{
                            fontSize: "14.5px",
                            fontWeight: 600,
                            color: "#111827",
                            lineHeight: 1.35,
                            wordBreak: "break-word",
                          }}
                        >
                          {r.title}
                        </div>
                        <div
                          style={{
                            fontSize: "12.5px",
                            color: "#8A92A6",
                            marginTop: "2px",
                          }}
                        >
                          {r.count} transactions
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        flexShrink: 0,
                      }}
                    >
                      <Button
                        variant={isCsvDownloaded ? "primary" : "outline"}
                        size="sm"
                        pill={false}
                        leftIcon={
                          isCsvDownloaded ? (
                            <CheckCircle2 size={13} color="#FFFFFF" />
                          ) : (
                            <Download size={13} />
                          )
                        }
                        className="report-download-btn"
                        onClick={() => handleDownloadCsv(r.type, r.title, r.id)}
                        style={{
                          backgroundColor: isCsvDownloaded
                            ? "#10B981"
                            : undefined,
                          borderColor: isCsvDownloaded ? "#10B981" : undefined,
                          color: isCsvDownloaded ? "#FFFFFF" : undefined,
                          fontWeight: 600,
                          fontSize: "12px",
                          padding: "6px 10px",
                        }}
                      >
                        {isCsvDownloaded ? "Saved" : "CSV"}
                      </Button>

                      <Button
                        variant={isPdfDownloaded ? "primary" : "outline"}
                        size="sm"
                        pill={false}
                        leftIcon={
                          isPdfDownloaded ? (
                            <CheckCircle2 size={13} color="#FFFFFF" />
                          ) : (
                            <FileDown size={13} />
                          )
                        }
                        className="report-download-btn"
                        onClick={() => handleDownloadPdf(r.type, r.title, r.id)}
                        style={{
                          backgroundColor: isPdfDownloaded
                            ? "#10B981"
                            : undefined,
                          borderColor: isPdfDownloaded ? "#10B981" : undefined,
                          color: isPdfDownloaded ? "#FFFFFF" : undefined,
                          fontWeight: 600,
                          fontSize: "12px",
                          padding: "6px 10px",
                        }}
                      >
                        {isPdfDownloaded ? "Saved" : "PDF"}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Spending Breakdown */}
          <SpendingBreakdown />
        </div>
      </div>
    </DashboardShell>
  );
}
