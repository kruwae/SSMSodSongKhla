import type { AppSession, AppUser } from '../types/app'
import { supabase } from '../lib/supabase'

type QueryListResult<T> = {
  data: T[]
  error: string | null
}

type QueryItemResult<T> = {
  data: T | null
  error: string | null
}

type OperationResult<T> = {
  data: T | null
  error: string | null
}

type DepartmentRow = {
  id: string
  code: string
  name: string
  description: string | null
  is_active: boolean
}

type OfficeRow = {
  id: string
  code: string
  name: string
  address: string | null
  department_id: string
  is_active: boolean
  departments?: { name?: string } | null
}

type ProfileRow = {
  id: string
  email: string
  full_name: string
  role: 'admin' | 'manager' | 'employee'
  employee_code: string | null
  phone: string | null
  avatar_url: string | null
  is_active: boolean
  department_id: string | null
  office_id: string | null
  departments?: { name?: string } | null
  offices?: { name?: string } | null
}

type DeviceRow = {
  id: string
  profile_id: string | null
  device_name: string | null
  platform: string | null
  is_verified: boolean
  last_seen_at: string | null
  profiles?: { full_name?: string } | null
}

type ShiftRow = {
  id: string
  office_id: string
  name: string
  start_time: string
  end_time: string
  grace_period_minutes: number
  is_active: boolean
  offices?: { name?: string } | null
}

type AttendanceRow = {
  id: string
  profile_id: string
  check_in_at: string
  check_out_at: string | null
  work_hours: number | string | null
  late_status: boolean
  check_in_source: string
  check_in_latitude?: number | string | null
  check_in_longitude?: number | string | null
  check_out_latitude?: number | string | null
  check_out_longitude?: number | string | null
  check_in_face_image_url?: string | null
  check_out_face_image_url?: string | null
  check_in_face_match_score?: number | string | null
  check_out_face_match_score?: number | string | null
  check_in_metadata?: Record<string, unknown> | null
  check_out_metadata?: Record<string, unknown> | null
  profiles?: { full_name?: string } | null
  offices?: { name?: string } | null
  shifts?: { name?: string } | null
}

type LeaveRequestRow = {
  id: string
  profile_id: string
  type: 'annual' | 'sick' | 'personal' | 'other'
  reason: string
  start_date: string
  end_date: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewed_at: string | null
  reviewed_note: string | null
  profiles?: { full_name?: string } | null
  approver?: { full_name?: string } | null
}

type NotificationRow = {
  id: string
  profile_id: string | null
  title: string
  body: string
  category: 'system' | 'attendance' | 'leave' | 'device' | 'admin'
  action_url: string | null
  is_read: boolean
  sent_at: string | null
}

export type DepartmentSummary = {
  id: string
  code: string
  name: string
  description: string | null
  isActive: boolean
}

export type OfficeSummary = {
  id: string
  code: string
  name: string
  address: string | null
  departmentId: string
  departmentName: string | null
  isActive: boolean
}

export type EmployeeSummary = {
  id: string
  fullName: string
  email: string
  role: 'admin' | 'manager' | 'employee'
  departmentName: string | null
  officeName: string | null
  employeeCode: string | null
  phone: string | null
  avatarUrl: string | null
  isActive: boolean
}

export type DeviceSummary = {
  id: string
  profileId: string | null
  profileName: string | null
  deviceName: string | null
  platform: string | null
  isVerified: boolean
  lastSeenAt: string | null
}

export type ShiftSummary = {
  id: string
  officeId: string
  officeName: string | null
  name: string
  startTime: string
  endTime: string
  gracePeriodMinutes: number
  isActive: boolean
}

export type AttendanceSummary = {
  id: string
  profileId: string
  employeeName: string | null
  officeName: string | null
  shiftName: string | null
  checkInAt: string
  checkOutAt: string | null
  workHours: number | null
  lateStatus: boolean
  checkInSource: string
}

export type LeaveRequestSummary = {
  id: string
  profileId: string
  employeeName: string | null
  approverName: string | null
  type: 'annual' | 'sick' | 'personal' | 'other'
  reason: string
  startDate: string
  endDate: string
  status: 'pending' | 'approved' | 'rejected' | 'cancelled'
  reviewedAt: string | null
  reviewedNote: string | null
}

export type NotificationSummary = {
  id: string
  profileId: string | null
  title: string
  body: string
  category: 'system' | 'attendance' | 'leave' | 'device' | 'admin'
  actionUrl: string | null
  isRead: boolean
  sentAt: string | null
}

export type DashboardStats = {
  employees: number
  offices: number
  attendanceToday: number
  pendingLeaves: number
  unreadNotifications: number
  activeDevices: number
}

export type OfficeUpsertInput = {
  code: string
  name: string
  address?: string | null
  departmentId: string
  isActive?: boolean
}

export type EmployeeUpdateInput = {
  fullName?: string
  email?: string
  role?: 'admin' | 'manager' | 'employee'
  employeeCode?: string | null
  phone?: string | null
  avatarUrl?: string | null
  isActive?: boolean
  departmentId?: string | null
  officeId?: string | null
}

export type DeviceUpdateInput = {
  profileId?: string | null
  deviceName?: string | null
  platform?: string | null
  isVerified?: boolean
  lastSeenAt?: string | null
}

export type NotificationCreateInput = {
  profileId?: string | null
  title: string
  body: string
  category: 'system' | 'attendance' | 'leave' | 'device' | 'admin'
  actionUrl?: string | null
  isRead?: boolean
  sentAt?: string | null
}

export type NotificationUpdateInput = Partial<NotificationCreateInput>

export type LeaveReviewInput = {
  status: 'approved' | 'rejected' | 'cancelled'
  reviewedNote?: string | null
}

export type AttendanceCheckPayload = {
  officeId?: string | null
  shiftId?: string | null
  source?: string
  latitude?: number | null
  longitude?: number | null
  faceImageUrl?: string | null
  faceMatchScore?: number | null
  metadata?: Record<string, unknown> | null
}

function normalizeError(error: unknown): string {
  if (typeof error === 'string') return error
  if (error && typeof error === 'object' && 'message' in error && typeof (error as { message?: unknown }).message === 'string') {
    return (error as { message: string }).message
  }
  return 'An unexpected Supabase error occurred.'
}

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function mapDepartment(row: DepartmentRow): DepartmentSummary {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    description: row.description,
    isActive: row.is_active,
  }
}

function mapOffice(row: OfficeRow): OfficeSummary {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    address: row.address,
    departmentId: row.department_id,
    departmentName: row.departments?.name ?? null,
    isActive: row.is_active,
  }
}

function mapEmployee(row: ProfileRow): EmployeeSummary {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    role: row.role,
    departmentName: row.departments?.name ?? null,
    officeName: row.offices?.name ?? null,
    employeeCode: row.employee_code,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    isActive: row.is_active,
  }
}

function mapDevice(row: DeviceRow): DeviceSummary {
  return {
    id: row.id,
    profileId: row.profile_id,
    profileName: row.profiles?.full_name ?? null,
    deviceName: row.device_name,
    platform: row.platform,
    isVerified: row.is_verified,
    lastSeenAt: row.last_seen_at,
  }
}

function mapShift(row: ShiftRow): ShiftSummary {
  return {
    id: row.id,
    officeId: row.office_id,
    officeName: row.offices?.name ?? null,
    name: row.name,
    startTime: row.start_time,
    endTime: row.end_time,
    gracePeriodMinutes: row.grace_period_minutes,
    isActive: row.is_active,
  }
}

function mapAttendance(row: AttendanceRow): AttendanceSummary {
  return {
    id: row.id,
    profileId: row.profile_id,
    employeeName: row.profiles?.full_name ?? null,
    officeName: row.offices?.name ?? null,
    shiftName: row.shifts?.name ?? null,
    checkInAt: row.check_in_at,
    checkOutAt: row.check_out_at,
    workHours: toNumber(row.work_hours),
    lateStatus: row.late_status,
    checkInSource: row.check_in_source,
  }
}

function mapLeaveRequest(row: LeaveRequestRow): LeaveRequestSummary {
  return {
    id: row.id,
    profileId: row.profile_id,
    employeeName: row.profiles?.full_name ?? null,
    approverName: row.approver?.full_name ?? null,
    type: row.type,
    reason: row.reason,
    startDate: row.start_date,
    endDate: row.end_date,
    status: row.status,
    reviewedAt: row.reviewed_at,
    reviewedNote: row.reviewed_note,
  }
}

function mapNotification(row: NotificationRow): NotificationSummary {
  return {
    id: row.id,
    profileId: row.profile_id,
    title: row.title,
    body: row.body,
    category: row.category,
    actionUrl: row.action_url,
    isRead: row.is_read,
    sentAt: row.sent_at,
  }
}

function buildSessionFromProfile(profile: ProfileRow): AppSession {
  const user: AppUser = {
    id: profile.id,
    email: profile.email,
    fullName: profile.full_name,
    role: profile.role === 'admin' ? 'admin' : 'employee',
    officeName: profile.offices?.name ?? null,
  }

  return {
    userId: user.id,
    email: user.email,
    role: user.role,
    displayName: user.fullName,
    officeName: user.officeName,
  }
}

export async function getCurrentSessionProfile(): Promise<QueryItemResult<AppSession>> {
  const { data, error } = await supabase.auth.getUser()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  const user = data.user
  if (!user) {
    return { data: null, error: null }
  }

  const { data: profileData, error: profileError } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, employee_code, phone, avatar_url, is_active, department_id, office_id, offices(name)')
    .eq('id', user.id)
    .maybeSingle()

  if (profileError || !profileData) {
    return {
      data: {
        userId: user.id,
        email: user.email ?? '',
        role: 'employee',
        displayName: user.user_metadata?.full_name ?? user.user_metadata?.name ?? user.email ?? 'User',
        officeName: null,
      },
      error: profileError ? normalizeError(profileError) : null,
    }
  }

  return {
    data: buildSessionFromProfile(profileData as ProfileRow),
    error: null,
  }
}

export async function getDashboardStats(): Promise<QueryItemResult<DashboardStats>> {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  const [employees, offices, attendanceToday, pendingLeaves, unreadNotifications, activeDevices] = await Promise.all([
    supabase.from('profiles').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('offices').select('id', { count: 'exact', head: true }).eq('is_active', true),
    supabase.from('attendance_records').select('id', { count: 'exact', head: true }).gte('check_in_at', today.toISOString()),
    supabase.from('leave_requests').select('id', { count: 'exact', head: true }).eq('status', 'pending'),
    supabase.from('notifications').select('id', { count: 'exact', head: true }).eq('is_read', false),
    supabase.from('devices').select('id', { count: 'exact', head: true }).eq('is_verified', true),
  ])

  const firstError = [employees.error, offices.error, attendanceToday.error, pendingLeaves.error, unreadNotifications.error, activeDevices.error].find(Boolean)

  if (firstError) {
    return {
      data: {
        employees: 0,
        offices: 0,
        attendanceToday: 0,
        pendingLeaves: 0,
        unreadNotifications: 0,
        activeDevices: 0,
      },
      error: normalizeError(firstError),
    }
  }

  return {
    data: {
      employees: employees.count ?? 0,
      offices: offices.count ?? 0,
      attendanceToday: attendanceToday.count ?? 0,
      pendingLeaves: pendingLeaves.count ?? 0,
      unreadNotifications: unreadNotifications.count ?? 0,
      activeDevices: activeDevices.count ?? 0,
    },
    error: null,
  }
}

export async function getDepartments(): Promise<QueryListResult<DepartmentSummary>> {
  const { data, error } = await supabase.from('departments').select('id, code, name, description, is_active').order('name', { ascending: true })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as DepartmentRow[]).map(mapDepartment),
    error: null,
  }
}

export async function getOffices(): Promise<QueryListResult<OfficeSummary>> {
  const { data, error } = await supabase
    .from('offices')
    .select('id, code, name, address, department_id, is_active, departments(name)')
    .order('name', { ascending: true })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as OfficeRow[]).map(mapOffice),
    error: null,
  }
}

export async function getEmployees(): Promise<QueryListResult<EmployeeSummary>> {
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, employee_code, phone, avatar_url, is_active, department_id, office_id, departments(name), offices(name)')
    .order('full_name', { ascending: true })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as ProfileRow[]).map(mapEmployee),
    error: null,
  }
}

export async function getDevices(): Promise<QueryListResult<DeviceSummary>> {
  const { data, error } = await supabase
    .from('devices')
    .select('id, profile_id, device_name, platform, is_verified, last_seen_at, profiles(full_name)')
    .order('last_seen_at', { ascending: false, nullsFirst: false })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as DeviceRow[]).map(mapDevice),
    error: null,
  }
}

export async function getShifts(): Promise<QueryListResult<ShiftSummary>> {
  const { data, error } = await supabase
    .from('shifts')
    .select('id, office_id, name, start_time, end_time, grace_period_minutes, is_active, offices(name)')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as ShiftRow[]).map(mapShift),
    error: null,
  }
}

export async function getAttendanceRecords(): Promise<QueryListResult<AttendanceSummary>> {
  const { data, error } = await supabase
    .from('attendance_records')
    .select('id, profile_id, check_in_at, check_out_at, work_hours, late_status, check_in_source, profiles(full_name), offices(name), shifts(name)')
    .order('check_in_at', { ascending: false })
    .limit(100)

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as AttendanceRow[]).map(mapAttendance),
    error: null,
  }
}

export async function getLeaveRequests(): Promise<QueryListResult<LeaveRequestSummary>> {
  const { data, error } = await supabase
    .from('leave_requests')
    .select('id, profile_id, type, reason, start_date, end_date, status, reviewed_at, reviewed_note, profiles!leave_requests_profile_id_fkey(full_name), approver:profiles!leave_requests_approver_id_fkey(full_name)')
    .order('created_at', { ascending: false })

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as LeaveRequestRow[]).map(mapLeaveRequest),
    error: null,
  }
}

export async function getNotifications(): Promise<QueryListResult<NotificationSummary>> {
  const { data, error } = await supabase
    .from('notifications')
    .select('id, profile_id, title, body, category, action_url, is_read, sent_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    return { data: [], error: normalizeError(error) }
  }

  return {
    data: ((data ?? []) as NotificationRow[]).map(mapNotification),
    error: null,
  }
}

export async function getAdminDashboardSummary(): Promise<{
  data: {
    stats: DashboardStats
    attendance: AttendanceSummary[]
    leaves: LeaveRequestSummary[]
    devices: DeviceSummary[]
    notifications: NotificationSummary[]
  }
  error: string | null
}> {
  const [stats, attendance, leaves, devices, notifications] = await Promise.all([
    getDashboardStats(),
    getAttendanceRecords(),
    getLeaveRequests(),
    getDevices(),
    getNotifications(),
  ])

  return {
    data: {
      stats: stats.data ?? {
        employees: 0,
        offices: 0,
        attendanceToday: 0,
        pendingLeaves: 0,
        unreadNotifications: 0,
        activeDevices: 0,
      },
      attendance: attendance.data,
      leaves: leaves.data,
      devices: devices.data,
      notifications: notifications.data,
    },
    error: stats.error ?? attendance.error ?? leaves.error ?? devices.error ?? notifications.error,
  }
}

export async function getAdminOffices() {
  return getOffices()
}

export async function getAdminEmployees() {
  return getEmployees()
}

export async function getAdminDevices() {
  return getDevices()
}

export async function getAdminAttendanceRecords() {
  return getAttendanceRecords()
}

export async function getAdminLeaveRequests() {
  return getLeaveRequests()
}

export async function getAdminNotifications() {
  return getNotifications()
}

export async function getEmployeeDashboard(profileId?: string | null): Promise<{
  data: {
    session: AppSession | null
    attendance: AttendanceSummary[]
    leaves: LeaveRequestSummary[]
    notifications: NotificationSummary[]
  }
  error: string | null
}> {
  const [sessionProfile, attendance, leaves, notifications] = await Promise.all([
    getCurrentSessionProfile(),
    getAttendanceRecords(),
    getLeaveRequests(),
    getNotifications(),
  ])

  const effectiveProfileId = profileId ?? sessionProfile.data?.userId ?? null

  return {
    data: {
      session: sessionProfile.data,
      attendance: effectiveProfileId ? attendance.data.filter((item) => item.profileId === effectiveProfileId) : [],
      leaves: effectiveProfileId ? leaves.data.filter((item) => item.profileId === effectiveProfileId) : [],
      notifications: effectiveProfileId
        ? notifications.data.filter((item) => item.profileId === effectiveProfileId || item.profileId === null)
        : [],
    },
    error: sessionProfile.error ?? attendance.error ?? leaves.error ?? notifications.error,
  }
}

export async function getEmployeeAttendanceRecords(profileId?: string | null): Promise<QueryListResult<AttendanceSummary>> {
  const attendance = await getAttendanceRecords()

  return {
    data: profileId ? attendance.data.filter((item) => item.profileId === profileId) : attendance.data,
    error: attendance.error,
  }
}

export async function getEmployeeLeaveRequests(profileId?: string | null): Promise<QueryListResult<LeaveRequestSummary>> {
  const leaves = await getLeaveRequests()

  return {
    data: profileId ? leaves.data.filter((item) => item.profileId === profileId) : leaves.data,
    error: leaves.error,
  }
}

export async function getEmployeeProfile(profileId?: string | null): Promise<QueryItemResult<AppSession | EmployeeSummary>> {
  if (!profileId) {
    return getCurrentSessionProfile()
  }

  const employees = await getEmployees()
  const employee = employees.data.find((item) => item.id === profileId) ?? null

  return {
    data: employee,
    error: employees.error,
  }
}

export async function createOffice(input: OfficeUpsertInput): Promise<OperationResult<OfficeSummary>> {
  const { data, error } = await supabase
    .from('offices')
    .insert({
      code: input.code,
      name: input.name,
      address: input.address ?? null,
      department_id: input.departmentId,
      is_active: input.isActive ?? true,
    })
    .select('id, code, name, address, department_id, is_active, departments(name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapOffice(data as OfficeRow), error: null }
}

export async function updateOffice(id: string, input: Partial<OfficeUpsertInput>): Promise<OperationResult<OfficeSummary>> {
  const payload: Record<string, unknown> = {}
  if (input.code !== undefined) payload.code = input.code
  if (input.name !== undefined) payload.name = input.name
  if (input.address !== undefined) payload.address = input.address
  if (input.departmentId !== undefined) payload.department_id = input.departmentId
  if (input.isActive !== undefined) payload.is_active = input.isActive

  const { data, error } = await supabase
    .from('offices')
    .update(payload)
    .eq('id', id)
    .select('id, code, name, address, department_id, is_active, departments(name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapOffice(data as OfficeRow), error: null }
}

export async function deleteOffice(id: string): Promise<OperationResult<null>> {
  const { error } = await supabase.from('offices').delete().eq('id', id)

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: null, error: null }
}

export async function updateEmployee(id: string, input: EmployeeUpdateInput): Promise<OperationResult<EmployeeSummary>> {
  const payload: Record<string, unknown> = {}
  if (input.fullName !== undefined) payload.full_name = input.fullName
  if (input.email !== undefined) payload.email = input.email
  if (input.role !== undefined) payload.role = input.role
  if (input.employeeCode !== undefined) payload.employee_code = input.employeeCode
  if (input.phone !== undefined) payload.phone = input.phone
  if (input.avatarUrl !== undefined) payload.avatar_url = input.avatarUrl
  if (input.isActive !== undefined) payload.is_active = input.isActive
  if (input.departmentId !== undefined) payload.department_id = input.departmentId
  if (input.officeId !== undefined) payload.office_id = input.officeId

  const { data, error } = await supabase
    .from('profiles')
    .update(payload)
    .eq('id', id)
    .select('id, email, full_name, role, employee_code, phone, avatar_url, is_active, department_id, office_id, departments(name), offices(name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapEmployee(data as ProfileRow), error: null }
}

export async function deleteEmployee(id: string): Promise<OperationResult<null>> {
  const { error } = await supabase.from('profiles').delete().eq('id', id)

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: null, error: null }
}

export async function updateDevice(id: string, input: DeviceUpdateInput): Promise<OperationResult<DeviceSummary>> {
  const payload: Record<string, unknown> = {}
  if (input.profileId !== undefined) payload.profile_id = input.profileId
  if (input.deviceName !== undefined) payload.device_name = input.deviceName
  if (input.platform !== undefined) payload.platform = input.platform
  if (input.isVerified !== undefined) payload.is_verified = input.isVerified
  if (input.lastSeenAt !== undefined) payload.last_seen_at = input.lastSeenAt

  const { data, error } = await supabase
    .from('devices')
    .update(payload)
    .eq('id', id)
    .select('id, profile_id, device_name, platform, is_verified, last_seen_at, profiles(full_name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapDevice(data as DeviceRow), error: null }
}

export async function deleteDevice(id: string): Promise<OperationResult<null>> {
  const { error } = await supabase.from('devices').delete().eq('id', id)

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: null, error: null }
}

export async function createNotification(input: NotificationCreateInput): Promise<OperationResult<NotificationSummary>> {
  const { data, error } = await supabase
    .from('notifications')
    .insert({
      profile_id: input.profileId ?? null,
      title: input.title,
      body: input.body,
      category: input.category,
      action_url: input.actionUrl ?? null,
      is_read: input.isRead ?? false,
      sent_at: input.sentAt ?? new Date().toISOString(),
    })
    .select('id, profile_id, title, body, category, action_url, is_read, sent_at')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapNotification(data as NotificationRow), error: null }
}

export async function updateNotification(id: string, input: NotificationUpdateInput): Promise<OperationResult<NotificationSummary>> {
  const payload: Record<string, unknown> = {}
  if (input.profileId !== undefined) payload.profile_id = input.profileId
  if (input.title !== undefined) payload.title = input.title
  if (input.body !== undefined) payload.body = input.body
  if (input.category !== undefined) payload.category = input.category
  if (input.actionUrl !== undefined) payload.action_url = input.actionUrl
  if (input.isRead !== undefined) payload.is_read = input.isRead
  if (input.sentAt !== undefined) payload.sent_at = input.sentAt

  const { data, error } = await supabase
    .from('notifications')
    .update(payload)
    .eq('id', id)
    .select('id, profile_id, title, body, category, action_url, is_read, sent_at')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapNotification(data as NotificationRow), error: null }
}

export async function deleteNotification(id: string): Promise<OperationResult<null>> {
  const { error } = await supabase.from('notifications').delete().eq('id', id)

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: null, error: null }
}

export async function reviewLeaveRequest(id: string, input: LeaveReviewInput): Promise<OperationResult<LeaveRequestSummary>> {
  const { data, error } = await supabase
    .from('leave_requests')
    .update({
      status: input.status,
      reviewed_at: new Date().toISOString(),
      reviewed_note: input.reviewedNote ?? null,
    })
    .eq('id', id)
    .select('id, profile_id, type, reason, start_date, end_date, status, reviewed_at, reviewed_note, profiles!leave_requests_profile_id_fkey(full_name), approver:profiles!leave_requests_approver_id_fkey(full_name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapLeaveRequest(data as LeaveRequestRow), error: null }
}

export async function checkInAttendance(input: AttendanceCheckPayload): Promise<OperationResult<AttendanceSummary>> {
  const { data: sessionProfile, error: sessionError } = await getCurrentSessionProfile()
  if (sessionError || !sessionProfile?.userId) {
    return { data: null, error: sessionError ?? 'Unable to resolve current user session.' }
  }

  const payload: Record<string, unknown> = {
    profile_id: sessionProfile.userId,
    check_in_at: new Date().toISOString(),
    check_in_source: input.source ?? 'face_gps',
    check_in_latitude: input.latitude ?? null,
    check_in_longitude: input.longitude ?? null,
    check_in_face_image_url: input.faceImageUrl ?? null,
    check_in_face_match_score: input.faceMatchScore ?? null,
    check_in_metadata: input.metadata ?? null,
  }

  if (input.officeId !== undefined) payload.office_id = input.officeId
  if (input.shiftId !== undefined) payload.shift_id = input.shiftId

  const { data, error } = await supabase
    .from('attendance_records')
    .insert(payload)
    .select('id, profile_id, check_in_at, check_out_at, work_hours, late_status, check_in_source, profiles(full_name), offices(name), shifts(name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapAttendance(data as AttendanceRow), error: null }
}

export async function checkOutAttendance(attendanceId: string, input: AttendanceCheckPayload): Promise<OperationResult<AttendanceSummary>> {
  const payload: Record<string, unknown> = {
    check_out_at: new Date().toISOString(),
    check_out_latitude: input.latitude ?? null,
    check_out_longitude: input.longitude ?? null,
    check_out_face_image_url: input.faceImageUrl ?? null,
    check_out_face_match_score: input.faceMatchScore ?? null,
    check_out_metadata: input.metadata ?? null,
  }

  const { data, error } = await supabase
    .from('attendance_records')
    .update(payload)
    .eq('id', attendanceId)
    .select('id, profile_id, check_in_at, check_out_at, work_hours, late_status, check_in_source, profiles(full_name), offices(name), shifts(name)')
    .single()

  if (error) {
    return { data: null, error: normalizeError(error) }
  }

  return { data: mapAttendance(data as AttendanceRow), error: null }
}