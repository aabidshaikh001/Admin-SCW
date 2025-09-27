"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { teamMemberApi, type TeamMember } from "@/lib/api"
import { Plus, Edit, Trash2, User, Linkedin, Twitter, Facebook, Search, Upload, X } from "lucide-react"

export function TeamMemberManager() {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null)
  const [uploadingImage, setUploadingImage] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()
  const { user } = useAuth()

  const [formData, setFormData] = useState<Partial<TeamMember>>({
    Name: "",
    Role: "",
    Bio: "",
    Linkedin: "",
    Twitter: "",
    Facebook: "",
    Image: "",
    IsActive: true,
  })

  useEffect(() => {
    if (user?.OrgCode) {
      fetchTeamMembers()
    }
  }, [user?.OrgCode])

  const fetchTeamMembers = async () => {
    try {
      setLoading(true)
      const data = await teamMemberApi.getByOrg(user?.OrgCode.toString() || "")
      setTeamMembers(data)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch team members",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return

  if (!file.type.startsWith("image/")) {
    toast({
      title: "Error",
      description: "Please select an image file",
      variant: "destructive",
    })
    return
  }

  if (file.size > 5 * 1024 * 1024) {
    toast({
      title: "Error",
      description: "Image size must be less than 5MB",
      variant: "destructive",
    })
    return
  }

  try {
    setUploadingImage(true)
    const formData = new FormData()
    formData.append("image", file)

    const response = await fetch("https://api.smartcorpweb.com/api/teammembers/upload", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Failed to upload image")
    }

    const result: { imageUrl: string } = await response.json()

    setFormData((prev) => ({ ...prev, Image: result.imageUrl }))

    toast({
      title: "Success",
      description: "Image uploaded successfully",
    })
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to upload image",
      variant: "destructive",
    })
  } finally {
    setUploadingImage(false)
  }
}

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!formData.Name || !formData.Role) {
    toast({
      title: "Error",
      description: "Name and Role are required",
      variant: "destructive",
    });
    return;
  }

  try {
    const formDataToSend = new FormData();
    
    // Append all form data
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formDataToSend.append(key, value.toString());
      }
    });
    
    // Append the image file if it exists
    if (fileInputRef.current?.files?.[0]) {
      formDataToSend.append('image', fileInputRef.current.files[0]);
    }
    
    // Append existing image for updates
    if (editingMember?.Image) {
      formDataToSend.append('existingImage', editingMember.Image);
    }

    if (editingMember) {
      await teamMemberApi.update(editingMember.Id!.toString(), formDataToSend);
      toast({
        title: "Success",
        description: "Team member updated successfully",
      });
    } else {
      await teamMemberApi.create(formDataToSend);
      toast({
        title: "Success",
        description: "Team member created successfully",
      });
    }

    resetForm();
    fetchTeamMembers();
  } catch (error) {
    toast({
      title: "Error",
      description: `Failed to ${editingMember ? "update" : "create"} team member`,
      variant: "destructive",
    });
  }
};
  const handleToggleActive = async (member: TeamMember) => {
  try {
    const response = await fetch(
      `https://api.smartcorpweb.com/api/teammembers/${member.Id}/toggle-active`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      }
    )

    if (!response.ok) {
      throw new Error("Failed to toggle active status")
    }

    const result: { isActive: boolean } = await response.json()

    toast({
      title: "Success",
      description: `Team member ${
        result.isActive ? "activated" : "deactivated"
      } successfully`,
    })

    fetchTeamMembers()
  } catch (error) {
    toast({
      title: "Error",
      description: "Failed to update team member status",
      variant: "destructive",
    })
  }
}

  const handleEdit = (member: TeamMember) => {
    setEditingMember(member)
    setFormData({
      Name: member.Name,
      Role: member.Role,
      Bio: member.Bio || "",
      Linkedin: member.Linkedin || "",
      Twitter: member.Twitter || "",
      Facebook: member.Facebook || "",
      Image: member.Image || "",
      IsActive: member.IsActive,
    })
    setIsCreateModalOpen(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this team member?")) return

    try {
      await teamMemberApi.delete(id.toString())
      toast({
        title: "Success",
        description: "Team member deleted successfully",
      })
      fetchTeamMembers()
    } catch (error) {
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
      Linkedin: "",
      Twitter: "",
      Facebook: "",
      Image: "",
      IsActive: true,
    })
    setEditingMember(null)
    setIsCreateModalOpen(false)
  }

  const removeImage = () => {
    setFormData(prev => ({ ...prev, Image: "" }))
  }

  const filteredMembers = teamMembers.filter(
    (member) =>
      member.Name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.Role.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Team Members</h2>
      
        </div>
        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="h-4 w-4 mr-2" />
             New
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{editingMember ? "Team Members(Update)" : "Team Members(New)"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name *</Label>
                  <Input
                    id="name"
                    value={formData.Name}
                    onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                    placeholder="Enter member name"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role *</Label>
                  <Input
                    id="role"
                    value={formData.Role}
                    onChange={(e) => setFormData({ ...formData, Role: e.target.value })}
                    placeholder="Enter member role"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="bio">Bio</Label>
                <Textarea
                  id="bio"
                  value={formData.Bio}
                  onChange={(e) => setFormData({ ...formData, Bio: e.target.value })}
                  placeholder="Enter member bio"
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Team Photo</Label>
                <div className="flex items-center gap-4">
                 <input
  type="file"
  ref={fileInputRef}
  accept="image/*"
  className="hidden"
  // Remove the onChange handler since we'll handle it during form submission
/>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploadingImage}
                  >
                    <Upload className="h-4 w-4 mr-2" />
                    {uploadingImage ? "Uploading..." : "Upload Image"}
                  </Button>
                  {formData.Image && (
                    <div className="flex items-center gap-2">
                      <img
                        src={`https://api.smartcorpweb.com${formData.Image}`}
                        alt="Preview"
                        className="w-12 h-12 rounded object-cover"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={removeImage}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">
                  Upload a square image (max 5MB)
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="linkedin">LinkedIn</Label>
                  <Input
                    id="linkedin"
                    value={formData.Linkedin}
                    onChange={(e) => setFormData({ ...formData, Linkedin: e.target.value })}
                    placeholder="LinkedIn URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="twitter">Twitter</Label>
                  <Input
                    id="twitter"
                    value={formData.Twitter}
                    onChange={(e) => setFormData({ ...formData, Twitter: e.target.value })}
                    placeholder="Twitter URL"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="facebook">Facebook</Label>
                  <Input
                    id="facebook"
                    value={formData.Facebook}
                    onChange={(e) => setFormData({ ...formData, Facebook: e.target.value })}
                    placeholder="Facebook URL"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={resetForm}>
                  Cancel
                </Button>
                <Button type="submit" disabled={uploadingImage}>
                  {editingMember ? "Save" : "Save"} 
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center gap-2">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search team members..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
      </div>

      <AnimatePresence>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredMembers.map((member, index) => (
            <motion.div
              key={member.Id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      {member.Image ? (
                      <img
  src={member.Image ? `https://api.smartcorpweb.com${member.Image}` : "/placeholder.svg"}
  alt={member.Name}
  className="w-12 h-12 rounded-full object-cover"
/>

                      ) : (
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                          <User className="h-6 w-6 text-primary" />
                        </div>
                      )}
                      <div>
                        <CardTitle className="text-lg">{member.Name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{member.Role}</p>
                      </div>
                    </div>
                    <Button
                      variant={member.IsActive ? "default" : "secondary"}
                      size="sm"
                      onClick={() => handleToggleActive(member)}
                      className="cursor-pointer"
                    >
                      {member.IsActive ? "Active" : "Inactive"}
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {member.Bio && <p className="text-sm text-muted-foreground line-clamp-3">{member.Bio}</p>}

                  <div className="flex items-center gap-2">
                    {member.Linkedin && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={member.Linkedin} target="_blank" rel="noopener noreferrer">
                          <Linkedin className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {member.Twitter && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={member.Twitter} target="_blank" rel="noopener noreferrer">
                          <Twitter className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                    {member.Facebook && (
                      <Button size="sm" variant="outline" asChild>
                        <a href={member.Facebook} target="_blank" rel="noopener noreferrer">
                          <Facebook className="h-4 w-4" />
                        </a>
                      </Button>
                    )}
                  </div>

                  <div className="flex justify-end gap-2 pt-2">
                    <Button size="sm" variant="outline" onClick={() => handleEdit(member)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    {/* <Button size="sm" variant="outline" onClick={() => handleDelete(member.Id!)}>
                      <Trash2 className="h-4 w-4" />
                    </Button> */}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </AnimatePresence>

      {filteredMembers.length === 0 && (
        <div className="text-center py-12">
          <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No team members found</h3>
          <p className="text-muted-foreground mb-4">
            {searchTerm ? "No team members match your search." : "Get started by adding your first team member."}
          </p>
          {!searchTerm && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
             New
            </Button>
          )}
        </div>
      )}
    </div>
  )
}