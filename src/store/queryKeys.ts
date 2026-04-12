export const queryKeys = {
  auth: ['auth'] as const,
  profile: ['profile'] as const,
  admin: {
    dashboard: ['admin', 'dashboard'] as const,
    offices: ['admin', 'offices'] as const,
    employees: ['admin', 'employees'] as const,
    devices: ['admin', 'devices'] as const,
    attendance: ['admin', 'attendance'] as const,
    leaves: ['admin', 'leaves'] as const,
    notifications: ['admin', 'notifications'] as const,
  },
  employee: {
    home: ['employee', 'home'] as const,
    attendance: ['employee', 'attendance'] as const,
    leave: ['employee', 'leave'] as const,
  },
} as const