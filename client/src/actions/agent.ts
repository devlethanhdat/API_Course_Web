import axios, { AxiosError, AxiosResponse } from 'axios'
import { PaginatedCourse } from '../models/paginatedCourse'
import { Category, CategoryFormValues } from '../models/category'
import { Course, RegisterCourse } from '../models/course'
import { Basket } from '../models/basket'
import { Login, Register, User } from '../models/user'
import { Lecture, LectureDto } from '../models/lecture'
import { InstructorStatsDto } from '../models/stats' // Add this import
import { notification } from 'antd'
import { Order } from '../models/order'
import { CourseStudentCountDto, CourseRevenueDto, OrderTrendDto } from '../models/stats'
import { Button, Modal, Descriptions, Tag } from 'antd'
import { useState } from 'react'
axios.defaults.baseURL = "http://localhost:5001/api";

const responseBody = <T>(response: AxiosResponse<T>) => response.data

axios.defaults.withCredentials = true

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) config.headers!.Authorization = `Bearer ${token}`
  return config
})

axios.interceptors.response.use(
  (response) => {
    return response
  },
  (error: AxiosError) => {
    const { data, status }: { data: any; status: number } = error.response!

    switch (status) {
      case 400:
        if (data.errors) {
          const validationErrors: string[] = []
          for (const key in data.errors) {
            if (data.errors[key]) {
              validationErrors.push(data.errors[key])
            }
          }
          throw validationErrors.flat()
        }
        notification.error({
          message: data.errorMessage,
        })
        break
      case 401:
        notification.error({
          message: data.errorMessage,
        })
        break
      case 403:
        notification.error({
          message: 'You are not allowed to do that!',
        })
        break
      case 404:
        notification.error({
          message: data.errorMessage,
        })
        break
      case 500:
        notification.error({
          message: 'Server error, try again later',
        })
        break
      default:
        break
    }
    return Promise.reject(error.response)
  },
)

const requests = {
  get: <T>(url: string, params?: URLSearchParams) =>
    axios
      .get<T>(url, { params })
      .then(responseBody),
  post: <T>(url: string, body: {}) =>
    axios.post<T>(url, body).then(responseBody),
  put: <T>(url: string, body: {} | undefined) => axios.put<T>(url, body).then(responseBody),
  del: <T>(url: string) => axios.delete<T>(url).then(responseBody),
  delete: <T>(url: string) => axios.delete<T>(url).then(responseBody),
}

const Users = {
  login: (values: Login) => requests.post<User>('users/login', values),
  register: (values: Register) => requests.post<User>('users/register', values),
  addCourse: () => requests.post('users/purchaseCourses', {}),
  currentUser: () => requests.get<User>('users/currentUser'),
  addRole: () => requests.post('users/addRole', {}),
   unpublishedCourses: () => requests.get<Course[]>('users/unpublishedCourses'),
}

const Courses = {
  list: (params?: URLSearchParams) =>
    requests.get<PaginatedCourse>('/courses', params),
  getById: (id: string) => {
    console.log('Calling API for course:', id); // Debug log
    return requests.get<Course>(`/courses/${id}`);
  },
  create: (data: RegisterCourse) => requests.post < string > ('courses', data),
  update: (id: string, course: Partial<Course>) => {
    console.log('Sending update request:', { id, data: course }); // Debug log
    return requests.put<Course>(`/courses/${id}`, course);
  },
  publish: (courseId: string) =>
    requests.put<string>(`courses/publish/${courseId}`, undefined),
  delete: (id: string) => requests.del(`/courses/${id}`),
  getInstructorStats: () => requests.get<InstructorStatsDto>('courses/stats'),
  unpublish: (courseId: string) => requests.put<string>(`courses/unpublish/${courseId}`, {}),
}

const Categories = {
  list: () => requests.get<Category[]>('category'),
  details: (id: number) => requests.get<Category>(`category/${id}`),
  create: (category: CategoryFormValues) => requests.post<Category>('category', category),
  update: (id: number, category: CategoryFormValues) => {
    console.log('Sending update request:', { id, data: category });
    return requests.put<Category>(`category/${id}`, category);
  },
  delete: (id: number) => requests.del(`category/${id}`)
}

const Baskets = {
  get: () => requests.get<Basket>('basket'),
  addItem: (courseId: string) =>
    requests.post<Basket>(`basket?courseId=${courseId}`, {}),
  removeItem: (courseId: string) => requests.del(`basket?courseId=${courseId}`),
  clear: () => requests.del('basket/clear'),
}

const Payments = {
  paymentIntent: () => requests.post<Basket>('payments', {}),
  confirmPayment: (paymentIntentId: string) =>
    requests.post<Order>('payments/confirm', { paymentIntentId }),
}

const Lectures = {
  getLectures: (courseId: string) =>
    requests.get<Lecture>(`lectures/${courseId}`),
  setCurrentLecture: (values: { lectureId: number; courseId: string }) =>
    requests.put('lectures/setCurrentLecture', values),
  create: (data: {
    courseId: string,
    sectionName: string,
    lectures: LectureDto[],
  }) => requests.post <string>('lectures', data),
}

const Instructor = {
  getStudentCountByCourse: () => requests.get<CourseStudentCountDto[]>('chart/student-count-by-course'),
  getRevenueByCourse: () => requests.get<CourseRevenueDto[]>('chart/revenue-by-course'),
  getOrderTrends: () => requests.get<OrderTrendDto[]>('chart/order-trends'),
  getOrders: () => requests.get<any[]>('courses/instructor/orders'),
  getRevenueStats: () => requests.get<any>('courses/instructor/revenue-stats'),
}

const Admin = {
  getUsers: () => requests.get<any[]>('users/admin/users'),
  createUser: (data: any) => requests.post('users/admin/users', data),
  updateUser: (id: string, data: any) => requests.put(`users/admin/users/${id}`, data),
  deleteUser: (id: string) => requests.del(`users/admin/users/${id}`),
  getOrders: () => {
    console.log('Calling API:', axios.defaults.baseURL + '/courses/admin/orders');
    return requests.get<any[]>('courses/admin/orders');
  },
  getOrdersAndRevenue: () => requests.get<{ orders: any[]; stats: any }>('courses/admin/orders-and-revenue'),
}

const agent = {
  Courses,
  Categories,
  Baskets,
  Users,
  Payments,
  Lectures,
  Instructor,
  Admin,
}

export default agent
