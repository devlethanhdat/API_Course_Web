import { Button, Form, Input, InputNumber, Select, Upload, notification, Card, Space } from "antd";
import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import { courseService } from "../services/courseService";
import { LoadingOutlined, PlusOutlined } from '@ant-design/icons';
// import './CreateCourse.scss';  // Update import path
import '../styles/EditCourse.scss';

const EditCourse = () => {
  const [form] = Form.useForm();
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");

  useEffect(() => {
    const loadCourse = async () => {
      try {
        console.log('Loading course with ID:', id); // Debug log
        const course = await courseService.getCourseById(id);
        console.log('Loaded course data:', course); // Debug log
        
        if (course) {
          form.setFieldsValue({
            ...course,
            image: course.image // Make sure image is included
          });
          setImageUrl(course.image);
        }
      } catch (error) {
        console.error('Error loading course:', error); // Debug log
        notification.error({
          message: 'Error',
          description: 'Could not load course details'
        });
      }
    };

    if (id) {
      loadCourse();
    }
  }, [id, form]);

  const onSubmit = async (values: any) => {
    setLoading(true);
    try {
      const updatedData = {
        ...values,
        image: imageUrl || values.image // Use existing image if no new upload
      };
      
      console.log('Submitting data:', updatedData); // Debug log
      
      await courseService.updateCourse(id, updatedData);
      notification.success({
        message: 'Success',
        description: 'Course updated successfully'
      });
      history.push('/instructor');
    } catch (error) {
      console.error('Update error:', error);
      notification.error({
        message: 'Error',
        description: 'Failed to update course'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (options: any) => {
    setLoading(true);
    const { file } = options;
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'acba8r8m');

      const response = await fetch(
        'https://api.cloudinary.com/v1_1/dzeea8yqr/image/upload',
        {
          method: 'POST',
          body: formData,
        }
      );

      const data = await response.json();
      if (data.secure_url) {
        setImageUrl(data.secure_url);
        // Update form field with new image URL
        form.setFieldsValue({ image: data.secure_url });
        notification.success({ message: 'Image uploaded successfully' });
      }
    } catch (error) {
      notification.error({ message: 'Failed to upload image' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="edit-course-container">
      <Card className="main-card">
        <h1 className="page-title">Enhance Your Course</h1>
        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
        >
          <Space direction="vertical" size="large" style={{ width: '100%' }}>
            <Form.Item
              name="title"
              label="Course Title"
              rules={[{ required: true, message: 'Please enter course title' }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="subTitle"
              label="Course Subtitle"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[{ required: true }]}
            >
              <Input.TextArea rows={6} />
            </Form.Item>

            <Form.Item
              name="price"
              label="Price"
              rules={[{ required: true }]}
            >
              <InputNumber min={0} style={{ width: 200 }} />
            </Form.Item>

            <Form.Item
              name="level"
              label="Level"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="Beginner">Beginner</Select.Option>
                <Select.Option value="Intermediate">Intermediate</Select.Option>
                <Select.Option value="Advanced">Advanced</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="language"
              label="Language"
              rules={[{ required: true }]}
            >
              <Select>
                <Select.Option value="English">English</Select.Option>
                <Select.Option value="Vietnamese">Vietnamese</Select.Option>
                <Select.Option value="Japanese">Japanese</Select.Option>
              </Select>
            </Form.Item>

            <Form.Item
              name="image"
              label="Course Cover Image"
              className="upload-container"
              rules={[{ required: true, message: 'Please upload a cover image' }]}
            >
              <Upload
                name="image"
                listType="picture-card"
                showUploadList={false}
                customRequest={handleImageUpload}
                beforeUpload={(file) => {
                  const isImage = file.type.startsWith('image/');
                  if (!isImage) {
                    notification.error({ message: 'You can only upload image files!' });
                  }
                  return isImage;
                }}
              >
                {imageUrl ? (
                  <img 
                    src={imageUrl} 
                    alt="course" 
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                ) : (
                  <div className="upload-placeholder">
                    {loading ? <LoadingOutlined /> : <PlusOutlined />}
                    <div>Upload Course Image</div>
                  </div>
                )}
              </Upload>
            </Form.Item>

            <Form.Item className="form-actions">
              <Space size="middle">
                <Button size="large" onClick={() => history.push('/instructor')}>
                  Cancel
                </Button>
                <Button type="primary" size="large" htmlType="submit" loading={loading}>
                  Save Changes
                </Button>
              </Space>
            </Form.Item>
          </Space>
        </Form>
      </Card>
    </div>
  );
};

export default EditCourse;
