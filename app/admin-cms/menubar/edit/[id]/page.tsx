"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { ArrowLeft, Save, Eye } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Menu {
  id: number
  OrgCode: number
  name: string
  type: string
  parentId: number | null
  img: string | null
  URL: string | null
  textColor: string | null
  isButton: boolean
  buttonColor: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

interface MainMenu {
  id: number
  name: string
  parentId: number
}

export default function EditMenuPage({ params }: { params: { id: string } }) {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const router = useRouter()
  const [mainMenus, setMainMenus] = useState<MainMenu[]>([])
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [menu, setMenu] = useState<Menu | null>(null)
  const [formData, setFormData] = useState({
    OrgCode: orgCode,
    name: "",
    type: "",
    parentId: "",
    img: null as File | null,
    URL: "",
    textColor: "#000000",
    isButton: false,
    buttonColor: "#007bff",
    isActive: true,
  })

  // Fetch main menus for dropdown
  useEffect(() => {
    const fetchMainMenus = async () => {
      try {
        const response = await fetch(`https://api.smartcorpweb.com/api/menu/main-menus?OrgCode=${orgCode}`)
        if (response.ok) {
          const menus = await response.json()
          setMainMenus(menus)
        }
      } catch (error) {
        console.error("Error fetching main menus:", error)
      }
    }
    
    fetchMainMenus()
  }, [orgCode])

  useEffect(() => {
    fetchMenu()
  }, [params.id])

  const fetchMenu = async () => {
    try {
      setInitialLoading(true)
      const response = await fetch(`https://api.smartcorpweb.com/api/menu/${params.id}?OrgCode=${orgCode}`)
      if (response.ok) {
        const menuData = await response.json()
        setMenu(menuData)
        setFormData({
          OrgCode: menuData.OrgCode || orgCode,
          name: menuData.name || "",
          type: menuData.type || "",
          parentId: menuData.parentId?.toString() || "",
          img: null,
          URL: menuData.URL || "",
          textColor: menuData.textColor || "#000000",
          isButton: menuData.isButton || false,
          buttonColor: menuData.buttonColor || "#007bff",
          isActive: menuData.isActive ?? true,
        })
      } else {
        alert("Menu not found")
        router.push("/admin-cms/menubar")
      }
    } catch (error) {
      console.error("Error fetching menu:", error)
      alert("Error loading menu")
    } finally {
      setInitialLoading(false)
    }
  }

  const handleInputChange = (field: string, value: any) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null
    setFormData((prev) => ({
      ...prev,
      img: file,
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)

  try {
    const submitData = new FormData()
    submitData.append("name", formData.name)
    submitData.append("type", formData.type)

if (formData.type === "sub") {
  submitData.append("parentId", formData.parentId || "")
} else {
  submitData.append("parentId", "") // ✅ reset for main menus
}


    if (formData.img) {
      submitData.append("img", formData.img) // new file
    } else if (menu?.img) {
      submitData.append("existingImg", menu.img) // keep old file
    }

    submitData.append("URL", formData.URL)
    submitData.append("textColor", formData.textColor)

    // ✅ Only send when true, otherwise nothing
    if (formData.isButton) {
      submitData.append("isButton", "1") // BIT expects 0/1
      submitData.append("buttonColor", formData.buttonColor)
    }

    submitData.append("isActive", formData.isActive ? "1" : "0")

    const response = await fetch(
      `https://api.smartcorpweb.com/api/menu/${params.id}?OrgCode=${orgCode}`,
      {
        method: "PUT",
        body: submitData,
      }
    )

    if (response.ok) {
      router.push("/admin-cms/menubar")
    } else {
      const error = await response.json()
      alert(`Error: ${error.message || "Failed to update menu item"}`)
    }
  } catch (error) {
    console.error("Error updating menu:", error)
    alert("Error updating menu item")
  } finally {
    setLoading(false)
  }
}


  if (initialLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Loading menu...</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

  if (!menu) {
    return (
      <DashboardLayout>
        <div className="container mx-auto p-6">
          <div className="flex items-center justify-center h-64">
            <div className="text-lg">Menu not found</div>
          </div>
        </div>
      </DashboardLayout>
    )
  }

    return (
    <DashboardLayout>
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin-cms/menubar">
          <Button variant="outline" size="sm">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Menus
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Menu Management(Update)</h1>
       
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Menu Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Menu Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter menu name"
                    required
                  />
                </div>

            <div>
  <Label htmlFor="type">Menu Type</Label>
   <Select 
                    value={formData.type} 
                    onValueChange={(value) => handleInputChange("type", value)}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select menu type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="main">Main Menu</SelectItem>
                      <SelectItem value="sub">Sub Menu</SelectItem>
                    </SelectContent>
                  </Select>
</div>
               

                {formData.type === "sub" && (
                  <div>
                    <Label htmlFor="parentId">Parent Menu *</Label>
                    <Select 
                      value={formData.parentId} 
                      onValueChange={(value) => handleInputChange("parentId", value)}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent menu" />
                      </SelectTrigger>
                      <SelectContent>
                       {mainMenus
 
  .map(menu => (
   <SelectItem key={menu.id} value={menu.id.toString()}>
      {menu.name} (ID: {menu.id})
    </SelectItem>
))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
                <div>
                  <Label htmlFor="URL">URL</Label>
                  <Input
                    id="URL"
                    value={formData.URL}
                    onChange={(e) => handleInputChange("URL", e.target.value)}
                    placeholder="Enter URL (e.g., /about, https://example.com)"
                  />
                </div>

             {formData.type !== "sub" && (
  <div>
    <Label htmlFor="img">Menu Image</Label>
    <Input id="img" type="file" accept="image/*" onChange={handleFileChange} />
  </div>
)}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Styling Options</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="textColor">Text Color</Label>
                <div className="flex gap-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={formData.textColor}
                    onChange={(e) => handleInputChange("textColor", e.target.value)}
                    className="w-16 h-10"
                  />
                  <Input
                    value={formData.textColor}
                    onChange={(e) => handleInputChange("textColor", e.target.value)}
                    placeholder="#000000"
                    className="flex-1"
                  />
                </div>
              </div>

              {formData.type !== "sub" && (
  <div>
    <div className="flex items-center justify-between">
      <div>
        <Label htmlFor="isButton">Display as Button</Label>
        <p className="text-sm text-muted-foreground">Show this menu item as a button</p>
      </div>
      <Switch
        id="isButton"
        checked={formData.isButton}
        onCheckedChange={(checked) => handleInputChange("isButton", checked)}
      />
    </div>

    {formData.isButton && (
      <div>
        <Label htmlFor="buttonColor">Button Color</Label>
        <div className="flex gap-2">
          <Input
            id="buttonColor"
            type="color"
            value={formData.buttonColor}
            onChange={(e) => handleInputChange("buttonColor", e.target.value)}
            className="w-16 h-10"
          />
          <Input
            value={formData.buttonColor}
            onChange={(e) => handleInputChange("buttonColor", e.target.value)}
            placeholder="#007bff"
            className="flex-1"
          />
        </div>
      </div>
    )}
  </div>
)}

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="isActive">Active Status</Label>
                  <p className="text-sm text-muted-foreground">Show this menu item on the website</p>
                </div>
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => handleInputChange("isActive", checked)}
                />
              </div>
            </CardContent>
          </Card>

          <div className="flex gap-4">
            <Button type="submit" onClick={handleSubmit} disabled={loading} className="flex-1">
              <Save className="w-4 h-4 mr-2" />
              {loading ? "Updating..." : "Update Menu Item"}
            </Button>
            <Link href="/admin-cms/menubar">
              <Button variant="outline" className="flex-1 bg-transparent">
                Cancel
              </Button>
            </Link>
          </div>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Live Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="space-y-4">
                  <div className="text-sm text-muted-foreground mb-2">Menu Item Preview:</div>

                  {formData.isButton ? (
                    <button
                      style={{
                        backgroundColor: formData.buttonColor,
                        color: formData.textColor,
                      }}
                      className="px-4 py-2 rounded-md font-medium transition-opacity hover:opacity-80"
                      disabled
                    >
                      {formData.name || "Menu Name"}
                    </button>
                  ) : (
                    <a
                      href="#"
                      style={{ color: formData.textColor }}
                      className="font-medium hover:underline"
                      onClick={(e) => e.preventDefault()}
                    >
                      {formData.name || "Menu Name"}
                    </a>
                  )}

                  {formData.img && (
                    <div className="mt-4">
                      <div className="text-sm text-muted-foreground mb-2">Image Preview:</div>
                      <div className="w-16 h-16 rounded-lg overflow-hidden bg-muted">
                        <img
                          src={URL.createObjectURL(formData.img) || "/placeholder.svg"}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                  )}

                  <div className="text-xs text-muted-foreground space-y-1">
                    {formData.type && <div>Type: {formData.type}</div>}
                    {formData.URL && <div>URL: {formData.URL}</div>}
                    {formData.parentId && <div>Parent ID: {formData.parentId}</div>}
                    <div>Status: {formData.isActive ? "Active" : "Inactive"}</div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
    </DashboardLayout>
  )
}