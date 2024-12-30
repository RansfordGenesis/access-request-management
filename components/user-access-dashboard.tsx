'use client'

import { useState, useEffect } from 'react'
import { DataTable } from './data-table'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast"
import { ColumnDef } from "@tanstack/react-table"

interface UserAccess {
  Email: string
  Name: string
  Job_Title: string
  Department: string
  ApprovedBy: string
  [key: string]: string | string[]
}

type AccessCategories = Record<string, string[]>;

const accessCategories: AccessCategories = {
  "Main AWS": ["Main_Aws_Ai_labs", "Main_Aws_Core_payment", "Main_Aws_Hubtel", "Main_Aws_Hubtel_developers", "Main_Aws_Vortex"],
  "Gov AWS": ["Gov_Aws_Backup", "Gov_Aws_Logging", "Gov_Aws_Network", "Gov_Aws_Production"],
  "Graylog": ["Graylog_Fraud_payment", "Graylog_Hubtel_customer_and_merchants", "Graylog_Hubtel_merchants", "Graylog_Hubtel_portals", "Graylog_Hubtel_qc", "Graylog_Hubtel_retailer", "Graylog_Infosec", "Graylog_Instant_services", "Graylog_Messaging_and_ussd", "Graylog_Mobile", "Graylog_Payments"],
  "ES/Kibana": ["ES_Ecommerce_search_es", "ES_Elastic_search_stream_es", "ES_Graylog_es", "ES_Health_os", "ES_Hubtel_paylinks_es", "ES_Instant_services_es", "ES_Internal_audit_os", "ES_Lend_score_os", "ES_Marketing_portal_es", "ES_Messaging_es", "ES_Ml_es", "ES_Receive_money_es", "ES_Risk_profile_os", "ES_Send_money_es"],
  "Others": ["others_Azure_devops", "others_Business_center", "others_Cloudflare", "others_Ghipss_server", "others_Icc", "others_Kannel", "others_Metabase", "others_New_relic", "others_Nita_db_server", "others_Nita_web_server", "others_Spacelift", "others_Webmin", "others_Windows_jumpbox"]
}

const renderAccessList = (category: keyof AccessCategories) => ({ row }: { row: { original: UserAccess } }) => {
  const access = row.original;

  // Get items in the current category that the user has access to
  const items = accessCategories[category].filter((item: string) => access[item] === "Yes");

  // Handle empty lists
  if (items.length === 0) {
    return <span>N/A</span>;
  }

  // Dynamically remove the prefix and clean up the item names
  return (
    <ul className="list-disc pl-5">
      {items.map((item: string) => {
        const prefix = item.split('_', 1)[0] + '_';
        return <li key={item}>{item.replace(prefix, '').replace('_', ' ')}</li>;
      })}
    </ul>
  );
};

const columns: ColumnDef<UserAccess>[] = [
  { accessorKey: "Email", header: "Email" },
  { accessorKey: "Name", header: "Name" },
  { accessorKey: "Job_Title", header: "Job Title" },
  { accessorKey: "Department", header: "Department" },
  { accessorKey: "Main AWS", header: "Main AWS", cell: renderAccessList("Main AWS") },
  { accessorKey: "Gov AWS", header: "Gov AWS", cell: renderAccessList("Gov AWS") },
  { accessorKey: "Graylog", header: "Graylog", cell: renderAccessList("Graylog") },
  { accessorKey: "ES/Kibana", header: "ES/Kibana", cell: renderAccessList("ES/Kibana") },
  { accessorKey: "Others", header: "Others", cell: renderAccessList("Others") }
]

export function UserAccessDashboard() {
  const [userAccesses, setUserAccesses] = useState<UserAccess[]>([])
  const [filteredAccesses, setFilteredAccesses] = useState<UserAccess[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [emailFilter, setEmailFilter] = useState('')
  const [nameFilter, setNameFilter] = useState('')
  const [departmentFilter, setDepartmentFilter] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    fetchUserAccesses()
  }, [])

  useEffect(() => {
    filterAccesses()
  }, [userAccesses, emailFilter, nameFilter, departmentFilter])

  const fetchUserAccesses = async () => {
    try {
      const response = await fetch('/api/get-user-accesses')
      if (response.ok) {
        const data = await response.json()
        setUserAccesses(data)
      } else {
        throw new Error('Failed to fetch user accesses')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user accesses. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const filterAccesses = () => {
    let filtered = userAccesses
    if (emailFilter) {
      filtered = filtered.filter(access => access.Email.toLowerCase().includes(emailFilter.toLowerCase()))
    }
    if (nameFilter) {
      filtered = filtered.filter(access => access.Name.toLowerCase().includes(nameFilter.toLowerCase()))
    }
    if (departmentFilter) {
      filtered = filtered.filter(access => access.Department === departmentFilter)
    }
    setFilteredAccesses(filtered)
  }

  const generateReport = async (format: 'csv' | 'pdf') => {
    try {
      const response = await fetch(`/api/generate-report?format=${format}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filteredAccesses),
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.style.display = 'none'
        a.href = url
        a.download = `user_accesses_report.${format}`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
      } else {
        throw new Error('Failed to generate report')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate report. Please try again.",
        variant: "destructive",
      })
    }
  }
  
  const departments = Array.from(new Set(userAccesses.map(access => access.Department)))

  if (isLoading) {
    return <div>Loading...</div>
  }

  return (
    <div className="space-y-4">
      <div className="flex space-x-4">
        <Input
          placeholder="Filter by email"
          value={emailFilter}
          onChange={(e) => setEmailFilter(e.target.value)}
        />
        <Input
          placeholder="Filter by name"
          value={nameFilter}
          onChange={(e) => setNameFilter(e.target.value)}
        />
        <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
          <SelectTrigger>
            <SelectValue placeholder="Filter by department" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem key="all" value="all">All Departments</SelectItem>
            {departments.map((dept) => (
              <SelectItem key={dept} value={dept}>{dept}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="flex space-x-4">
        <Button onClick={() => generateReport('csv')}>Download CSV</Button>
        <Button onClick={() => generateReport('pdf')}>Download PDF</Button>
      </div>
      <DataTable columns={columns} data={filteredAccesses} />
    </div>
  )
}