import { useMemo, useState } from 'react'
import { apiClient } from '../../services/api'

export type CrudField = {
  name: string
  label: string
  type?: 'text' | 'email' | 'number' | 'textarea' | 'checkbox'
  placeholder?: string
}

export type CrudActionState = 'idle' | 'saved' | 'deleted'

export type CrudShellProps<T extends Record<string, string | number | boolean>> = {
  title: string
  description: string
  fields: CrudField[]
  initialItems: T[]
  getRowKey: (item: T) => string
  getTitle: (item: T) => string
  renderSummary: (item: T) => React.ReactNode
  entityName?: 'users' | 'devices' | 'locations'
}

function formatValue(value: string | number | boolean) {
  if (typeof value === 'boolean') {
    return value ? 'ใช่' : 'ไม่ใช่'
  }

  return String(value)
}

export default function AdminCrudShell<T extends Record<string, string | number | boolean>>({
  title,
  description,
  fields,
  initialItems,
  getRowKey,
  getTitle,
  renderSummary,
  entityName,
}: CrudShellProps<T>) {
  const [items, setItems] = useState<T[]>(initialItems)
  const [editingKey, setEditingKey] = useState<string | null>(null)
  const [message, setMessage] = useState('เลือกแถวเพื่อแก้ไข หรือเพิ่มรายการใหม่')
  const [draft, setDraft] = useState<Record<string, string | boolean>>(() =>
    fields.reduce<Record<string, string | boolean>>((acc, field) => {
      acc[field.name] = field.type === 'checkbox' ? false : ''
      return acc
    }, {}),
  )

  const editingItem = useMemo(() => items.find((item) => getRowKey(item) === editingKey) ?? null, [editingKey, getRowKey, items])

  const syncDraftFromItem = (item: T | null) => {
    const nextDraft: Record<string, string | boolean> = {}
    fields.forEach((field) => {
      const value = item ? item[field.name as keyof T] : ''
      nextDraft[field.name] = field.type === 'checkbox' ? Boolean(value) : formatValue(value ?? '')
    })
    setDraft(nextDraft)
  }

  const startCreate = () => {
    setEditingKey(null)
    syncDraftFromItem(null)
    setMessage('กำลังเพิ่มรายการใหม่')
  }

  const startEdit = (item: T) => {
    setEditingKey(getRowKey(item))
    syncDraftFromItem(item)
    setMessage(`กำลังแก้ไข: ${getTitle(item)}`)
  }

  const deleteItem = async (key: string) => {
    if (entityName) {
      const result = await apiClient.deleteAdminEntity(entityName, key)
      if (!result.deleted) {
        setMessage('ลบรายการไม่สำเร็จ')
        return
      }
    }

    setItems((current) => current.filter((item) => getRowKey(item) !== key))
    setMessage('ลบรายการเรียบร้อย')
    if (editingKey === key) {
      setEditingKey(null)
      syncDraftFromItem(null)
    }
  }

  const updateField = (name: string, value: string | boolean) => {
    setDraft((current) => ({ ...current, [name]: value }))
  }

  const saveItem = async () => {
    const nextItem = fields.reduce<Record<string, string | number | boolean>>((acc, field) => {
      const value = draft[field.name]
      acc[field.name] = field.type === 'number' ? Number(value || 0) : field.type === 'checkbox' ? Boolean(value) : String(value || '')
      return acc
    }, {}) as T

    if (editingItem) {
      if (entityName) {
        const result = await apiClient.saveAdminEntity(entityName, nextItem as T & { id: string })
        if (!result.saved) {
          setMessage('บันทึกการแก้ไขไม่สำเร็จ')
          return
        }
      }
      setItems((current) => current.map((item) => (getRowKey(item) === editingKey ? nextItem : item)))
      setMessage('บันทึกการแก้ไขเรียบร้อย')
    } else {
      const createdItem = { ...nextItem, id: `mock-${Date.now()}` } as T & { id: string }
      if (entityName) {
        const result = await apiClient.saveAdminEntity(entityName, createdItem)
        if (!result.saved) {
          setMessage('เพิ่มรายการไม่สำเร็จ')
          return
        }
      }
      setItems((current) => [createdItem as T, ...current])
      setMessage('เพิ่มรายการเรียบร้อย')
    }

    setEditingKey(null)
    syncDraftFromItem(null)
  }

  return (
    <article className="panel">
      <div className="panel-heading">
        <div>
          <p className="eyebrow">Admin CRUD</p>
          <h3>{title}</h3>
        </div>
      </div>
      <p className="helper-text">{description}</p>

      <div className="crud-toolbar">
        <button type="button" className="primary-button" onClick={startCreate}>
          เพิ่มรายการใหม่
        </button>
        <span className="mini-chip">{message}</span>
      </div>

      <div className="crud-grid">
        <div className="crud-form panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{editingItem ? 'Edit' : 'Create'}</p>
              <h3>{editingItem ? getTitle(editingItem) : 'เพิ่มข้อมูลใหม่'}</h3>
            </div>
          </div>

          <div className="crud-fields">
            {fields.map((field) => (
              <label key={field.name} className="crud-field">
                <span>{field.label}</span>
                {field.type === 'textarea' ? (
                  <textarea
                    value={String(draft[field.name] ?? '')}
                    placeholder={field.placeholder}
                    onChange={(event) => updateField(field.name, event.target.value)}
                  />
                ) : field.type === 'checkbox' ? (
                  <input
                    type="checkbox"
                    checked={Boolean(draft[field.name])}
                    onChange={(event) => updateField(field.name, event.target.checked)}
                  />
                ) : (
                  <input
                    type={field.type ?? 'text'}
                    value={String(draft[field.name] ?? '')}
                    placeholder={field.placeholder}
                    onChange={(event) => updateField(field.name, event.target.value)}
                  />
                )}
              </label>
            ))}
          </div>

          <div className="panel-actions">
            <button type="button" className="primary-button" onClick={saveItem}>
              บันทึก
            </button>
            <button type="button" className="secondary-button" onClick={() => syncDraftFromItem(editingItem)}>
              รีเซ็ตฟอร์ม
            </button>
          </div>
        </div>

        <div className="crud-table panel">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">List</p>
              <h3>รายการทั้งหมด</h3>
            </div>
          </div>

          <div className="table-wrap">
            <table className="attendance-table">
              <thead>
                <tr>
                  {fields.map((field) => (
                    <th key={field.name}>{field.label}</th>
                  ))}
                  <th>สรุป</th>
                  <th>จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => {
                  const key = getRowKey(item)
                  return (
                    <tr key={key}>
                      {fields.map((field) => (
                        <td key={field.name}>{formatValue(item[field.name as keyof T])}</td>
                      ))}
                      <td>{renderSummary(item)}</td>
                      <td>
                        <div className="crud-row-actions">
                          <button type="button" className="secondary-button" onClick={() => startEdit(item)}>
                            แก้ไข
                          </button>
                          <button type="button" className="secondary-button" onClick={() => deleteItem(key)}>
                            ลบ
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </article>
  )
}