import React, { useEffect, useState } from 'react';
import { Button, Table, Space, message, Tag, Popconfirm, Modal, Descriptions } from 'antd';
import { CheckCircleOutlined, ClockCircleOutlined } from '@ant-design/icons';
import agent from '../../../actions/agent';
import { Course } from '../../../models/course';
import '../styles/Admin.scss';
import { saveAs } from 'file-saver';
import * as XLSX from 'xlsx';

const CourseList = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [commissionModalOpen, setCommissionModalOpen] = useState(false);
  const [detailCourse, setDetailCourse] = useState<Course | null>(null);
  const [commissionCourse, setCommissionCourse] = useState<Course | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('pageIndex', '1');
      params.append('pageSize', '1000');
      const response = await agent.Courses.list(params);
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

  const handleUnpublish = async (courseId: string) => {
    try {
      await agent.Courses.unpublish(courseId);
      message.success('Course unpublished successfully');
      loadData();
    } catch (error: any) {
      console.error('Error unpublishing course:', error);
      message.error(error?.data?.error || 'Failed to unpublish course');
    }
  };

  const handleViewCommission = (course: Course) => {
    setCommissionCourse(course);
    setCommissionModalOpen(true);
  };

  const handleDelete = async (courseId: string) => {
    try {
      await agent.Courses.delete(courseId);
      message.success('Course deleted successfully');
      loadData();
    } catch (error: any) {
      console.error('Error deleting course:', error);
      message.error(error?.data?.error || 'Failed to delete course');
    }
  };

  const handleViewDetails = (course: Course) => {
    setDetailCourse(course);
    setDetailModalOpen(true);
  };

  const handleExportCSV = () => {
    const csvRows = [
      ['Title', 'Subtitle', 'Price', 'Level', 'Status', 'Instructor', 'Category', 'Language'],
      ...courses.map(c => [
        `"${(c.title || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        `"${(c.subTitle || '').replace(/"/g, '""').replace(/\n/g, ' ')}"`,
        c.price,
        c.level,
        c.published ? 'Published' : 'Draft',
        `"${(c.instructor || '').replace(/"/g, '""')}"`,
        `"${(c.category || '').replace(/"/g, '""')}"`,
        `"${(c.language || '').replace(/"/g, '""')}"`
      ])
    ];
    const csvContent = csvRows.map(e => e.join(',')).join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'courses.csv');
  };

  const handleExportExcel = () => {
    // Chuẩn bị dữ liệu
    const data = courses.map(c => ({
      Title: c.title,
      Subtitle: c.subTitle,
      Price: c.price,
      Level: c.level,
      Status: c.published ? 'Published' : 'Draft',
      Instructor: c.instructor,
      Category: c.category,
      Language: c.language,
      // Thêm các trường khác nếu muốn
    }));

    // Tạo worksheet và workbook
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Courses');

    // Xuất file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'courses.xlsx');
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
          {record.published ? (
            <Button type="default" onClick={() => handleUnpublish(record.id)}>
              Unpublish
            </Button>
          ) : (
            <Button type="primary" onClick={() => handlePublish(record.id)}>
              Publish
            </Button>
          )}
          <Button onClick={() => handleViewCommission(record)}>View Commission</Button>
          <Button onClick={() => handleViewDetails(record)}>View Details</Button>
          <Popconfirm
            title="Are you sure to delete this course?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button danger>Delete</Button>
          </Popconfirm>
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

        <div style={{ marginBottom: 16 }}>
          <Button onClick={handleExportExcel} style={{ marginRight: 8 }}>Export Excel</Button>
          <Button onClick={handleExportCSV} style={{ marginRight: 8 }}>Export CSV</Button>
          <input
            type="text"
            placeholder="Search by title..."
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ padding: 8, width: 300, borderRadius: 4, border: '1px solid #ccc' }}
          />
        </div>

        <Table 
          columns={columns} 
          dataSource={courses.filter(course =>
            course.title.toLowerCase().includes(searchText.toLowerCase())
          )}
          rowKey="id"
          loading={loading}
          pagination={{
            pageSize: 10,
            showTotal: (total) => `Total ${total} courses`
          }}
        />
      </div>

      <Modal
        title="Course Details"
        open={detailModalOpen}
        onCancel={() => setDetailModalOpen(false)}
        footer={<Button onClick={() => setDetailModalOpen(false)}>Close</Button>}
      >
        {detailCourse && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Title">{detailCourse.title}</Descriptions.Item>
            <Descriptions.Item label="Subtitle">{detailCourse.subTitle}</Descriptions.Item>
            <Descriptions.Item label="Description">
              <div
                style={{ maxHeight: 300, overflowY: 'auto' }}
                dangerouslySetInnerHTML={{ __html: detailCourse.description }}
              />
            </Descriptions.Item>
            <Descriptions.Item label="Price">${detailCourse.price.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Level">{detailCourse.level}</Descriptions.Item>
            <Descriptions.Item label="Language">{detailCourse.language}</Descriptions.Item>
            <Descriptions.Item label="Status">
              {detailCourse.published ? <Tag color="success">Published</Tag> : <Tag color="warning">Draft</Tag>}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>

      <Modal
        title="Commission Analysis"
        open={commissionModalOpen}
        onCancel={() => setCommissionModalOpen(false)}
        footer={<Button onClick={() => setCommissionModalOpen(false)}>Close</Button>}
      >
        {commissionCourse && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="Title">{commissionCourse.title}</Descriptions.Item>
            <Descriptions.Item label="Price">${commissionCourse.price.toFixed(2)}</Descriptions.Item>
            <Descriptions.Item label="Commission (40%)">
              <b style={{ color: '#faad14' }}>${(commissionCourse.price * 0.4).toFixed(2)}</b>
            </Descriptions.Item>
            <Descriptions.Item label="You Receive (60%)">
              <b style={{ color: '#52c41a' }}>${(commissionCourse.price * 0.6).toFixed(2)}</b>
            </Descriptions.Item>
            <Descriptions.Item label="Status">
              {commissionCourse.published ? (
                <Tag color="success">Published</Tag>
              ) : (
                <Tag color="warning">Draft</Tag>
              )}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </div>
  );
};

export default CourseList;
