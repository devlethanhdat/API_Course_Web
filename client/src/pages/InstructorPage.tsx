import { Button, Card, Typography, Empty, Space, Statistic, Row, Col, Tooltip, Tag, Modal, notification } from 'antd';
import { PlusOutlined, BookOutlined, UsergroupAddOutlined, DollarOutlined, EditOutlined, EyeOutlined, DeleteOutlined } from '@ant-design/icons';
import { motion, AnimatePresence } from 'framer-motion';
import { Area, Bar, Pie, Column } from '@ant-design/charts';
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
import agent from '../actions/agent'; // Import agent for API calls
import { CourseStudentCountDto, CourseRevenueDto, OrderTrendDto } from '../models/stats';

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

  const [studentCounts, setStudentCounts] = useState<CourseStudentCountDto[]>([]);
  const [revenues, setRevenues] = useState<CourseRevenueDto[]>([]);
  const [orderTrends, setOrderTrends] = useState<OrderTrendDto[]>([]);

  useEffect(() => {
    agent.Instructor.getOrderTrends()
      .then(data => setOrderTrends(Array.isArray(data) ? data : []))
      .catch(() => setOrderTrends([]));
  }, []);

  const orderTrendData = Array.isArray(orderTrends)
    ? orderTrends.map(item => ({
        date: `${item.month}/${item.year}`,
        orders: item.orderCount,
      }))
    : [];

  useEffect(() => {
    const loadStats = async () => {
      try {
        const response = await agent.Courses.getInstructorStats();
        setStats({
          totalStudents: response.totalStudents,
          totalRevenue: response.totalRevenue,
          totalCourses: response.totalCourses
        });
      } catch (error) {
        console.error('Error loading stats:', error);
        notification.error({
          message: 'Error',
          description: 'Could not load statistics'
        });
      }
    };

    loadStats();
    dispatch(getUnpublishedCourses());
    agent.Instructor.getStudentCountByCourse().then(setStudentCounts);
    agent.Instructor.getRevenueByCourse().then(setRevenues);
    agent.Instructor.getOrderTrends().then(setOrderTrends);
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
              <Text>Bạn chưa tạo khóa học nào</Text>
              <Button type="primary" size="large" onClick={makeCourse}>
                Tạo khóa học đầu tiên
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
                  <div className="card-status">Bản nháp</div>
                </div>
              }
              actions={[
                <Tooltip title="Chỉnh sửa khóa học">
                  <Button 
                    type="text" 
                    icon={<EditOutlined />}
                    onClick={() => handleEdit(course.id)}
                  />
                </Tooltip>,
                <Tooltip title="Xóa khóa học">
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
                <Tooltip title="Xem bài giảng">
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

  console.log('revenues:', revenues);

  // Sử dụng orderTrendData thực tế cho Area chart
  const areaChartConfig = {
    data: orderTrendData,
    xField: 'date',
    yField: 'orders',
    smooth: true,
    color: '#f857a6',
    areaStyle: { fill: '#fda085', fillOpacity: 0.5 },
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
          <Title level={2}>Chào mừng trở lại, Giảng viên!</Title>
          <Text type="secondary">Tổng quan về các khóa học của bạn</Text>
        </Space>
      </motion.div>

      <Row gutter={[24, 24]} className="stats-section">
        <Col xs={24} sm={8}>
          <motion.div whileHover={{ scale: 1.03 }}>
            <Card className="stat-card">
              <Statistic 
                title="Tổng số học viên"
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
                title="Tổng doanh thu"
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
                title="Tổng số khóa học"
                value={stats.totalCourses}
                prefix={<BookOutlined />}
                formatter={(value) => <CountUp end={Number(value)} duration={2.5} />}
              />
            </Card>
          </motion.div>
        </Col>
      </Row>

      <Card className="chart-section">
        <Title level={4}>Biểu đồ số lượng học viên đăng ký</Title>
        <Area {...areaChartConfig} />
      </Card>

      <Card className="chart-section">
        <Title level={4}>Số học viên theo từng khóa học</Title>
        <Bar
          data={studentCounts}
          xField="studentCount"
          yField="courseTitle"
          seriesField="courseTitle"
          color={['#36cfc9', '#fda085', '#a259f7', '#ff9800', '#e00ed2']}
        />
      </Card>

      <Card className="chart-section">
        <Title level={4}>Doanh thu theo từng khóa học</Title>
        <Pie
          data={revenues}
          angleField="revenue"
          colorField="courseTitle"
          label={false}
          color={['#fda085', '#a259f7', '#36cfc9', '#ff9800', '#e00ed2']}
        />
      </Card>

      <Card className="chart-section">
        <Title level={4}>Xu hướng đơn hàng</Title>
        <Column
          data={orderTrendData}
          xField="date"
          yField="orders"
          color="#a259f7"
        />
      </Card>

      <section className="courses-section">
        <div className="section-header">
          <Space align="center">
            <BookOutlined className="section-icon" />
            <Title level={3} style={{ margin: 0 }}>Các khóa học của bạn</Title>
          </Space>
          <Button 
            type="primary"
            size="large"
            icon={<PlusOutlined />}
            onClick={makeCourse}
          >
            Tạo khóa học mới
          </Button>
        </div>
        {renderCourseCards()}
      </section>
    </motion.div>
  );
};

export default InstructorPage;