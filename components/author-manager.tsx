"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, User, Mail, Calendar, ImageIcon } from "lucide-react"
import { useAuth } from "@/contexts/auth-context"
import { toast } from "@/hooks/use-toast"
import { apiService } from "@/lib/api"

interface TeamMember {
  Id: number
  OrgCode: number
  Name: string
  Role: string
  Bio: string
  Img: string
  TransDate: string
  IsDeleted: boolean
  IsActive: boolean
  // Social media fields (optional)
  Linkedin?: string
  Twitter?: string
  Facebook?: string
}

export function AuthorManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [formData, setFormData] = useState({
    Name: "",
    Role: "",
    Bio: "",
    Img: "",
    Linkedin: "",
    Twitter: "",
    Facebook: "",
    IsActive: true
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchTeamMembers()
  }, [user])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      if (user?.OrgCode) {
        // Use the correct API endpoint for team members
        const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/org/${user.OrgCode}`)
        const result = await response.json()
        
        if (result.success && result.data) {
          setTeamMembers(result.data)
        } else {
          setTeamMembers([])
        }
      }
    } catch (error) {
      console.error("Error fetching team members:", error)
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (!user?.OrgCode) return

      const memberData = {
        ...formData,
        OrgCode: user.OrgCode,
        IsActive: true,
        IsDeleted: false
      }

      if (editingMember) {
        // Update existing member
        const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/${editingMember.Id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData)
        })

        if (!response.ok) throw new Error("Failed to update team member")
        
        toast({
          title: "Success",
          description: "Team member updated successfully",
        })
      } else {
        // Create new member
        const response = await fetch("https://api.smartcorpweb.com/api/blog/authors", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(memberData)
        })

        if (!response.ok) throw new Error("Failed to create team member")
        
        toast({
          title: "Success",
          description: "Team member created successfully",
        })
      }

      resetForm()
      setIsCreateModalOpen(false)
      fetchTeamMembers()
    } catch (error) {
      console.error("Error saving team member:", error)
      toast({
        title: "Error",
        description: editingMember ? "Failed to update team member" : "Failed to create team member",
        variant: "destructive",
      })
    }
  }

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      Name: member.Name,
      Role: member.Role,
      Bio: member.Bio,
      Img: member.Img,
      Linkedin: member.Linkedin || "",
      Twitter: member.Twitter || "",
      Facebook: member.Facebook || "",
      IsActive: member.IsActive
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/blog/authors/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) throw new Error("Failed to delete team member")

      toast({
        title: "Success",
        description: "Team member deleted successfully",
      })
      fetchTeamMembers()
    } catch (error) {
      console.error("Error deleting team member:", error)
      toast({
        title: "Error",
        description: "Failed to delete team member",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      Name: "",
      Role: "",
      Bio: "",
      Img: "",
      Linkedin: "",
      Twitter: "",
      Facebook: "",
      IsActive: true
    })
    setEditingMember(null)
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Here you would typically upload the file to your server
    // For now, we'll just use a placeholder
    toast({
      title: "Image upload",
      description: "Image upload functionality would be implemented here",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
          <p className="text-muted-foreground">Manage your team members and their information</p>
        </div>
        <Dialog
          open={isCreateModalOpen}
          onOpenChange={(open) => {
            setIsCreateModalOpen(open)
            if (!open) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="bg-primary hover:bg-primary/90">
              <Plus className="w-4 h-4 mr-2" />
              Add Team Member
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Edit Team Member" : "Add New Team Member"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={formData.Name}
                  onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="role">Role *</Label>
                <Input
                  id="role"
                  value={formData.Role}
                  onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.Bio}
                  onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                  rows={3}
                  placeholder="Brief description of the team member..."
                />
              </div>
              <div>
                <Label htmlFor="image">Profile Image</Label>
                <div className="flex gap-2">
                  <Input
                    id="image"
                    value={formData.Img}
                    onChange={(e) => setFormData({ ...formData, Img: e.target.value })}
                    placeholder="Image URL or path"
                  />
                  <Button type="button" variant="outline" onClick={() => document.getElementById('imageUpload')?.click()}>
                    <ImageIcon className="w-4 h-4" />
                  </Button>
                  <input
                    id="imageUpload"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-2">
                <div>
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.Linkedin}
                    onChange={(e) => setFormData({ ...formData, Linkedin: e.target.value })}
                    placeholder="URL"
                  />
                </div>
                <div>
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.Twitter}
                    onChange={(e) => setFormData({ ...formData, Twitter: e.target.value })}
                    placeholder="URL"
                  />
                </div>
                <div>
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.Facebook}
                    onChange={(e) => setFormData({ ...formData, Facebook: e.target.value })}
                    placeholder="URL"
                  />
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="isActive"
                  checked={formData.IsActive}
                  onChange={(e) => setFormData({ ...formData, IsActive: e.target.checked })}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="isActive">Active</Label>
              </div>
              <div className="flex gap-2 pt-4">
                <Button type="submit" className="flex-1">
                  {editingMember ? "Update" : "Create"} Team Member
                </Button>
                <Button type="button" variant="outline" onClick={() => setIsCreateModalOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <AnimatePresence>
          {teamMembers.map((member) => (
            <motion.div
              key={member.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="hover:shadow-md transition-shadow h-full">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {member.Img ? (
                        <img
                          src={member.Img || "/placeholder.svg"}
                          alt={member.Name}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="w-6 h-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{member.Name}</CardTitle>
                        <div className="text-sm text-muted-foreground">
                          {member.Role}
                        </div>
                      </div>
                    </div>
                    <Badge variant={member.IsActive ? "default" : "secondary"}>
                      {member.IsActive ? "Active" : "Inactive"}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  {member.Bio && <p className="text-sm text-muted-foreground mb-3 line-clamp-3">{member.Bio}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="w-3 h-3" />
                      {new Date(member.TransDate).toLocaleDateString()}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                        <Edit className="w-3 h-3" />
                      </Button>
                      {/* <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDelete(member.Id)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="w-3 h-3" />
                      </Button> */}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {teamMembers.length === 0 && !loading && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-12">
          <User className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">Get started by adding your first team member</p>
          <Button onClick={() => setIsCreateModalOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Team Member
          </Button>
        </motion.div>
      )}
    </div>
  )
}