export type AdminCrudPlaceholderPageProps = {
  title: string
  description: string
}

function AdminCrudPlaceholderPage({ title, description }: AdminCrudPlaceholderPageProps) {
  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Admin CRUD</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="helper-text">{description}</p>
      <div className="summary-grid">
        <div>
          <span>สถานะ</span>
          <strong>กำลังพัฒนา</strong>
        </div>
        <div>
          <span>ขั้นถัดไป</span>
          <strong>เชื่อม route shell</strong>
        </div>
        <div>
          <span>การทำงาน</span>
          <strong>ยังคงใช้โครงสร้างเดิม</strong>
        </div>
      </div>
    </article>
  )
}

export default AdminCrudPlaceholderPage