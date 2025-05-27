export interface Course {
  id: string;
  title: string;
  subTitle: string;
  description: string;
  price: number;
  category: string;
  level: string;
  published: boolean;
  instructor: string;
  image: string;
  rating: number;
  language: string;
  lastUpdated: string;
  students: number;
  learnings: Learning[];
  requirements: Requirement[];
  lectures?: Lecture[];
  sections?: Section[];
}

export interface CourseParams {
  sort: string;
  search?: string;
  pageIndex: number;
  pageSize: number;
  category?: number;
}

export interface Learning {
  id: number;
  name: string;
}

export interface Requirement {
  id: number;
  name: string;
}

export interface RegisterCourse {
  title: string;
  subTitle: string;
  description: string;
  price: number;
  category?: number;
  level: string;
  language: string;
  image?: string;
}

export interface Lecture {
  id: string;
  title: string;
  videoUrl?: string;
  content?: string;
  // ... các trường khác nếu có
}

export interface Section {
  sectionName: string;
  lectures: Lecture[];
}

export type CourseReview = {
  value: number;
  reviewText: string;
  createdAt: string;
  userName: string;
  likes?: number;
  dislikes?: number;
  id?: string;
};