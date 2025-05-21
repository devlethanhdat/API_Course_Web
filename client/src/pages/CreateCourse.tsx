import { Button, Form, Input, InputNumber, notification, Select, Upload, Steps, Card } from "antd";
import { PlusOutlined, LoadingOutlined, FileTextOutlined, DollarOutlined, PictureOutlined } from '@ant-design/icons';
import { Content } from "antd/lib/layout/layout";
import { ChangeEvent, useState } from "react";
import { useHistory } from "react-router-dom";
import agent from "../actions/agent";
import { Category } from "../models/category";
import { RegisterCourse } from "../models/course";
import { categoriesSelector } from "../redux/slice/categorySlice";
import { useAppSelector } from "../redux/store/configureStore";
import './CreateCourse.scss';

const { Step } = Steps;

const CreateCourse = () => {
  const [values, setValues] = useState<RegisterCourse>({
    title: "",
    subTitle: "",
    description: "",
    price: 0,
    category: 0,
    level: "",
    language: "",
    image: "",
  });

  const [imageLoading, setImageLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string>("");
  const [currentStep, setCurrentStep] = useState(0);

  const { title, subTitle, description, price, category, level, language } =
    values;

  const categories = useAppSelector(categoriesSelector.selectAll);

  const { Option } = Select;
  const history = useHistory();

  const getSelectCategories = () => {
    const catArray: { value: number; label: string }[] = [];
    if (categories) {
      categories.forEach((category: Category) => {
        catArray.push({ value: category.id, label: category.name });
      });
    }
    return catArray;
  };

  const [form] = Form.useForm();

  const handleChange = (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setValues({ ...values, [name]: value });
  };

  const handleImageUpload = async (options: any) => {
    const { file } = options;
    setImageLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', 'acba8r8m'); // Hardcoded value from .env

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dzeea8yqr/image/upload`, // Hardcoded value from .env
        {
          method: 'POST',
          body: formData,
        }
      );

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      console.log("Upload response:", data); // Debug log

      if (data.secure_url) {
        setImageUrl(data.secure_url);
        setValues({ ...values, image: data.secure_url });
        notification.success({ message: 'Image uploaded successfully' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      notification.error({ 
        message: 'Failed to upload image',
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setImageLoading(false);
    }
  };

  const uploadButton = (
    <div>
      {imageLoading ? <LoadingOutlined /> : <PlusOutlined />}
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  const onSubmit = async () => {
    const { category, ...rest } = values;
    const payload = {
      ...rest,
      categoryId: Number(category),
    };
    console.log(payload);
    const response = await agent.Courses.create(payload);
    notification.success({
      message: response,
    });
    history.push("/instructor");
  };

  const steps = [
    {
      title: 'Basic Info',
      icon: <FileTextOutlined />,
      content: (
        <Card className="form-card">
          <Form.Item name="title" label="Course Title" rules={[{ required: true, min: 10 }]}>
            <Input className="styled-input" onChange={handleChange} name="title" value={title} />
          </Form.Item>
          <Form.Item name="subTitle" label="Course Subtitle" rules={[{ required: true, min: 10 }]}>
            <Input className="styled-input" onChange={handleChange} name="subTitle" value={subTitle} />
          </Form.Item>
          <Form.Item name="description" label="Description" rules={[{ required: true }]}>
            <Input.TextArea 
              className="styled-textarea" 
              rows={6}
              onChange={handleChange}
              name="description"
              value={description}
            />
          </Form.Item>
        </Card>
      ),
    },
    {
      title: 'Course Details',
      icon: <DollarOutlined />,
      content: (
        <Card className="form-card">
          <Form.Item name="price" label="Price ($)" rules={[{ required: true }]}>
            <InputNumber 
              className="styled-input"
              min={0}
              onChange={(value) => setValues({ ...values, price: value ?? 0 })}
              value={price}
            />
          </Form.Item>
          <Form.Item name="category" label="Category" rules={[{ required: true }]}>
            <Select
              className="styled-select"
              options={getSelectCategories()}
              onChange={(value) => setValues({ ...values, category: Number(value) })}
              value={category}
            />
          </Form.Item>
          <Form.Item name="level" label="Level" rules={[{ required: true }]}>
            <Select
              className="styled-select"
              onChange={(value) => setValues({ ...values, level: value })}
              value={level}
            >
              <Select.Option value="Beginner">Beginner</Select.Option>
              <Select.Option value="Intermediate">Intermediate</Select.Option>
              <Select.Option value="Advanced">Advanced</Select.Option>
            </Select>
          </Form.Item>
          <Form.Item name="language" label="Language" rules={[{ required: true }]}>
            <Select
              className="styled-select"
              onChange={(value) => setValues({ ...values, language: value })}
              value={language}
            >
              <Select.Option value="English">English</Select.Option>
              <Select.Option value="Vietnamese">Vietnamese</Select.Option>
              <Select.Option value="Japanese">Japanese</Select.Option>
            </Select>
          </Form.Item>
        </Card>
      ),
    },
    {
      title: 'Course Media',
      icon: <PictureOutlined />,
      content: (
        <Card className="form-card">
          <Form.Item name="image" label="Course Image" rules={[{ required: true }]}>
            <div className="upload-container">
              <Upload
                name="image"
                listType="picture-card"
                className="avatar-uploader"
                showUploadList={false}
                customRequest={handleImageUpload}
                beforeUpload={(file) => {
                  const isJpgOrPng = file.type === 'image/jpeg' || file.type === 'image/png';
                  if (!isJpgOrPng) {
                    notification.error({ message: 'You can only upload JPG/PNG files!' });
                    return false;
                  }
                  const isLt2M = file.size / 1024 / 1024 < 2;
                  if (!isLt2M) {
                    notification.error({ message: 'Image must be smaller than 2MB!' });
                    return false;
                  }
                  return true;
                }}
              >
                {imageUrl ? (
                  <img src={imageUrl} alt="course" className="uploaded-image" />
                ) : (
                  uploadButton
                )}
              </Upload>
            </div>
          </Form.Item>
        </Card>
      ),
    },
  ];

  return (
    <div className="create-course-container">
      <Card className="main-card">
        <h1 className="page-title">Create Course</h1>
        <div className="page-subtitle">Follow the steps to create your course</div>
        
        <Steps current={currentStep} className="course-steps">
          {steps.map(item => (
            <Step key={item.title} title={item.title} icon={item.icon} />
          ))}
        </Steps>

        <Form
          form={form}
          layout="vertical"
          onFinish={onSubmit}
          className="create-course-form"
        >
          {steps[currentStep].content}

          <div className="steps-action">
            {currentStep > 0 && (
              <Button className="prev-button" onClick={() => setCurrentStep(current => current - 1)}>
                Previous
              </Button>
            )}
            {currentStep < steps.length - 1 && (
              <Button type="primary" onClick={() => setCurrentStep(current => current + 1)}>
                Next
              </Button>
            )}
            {currentStep === steps.length - 1 && (
              <Button type="primary" htmlType="submit" className="submit-button">
                Create Course
              </Button>
            )}
          </div>
        </Form>
      </Card>
    </div>
  );
};

export default CreateCourse;
