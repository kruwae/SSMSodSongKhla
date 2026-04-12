import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'

export default function EmployeeProfilePage(): JSX.Element {
  return (
    <SectionCard title="Profile" description="Manage your employee information.">
      <EmptyState
        title="Profile settings placeholder"
        description="Profile editing, password updates, and preferences can be added here."
      />
    </SectionCard>
  )
}