'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Search,
  Check,
  X,
  AlertCircle,
  Calendar,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  Wallet,
  TrendingUp,
  TrendingDown,
} from 'lucide-react';
import { Modal, Button, Input } from '@/components/ui';
import { useDashboard } from '@/context/DashboardContext';
import { Project } from '@/types';
import { formatINR } from '@/lib';

export function ProjectsManager() {
  const { projects, setProjects, transactions, currencySymbol } = useDashboard();
  const [isLoading, setIsLoading] = useState(projects.length === 0);
  const [searchQuery, setSearchQuery] = useState('');

  // Modal State for Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const [formName, setFormName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Delete State
  const [deletingProject, setDeletingProject] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Toast / Feedback
  const [toastMessage, setToastMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((text: string, type: 'success' | 'error' = 'success') => {
    setToastMessage({ type, text });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  }, []);

  useEffect(() => {
    let ignore = false;

    async function syncProjects() {
      try {
        const res = await fetch('/api/projects');
        if (!res.ok) return;
        const data = await res.json();
        if (!ignore && data.success && Array.isArray(data.data)) {
          setProjects(data.data);
        }
      } catch (err) {
        console.warn('Failed to background sync projects:', err);
      } finally {
        if (!ignore) {
          setIsLoading(false);
        }
      }
    }

    syncProjects();

    return () => {
      ignore = true;
    };
  }, [setProjects]);

  // Filtered projects
  const filteredProjects = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return projects;
    return projects.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        String(p.id).includes(q)
    );
  }, [projects, searchQuery]);

  // Aggregate project cash in, cash out, and net flow
  const projectFinances = useMemo(() => {
    const map = new Map<
      number,
      { cashIn: number; cashOut: number; netFlow: number; count: number }
    >();

    for (const p of projects) {
      map.set(p.id, {
        cashIn: p.cashIn || 0,
        cashOut: p.cashOut || 0,
        netFlow: (p.cashIn || 0) - (p.cashOut || 0),
        count: p.transactionCount || 0,
      });
    }

    if (transactions && transactions.length > 0) {
      for (const p of projects) {
        map.set(p.id, { cashIn: 0, cashOut: 0, netFlow: 0, count: 0 });
      }

      for (const tx of transactions) {
        const amt = Number(tx.amount) || 0;
        let matchedProjectId: number | null = null;

        if (tx.projectId !== undefined && tx.projectId !== null) {
          const pid = Number(tx.projectId);
          if (map.has(pid)) {
            matchedProjectId = pid;
          }
        }

        if (matchedProjectId === null && tx.projectName) {
          const normTx = tx.projectName.trim().toLowerCase();
          const found = projects.find((p) => p.name.trim().toLowerCase() === normTx);
          if (found) {
            matchedProjectId = found.id;
          }
        }

        if (matchedProjectId !== null) {
          const stats = map.get(matchedProjectId)!;
          if (amt > 0) {
            stats.cashIn += amt;
          } else if (amt < 0) {
            stats.cashOut += Math.abs(amt);
          }
          stats.netFlow = stats.cashIn - stats.cashOut;
          stats.count += 1;
        }
      }
    }

    return map;
  }, [projects, transactions]);

  // Overall financial summary metrics
  const totals = useMemo(() => {
    let cashIn = 0;
    let cashOut = 0;
    let totalTaggedTx = 0;

    projectFinances.forEach((val) => {
      cashIn += val.cashIn;
      cashOut += val.cashOut;
      totalTaggedTx += val.count;
    });

    return {
      cashIn,
      cashOut,
      netFlow: cashIn - cashOut,
      totalTaggedTx,
    };
  }, [projectFinances]);

  // Handlers for Modal
  const openCreateModal = () => {
    setModalMode('create');
    setEditingProject(null);
    setFormName('');
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const openEditModal = (project: Project) => {
    setModalMode('edit');
    setEditingProject(project);
    setFormName(project.name);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = formName.trim();
    if (!trimmed) {
      setErrorMessage('Project name is required');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/projects', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: trimmed }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to create project');
        }

        setProjects((prev) => [data.project, ...prev]);
        setIsModalOpen(false);
        showToast(`Project "${data.project.name}" created successfully!`);
      } else if (editingProject) {
        const res = await fetch('/api/projects', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingProject.id, name: trimmed }),
        });
        const data = await res.json();
        if (!res.ok || !data.success) {
          throw new Error(data.error || 'Failed to update project');
        }

        setProjects((prev) =>
          prev.map((p) => (p.id === editingProject.id ? data.project : p))
        );
        setIsModalOpen(false);
        showToast(`Project updated to "${data.project.name}"!`);
      }
    } catch (err) {
      setErrorMessage((err as Error).message || 'An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingProject) return;

    setIsDeleting(true);
    try {
      const res = await fetch(`/api/projects?id=${deletingProject.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        throw new Error(data.error || 'Failed to delete project');
      }

      setProjects((prev) => prev.filter((p) => p.id !== deletingProject.id));
      const deletedName = deletingProject.name;
      setDeletingProject(null);
      showToast(`Project "${deletedName}" was deleted.`);
    } catch (err) {
      showToast((err as Error).message || 'Failed to delete project', 'error');
    } finally {
      setIsDeleting(false);
    }
  };

  const formatDate = (isoString?: string) => {
    if (!isoString) return 'Recent';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString('en-IN', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
    } catch {
      return isoString;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div
          className="animate-slide-down"
          style={{
            position: 'fixed',
            top: '24px',
            right: '24px',
            zIndex: 9999,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px 18px',
            borderRadius: '12px',
            backgroundColor: toastMessage.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            border: toastMessage.type === 'success' ? '1px solid #A7F3D0' : '1px solid #FECACA',
            color: toastMessage.type === 'success' ? '#065F46' : '#991B1B',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)',
            fontSize: '13.5px',
            fontWeight: 600,
          }}
        >
          {toastMessage.type === 'success' ? (
            <Check size={16} color="#059669" />
          ) : (
            <AlertCircle size={16} color="#DC2626" />
          )}
          <span>{toastMessage.text}</span>
        </div>
      )}

      {/* Top Financial Stat Summary Grid */}
      <div className="project-stats-grid">
        {/* Card 1: Total Projects */}
        <div
          className="project-stat-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #ECEEF2',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px -2px rgba(17, 24, 39, 0.04)',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Active Projects
            </div>
            <div className="project-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#111827', marginTop: '4px' }}>
              {projects.length}
            </div>
            <div style={{ fontSize: '12px', color: '#9CA3AF', marginTop: '2px' }}>
              {totals.totalTaggedTx} linked transaction{totals.totalTaggedTx === 1 ? '' : 's'}
            </div>
          </div>
          <div
            className="project-stat-icon"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'var(--primary-accent-light)',
              color: 'var(--primary-accent)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <FolderKanban size={22} />
          </div>
        </div>

        {/* Card 2: Total Project Cash In */}
        <div
          className="project-stat-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #D1FAE5',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px -2px rgba(16, 185, 129, 0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#047857', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Cash In
            </div>
            <div className="project-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#059669', marginTop: '4px' }}>
              {formatINR(totals.cashIn, { currencySymbol, showSign: false })}
            </div>
            <div style={{ fontSize: '12px', color: '#10B981', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingUp size={13} />
              <span>Total Revenue</span>
            </div>
          </div>
          <div
            className="project-stat-icon"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ArrowDownLeft size={22} />
          </div>
        </div>

        {/* Card 3: Total Project Cash Out */}
        <div
          className="project-stat-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: '1px solid #FEE2E2',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px -2px rgba(239, 68, 68, 0.06)',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Project Cash Out
            </div>
            <div className="project-stat-value" style={{ fontSize: '24px', fontWeight: 800, color: '#DC2626', marginTop: '4px' }}>
              {formatINR(totals.cashOut, { currencySymbol, showSign: false })}
            </div>
            <div style={{ fontSize: '12px', color: '#EF4444', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <TrendingDown size={13} />
              <span>Total Expenses</span>
            </div>
          </div>
          <div
            className="project-stat-icon"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: '#FEF2F2',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <ArrowUpRight size={22} />
          </div>
        </div>

        {/* Card 4: Net Cash Balance */}
        <div
          className="project-stat-card"
          style={{
            backgroundColor: '#FFFFFF',
            borderRadius: '16px',
            border: totals.netFlow >= 0 ? '1px solid #D1FAE5' : '1px solid #FED7AA',
            padding: '20px 22px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            boxShadow: '0 2px 8px -2px rgba(17, 24, 39, 0.04)',
          }}
        >
          <div>
            <div style={{ fontSize: '11.5px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Net Balance
            </div>
            <div
              className="project-stat-value"
              style={{
                fontSize: '24px',
                fontWeight: 800,
                color: totals.netFlow >= 0 ? '#059669' : '#DC2626',
                marginTop: '4px',
              }}
            >
              {formatINR(totals.netFlow, { currencySymbol, showSign: true })}
            </div>
            <div style={{ fontSize: '12px', color: '#6B7280', marginTop: '2px' }}>
              {totals.netFlow >= 0 ? 'Surplus Margin' : 'Deficit Outflow'}
            </div>
          </div>
          <div
            className="project-stat-icon"
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: totals.netFlow >= 0 ? '#ECFDF5' : '#FFF7ED',
              color: totals.netFlow >= 0 ? '#059669' : '#EA580C',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Wallet size={22} />
          </div>
        </div>
      </div>

      {/* Main Container Card */}
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderRadius: '20px',
          border: '1px solid #ECEEF2',
          boxShadow: '0 4px 16px -2px rgba(17, 24, 39, 0.04)',
          overflow: 'hidden',
        }}
      >
        {/* Header Strip */}
        <div
          style={{
            padding: '24px 28px',
            borderBottom: '1px solid #F3F4F6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                backgroundColor: 'var(--primary-accent-light)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary-accent)',
                flexShrink: 0,
              }}
            >
              <FolderKanban size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', letterSpacing: '-0.01em' }}>
                  Projects Directory
                </h2>
                <span
                  style={{
                    fontSize: '12px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '9999px',
                    backgroundColor: '#F3F4F6',
                    color: '#4B5563',
                  }}
                >
                  {projects.length} Total
                </span>
              </div>
              <p style={{ fontSize: '13px', color: '#6B7280', marginTop: '2px' }}>
                Create, organize, and manage client and internal project names
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                minWidth: '220px',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  color: '#9CA3AF',
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search projects..."
                style={{
                  width: '100%',
                  padding: '9px 32px 9px 36px',
                  borderRadius: '10px',
                  border: '1px solid #E5E7EB',
                  backgroundColor: '#F9FAFB',
                  fontSize: '13.5px',
                  color: '#111827',
                  outline: 'none',
                  transition: 'all 0.15s ease',
                }}
                onFocus={(e) => {
                  e.currentTarget.style.backgroundColor = '#FFFFFF';
                  e.currentTarget.style.borderColor = 'var(--primary-accent)';
                  e.currentTarget.style.boxShadow = '0 0 0 3px var(--primary-accent-border)';
                }}
                onBlur={(e) => {
                  e.currentTarget.style.backgroundColor = '#F9FAFB';
                  e.currentTarget.style.borderColor = '#E5E7EB';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    color: '#9CA3AF',
                    border: 'none',
                    background: 'transparent',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    padding: '2px',
                  }}
                  title="Clear search"
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Add Project Button */}
            <Button onClick={openCreateModal}>
              <Plus size={16} style={{ marginRight: '6px' }} />
              <span>New Project</span>
            </Button>
          </div>
        </div>

        {/* Content Area */}
        {isLoading ? (
          <div
            style={{
              padding: '60px 20px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: '12px',
              color: '#6B7280',
            }}
          >
            <div
              style={{
                width: '36px',
                height: '36px',
                border: '3px solid #E5E7EB',
                borderTopColor: 'var(--primary-accent)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span style={{ fontSize: '13.5px', fontWeight: 500 }}>Loading projects directory...</span>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div
            style={{
              padding: '64px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '50%',
                backgroundColor: '#F3F4F6',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#9CA3AF',
                marginBottom: '14px',
              }}
            >
              <FolderKanban size={26} />
            </div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#111827', marginBottom: '4px' }}>
              {searchQuery ? 'No matching projects found' : 'No projects yet'}
            </h3>
            <p style={{ fontSize: '13.5px', color: '#6B7280', maxWidth: '360px', marginBottom: '18px' }}>
              {searchQuery
                ? `We couldn't find any projects matching "${searchQuery}". Try a different keyword.`
                : 'Get started by creating your first project name to track all initiatives.'}
            </p>
            {searchQuery ? (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                style={{
                  fontSize: '13px',
                  fontWeight: 600,
                  color: 'var(--primary-accent)',
                  border: 'none',
                  background: 'none',
                  cursor: 'pointer',
                }}
              >
                Clear Search Query
              </button>
            ) : (
              <Button onClick={openCreateModal}>
                <Plus size={16} style={{ marginRight: '6px' }} />
                <span>Create Your First Project</span>
              </Button>
            )}
          </div>
        ) : (
          <>
            {/* Desktop / Tablet Table View */}
            <div className="table-responsive-desktop" style={{ width: '100%', overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: '#FAFAFC', borderBottom: '1px solid #ECEEF2' }}>
                    <th
                      style={{
                        padding: '14px 20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        width: '70px',
                      }}
                    >
                      #
                    </th>
                    <th
                      style={{
                        padding: '14px 20px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                      }}
                    >
                      Project Name
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#047857',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'right',
                        width: '130px',
                      }}
                    >
                      Cash In
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#B91C1C',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'right',
                        width: '130px',
                      }}
                    >
                      Cash Out
                    </th>
                    <th
                      style={{
                        padding: '14px 16px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#4B5563',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'right',
                        width: '130px',
                      }}
                    >
                      Net Balance
                    </th>
                    <th
                      style={{
                        padding: '14px 18px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        width: '130px',
                      }}
                    >
                      Created Date
                    </th>
                    <th
                      style={{
                        padding: '14px 24px',
                        fontSize: '11px',
                        fontWeight: 700,
                        color: '#6B7280',
                        textTransform: 'uppercase',
                        letterSpacing: '0.04em',
                        textAlign: 'right',
                        width: '100px',
                      }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProjects.map((project, index) => {
                    const stats = projectFinances.get(project.id) || {
                      cashIn: 0,
                      cashOut: 0,
                      netFlow: 0,
                      count: 0,
                    };
                    return (
                      <tr
                        key={project.id}
                        style={{
                          borderBottom: index === filteredProjects.length - 1 ? 'none' : '1px solid #F3F4F6',
                          transition: 'background-color 0.15s ease',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#F9FAFB')}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <td
                          style={{
                            padding: '16px 20px',
                            fontSize: '13px',
                            fontWeight: 600,
                            color: '#9CA3AF',
                            fontFamily: 'monospace',
                          }}
                        >
                          #{project.id}
                        </td>
                        <td style={{ padding: '16px 20px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div
                              style={{
                                width: '32px',
                                height: '32px',
                                borderRadius: '8px',
                                backgroundColor: 'var(--primary-accent-light)',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                color: 'var(--primary-accent)',
                                flexShrink: 0,
                              }}
                            >
                              <Layers size={16} />
                            </div>
                            <div>
                              <span
                                style={{
                                  fontSize: '14.5px',
                                  fontWeight: 700,
                                  color: '#111827',
                                }}
                              >
                                {project.name}
                              </span>
                              {stats.count > 0 && (
                                <div style={{ fontSize: '11px', color: '#9CA3AF', marginTop: '1px' }}>
                                  {stats.count} transaction{stats.count === 1 ? '' : 's'}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Cash In Column */}
                        <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: stats.cashIn > 0 ? '#059669' : '#9CA3AF',
                            }}
                          >
                            {stats.cashIn > 0
                              ? formatINR(stats.cashIn, { currencySymbol, showSign: true })
                              : `${currencySymbol}0`}
                          </span>
                        </td>

                        {/* Cash Out Column */}
                        <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                          <span
                            style={{
                              fontSize: '13.5px',
                              fontWeight: 700,
                              color: stats.cashOut > 0 ? '#DC2626' : '#9CA3AF',
                            }}
                          >
                            {stats.cashOut > 0
                              ? `-${formatINR(stats.cashOut, { currencySymbol, showSign: false })}`
                              : `${currencySymbol}0`}
                          </span>
                        </td>

                        {/* Net Flow Column */}
                        <td style={{ padding: '16px 16px', textAlign: 'right' }}>
                          <span
                            style={{
                              display: 'inline-block',
                              padding: '3px 8px',
                              borderRadius: '6px',
                              fontSize: '12px',
                              fontWeight: 700,
                              backgroundColor:
                                stats.netFlow > 0
                                  ? '#ECFDF5'
                                  : stats.netFlow < 0
                                  ? '#FEF2F2'
                                  : '#F3F4F6',
                              color:
                                stats.netFlow > 0
                                  ? '#065F46'
                                  : stats.netFlow < 0
                                  ? '#991B1B'
                                  : '#6B7280',
                              border:
                                stats.netFlow > 0
                                  ? '1px solid #A7F3D0'
                                  : stats.netFlow < 0
                                  ? '1px solid #FECACA'
                                  : '1px solid #E5E7EB',
                            }}
                          >
                            {formatINR(stats.netFlow, { currencySymbol, showSign: true })}
                          </span>
                        </td>

                        <td style={{ padding: '16px 18px' }}>
                          <div
                            style={{
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontSize: '12.5px',
                              color: '#6B7280',
                              fontWeight: 500,
                            }}
                          >
                            <Calendar size={13} color="#9CA3AF" />
                            <span>{formatDate(project.createdAt)}</span>
                          </div>
                        </td>
                        <td style={{ padding: '16px 24px', textAlign: 'right' }}>
                          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
                            <button
                            type="button"
                            onClick={() => openEditModal(project)}
                            title="Edit project"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #E5E7EB',
                              backgroundColor: '#FFFFFF',
                              color: '#374151',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                              boxShadow: '0 1px 2px rgba(0,0,0,0.03)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'var(--primary-accent-light)';
                              e.currentTarget.style.borderColor = 'var(--primary-accent-border)';
                              e.currentTarget.style.color = 'var(--primary-accent)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FFFFFF';
                              e.currentTarget.style.borderColor = '#E5E7EB';
                              e.currentTarget.style.color = '#374151';
                            }}
                          >
                            <Pencil size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeletingProject(project)}
                            title="Delete project"
                            style={{
                              padding: '7px',
                              borderRadius: '8px',
                              border: '1px solid #FEE2E2',
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              transition: 'all 0.15s ease',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEE2E2';
                              e.currentTarget.style.borderColor = '#FCA5A5';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = '#FEF2F2';
                              e.currentTarget.style.borderColor = '#FEE2E2';
                            }}
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              </table>
            </div>

            {/* Mobile Card List */}
            <div className="card-list-mobile" style={{ display: 'none', padding: '16px', gap: '12px', flexDirection: 'column' }}>
              {filteredProjects.map((project) => {
                const stats = projectFinances.get(project.id) || {
                  cashIn: 0,
                  cashOut: 0,
                  netFlow: 0,
                  count: 0,
                };
                return (
                  <div
                    key={project.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: '12px',
                      border: '1px solid #F3F4F6',
                      backgroundColor: '#FAFAFC',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '10px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div
                          style={{
                            width: '32px',
                            height: '32px',
                            borderRadius: '8px',
                            backgroundColor: 'var(--primary-accent-light)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'var(--primary-accent)',
                            flexShrink: 0,
                          }}
                        >
                          <Layers size={16} />
                        </div>
                        <div>
                          <div style={{ fontSize: '14px', fontWeight: 700, color: '#111827' }}>
                            {project.name}
                          </div>
                          <div style={{ fontSize: '11px', color: '#8A92A6', fontFamily: 'monospace' }}>
                            ID: #{project.id} {stats.count > 0 && `• ${stats.count} tx`}
                          </div>
                        </div>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <button
                          type="button"
                          onClick={() => openEditModal(project)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: '1px solid #E5E7EB',
                            backgroundColor: '#FFFFFF',
                            color: '#374151',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Pencil size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeletingProject(project)}
                          style={{
                            padding: '6px 10px',
                            borderRadius: '7px',
                            border: '1px solid #FEE2E2',
                            backgroundColor: '#FEF2F2',
                            color: '#DC2626',
                            fontSize: '12px',
                            fontWeight: 600,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px',
                          }}
                        >
                          <Trash2 size={12} />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Mobile Project Financials */}
                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(3, 1fr)',
                        gap: '6px',
                        padding: '10px 12px',
                        borderRadius: '10px',
                        backgroundColor: '#FFFFFF',
                        border: '1px solid #ECEEF2',
                      }}
                    >
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#047857', textTransform: 'uppercase' }}>
                          Cash In
                        </div>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: stats.cashIn > 0 ? '#059669' : '#9CA3AF',
                            marginTop: '2px',
                          }}
                        >
                          {stats.cashIn > 0
                            ? formatINR(stats.cashIn, { currencySymbol, showSign: true })
                            : `${currencySymbol}0`}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#B91C1C', textTransform: 'uppercase' }}>
                          Cash Out
                        </div>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color: stats.cashOut > 0 ? '#DC2626' : '#9CA3AF',
                            marginTop: '2px',
                          }}
                        >
                          {stats.cashOut > 0
                            ? `-${formatINR(stats.cashOut, { currencySymbol, showSign: false })}`
                            : `${currencySymbol}0`}
                        </div>
                      </div>
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 700, color: '#4B5563', textTransform: 'uppercase' }}>
                          Net Flow
                        </div>
                        <div
                          style={{
                            fontSize: '12.5px',
                            fontWeight: 800,
                            color:
                              stats.netFlow > 0
                                ? '#059669'
                                : stats.netFlow < 0
                                ? '#DC2626'
                                : '#6B7280',
                            marginTop: '2px',
                          }}
                        >
                          {formatINR(stats.netFlow, { currencySymbol, showSign: true })}
                        </div>
                      </div>
                    </div>

                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        fontSize: '11.5px',
                        color: '#6B7280',
                        borderTop: '1px solid #ECEEF2',
                        paddingTop: '8px',
                      }}
                    >
                      <Calendar size={12} color="#9CA3AF" />
                      <span>Created: {formatDate(project.createdAt)}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}
      </div>

      {/* Add / Edit Project Modal (Static) */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          if (!isSubmitting) setIsModalOpen(false);
        }}
        title={modalMode === 'create' ? 'Add New Project' : 'Edit Project'}
        description={
          modalMode === 'create'
            ? 'Enter a unique name for this project initiative.'
            : `Update the name for project #${editingProject?.id}`
        }
        maxWidth="460px"
        isStatic={true}
      >
        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {errorMessage && (
            <div
              style={{
                padding: '10px 14px',
                borderRadius: '8px',
                backgroundColor: '#FEF2F2',
                border: '1px solid #FECACA',
                color: '#991B1B',
                fontSize: '12.5px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                marginBottom: '16px',
              }}
            >
              <AlertCircle size={15} color="#DC2626" />
              <span>{errorMessage}</span>
            </div>
          )}

          <div style={{ marginBottom: '20px' }}>
            <Input
              label="Project Name"
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Cherukavu LED Screen Work"
              required
              autoFocus
            />
            <p style={{ fontSize: '12px', color: '#8A92A6', marginTop: '6px' }}>
              Only a project name is required. This will be available for tagging records.
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              borderTop: '1px solid #F3F4F6',
              paddingTop: '16px',
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
              {isSubmitting ? (
                <span>Saving...</span>
              ) : modalMode === 'create' ? (
                <>
                  <Plus size={15} style={{ marginRight: '6px' }} />
                  <span>Create Project</span>
                </>
              ) : (
                <>
                  <Check size={15} style={{ marginRight: '6px' }} />
                  <span>Save Changes</span>
                </>
              )}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal (Static) */}
      <Modal
        isOpen={!!deletingProject}
        onClose={() => {
          if (!isDeleting) setDeletingProject(null);
        }}
        title="Delete Project"
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
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={18} color="#DC2626" style={{ flexShrink: 0, marginTop: '2px' }} />
            <div>
              <div style={{ fontSize: '13px', fontWeight: 700, color: '#991B1B' }}>
                Permanent Action
              </div>
              <div style={{ fontSize: '12px', color: '#B91C1C', marginTop: '2px' }}>
                Are you sure you want to delete project:
              </div>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 700,
                  color: '#111827',
                  backgroundColor: '#FFFFFF',
                  padding: '6px 10px',
                  borderRadius: '6px',
                  border: '1px solid #FECACA',
                  marginTop: '8px',
                }}
              >
                {deletingProject?.name}
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button
              type="button"
              variant="outline"
              disabled={isDeleting}
              onClick={() => setDeletingProject(null)}
            >
              Cancel
            </Button>
            <button
              type="button"
              disabled={isDeleting}
              onClick={handleDelete}
              style={{
                padding: '9px 16px',
                borderRadius: '10px',
                backgroundColor: '#DC2626',
                color: '#FFFFFF',
                border: 'none',
                fontSize: '13.5px',
                fontWeight: 600,
                cursor: isDeleting ? 'not-allowed' : 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 2px 4px rgba(220, 38, 38, 0.25)',
              }}
            >
              <Trash2 size={15} />
              <span>{isDeleting ? 'Deleting...' : 'Delete Project'}</span>
            </button>
          </div>
        </div>
      </Modal>

      {/* Responsive CSS for Mobile vs Desktop */}
      <style jsx>{`
        @media (max-width: 640px) {
          .table-responsive-desktop {
            display: none !important;
          }
          .card-list-mobile {
            display: flex !important;
          }
        }
      `}</style>
    </div>
  );
}
