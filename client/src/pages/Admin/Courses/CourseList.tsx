import React, { useEffect, useState } from 'react';
import { Button, Table, Space, message, Tag } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import agent from '../../../actions/agent';
import { Course } from '../../../models/course';
import '../styles/Admin.scss';

const CourseList: React.FC = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const response = await agent.Courses.list();
      setCourses(response.data || []);
    } catch (error) {
      message.error('Failed to load courses');
    } finally {
      setLoading(false);
    }
  };

  const handlePublish = async (courseId: string) => {
    try {
      await agent.Courses.publish(courseId);
      message.success('Course published successfully');
      loadData();
    } catch (error: any) {
      console.error('Error publishing course:', error);
      message.error(error?.data?.error || 'Failed to publish course');
    }
  };

  const columns = [
    {
      title: 'Image',
      key: 'image',
      width: 120,
      render: (record: Course) => (
        <img
          src={record.image}
          alt={record.title}
          style={{
            width: '100px',
            height: '60px',
            objectFit: 'cover',
            borderRadius: '4px',
            cursor: 'pointer',
            transition: 'transform 0.3s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'scale(2)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'scale(1)';
          }}
        />
      )
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
      render: (text: string, record: Course) => (
        <Space direction="vertical" size="small">
          <span>{text}</span>
          {record.published ? 
            <Tag color="success" icon={<CheckCircleOutlined />}>Published</Tag> :
            <Tag color="warning" icon={<ClockCircleOutlined />}>Draft</Tag>
          }
        </Space>
      )
    },
    {
      title: 'Instructor',
      dataIndex: 'instructor',
      key: 'instructor'
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category'
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => `$${price.toFixed(2)}`
    },
    {
      title: 'Level',
      dataIndex: 'level',
      key: 'level'
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Course) => (
        <Space>
          {!record.published && (
            <Button 
              type="primary"
              onClick={() => handlePublish(record.id)}
            >
              Publish
            </Button>
          )}
        </Space>
      )
    }
  ];

  return (
    <div className="admin-container">
      <div className="table-container">
        <div className="table-header">
          <h2>Course Management</h2>
        </div>

        <Table 
          columns={columns} 
          dataSource={courses}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} courses`
          }}
        />
      </div>
    </div>
  );
};

export default CourseList;
