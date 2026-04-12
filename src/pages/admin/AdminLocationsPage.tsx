import AdminCrudShell from './AdminCrudShell'

type AdminLocationItem = {
  id: string
  name: string
  code: string
  address: string
  latitude?: number
  longitude?: number
  active: boolean
}

const adminLocations: AdminLocationItem[] = [
  {
    id: 'LOC-001',
    name: 'อาคารสำนักงานหลัก',
    code: 'HQ',
    address: '123 ถนนศูนย์กลาง ตำบลในเมือง',
    active: true,
  },
  {
    id: 'LOC-002',
    name: 'หน่วยบริการ A',
    code: 'A1',
    address: '45 หมู่ 2 ตำบลบางรัก',
    active: true,
  },
  {
    id: 'LOC-003',
    name: 'หน่วยบริการ B',
    code: 'B1',
    address: '88 หมู่ 7 ตำบลหนองบัว',
    active: false,
  },
  {
    id: 'LOC-004',
    name: 'Work From Home',
    code: 'WFH',
    address: 'พิกัดทำงานจากที่บ้าน',
    latitude: 6.647581014685428,
    longitude: 101.30647939321433,
    active: true,
  },
]

function AdminLocationsPage() {
  return (
    <AdminCrudShell<AdminLocationItem>
      title="จัดการสถานที่"
      description="สร้างและปรับปรุงข้อมูลสถานที่ใช้งานสำหรับการลงเวลาแบบ local mock data"
      initialItems={adminLocations}
      getRowKey={(item) => item.id}
      getTitle={(item) => item.name}
      fields={[
        { name: 'id', label: 'รหัส', placeholder: 'LOC-004' },
        { name: 'name', label: 'ชื่อสถานที่', placeholder: 'ชื่อสถานที่' },
        { name: 'code', label: 'รหัสสถานที่', placeholder: 'SITE-01' },
        { name: 'address', label: 'ที่อยู่', type: 'textarea', placeholder: 'รายละเอียดที่อยู่' },
        { name: 'latitude', label: 'ละติจูด', placeholder: '6.647581014685428' },
        { name: 'longitude', label: 'ลองจิจูด', placeholder: '101.30647939321433' },
        { name: 'active', label: 'ใช้งาน', type: 'checkbox' },
      ]}
      renderSummary={(item) => (
        <div className="summary-grid">
          <div>
            <span>รหัส</span>
            <strong>{item.code}</strong>
          </div>
          <div>
            <span>สถานะ</span>
            <strong>{item.active ? 'ใช้งาน' : 'ปิดใช้งาน'}</strong>
          </div>
          <div>
            <span>พิกัด</span>
            <strong>
              {item.latitude !== undefined && item.longitude !== undefined
                ? `${item.latitude}, ${item.longitude}`
                : '-'}
            </strong>
          </div>
          <div>
            <span>ที่อยู่</span>
            <strong>{item.address}</strong>
          </div>
        </div>
      )}
    />
  )
}

export default AdminLocationsPage
