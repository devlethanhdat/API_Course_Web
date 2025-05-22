import agent from '../actions/agent';
import { notification } from 'antd';
import { Course } from '../models/course';

export const courseService = {
  updateCourse: async (courseId: string, courseData: Partial<Course>) => {
    try {
      // Log the request
      console.log('Updating course:', courseId);
      console.log('Update data:', courseData);

      // Make sure all required fields are present
      const requiredFields = [
        'title', 
        'subTitle', 
        'description', 
        'price', 
        'level', 
        'language',
        'image'
      ];

      const missingFields = requiredFields.filter(field => !(field in courseData));
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      const response = await agent.Courses.update(courseId, courseData);
      
      // Log the response
      console.log('Update response:', response);

      notification.success({
        message: 'Success',
        description: 'Course updated successfully'
      });
      return response;
    } catch (error) {
      console.error('Update error details:', error);
      notification.error({
        message: 'Error',
        description: error instanceof Error ? error.message : 'Failed to update course'
      });
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
      console.log("Fetching course with ID:", courseId); // Debug log
      const response = await agent.Courses.getById(courseId);
      console.log("API Response:", response); // Debug log
      
      if (!response) {
        throw new Error('Course not found');
      }
      
      return response;
    } catch (error: unknown) {
      console.error("Error fetching course:", error); // Debug log
      notification.error({
        message: 'Error',
        description: 'Failed to load course details'
      });
      throw error;
    }
  },
};
