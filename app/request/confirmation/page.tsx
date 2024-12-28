'use client'

import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { signOut } from 'next-auth/react'

interface RequestDetails {
  id: string;
  email: string;
  fullName: string;
  department: string;
  jobTitle: string;
  mainAws?: string[];
  govAws?: string[];
  graylog?: string[];
  esKibana?: string[];
  otherAccess?: string[];
  status: string;
  createdAt: string;
}

export default function ConfirmationPage() {
  const [request, setRequest] = useState<RequestDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const id = searchParams?.get('id') ?? null

  useEffect(() => {
    const fetchRequest = async () => {
      if (!id) {
        setError('No request ID provided')
        setIsLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/get-request/${id}`)
        if (response.ok) {
          const data = await response.json()
          setRequest(data)
        } else {
          throw new Error('Failed to fetch request')
        }
      } catch (error) {
        setError('Failed to fetch request details. Please try again.')
        toast({
          title: "Error",
          description: "Failed to fetch request details. Please try again.",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchRequest()
  }, [id, toast])

  const handleLogout = () => {
    signOut({ callbackUrl: '/signin' })
  }

  if (isLoading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  if (!request) {
    return <div>No request found</div>
  }

  const renderAccessList = (title: string, items?: string[]) => {
    if (!items || items.length === 0) return null
    return (
      <div>
        <strong>{title}:</strong>
        <ul className="list-disc list-inside">
          {items.map((item: string) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      </div>
    )
  }

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-2xl font-bold mb-5">Request Submitted Successfully</h1>
      <div className="bg-secondary p-6 rounded-lg">
        <h2 className="text-xl font-semibold mb-4">Request Details</h2>
        <p><strong>Request ID:</strong> {request.id}</p>
        <p><strong>Email:</strong> {request.email}</p>
        <p><strong>Full Name:</strong> {request.fullName}</p>
        <p><strong>Department:</strong> {request.department}</p>
        <p><strong>Job Title:</strong> {request.jobTitle}</p>
        <p><strong>Status:</strong> {request.status}</p>
        <p><strong>Submitted on:</strong> {new Date(request.createdAt).toLocaleString()}</p>
        <h3 className="text-lg font-semibold mt-4 mb-2">Requested Access:</h3>
        {renderAccessList("Main AWS Accounts", request.mainAws)}
        {renderAccessList("Gov AWS Accounts", request.govAws)}
        {renderAccessList("Graylog Access", request.graylog)}
        {renderAccessList("ES/Kibana Access", request.esKibana)}
        {renderAccessList("Other Access", request.otherAccess)}
      </div>
      <Button onClick={handleLogout} className="mt-6">Logout</Button>
    </div>
  )
}