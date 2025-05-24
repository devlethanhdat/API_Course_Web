export interface InstructorStatsDto {
    totalStudents: number;
    totalRevenue: number;
    totalCourses: number;
}

export interface CourseStudentCountDto {
  courseTitle: string;
  studentCount: number;
}

export interface CourseRevenueDto {
  courseTitle: string;
  revenue: number;
}

export interface OrderTrendDto {
  year: number;
  month: number;
  orderCount: number;
}