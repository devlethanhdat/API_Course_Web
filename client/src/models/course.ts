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