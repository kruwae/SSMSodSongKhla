import { apiClient } from '../services/api'

export type AttendanceRow = {
  name: string
  status: string
  time: string
  department: string
}

export const attendanceRows: AttendanceRow[] = [
  { name: 'กานต์ธิดา ใจดี', status: 'ปกติ', time: '08:02', department: 'งานทะเบียน' },
  { name: 'ณัฐวุฒิ พรหมมา', status: 'สาย', time: '08:26', department: 'งานอาคารสถานที่' },
  { name: 'สุภาวดี แสงทอง', status: 'ปฏิบัติหน้าที่เวร', time: '07:45', department: 'งานการเงิน' },
  { name: 'อาทิตย์ มั่นคง', status: 'กลับก่อนเวลา', time: '15:10', department: 'งานบุคคล' },
]

export async function loadAttendanceRows() {
  return apiClient.listAttendanceRows()
}