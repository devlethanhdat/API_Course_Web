import { Button, Card, Typography, Empty, Space, Statistic, Row, Col, Tooltip, Tag, Modal, notification } from 'antd';
import { PlusOutlined, BookOutlined, UsergroupAddOutlined, DollarOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Area } from '@ant-design/charts';
import CountUp from 'react-countup';
import { useEffect, useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { Course } from '../models/course';
import { getUnpublishedCourses } from '../redux/slice/userSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore';
import { courseService } from '../services/courseService';
import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';
import 'aos/dist/aos.css';
import '../styles/InstructorPage.scss'; // Update import path

const { Title, Text } = Typography;
const { Meta } = Card;

const InstructorPage = () => {
  const history = useHistory();
  const dispatch = useAppDispatch();
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalRevenue: 0,
    totalCourses: 0
  });

  const chartData = [
    { date: '2023-01', students: 35 },
    { date: '2023-02', students: 45 },
  ];

  const chartConfig = {
    data: chartData,
    xField: 'date',
    yField: 'students',
    smooth: true,
    areaStyle: {
      fill: 'l(270) 0:#ffffff 0.5:#7ec2f3 1:#1890ff',
    }
  };

  useEffect(() => {
    dispatch(getUnpublishedCourses());
  }, [dispatch]);

  const { unpublishedCourses } = useAppSelector((state) => state.user);

  const makeCourse = () => {
    history.push('/instructor/course');
  };

  const handleEdit = (courseId: string) => {
    console.log('Editing course:', courseId); // Debug log
    history.push(`/instructor/course/${courseId}/edit`);
  };

  const handleDelete = async (courseId: string) => {
    Modal.confirm({
      title: 'Delete Course',
      content: 'Are you sure you want to delete this course? This action cannot be undone.',
      okText: 'Delete',
      okType: 'danger',
      cancelText: 'Cancel',
      async onOk() {
        try {
          await courseService.deleteCourse(courseId);
          // Refresh course list after successful deletion
          dispatch(getUnpublishedCourses());
        } catch (error) {
          console.error('Delete failed:', error);
        }
      },
    });
  };

  const renderCourseCards = () => {
    if (!unpublishedCourses.length) {
      return (
        <Empty
          image={Empty.PRESENTED_IMAGE_DEFAULT}
          description={
            <Space direction="vertical" align="center" size="large">
              <Text>You haven't created any courses yet</Text>
              <Button type="primary" size="large" onClick={makeCourse}>
                Create Your First Course
              </Button>
            </Space>
          }
        />
      );
    }

    return (
      <div className="courses-grid">
        {unpublishedCourses.map((course, index) => (
          <motion.div
            key={course.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card
              hoverable
              className="course-card"
              cover={
                <div className="card-cover">
                  <img alt={course.title} src={course.image} />
                  <div className="card-status">Draft</div>
                </div>
              }
              actions={[
                <Tooltip title="Edit Course">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(course.id)}
                  />
                </Tooltip>,
                <Tooltip title="Delete Course">
                  <Button 
                    type="text" 
                    danger
                    icon={<DeleteOutlined />}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(course.id);
                    }}
                  />
                </Tooltip>,
                <Tooltip title="View Lectures">
                  <Link to={`${course.id}/lectures`}>
                    <Button type="text" icon={<EyeOutlined />} />
                  </Link>
                </Tooltip>
              ]}
            >
              <div className="card-content">
                <Title level={5} ellipsis={{ tooltip: course.title }}>{course.title}</Title>
                <Text type="secondary" ellipsis={{ tooltip: course.subTitle }}>{course.subTitle}</Text>
                <div className="card-footer">
                  <Text strong className="price">${course.price}</Text>
                  <Tag color="blue">{course.level}</Tag>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>
    );
  };

  return (
    <motion.div 
      className="instructor-dashboard"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="dashboard-header"
      >
        <Space direction="vertical">
          <Title level={2}>Welcome Back, Instructor!</Title>
          <Text type="secondary">Here's what's happening with your courses</Text>
        </Space>
      </motion.div>

      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={8}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="stat-card">
              <Statistic 
                title="Total Students"
                value={stats.totalStudents}
                prefix={<UsergroupAddOutlined />}
                formatter={(value) => <CountUp end={Number(value)} duration={2.5} />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={8}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="stat-card">
              <Statistic 
                title="Total Revenue"
                value={stats.totalRevenue}
                prefix={<DollarOutlined />}
                formatter={(value) => <CountUp end={Number(value)} duration={2.5} />}
              />
            </Card>
          </motion.div>
        </Col>
        <Col xs={24} sm={8}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="stat-card">
              <Statistic 
                title="Total Courses"
                value={stats.totalCourses}
                prefix={<BookOutlined />}
                formatter={(value) => <CountUp end={Number(value)} duration={2.5} />}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Card className="chart-section">
        <Title level={4}>Student Enrollment Trends</Title>
        <Area {...chartConfig} />
      </Card>

      <section className="courses-section">
        <div className="section-header">
          <Space align="center">
            <BookOutlined className="section-icon" />
            <Title level={3} style={{ margin: 0 }}>Your Courses</Title>
          </Space>
          <Button 
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={makeCourse}
          >
            Create New Course
          </Button>
        </div>
        {renderCourseCards()}
      </section>
    </motion.div>
  );
};

export default InstructorPage;