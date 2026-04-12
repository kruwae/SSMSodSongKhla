import AdminCrudShell from './AdminCrudShell'

type AdminDeviceItem = {
  id: string
  name: string
  imei: string
  owner: string
  serviceUnit: string
  gpsEnabled: boolean
  scanEnabled: boolean
}

const adminDevices: AdminDeviceItem[] = [
  {
    id: 'DEV-001',
    name: 'มือถือเจ้าหน้าที่เวรเช้า',
    imei: '123456',
    owner: 'สุภาวดี แสงทอง',
    serviceUnit: 'หน่วยบริการ A',
    gpsEnabled: true,
    scanEnabled: true,
  },
  {
    id: 'DEV-002',
    name: 'แท็บเล็ตเวรบ่าย',
    imei: '654321',
    owner: 'กานต์ธิดา ใจดี',
    serviceUnit: 'หน่วยบริการ B',
    gpsEnabled: true,
    scanEnabled: false,
  },
  {
    id: 'DEV-003',
    name: 'เครื่องสำรอง',
    imei: '998877',
    owner: 'อาทิตย์ มั่นคง',
    serviceUnit: 'หน่วยบริการ C',
    gpsEnabled: false,
    scanEnabled: true,
  },
]

function AdminDevicesPage() {
  return (
    <AdminCrudShell<AdminDeviceItem>
      title="จัดการอุปกรณ์"
      description="ใช้งาน mock state เพื่อเพิ่ม แก้ไข และลบอุปกรณ์ พร้อมข้อมูล IMEI และการใช้งาน GPS/Scan"
      initialItems={adminDevices}
      getRowKey={(item) => item.id}
      getTitle={(item) => item.name}
      fields={[
        { name: 'id', label: 'รหัส', placeholder: 'DEV-004' },
        { name: 'name', label: 'ชื่ออุปกรณ์', placeholder: 'ชื่ออุปกรณ์' },
        { name: 'imei', label: 'IMEI', placeholder: '123456789012345' },
        { name: 'owner', label: 'เจ้าของ', placeholder: 'ชื่อผู้ครอบครอง' },
        { name: 'serviceUnit', label: 'หน่วยบริการ', placeholder: 'หน่วยบริการ A' },
        { name: 'gpsEnabled', label: 'GPS', type: 'checkbox' },
        { name: 'scanEnabled', label: 'สแกน', type: 'checkbox' },
      ]}
      renderSummary={(item) => (
        <div className="summary-grid">
          <div>
            <span>เจ้าของ</span>
            <strong>{item.owner}</strong>
          </div>
          <div>
            <span>GPS</span>
            <strong>{item.gpsEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</strong>
          </div>
          <div>
            <span>สแกน</span>
            <strong>{item.scanEnabled ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}</strong>
          </div>
        </div>
      )}
    />
  )
}

export default AdminDevicesPage