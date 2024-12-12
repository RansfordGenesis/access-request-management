import { RequestForm } from '@/components/request-form'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function RequestPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Access Request Form</h1>
        <RequestForm />
      </div>
    </ProtectedRoute>
  )
}

