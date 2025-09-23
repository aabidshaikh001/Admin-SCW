"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { Trash2, Edit, Plus, Search, ArrowUpDown } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "@/contexts/auth-context"
import { DashboardLayout } from "@/components/dashboard-layout"

interface Slider {
  id: number
  OrgCode: number
  aligment: string
  title: string
  titleColor: string
  titleFontSize: string
  subTitle: string
  subTitleColor: string
  subTitleFontSize: string
  description: string
  descriptionColor: string
  descriptionFontSize: string
  btn1Text: string
  btn1TextColor: string
  btn1BgColor: string
  btn1URL: string
  btn2Text: string
  btn2TextColor: string
  btn2BgColor: string
  btn2URL: string
  sliderBGType: string
  sliderBGColor: string
  sliderBGImg: string | null
  sliderBGVideo: string | null
  sliderSqquence: number
  isActive: boolean
  createdAt: string
}

// Custom Carousel Components
interface CarouselProps {
  children: React.ReactNode
  className?: string
  ref?: React.Ref<any>
}

const Carousel = ({ children, className = "", ref }: CarouselProps) => {
  return (
    <div className={`relative w-full ${className}`} ref={ref}>
      {children}
    </div>
  )
}

interface CarouselContentProps {
  children: React.ReactNode
  className?: string
}

const CarouselContent = ({ children, className = "" }: CarouselContentProps) => {
  return (
    <div className={`overflow-hidden w-full ${className}`}>
      {children}
    </div>
  )
}

interface CarouselItemProps {
  children: React.ReactNode
  className?: string
}

const CarouselItem = ({ children, className = "" }: CarouselItemProps) => {
  return (
    <div className={`min-w-full ${className}`} style={{ display: "none" }}>
      {children}
    </div>
  )
}

interface CarouselNavigationProps {
  onClick: () => void
  direction: "prev" | "next"
  className?: string
}

const CarouselNavigation = ({ onClick, direction, className = "" }: CarouselNavigationProps) => {
  return (
    <Button
      variant="outline"
      size="icon"
      className={`absolute top-1/2 -translate-y-1/2 z-10 h-8 w-8 rounded-full ${direction === 'prev' ? 'left-2' : 'right-2'} ${className}`}
      onClick={onClick}
    >
      {direction === 'prev' ? '‹' : '›'}
    </Button>
  )
}

const CarouselPrevious = (props: Omit<CarouselNavigationProps, 'direction'>) => (
  <CarouselNavigation direction="prev" {...props} />
)

const CarouselNext = (props: Omit<CarouselNavigationProps, 'direction'>) => (
  <CarouselNavigation direction="next" {...props} />
)

export default function SlidersPage() {
  const { user } = useAuth()
  const orgCode = user?.OrgCode || 1
  const [currentSlide, setCurrentSlide] = useState(0)
  const [sliders, setSliders] = useState<Slider[]>([])
  const [filteredSliders, setFilteredSliders] = useState<Slider[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [bgTypeFilter, setBgTypeFilter] = useState<string>("all")

  const { toast } = useToast()
  const carouselRef = useRef<any>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Custom carousel implementation
  const CustomCarousel = ({ children, className = "" }: { children: React.ReactNode, className?: string }) => {
    const [currentIndex, setCurrentIndex] = useState(0)
    const items = React.Children.toArray(children)
    const itemsCount = items.length
    
    const goToNext = useCallback(() => {
      setCurrentIndex(prev => (prev + 1) % itemsCount)
    }, [itemsCount])
    
    const goToPrev = () => {
      setCurrentIndex(prev => (prev - 1 + itemsCount) % itemsCount)
    }
    
    const goToIndex = (index: number) => {
      setCurrentIndex(index)
    }
    
    // Auto-advance slides
    useEffect(() => {
      if (itemsCount <= 1) return
      
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
      
      intervalRef.current = setInterval(goToNext, 5000)
      
      return () => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current)
        }
      }
    }, [itemsCount, goToNext])
    
    return (
      <div className={`relative w-full overflow-hidden ${className}`}>
        <div 
          className="flex transition-transform duration-500 ease-in-out"
          style={{ transform: `translateX(-${currentIndex * 100}%)` }}
        >
          {items.map((item, index) => (
            <div key={index} className="min-w-full">
              {item}
            </div>
          ))}
        </div>
        
        {itemsCount > 1 && (
          <>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 left-2 -translate-y-1/2 z-10 h-8 w-8 rounded-full"
              onClick={goToPrev}
            >
              ‹
            </Button>
            <Button
              variant="outline"
              size="icon"
              className="absolute top-1/2 right-2 -translate-y-1/2 z-10 h-8 w-8 rounded-full"
              onClick={goToNext}
            >
              ›
            </Button>
            
            <div className="absolute bottom-4 left-0 right-0">
              <div className="flex items-center justify-center gap-2">
                {items.map((_, index) => (
                  <button
                    key={index}
                    className={`h-3 w-3 rounded-full transition-all ${
                      currentIndex === index ? "bg-primary" : "bg-muted"
                    }`}
                    onClick={() => goToIndex(index)}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </div>
    )
  }

  // Auto slide effect
  useEffect(() => {
    if (filteredSliders.length <= 1) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => {
        const next = (prev + 1) % filteredSliders.length
        return next
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [filteredSliders])

  useEffect(() => {
    fetchSliders()
  }, [])

  useEffect(() => {
    filterSliders()
  }, [sliders, searchTerm, statusFilter, bgTypeFilter])

  const fetchSliders = async () => {
    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/sliders?OrgCode=${orgCode}`)
      if (response.ok) {
        const data = await response.json()
        setSliders(data)
      }
    } catch (error) {
      console.error("Error fetching sliders:", error)
      toast({
        title: "Error",
        description: "Failed to fetch sliders",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterSliders = () => {
    let filtered = sliders

    if (searchTerm) {
      filtered = filtered.filter(
        (slider) =>
          slider.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slider.subTitle.toLowerCase().includes(searchTerm.toLowerCase()) ||
          slider.description.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((slider) => (statusFilter === "active" ? slider.isActive : !slider.isActive))
    }

    if (bgTypeFilter !== "all") {
      filtered = filtered.filter((slider) => slider.sliderBGType === bgTypeFilter)
    }

    setFilteredSliders(filtered)
  }

  const handleDelete = async (id: number) => {
    if (!confirm("Are you sure you want to delete this slider?")) return

    try {
      const response = await fetch(`https://api.smartcorpweb.com/api/sliders/${id}?OrgCode=${orgCode}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Slider deleted successfully",
        })
        fetchSliders()
      } else {
        throw new Error("Failed to delete slider")
      }
    } catch (error) {
      console.error("Error deleting slider:", error)
      toast({
        title: "Error",
        description: "Failed to delete slider",
        variant: "destructive",
      })
    }
  }

  const getBgTypeColor = (type: string) => {
    switch (type) {
      case "color":
        return "bg-blue-100 text-blue-800"
      case "image":
        return "bg-green-100 text-green-800"
      case "video":
        return "bg-purple-100 text-purple-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Sliders Management</h1>
            <p className="text-muted-foreground">Manage your website sliders and carousel content</p>
          </div>

          {/* Buttons group */}
          <div className="flex items-center gap-3">
            {/* 👈 View All Dialog */}
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline">View All</Button>
              </DialogTrigger>
              <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Sliders Preview</DialogTitle>
                </DialogHeader>

                {/* Custom Carousel with dots */}
                <div>
                  {filteredSliders.length > 0 ? (
                    <CustomCarousel className="w-full">
                      {filteredSliders.map((slider) => (
                        <div key={slider.id}>
                          <div
                            className="relative flex items-center justify-center text-center rounded-lg overflow-hidden h-[400px] p-8"
                            style={{
                              backgroundColor: slider.sliderBGType === "color" ? slider.sliderBGColor : "transparent",
                              backgroundImage:
                                slider.sliderBGType === "image" && slider.sliderBGImg
                                  ? `url(https://api.smartcorpweb.com${slider.sliderBGImg})`
                                  : undefined,
                              backgroundSize: "cover",
                              backgroundPosition: "center",
                            }}
                          >
                            {slider.sliderBGType === "video" && slider.sliderBGVideo && (
                              <video
                                className="absolute inset-0 w-full h-full object-cover"
                                src={`https://api.smartcorpweb.com${slider.sliderBGVideo}`}
                                autoPlay
                                loop
                                muted
                              />
                            )}

                            <div className="absolute inset-0 bg-black/40"></div>

                            <div
                              className={`relative z-10 max-w-3xl flex flex-col ${
                                slider.aligment === "left"
                                  ? "text-left items-start"
                                  : slider.aligment === "right"
                                  ? "text-right items-end"
                                  : "text-center items-center"
                              }`}
                            >
                              <h2
                                className={`font-bold ${slider.titleFontSize || "text-4xl"}`}
                                style={{ color: slider.titleColor }}
                              >
                                {slider.title}
                              </h2>
                              {slider.subTitle && (
                                <p className={`mt-2 ${slider.subTitleFontSize || "text-lg"}`} style={{ color: slider.subTitleColor }}>
                                  {slider.subTitle}
                                </p>
                              )}
                              {slider.description && (
                                <p className={`mt-2 ${slider.descriptionFontSize || "text-base"}`} style={{ color: slider.descriptionColor }}>
                                  {slider.description}
                                </p>
                              )}
                              <div className="mt-4 flex gap-4">
                                {slider.btn1Text && (
                                  <a
                                    href={slider.btn1URL || "#"}
                                    className="px-4 py-2 rounded font-medium"
                                    style={{
                                      backgroundColor: slider.btn1BgColor,
                                      color: slider.btn1TextColor,
                                    }}
                                  >
                                    {slider.btn1Text}
                                  </a>
                                )}
                                {slider.btn2Text && (
                                  <a
                                    href={slider.btn2URL || "#"}
                                    className="px-4 py-2 rounded font-medium border"
                                    style={{
                                      backgroundColor: slider.btn2BgColor,
                                      color: slider.btn2TextColor,
                                    }}
                                  >
                                    {slider.btn2Text}
                                  </a>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </CustomCarousel>
                  ) : (
                    <div className="py-8 text-center text-muted-foreground">No sliders available.</div>
                  )}
                </div>
              </DialogContent>
            </Dialog>

            {/* 👉 Add New Slider */}
            <Link href="/admin-cms/sliders/create">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add New Slider
              </Button>
            </Link>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Filters</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    placeholder="Search sliders..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
              <Select value={bgTypeFilter} onValueChange={setBgTypeFilter}>
                <SelectTrigger className="w-full md:w-48">
                  <SelectValue placeholder="Filter by background" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Backgrounds</SelectItem>
                  <SelectItem value="color">Color</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Sliders ({filteredSliders.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-12">
                      <Button variant="ghost" size="sm">
                        <ArrowUpDown className="w-4 h-4" />
                      </Button>
                    </TableHead>
                    <TableHead>Title</TableHead>
                    <TableHead>Subtitle</TableHead>
                    <TableHead>Background</TableHead>
                    <TableHead>Buttons</TableHead>
                    <TableHead>Sequence</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredSliders.map((slider) => (
                    <TableRow key={slider.id}>
                      <TableCell>{slider.id}</TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium" style={{ color: slider.titleColor }}>
                            {slider.title}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="text-sm" style={{ color: slider.subTitleColor }}>
                          {slider.subTitle}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getBgTypeColor(slider.sliderBGType)}>{slider.sliderBGType}</Badge>
                        {slider.sliderBGType === "color" && (
                          <div
                            className="w-4 h-4 rounded-full border ml-2 inline-block"
                            style={{ backgroundColor: slider.sliderBGColor }}
                          />
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          {slider.btn1Text && (
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: slider.btn1BgColor,
                                color: slider.btn1TextColor,
                              }}
                            >
                              {slider.btn1Text}
                            </div>
                          )}
                          {slider.btn2Text && (
                            <div
                              className="text-xs px-2 py-1 rounded"
                              style={{
                                backgroundColor: slider.btn2BgColor,
                                color: slider.btn2TextColor,
                              }}
                            >
                              {slider.btn2Text}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">#{slider.sliderSqquence}</Badge>
                      </TableCell>
                      <TableCell>
                        <Badge variant={slider.isActive ? "default" : "secondary"}>
                          {slider.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>{new Date(slider.createdAt).toLocaleDateString()}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Link href={`/admin-cms/sliders/edit/${slider.id}`}>
                            <Button variant="outline" size="sm">
                              <Edit className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(slider.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
            {filteredSliders.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">No sliders found matching your criteria.</div>
            )}
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  )
}