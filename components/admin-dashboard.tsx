'use client'

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { MoreHorizontal } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface Request {
  id: string
  email: string
  fullName: string
  department: string
  jobTitle: string
  status: 'Pending' | 'Approved' | 'Rejected'
  createdAt: string
  mainAws?: string[]
  govAws?: string[]
  graylog?: string[]
  esKibana?: string[]
  other?: string[]
}

export function AdminDashboard() {
  const [requests, setRequests] = useState<Request[]>([])
  const [filteredRequests, setFilteredRequests] = useState<Request[]>([])
  const [isLoading, setIsLoading] = useState(true)
  // const { data: session } = useSession()
  const { toast } = useToast()
  const [isApprovalDialogOpen, setIsApprovalDialogOpen] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [selectedRequest, setSelectedRequest] = useState<Request | null>(null)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)
  const [sortBy, setSortBy] = useState<string>('createdAt')
  const [filterStatus, setFilterStatus] = useState<string>('all')

  useEffect(() => {
    fetchRequests()
  }, [])

  useEffect(() => {
    const sorted = [...requests].sort((a, b) => {
      if (sortBy === 'createdAt') {
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      }
      return a[sortBy as keyof Request] > b[sortBy as keyof Request] ? 1 : -1
    })

    const filtered = sorted.filter(request => 
      filterStatus === 'all' || request.status === filterStatus
    )

    setFilteredRequests(filtered)
  }, [requests, sortBy, filterStatus])

  const fetchRequests = async () => {
    try {
      const response = await fetch('/api/get-requests')
      if (response.ok) {
        const data = await response.json()
        setRequests(data)
      } else {
        throw new Error('Failed to fetch requests')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch requests. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleApprove = async (id: string) => {
    const request = requests.find(r => r.id === id)
    if (request) {
      setSelectedRequest(request)
      setSelectedRequestId(id)
      setIsApprovalDialogOpen(true)
    }
  }

  const handleReject = async (id: string) => {
    try {
      const response = await fetch(`/api/reject-request/${id}`, {
        method: 'POST',
      })
      if (response.ok) {
        toast({
          title: "Request rejected",
          description: "The request has been rejected and an email has been sent to the requester.",
        })
        fetchRequests()
      } else {
        throw new Error('Failed to reject request')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to reject request. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handleApproveSelected = async (selectedAccess: string[]) => {
  if (!selectedRequestId || !selectedRequest) return;

  try {
    const payload = {
      RequestedBy: selectedRequest.email,
      Name: selectedRequest.fullName,
      Department: selectedRequest.department,
      "Job Title": selectedRequest.jobTitle,
      "Main AWS": selectedAccess.filter(access => selectedRequest.mainAws?.includes(access)) || [],
      "Gov AWS": selectedAccess.filter(access => selectedRequest.govAws?.includes(access)) || [],
      Graylog: selectedAccess.filter(access => selectedRequest.graylog?.includes(access)) || [],
      ES: selectedAccess.filter(access => selectedRequest.esKibana?.includes(access)) || [],
      Others: selectedAccess.filter(access => selectedRequest.other?.includes(access)) || [],
      ApprovedBy: "admin@example.com",
      UpdatedAt: new Date().toISOString(),
    };

    const response = await fetch(`/api/approve-request/${selectedRequestId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (response.ok) {
      toast({
        title: "Request approved",
        description: "The selected access has been granted.",
      });
      fetchRequests();
      setIsApprovalDialogOpen(false);
    } else {
      throw new Error('Failed to approve request');
    }
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to approve request. Please try again.",
      variant: "destructive",
    });
  }
};

  const handleViewRequest = (request: Request) => {
    setSelectedRequest(request)
    setViewDialogOpen(true)
  }

  const columns = [
    {
      accessorKey: "id",
      header: "Request ID",
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "fullName",
      header: "Full Name",
    },
    {
      accessorKey: "department",
      header: "Department",
    },
    {
      accessorKey: "jobTitle",
      header: "Job Title",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const status = row.getValue("status")
        return (
          <div className={`font-medium ${
            status === 'Approved' ? 'text-green-600' :
            status === 'Rejected' ? 'text-red-600' :
            'text-yellow-600'
          }`}>
            {status}
          </div>
        )
      },
    },
    {
      accessorKey: "createdAt",
      header: "Created At",
      cell: ({ row }) => {
        return new Date(row.getValue("createdAt")).toLocaleString()
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const request = row.original
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => handleViewRequest(request)}>
                View details
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleApprove(request.id)} disabled={request.status !== 'Pending'}>
                Approve
              </DropdownMenuItem>
              <DropdownMenuItem onSelect={() => handleReject(request.id)} disabled={request.status !== 'Pending'}>
                Reject
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ]

  const ApprovalDialog = ({ isOpen, onClose, onApprove, request }: {
    isOpen: boolean
    onClose: () => void
    onApprove: (selectedAccess: string[]) => void
    request: Request | null
  }) => {
    const [selectedAccess, setSelectedAccess] = useState<string[]>([])

    useEffect(() => {
      if (request) {
        setSelectedAccess([
          ...(request.mainAws || []),
          ...(request.govAws || []),
          ...(request.graylog || []),
          ...(request.esKibana || []),
          ...(request.other || []),
        ])
      }
    }, [request])

    if (!request) return null

    const handleApprove = () => {
      onApprove(selectedAccess)
    }

    const renderCheckboxes = (title: string, items?: string[]) => {
      if (!items || items.length === 0) return null
      return (
        <div>
          <h3 className="font-semibold mt-2">{title}</h3>
          {items.map((item) => (
            <div key={item} className="flex items-center">
              <Checkbox
                id={item}
                checked={selectedAccess.includes(item)}
                onCheckedChange={(checked) => {
                  setSelectedAccess(checked
                    ? [...selectedAccess, item]
                    : selectedAccess.filter((a) => a !== item)
                  )
                }}
              />
              <label htmlFor={item} className="ml-2">{item}</label>
            </div>
          ))}
        </div>
      )
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve Access Request</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Select the access to grant for {request.email}:</p>
            {renderCheckboxes("Main AWS Accounts", request.mainAws)}
            {renderCheckboxes("Gov AWS Accounts", request.govAws)}
            {renderCheckboxes("Graylog Access", request.graylog)}
            {renderCheckboxes("ES/Kibana Access", request.esKibana)}
            {renderCheckboxes("Other Access", request.other)}
          </div>
          <DialogFooter>
            <Button onClick={onClose} variant="outline">Cancel</Button>
            <Button onClick={handleApprove}>Approve Selected</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    )
  }

  const ViewRequestDialog = ({ isOpen, onClose, request }: {
    isOpen: boolean
    onClose: () => void
    request: Request | null
  }) => {
    if (!request) return null

    const renderAccessList = (title: string, items?: string[]) => {
      if (!items || items.length === 0) return null
      return (
        <div>
          <strong>{title}:</strong>
          <ul className="list-disc list-inside">
            {items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>
      )
    }

    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <p><strong>ID:</strong> {request.id}</p>
            <p><strong>Email:</strong> {request.email}</p>
            <p><strong>Full Name:</strong> {request.fullName}</p>
            <p><strong>Department:</strong> {request.department}</p>
            <p><strong>Job Title:</strong> {request.jobTitle}</p>
            <p><strong>Status:</strong> {request.status}</p>
            <p><strong>Created At:</strong> {new Date(request.createdAt).toLocaleString()}</p>
            <h3 className="text-lg font-semibold mt-4 mb-2">Requested Access:</h3>
            {renderAccessList("Main AWS Accounts", request.mainAws)}
            {renderAccessList("Gov AWS Accounts", request.govAws)}
            {renderAccessList("Graylog Access", request.graylog)}
            {renderAccessList("ES/Kibana Access", request.esKibana)}
            {renderAccessList("Other Access", request.other)}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  // const handleLogout = () => {
  //   signOut({ callbackUrl: '/signin' })
  // }

  const totalRequests = requests.length
  const approvedRequests = requests.filter(r => r.status === 'Approved').length
  const rejectedRequests = requests.filter(r => r.status === 'Rejected').length
  const pendingRequests = requests.filter(r => r.status === 'Pending').length

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Approved Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{approvedRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Rejected Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{rejectedRequests}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingRequests}</div>
          </CardContent>
        </Card>
      </div>
      <div className="flex justify-between mb-4">
        <Select value={sortBy} onValueChange={setSortBy}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort by" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="createdAt">Date</SelectItem>
            <SelectItem value="department">Department</SelectItem>
            <SelectItem value="status">Status</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="Pending">Pending</SelectItem>
            <SelectItem value="Approved">Approved</SelectItem>
            <SelectItem value="Rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <DataTable columns={columns} data={filteredRequests} />
      <ApprovalDialog
        isOpen={isApprovalDialogOpen}
        onClose={() => setIsApprovalDialogOpen(false)}
        onApprove={handleApproveSelected}
        request={selectedRequest}
      />
      <ViewRequestDialog
        isOpen={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        request={selectedRequest}
      />
    </div>
  )
}

