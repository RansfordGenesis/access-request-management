'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/components/ui/use-toast"
import { useRouter } from 'next/navigation'

const departments = [
  "Infrastructure",
  "Engineering",
  "Merchant Relations",
  "Direct-To-Customer",
  "User Experience & Marketing",
  "Commercial & New Markets",
  "Product & User Care",
  "Internal Affairs",
  "General Management",
  "Finance"
]

const mainAwsAccounts = ["Core Payment", "AI Labs", "Vortex", "Hubtel", "Hubtel Developers"]
const govAwsAccounts = ["Logging", "Backup", "Network", "Production"]
const graylogAccess = [
  "Hubtel Merchants", "Payments", "Instant Services", "Mobile", "Messaging and USSD",
  "Hubtel QC", "Hubtel Portals", "Hubtel Retailer", "Hubtel Customer and Merchants",
  "Fraud Payment", "InfoSec"
]
const esKibanaAccess = [
  "Messaging ES", "Send Money ES", "Receive Money ES", "Ecommerce Search ES",
  "Elastic Search Stream ES", "Graylog ES", "Health OS", "Hubtel Paylinks ES",
  "Instant Services ES", "Internal Audit OS", "Lend Score OS", "Marketing Portal ES",
  "RIsk Profile OS", "ML ES"
]
const other = [
  "Metabase", "NITA DB Server", "NITA WEB Server", "New Relic", "Azure DevOps",
  "Coudflare", "Windows JumpBox", "Kannel", "Business Center", "Spacelift",
  "Ghipss Server", "ICC", "Webmin"
]

const formSchema = z.object({
  email: z.string().email(),
  fullName: z.string().min(2).max(50),
  department: z.string(),
  jobTitle: z.string().min(2).max(50),
  mainAws: z.array(z.string()).optional(),
  govAws: z.array(z.string()).optional(),
  graylog: z.array(z.string()).optional(),
  esKibana: z.array(z.string()).optional(),
  other: z.array(z.string()).optional(),
})

export function RequestForm() {
  const [department, setDepartment] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      fullName: '',
      department: '',
      jobTitle: '',
      mainAws: [],
      govAws: [],
      graylog: [],
      esKibana: [],
      other: [],
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)
    setError(null)
    try {
      const response = await fetch('/api/submit-request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      })

      if (response.ok) {
        const result = await response.json()
        router.push(`/request/confirmation?id=${result.id}`)
      } else {
        throw new Error('Failed to submit request')
      }
    } catch (error) {
      setError('Failed to submit request. Please try again.')
      toast({
        title: "Error",
        description: "Failed to submit request. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const showAllSections = department === 'Infrastructure' || department === 'Engineering'

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Email</FormLabel>
              <FormControl>
                <Input placeholder="email@example.com" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="fullName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Full Name</FormLabel>
              <FormControl>
                <Input placeholder="John Doe" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="department"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Department</FormLabel>
              <Select onValueChange={(value) => {
                field.onChange(value)
                setDepartment(value)
              }}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a department" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="jobTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Job Title</FormLabel>
              <FormControl>
                <Input placeholder="Software Engineer" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {department && (
          <>
            {(showAllSections || department === 'Infrastructure' || department === 'Engineering') && (
              <>
                <FormField
                  control={form.control}
                  name="mainAws"
                  render={() => (
                    <FormItem>
                      <FormLabel>Main AWS Accounts</FormLabel>
                      <div className="space-y-2">
                        {mainAwsAccounts.map((account) => (
                          <FormField
                            key={account}
                            control={form.control}
                            name="mainAws"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={account}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(account)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, account])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== account
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {account}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="govAws"
                  render={() => (
                    <FormItem>
                      <FormLabel>Gov AWS Accounts</FormLabel>
                      <div className="space-y-2">
                        {govAwsAccounts.map((account) => (
                          <FormField
                            key={account}
                            control={form.control}
                            name="govAws"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={account}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(account)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, account])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== account
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {account}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="graylog"
                  render={() => (
                    <FormItem>
                      <FormLabel>Graylog Access Request</FormLabel>
                      <div className="space-y-2">
                        {graylogAccess.map((access) => (
                          <FormField
                            key={access}
                            control={form.control}
                            name="graylog"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={access}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(access)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, access])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== access
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {access}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="esKibana"
                  render={() => (
                    <FormItem>
                      <FormLabel>ES/Kibana Access Request</FormLabel>
                      <div className="space-y-2">
                        {esKibanaAccess.map((access) => (
                          <FormField
                            key={access}
                            control={form.control}
                            name="esKibana"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={access}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(access)}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, access])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== access
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {access}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}
            <FormField
              control={form.control}
              name="other"
              render={() => (
                <FormItem>
                  <FormLabel>Other Access Request</FormLabel>
                  <div className="space-y-2">
                    {other.map((access) => (
                      <FormField
                        key={access}
                        control={form.control}
                        name="other"
                        render={({ field }) => {
                          return (
                            <FormItem
                              key={access}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={field.value?.includes(access)}
                                  onCheckedChange={(checked) => {
                                    return checked
                                      ? field.onChange([...field.value, access])
                                      : field.onChange(
                                          field.value?.filter(
                                            (value) => value !== access
                                          )
                                        )
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="font-normal">
                                {access}
                              </FormLabel>
                            </FormItem>
                          )
                        }}
                      />
                    ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Submitting...' : 'Submit Request'}
        </Button>
      </form>
      {error && (
        <div className="text-red-500 mt-2">{error}</div>
      )}
    </Form>
  )
}

