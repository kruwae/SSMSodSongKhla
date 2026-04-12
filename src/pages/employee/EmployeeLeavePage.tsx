import EmptyState from '../../components/EmptyState'
import SectionCard from '../../components/SectionCard'

export default function EmployeeLeavePage(): JSX.Element {
  return (
    <SectionCard title="Leave request" description="Submit a new leave request.">
      <EmptyState
        title="Leave form placeholder"
        description="This page is ready for a future react-hook-form + zod form implementation."
      />
    </SectionCard>
  )
}