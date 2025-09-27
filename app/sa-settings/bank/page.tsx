"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Pencil, Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { DashboardLayout } from "@/components/dashboard-layout"

interface OrgBank {
  OrgBankId: number
  OrgCode: number
  ACHolderName: string
  BankAccount: string
  BankCode: string
  BankBranch: string
  BankIFSC: string
  AccountType: string
  Status: string
}

export default function BankPage() {
  const [banks, setBanks] = useState<OrgBank[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingBank, setEditingBank] = useState<OrgBank | null>(null)
  const [formData, setFormData] = useState({
    OrgCode: "",
    ACHolderName: "",
    BankAccount: "",
    BankCode: "",
    BankBranch: "",
    BankIFSC: "",
    AccountType: "",
    Status: "Active",
  })
  const { toast } = useToast()

  const API_BASE_URL = "https://api.smartcorpweb.com/api/masterorg/org-banks"

  const fetchBanks = async () => {
    setLoading(true)
    try {
      const response = await fetch(`${API_BASE_URL}/all`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()
      setBanks(data)
    } catch (e: any) {
      toast({
        title: "Error",
        description: "Failed to fetch organisation banks.",
        variant: "destructive",
      })
      console.error("Failed to fetch organisation banks:", e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchBanks()
  }, [])

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value)
    setCurrentPage(1)
  }

  const filteredBanks = banks.filter((bank) =>
    Object.values(bank).some((value) => String(value).toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentItems = filteredBanks.slice(indexOfFirstItem, indexOfLastItem)

  const totalPages = Math.ceil(filteredBanks.length / itemsPerPage)

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber)

  const handleAddClick = () => {
    setEditingBank(null)
    setFormData({
      OrgCode: "",
      ACHolderName: "",
      BankAccount: "",
      BankCode: "",
      BankBranch: "",
      BankIFSC: "",
      AccountType: "",
      Status: "Active",
    })
    setDialogOpen(true)
  }

  const handleEditClick = (bank: OrgBank) => {
    setEditingBank(bank)
    setFormData({
      OrgCode: String(bank.OrgCode),
      ACHolderName: bank.ACHolderName,
      BankAccount: bank.BankAccount,
      BankCode: bank.BankCode,
      BankBranch: bank.BankBranch,
      BankIFSC: bank.BankIFSC,
      AccountType: bank.AccountType,
      Status: bank.Status,
    })
    setDialogOpen(true)
  }

  const handleDialogClose = () => {
    setDialogOpen(false)
    setEditingBank(null)
  }

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    const payload = {
      ...formData,
      OrgCode: Number.parseInt(formData.OrgCode),
      TransBy: "Admin", // Assuming a default user for now
      TranByUpdate: "Admin", // Assuming a default user for now
    }

    try {
      const method = editingBank ? "PUT" : "POST"
      const url = editingBank ? `${API_BASE_URL}/${editingBank.OrgBankId}` : API_BASE_URL

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      toast({
        title: "Success",
        description: `Organisation bank ${editingBank ? "updated" : "created"} successfully.`,
      })

      await fetchBanks()
      handleDialogClose()
    } catch (e: any) {
      toast({
        title: "Error",
        description: `Failed to ${editingBank ? "update" : "create"} organisation bank.`,
        variant: "destructive",
      })
      console.error(`Failed to ${editingBank ? "update" : "create"} organisation bank:`, e)
    } finally {
      setLoading(false)
    }
  }

  if (loading) return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  // if (error) return <div className="p-4 text-center text-red-500">Error: {error}</div>

  return (
      <DashboardLayout>
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Organisation Bank Settings</h1>
        <Button onClick={handleAddClick} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> New
        </Button>
      </div>

      <div className="flex items-center justify-between mb-4">
        <Input placeholder="Search banks..." value={searchTerm} onChange={handleSearchChange} className="max-w-sm" />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              
              <TableHead>Org Code</TableHead>
              <TableHead>Account Holder Name</TableHead>
              <TableHead>Bank Account</TableHead>
              <TableHead>Bank Code</TableHead>
              <TableHead>Bank Branch</TableHead>
              <TableHead>Bank IFSC</TableHead>
              <TableHead>Account Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {currentItems.map((bank) => (
              <TableRow key={bank.OrgBankId}>
                 
                <TableCell className="font-medium">{bank.OrgCode}</TableCell>
                <TableCell>{bank.ACHolderName}</TableCell>
                <TableCell>{bank.BankAccount}</TableCell>
                <TableCell>{bank.BankCode}</TableCell>
                <TableCell>{bank.BankBranch}</TableCell>
                <TableCell>{bank.BankIFSC}</TableCell>
                <TableCell>{bank.AccountType}</TableCell>
                <TableCell>{bank.Status}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" onClick={() => handleEditClick(bank)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-end space-x-2 py-4">
        <Button variant="outline" size="sm" onClick={() => paginate(currentPage - 1)} disabled={currentPage === 1}>
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => paginate(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
        </Button>
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingBank ? "Organisation Bank Settings(Update)" : "Organisation Bank Settings(New)"}</DialogTitle>
           
          </DialogHeader>
          <form onSubmit={handleFormSubmit} className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="OrgCode" className="text-right">
                Org Code
              </Label>
              <Input
                id="OrgCode"
                name="OrgCode"
                type="number"
                value={formData.OrgCode}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="ACHolderName" className="text-right">
                Account Holder Name
              </Label>
              <Input
                id="ACHolderName"
                name="ACHolderName"
                value={formData.ACHolderName}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="BankAccount" className="text-right">
                Bank Account
              </Label>
              <Input
                id="BankAccount"
                name="BankAccount"
                value={formData.BankAccount}
                onChange={handleFormChange}
                className="col-span-3"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="BankCode" className="text-right">
                Bank Code
              </Label>
              <Input
                id="BankCode"
                name="BankCode"
                value={formData.BankCode}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="BankBranch" className="text-right">
                Bank Branch
              </Label>
              <Input
                id="BankBranch"
                name="BankBranch"
                value={formData.BankBranch}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="BankIFSC" className="text-right">
                Bank IFSC
              </Label>
              <Input
                id="BankIFSC"
                name="BankIFSC"
                value={formData.BankIFSC}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="AccountType" className="text-right">
                Account Type
              </Label>
              <Input
                id="AccountType"
                name="AccountType"
                value={formData.AccountType}
                onChange={handleFormChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="Status" className="text-right">
                Status
              </Label>
              <select
                name="Status"
                id="Status"
                value={formData.Status}
                onChange={handleFormChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm col-span-3"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={handleDialogClose}>
                Cancel
              </Button>
              <Button type="submit">{editingBank ? "Save" : "Save"}</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
</DashboardLayout>
  )
}
