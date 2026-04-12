import AdminCrudShell from './AdminCrudShell'

type AdminUserItem = {
  id: string
  fullName: string
  username: string
  role: string
  department: string
  active: boolean
}

const adminUsers: AdminUserItem[] = [
  {
    id: 'USR-001',
    fullName: 'กานต์ธิดา ใจดี',
    username: 'kanthida',
    role: 'เจ้าหน้าที่',
    department: 'งานทะเบียน',
    active: true,
  },
  {
    id: 'USR-002',
    fullName: 'ณัฐวุฒิ พรหมมา',
    username: 'natthawut',
    role: 'หัวหน้างาน',
    department: 'งานอาคารสถานที่',
    active: true,
  },
  {
    id: 'USR-003',
    fullName: 'สุภาวดี แสงทอง',
    username: 'supawadee',
    role: 'ผู้ใช้งานทั่วไป',
    department: 'งานการเงิน',
    active: false,
  },
]

function AdminUsersPage() {
  return (
    <AdminCrudShell<AdminUserItem>
      title="จัดการผู้ใช้งาน"
      description="หน้าจัดการผู้ใช้งานแบบ local state สำหรับทดสอบการสร้าง แก้ไข และลบรายการ"
      initialItems={adminUsers}
      getRowKey={(item) => item.id}
      getTitle={(item) => item.fullName}
      fields={[
        { name: 'id', label: 'รหัส', placeholder: 'USR-004' },
        { name: 'fullName', label: 'ชื่อ-สกุล', placeholder: 'ชื่อผู้ใช้งาน' },
        { name: 'username', label: 'Username', placeholder: 'username' },
        { name: 'role', label: 'บทบาท', placeholder: 'เจ้าหน้าที่' },
        { name: 'department', label: 'หน่วยงาน', placeholder: 'งานทะเบียน' },
        { name: 'active', label: 'ใช้งาน', type: 'checkbox' },
      ]}
      renderSummary={(item) => (
        <div className="summary-grid">
          <div>
            <span>สถานะ</span>
            <strong>{item.active ? 'ใช้งาน' : 'ปิดใช้งาน'}</strong>
          </div>
          <div>
            <span>ชื่อ</span>
            <strong>{item.fullName}</strong>
          </div>
          <div>
            <span>หน่วยงาน</span>
            <strong>{item.department}</strong>
          </div>
        </div>
      )}
    />
  )
}

export default AdminUsersPage