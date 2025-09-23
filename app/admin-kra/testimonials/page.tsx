"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Trash2, Edit, Plus, Search, Star } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import { DashboardLayout } from "@/components/dashboard-layout"

interface Testimonial {
  id: number
  OrgCode: number
  name: string
  role: string
  content: string
  rating: number
  image_url: string
  created_at: string
  updated_at: string
}

export default function TestimonialsPage() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>([])
  const [filteredTestimonials, setFilteredTestimonials] = useState<Testimonial[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [ratingFilter, setRatingFilter] = useState<string>("all")
  const router = useRouter()
  const { toast } = useToast()
  const { user } = useAuth()
  const orgCode = user?.OrgCode

  useEffect(() => {
    if (orgCode) {
      fetchTestimonials()
    }
  }, [orgCode])

  useEffect(() => {
    filterTestimonials()
  }, [testimonials, searchTerm, ratingFilter])

  const fetchTestimonials = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/testimonials/${orgCode}`)
      const result = await response.json()

      if (result.success) {
        setTestimonials(result.data || [])
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch testimonials",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error fetching testimonials:", error)
      toast({
        title: "Error",
        description: "Failed to fetch testimonials",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTestimonials = () => {
    let filtered = testimonials

    if (searchTerm) {
      filtered = filtered.filter(
        (testimonial) =>
          testimonial.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
          testimonial.content.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (ratingFilter !== "all") {
      filtered = filtered.filter((testimonial) => testimonial.rating === Number.parseInt(ratingFilter))
    }

    setFilteredTestimonials(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this testimonial?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/testimonials/${id}`, {
        method: "DELETE",
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Success",
          description: "Testimonial deleted successfully",
        })
        fetchTestimonials()
      } else {
        toast({
          title: "Error",
          description: "Failed to delete testimonial",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error deleting testimonial:", error)
      toast({
        title: "Error",
        description: "Failed to delete testimonial",
        variant: "destructive",
      })
    }
  }

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ))
  }

  if (!orgCode) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">Please log in to view testimonials.</p>
        </div>
      </DashboardLayout>
    )
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
      <div className="flex justify-between items-center">
  <div>
    <h1 className="text-3xl font-bold">Testimonials</h1>
    <p className="text-muted-foreground">Manage customer testimonials and reviews</p>
  </div>
  <div className="flex gap-2">
    {/* Preview All Button */}
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline">
          Preview All
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>All Testimonials</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-h-[70vh] overflow-y-auto">
          {testimonials.map((t) => (
            <Card key={t.id} className="p-4">
              <div className="flex items-center gap-3">
                <Avatar className="h-12 w-12">
                  <AvatarImage
                    src={
                      t.image_url
                        ? `https://api.smartcorpweb.com${t.image_url}`
                        : "/placeholder.svg"
                    }
                    alt={t.name}
                  />
                  <AvatarFallback>
                    {t.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">{t.name}</p>
                  <p className="text-sm text-muted-foreground">{t.role}</p>
                </div>
              </div>
              <p className="mt-2 text-sm">{t.content}</p>
              <div className="mt-2 flex items-center gap-1">
                {renderStars(t.rating)}
                <span className="ml-1 text-xs text-muted-foreground">
                  ({t.rating})
                </span>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>

    {/* Add Testimonial Button */}
    <Button onClick={() => router.push("/admin-kra/testimonials/create")}>
      <Plus className="mr-2 h-4 w-4" />
      Add Testimonial
    </Button>
  </div>
</div>

        <Card>
          <CardHeader>
            <CardTitle>Filter Testimonials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by name, role, or content..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
              <Select value={ratingFilter} onValueChange={setRatingFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filter by rating" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Ratings</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Testimonials ({filteredTestimonials.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center h-32">
                <p>Loading testimonials...</p>
              </div>
            ) : filteredTestimonials.length === 0 ? (
              <div className="flex items-center justify-center h-32">
                <p className="text-muted-foreground">No testimonials found</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Content</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTestimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-10 w-10">
                <AvatarImage
  src={
    testimonial.image_url
      ? `https://api.smartcorpweb.com${testimonial.image_url}`
      : "/placeholder.svg"
  }
  alt={testimonial.name}
/>

                            <AvatarFallback>
                              {testimonial.name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">{testimonial.name}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="secondary">{testimonial.role}</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="max-w-xs truncate" title={testimonial.content}>
                          {testimonial.content}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1">
                          {renderStars(testimonial.rating)}
                          <span className="ml-2 text-sm text-muted-foreground">({testimonial.rating})</span>
                        </div>
                      </TableCell>
                      <TableCell>{new Date(testimonial.created_at).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => router.push(`/admin-kra/testimonials/edit/${testimonial.id}`)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button variant="outline" size="sm" onClick={() => handleDelete(testimonial.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}
