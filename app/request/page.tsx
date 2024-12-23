import { RequestForm } from '@/components/request-form'
import ProtectedRoute from '@/components/ProtectedRoute'
import { Header } from '@/components/header'

export default function RequestPage() {
  return (
    <ProtectedRoute>
      <Header />
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-5">Access Request Form</h1>
        <RequestForm />
      </div>
    </ProtectedRoute>
  )
}

