import React, { useEffect, useState } from 'react';
import { Card, Button, notification, Spin, Typography, Empty } from 'antd';
import agent from '../../actions/agent';
import { courseService } from '../../services/courseService';
import { Course } from '../../models/course';
import { Link, useHistory } from 'react-router-dom';
import { User } from '../../models/user';
import { FiEdit, FiTrash2 } from 'react-icons/fi'; // Thêm icon
import './ManageCourses.scss';

const { Title, Text } = Typography;

const ManageCourses = () => {
  const [publishedCourses, setPublishedCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null); // Local state for user
  const history = useHistory();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await agent.Users.currentUser();
        setUser(userData);
        const instructorId = userData.email;
        if (!instructorId) {
          console.error("Instructor ID not found.");
          return;
        }
        
        // Create URLSearchParams object
        const params = new URLSearchParams();
        params.append('instructorId', instructorId);
        
        const response = await agent.Courses.list(params);
        setPublishedCourses(response.data);
      } catch (error) {
        console.error("Error fetching user or courses:", error);
        notification.error({ message: 'Failed to load data.' });
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleUpdate = async (courseId: string) => {
    try {
      // Chuyển hướng đến trang edit
      history.push(`/instructor/course/edit/${courseId}`);
    } catch (error) {
      console.error('Error navigating to edit page:', error);
      notification.error({ message: 'Cannot access edit page' });
    }
  };

  const handleDelete = async (courseId: string) => {
    try {
      const confirmed = window.confirm('Are you sure you want to delete this course?');
      if (!confirmed) return;

      await courseService.deleteCourse(courseId);
      // Cập nhật lại danh sách sau khi xóa
      setPublishedCourses(prev => prev.filter(course => course.id !== courseId));
    } catch (error) {
      console.error('Error deleting course:', error);
    }
  };

  if (loading) return <div className="manage-courses__loading"><Spin size="large" /></div>;

  return (
    <div className="manage-courses__container">
      <div className="manage-courses__header">
        <Title level={2} className="manage-courses__title">Manage Your Published Courses</Title>
        {user && (
          <Text className="manage-courses__user">{user.email}</Text>
        )}
      </div>
      {user ? (
        <>
          {publishedCourses.length === 0 ? (
            <div className="manage-courses__empty">
              <Empty
                description={<span>No published courses found.</span>}
                imageStyle={{ height: 80 }}
              />
            </div>
          ) : (
            <div className="manage-courses__list">
              {publishedCourses.map((course) => (
                <Card
                  key={course.id}
                  className="manage-courses__card"
                  title={<span className="manage-courses__card-title">{course.title}</span>}
                  cover={
                    <img
                      alt={course.title}
                      src={course.image}
                      className="manage-courses__card-image"
                    />
                  }
                  actions={[
                    <Button
                      type="primary"
                      className="manage-courses__btn manage-courses__btn--edit"
                      onClick={() => handleUpdate(course.id)}
                      icon={<FiEdit />}
                    >
                      Update
                    </Button>,
                    <Button
                      type="primary"
                      danger
                      className="manage-courses__btn manage-courses__btn--delete"
                      onClick={() => handleDelete(course.id)}
                      icon={<FiTrash2 />}
                    >
                      Delete
                    </Button>,
                  ]}
                >
                  <Text className="manage-courses__subtitle">{course.subTitle}</Text>
                  <br />
                  <Text className="manage-courses__price">${course.price}</Text>
                </Card>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="manage-courses__empty">
          <Empty description="Please log in to view your courses." imageStyle={{ height: 80 }} />
        </div>
      )}
      <div className="manage-courses__footer">
        <Link to="/instructor/courses/manage">
          <Button type="primary" className="manage-courses__footer-btn">Manage Published Courses</Button>
        </Link>
      </div>
    </div>
  );
};

export default ManageCourses;
