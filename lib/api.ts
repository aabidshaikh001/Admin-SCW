const API_BASE_URL = "http://localhost:5000/api/users"
const HOME_API_BASE_URL = "http://localhost:5000/api/home"
const ABOUT_API_BASE_URL = "http://localhost:5000/api/about"
const CAREERS_API_BASE_URL = "http://localhost:5000/api/career"
const BLOG_API_BASE_URL = "http://localhost:5000/api/blog"
const TEAM_API_BASE_URL = "http://localhost:5000/api/pageTeam"
const TEAM_MEMBER_API_BASE_URL = "http://localhost:5000/api/teammembers"
const NOTIFICATION_API_BASE_URL = "http://localhost:5000/api/notifications"
const ORG_API_BASE_URL = "http://localhost:5000/api/orgs"
const ORG_LICENSE_API_BASE_URL = "http://localhost:5000/api/licenses"

interface LoginRequest {
  LoginId: string
  LoginPwd: string
}

interface RegisterRequest {
  EmployeeCode: string
  OrgCode: string
  UserName: string
  UserEmail: string
  UserDOB: string
  UserType: string
  LoginId: string
  LoginPwd: string
  Mobile: string
  AboutUs: string
  UserPhoto?: File
}

interface HomePageSection {
  id?: number
  OrgCode: number
  pageName: string
  sectionName: string
  title: string
  subtitle?: string
  content?: string
  iconName?: string
  secColor?: string
  ImgVideo?: string
  btnName?: string
  btnColor?: string
  btnURL?: string
  isActive?: boolean
  homeComponentName?: string
  homeComponenData?: any
}

interface AboutPageSection {
  Id?: number
  OrgCode: number
  pageName: string
  sectionName: string
  title: string
  subtitle?: string
  content?: string
  iconName?: string
  secColor?: string
  ImgVideo?: string
  btnName?: string
  btnColor?: string
  btnURL?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface CareersPageSection {
  Id?: number
  OrgCode: number
  pageName: string
  sectionName: string
  title: string
  subtitle?: string
  content?: string
  iconName?: string
  secColor?: string
  ImgVideo?: string
  btnName?: string
  btnColor?: string
  btnURL?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface TeamPageSection {
  id?: number
  OrgCode: number
  pageName: string
  sectionName: string
  title: string
  subtitle?: string
  content?: string
  iconName?: string
  secColor?: string
  ImgVideo?: string
  btnName?: string
  btnColor?: string
  btnURL?: string
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
}

interface TeamMember {
  Id?: number
  OrgCode: number
  Name: string
  Role: string
  Bio?: string
  Linkedin?: string
  Twitter?: string
  Facebook?: string
  Image?: string
  IsActive?: boolean
  CreatedAt?: string
  UpdatedAt?: string
}

interface BlogPost {
  id?: number
  OrgCode: number
  title: string
  content: string
  category?: string
  thumbnail?: string
  image?: string
  featured?: boolean
  authorId: number
  categoryId: number
  isActive?: boolean
  createdAt?: string
  updatedAt?: string
  CategoryName?: string
  CategoryImg?: string
  AuthorName?: string
  AuthorRole?: string
  AuthorBio?: string
  AuthorImg?: string
}

interface BlogAuthor {
  Id?: number
  OrgCode: number
  Name: string
  Role: string
  Bio?: string
  Img?: string
  IsActive?: boolean
  TransDate?: string
  IsDeleted?: boolean
}

interface BlogCategory {
  Id?: number
  OrgCode: number
  CategoryName: string
  Img?: string
  IsActive?: boolean
  TransDate?: string
  IsDeleted?: boolean
}

interface ApiResponse<T> {
  message: string
  user?: T
  token?: string
  data?: T
}

class ApiService {
  private getAuthHeaders() {
    const token = localStorage.getItem("token")
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  private getFormDataHeaders() {
    const token = localStorage.getItem("token")
    return {
      ...(token && { Authorization: `Bearer ${token}` }),
    }
  }

  async login(credentials: LoginRequest): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/login`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(credentials),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Login failed")
    }

    return response.json()
  }

  async register(userData: RegisterRequest): Promise<ApiResponse<any>> {
    const formData = new FormData()

    // Append all fields to FormData
    Object.entries(userData).forEach(([key, value]) => {
      if (key === "UserPhoto" && value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/register`, {
      method: "POST",
      headers: this.getFormDataHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Registration failed")
    }

    return response.json()
  }

  async getProfile(): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch profile")
    }

    return response.json()
  }

  async updateProfile(userData: Partial<RegisterRequest>): Promise<ApiResponse<any>> {
    const formData = new FormData()

    Object.entries(userData).forEach(([key, value]) => {
      if (key === "UserPhoto" && value instanceof File) {
        formData.append(key, value)
      } else if (value !== undefined) {
        formData.append(key, value.toString())
      }
    })

    const response = await fetch(`${API_BASE_URL}/profile`, {
      method: "PUT",
      headers: this.getFormDataHeaders(),
      body: formData,
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update profile")
    }

    return response.json()
  }

  async getAllUsers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch users")
    }

    return response.json()
  }

  async getUsersByOrg(orgCode: string): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch users by organization")
    }

    return response.json()
  }

  async deleteUser(userId: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${API_BASE_URL}/${userId}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete user")
    }

    return response.json()
  }

  async createHomeSection(sectionData: HomePageSection): Promise<ApiResponse<any>> {
    const response = await fetch(`${HOME_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create home section")
    }

    return response.json()
  }

  async getAllHomeSections(): Promise<any[]> {
    const response = await fetch(`${HOME_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch home sections")
    }

    const result = await response.json()
    return result.data || []
  }

  async getHomeSectionsByOrg(orgCode: string): Promise<any[]> {
    const response = await fetch(`${HOME_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch home sections by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async getHomeSectionById(id: string): Promise<any> {
    const response = await fetch(`${HOME_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch home section")
    }

    const result = await response.json()
    return result.data
  }

  async updateHomeSection(id: string, sectionData: Partial<HomePageSection>): Promise<ApiResponse<any>> {
    const response = await fetch(`${HOME_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update home section")
    }

    return response.json()
  }

  async deleteHomeSection(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${HOME_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete home section")
    }

    return response.json()
  }

  async createAboutSection(sectionData: AboutPageSection): Promise<ApiResponse<any>> {
    const response = await fetch(`${ABOUT_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create about section")
    }

    return response.json()
  }

  async getAllAboutSections(): Promise<any[]> {
    const response = await fetch(`${ABOUT_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch about sections")
    }

    const result = await response.json()
    return result.data || []
  }

  async getAboutSectionsByOrg(orgCode: string): Promise<any[]> {
    const response = await fetch(`${ABOUT_API_BASE_URL}/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch about sections by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async getAboutSectionByOrgAndSection(orgCode: string, sectionName: string): Promise<any[]> {
    const response = await fetch(`${ABOUT_API_BASE_URL}/org/${orgCode}/section/${sectionName}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch about section")
    }

    return response.json()
  }

  async updateAboutSection(id: string, sectionData: Partial<AboutPageSection>): Promise<ApiResponse<any>> {
    const response = await fetch(`${ABOUT_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update about section")
    }

    return response.json()
  }

  async deleteAboutSection(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${ABOUT_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete about section")
    }

    return response.json()
  }

  async createOrUpdateCareersSection(sectionData: CareersPageSection): Promise<ApiResponse<any>> {
    const response = await fetch(`${CAREERS_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create/update careers section")
    }

    return response.json()
  }

  async getAllCareersSections(): Promise<any[]> {
    const response = await fetch(`${CAREERS_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch careers sections")
    }

    const result = await response.json()
    return result.data || []
  }

  async getCareersSectionsByOrg(orgCode: string): Promise<any[]> {
    const response = await fetch(`${CAREERS_API_BASE_URL}/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch careers sections by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async createTeamSection(sectionData: TeamPageSection): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create team section")
    }

    return response.json()
  }

  async getAllTeamSections(): Promise<any[]> {
    const response = await fetch(`${TEAM_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team sections")
    }

    return response.json()
  }

  async getTeamSectionsByOrg(orgCode: string): Promise<any[]> {
    const response = await fetch(`${TEAM_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team sections by organization")
    }

    return response.json()
  }

  async getTeamSectionById(id: string): Promise<any> {
    const response = await fetch(`${TEAM_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team section")
    }

    return response.json()
  }

  async updateTeamSection(id: string, sectionData: Partial<TeamPageSection>): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(sectionData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update team section")
    }

    return response.json()
  }

  async deleteTeamSection(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete team section")
    }

    return response.json()
  }

  async createTeamMember(memberData: TeamMember): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(memberData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create team member")
    }

    return response.json()
  }

  async getAllTeamMembers(): Promise<TeamMember[]> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team members")
    }

    return response.json()
  }

  async getTeamMembersByOrg(orgCode: string): Promise<TeamMember[]> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team members by organization")
    }

    return response.json()
  }

  async getTeamMemberById(id: string): Promise<TeamMember> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch team member")
    }

    return response.json()
  }

  async updateTeamMember(id: string, memberData: Partial<TeamMember>): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(memberData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update team member")
    }

    return response.json()
  }

  async deleteTeamMember(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${TEAM_MEMBER_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete team member")
    }

    return response.json()
  }

  async createBlog(blogData: BlogPost): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(blogData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create blog")
    }

    return response.json()
  }

  async getAllBlogs(): Promise<BlogPost[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch blogs")
    }

    const result = await response.json()
    return result.data || []
  }

  async getBlogById(id: string): Promise<BlogPost> {
    const response = await fetch(`${BLOG_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch blog")
    }

    const result = await response.json()
    return result.data
  }

  async updateBlog(id: string, blogData: Partial<BlogPost>): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(blogData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update blog")
    }

    return response.json()
  }

  async deleteBlog(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete blog")
    }

    return response.json()
  }

  async getBlogsByOrg(orgCode: string): Promise<BlogPost[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch blogs by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async getBlogsByCategory(categoryId: string): Promise<BlogPost[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/category/${categoryId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch blogs by category")
    }

    const result = await response.json()
    return result.data || []
  }

  async getBlogsByAuthor(authorId: string): Promise<BlogPost[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/author/${authorId}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch blogs by author")
    }

    const result = await response.json()
    return result.data || []
  }

  async getFeaturedBlogs(): Promise<BlogPost[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/featured/list`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch featured blogs")
    }

    const result = await response.json()
    return result.data || []
  }

  async getRelatedBlogs(id: string, categoryId: string, limit?: number): Promise<BlogPost[]> {
    const url = `${BLOG_API_BASE_URL}/related/${id}/${categoryId}${limit ? `?limit=${limit}` : ""}`
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch related blogs")
    }

    const result = await response.json()
    return result.data || []
  }

  async createAuthor(authorData: BlogAuthor): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/author`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(authorData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create author")
    }

    return response.json()
  }

  async getAuthorsByOrg(orgCode: string): Promise<BlogAuthor[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/authors/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch authors by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async updateAuthor(id: string, authorData: Partial<BlogAuthor>): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/author/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(authorData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update author")
    }

    return response.json()
  }

  async deleteAuthor(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/author/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete author")
    }

    return response.json()
  }

  async createCategory(categoryData: BlogCategory): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/category`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to create category")
    }

    return response.json()
  }

  async getCategoriesByOrg(orgCode: string): Promise<BlogCategory[]> {
    const response = await fetch(`${BLOG_API_BASE_URL}/categories/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to fetch categories by organization")
    }

    const result = await response.json()
    return result.data || []
  }

  async updateCategory(id: string, categoryData: Partial<BlogCategory>): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/category/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(categoryData),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to update category")
    }

    return response.json()
  }

  async deleteCategory(id: string): Promise<ApiResponse<any>> {
    const response = await fetch(`${BLOG_API_BASE_URL}/category/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(error.message || "Failed to delete category")
    }

    return response.json()
  }

  // Notification methods
  async createNotification(notificationData: any) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    })
    if (!response.ok) throw new Error("Failed to create notification")
    return response.json()
  }

  async getAllNotifications(orgCode?: string) {
    const url = orgCode ? `${NOTIFICATION_API_BASE_URL}?orgCode=${orgCode}` : `${NOTIFICATION_API_BASE_URL}`
    const response = await fetch(url, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch notifications")
    return response.json()
  }

  async getNotificationById(id: string) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch notification")
    return response.json()
  }

  async getNotificationsByOrg(orgCode: string) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch notifications by org")
    return response.json()
  }

  async updateNotification(id: string, notificationData: any) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(notificationData),
    })
    if (!response.ok) throw new Error("Failed to update notification")
    return response.json()
  }

  async deleteNotification(id: string) {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete notification")
    return response.json()
  }

  async getOrgList() {
    const response = await fetch(`${NOTIFICATION_API_BASE_URL}/orglist/all`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch organization list")
    return response.json()
  }

  // Organization Management
  async createOrganization(orgData: FormData) {
    const response = await fetch(`${ORG_API_BASE_URL}/register`, {
      method: "POST",
      headers: this.getFormDataHeaders(),
      body: orgData,
    })
    if (!response.ok) throw new Error("Failed to create organization")
    return response.json()
  }

  async getAllOrganizations() {
    const response = await fetch(`${ORG_API_BASE_URL}/`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch organizations")
    return response.json()
  }

  async getOrganizationById(id: string) {
    const response = await fetch(`${ORG_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch organization")
    return response.json()
  }

  async updateOrganization(id: string, orgData: FormData) {
    const response = await fetch(`${ORG_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getFormDataHeaders(),
      body: orgData,
    })
    if (!response.ok) throw new Error("Failed to update organization")
    return response.json()
  }

  async deleteOrganization(id: string) {
    const response = await fetch(`${ORG_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete organization")
    return response.json()
  }

  // Organization License Management
  async createLicense(licenseData: any) {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/create`, {
      method: "POST",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(licenseData),
    })
    if (!response.ok) throw new Error("Failed to create license")
    return response.json()
  }

  async getAllLicenses() {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch licenses")
    return response.json()
  }

  async getLicenseById(id: string) {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/${id}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch license")
    return response.json()
  }

  async getLicensesByOrgCode(orgCode: string) {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/org/${orgCode}`, {
      method: "GET",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to fetch licenses by org code")
    return response.json()
  }

  async updateLicense(id: string, licenseData: any) {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/${id}`, {
      method: "PUT",
      headers: this.getAuthHeaders(),
      body: JSON.stringify(licenseData),
    })
    if (!response.ok) throw new Error("Failed to update license")
    return response.json()
  }

  async deleteLicense(id: string) {
    const response = await fetch(`${ORG_LICENSE_API_BASE_URL}/${id}`, {
      method: "DELETE",
      headers: this.getAuthHeaders(),
    })
    if (!response.ok) throw new Error("Failed to delete license")
    return response.json()
  }
}

export const blogApi = {
  create: (blogData: BlogPost) => apiService.createBlog(blogData),
  getAll: () => apiService.getAllBlogs(),
  getById: (id: string) => apiService.getBlogById(id),
  update: (id: string, blogData: Partial<BlogPost>) => apiService.updateBlog(id, blogData),
  delete: (id: string) => apiService.deleteBlog(id),
  getByOrg: (orgCode: string) => apiService.getBlogsByOrg(orgCode),
  getByCategory: (categoryId: string) => apiService.getBlogsByCategory(categoryId),
  getByAuthor: (authorId: string) => apiService.getBlogsByAuthor(authorId),
  getFeatured: () => apiService.getFeaturedBlogs(),
  getRelated: (id: string, categoryId: string, limit?: number) => apiService.getRelatedBlogs(id, categoryId, limit),
}

export const teamMemberApi = {
  create: (memberData: TeamMember) => apiService.createTeamMember(memberData),
  getAll: () => apiService.getAllTeamMembers(),
  getById: (id: string) => apiService.getTeamMemberById(id),
  update: (id: string, memberData: Partial<TeamMember>) => apiService.updateTeamMember(id, memberData),
  delete: (id: string) => apiService.deleteTeamMember(id),
  getByOrg: (orgCode: string) => apiService.getTeamMembersByOrg(orgCode),
}

export const notificationApi = {
  create: (notificationData: any) => apiService.createNotification(notificationData),
  getAll: (orgCode?: string) => apiService.getAllNotifications(orgCode),
  getById: (id: string) => apiService.getNotificationById(id),
  getByOrg: (orgCode: string) => apiService.getNotificationsByOrg(orgCode),
  update: (id: string, notificationData: any) => apiService.updateNotification(id, notificationData),
  delete: (id: string) => apiService.deleteNotification(id),
  getOrgList: () => apiService.getOrgList(),
}

export const orgApi = {
  create: (orgData: FormData) => apiService.createOrganization(orgData),
  getAll: () => apiService.getAllOrganizations(),
  getById: (id: string) => apiService.getOrganizationById(id),
  update: (id: string, orgData: FormData) => apiService.updateOrganization(id, orgData),
  delete: (id: string) => apiService.deleteOrganization(id),
}

export const orgLicenseApi = {
  create: (licenseData: any) => apiService.createLicense(licenseData),
  getAll: () => apiService.getAllLicenses(),
  getById: (id: string) => apiService.getLicenseById(id),
  getByOrgCode: (orgCode: string) => apiService.getLicensesByOrgCode(orgCode),
  update: (id: string, licenseData: any) => apiService.updateLicense(id, licenseData),
  delete: (id: string) => apiService.deleteLicense(id),
}

export const apiService = new ApiService()
export type {
  HomePageSection,
  AboutPageSection,
  CareersPageSection,
  TeamPageSection,
  TeamMember,
  BlogPost,
  BlogAuthor,
  BlogCategory,
}
