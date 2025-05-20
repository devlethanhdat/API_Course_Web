import { Course } from './course'

export interface Category {
  id: number;
  name: string;
  courses: Course[];
}

export interface CategoryFormValues {
  name: string;
}
