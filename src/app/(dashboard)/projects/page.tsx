'use client';

import React from 'react';
import { DashboardShell } from '@/components/layout/DashboardShell';
import { ProjectsManager } from '@/components/projects/ProjectsManager';

export default function ProjectsPage() {
  return (
    <DashboardShell>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
        <ProjectsManager />
      </div>
    </DashboardShell>
  );
}
