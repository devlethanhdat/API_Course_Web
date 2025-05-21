import agent from '../actions/agent';
import { notification } from 'antd';

export const courseService = {
  updateCourse: async (courseId: string, courseData: any) => {
    try {
      const response = await agent.Courses.update(courseId, courseData);
      notification.success({ message: 'Course updated successfully' });
      return response;
    } catch (error) {
      notification.error({ message: 'Failed to update course' });
      throw error;
    }
  },

  deleteCourse: async (courseId: string) => {
    try {
      await agent.Courses.delete(courseId);
      notification.success({ message: 'Course deleted successfully' });
      return true;
    } catch (error) {
      notification.error({ message: 'Failed to delete course' });
      throw error;
    }
  },

  getCourseById: async (courseId: string) => {
    try {
      console.log("Calling getById with courseId:", courseId); // Debug log
      const response = await agent.Courses.getById(courseId);
      console.log("API Response:", response); // Debug log
      return response;
    } catch (error: unknown) {
      console.error("Error in getCourseById:", error); // Debug log
      const errorMessage = error instanceof Error 
        ? error.message 
        : 'An unknown error occurred';
        
      notification.error({ 
        message: 'Failed to fetch course details',
        description: errorMessage
      });
      throw error;
    }
  }
};
