import { Button, Row, Tabs, Form, Input, message, Col } from 'antd';
import { useEffect } from 'react';
import ShowCourses from '../components/ShowCourses';
import { Course } from '../models/course';
import { addRole, fetchCurrentUser } from '../redux/slice/userSlice';
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore';
import { FaChalkboardTeacher, FaBookOpen } from 'react-icons/fa';
import { motion } from 'framer-motion';
import axios from 'axios';

const Dashboard = () => {
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchCurrentUser());
  }, [dispatch]);

  const becomeInstructor = async () => {
    await dispatch(addRole());
    dispatch(fetchCurrentUser());
  };

  const { userCourses, user } = useAppSelector((state) => state.user);

  // Handler đổi mật khẩu
  const onFinishChangePassword = async (values: any) => {
    try {
      // Gửi request đổi mật khẩu
      await axios.post(
        'http://localhost:5001/api/users/change-password',
        {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token') || ''}`
          }
        }
      );
      message.success('Đổi mật khẩu thành công!');
    } catch (error: any) {
      // Xử lý lỗi trả về từ backend
      if (error.response && error.response.data && error.response.data.errors) {
        error.response.data.errors.forEach((err: string) => message.error(err));
      } else {
        message.error('Đổi mật khẩu thất bại!');
      }
    }
  };

  return (
    <div className="dashboard">
      <motion.div
        className="dashboard__header glassmorphism"
        initial={{ opacity: 0, y: -30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        style={{
          position: 'relative',
          overflow: 'hidden',
          borderRadius: '2rem',
          marginBottom: 32,
          padding: '2.5rem 2rem 2rem 2rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          minHeight: 140,
          boxShadow: '0 8px 32px 0 #4f8cff22',
          background: 'rgba(255,255,255,0.12)',
          zIndex: 1
        }}
      >
        {/* Animated gradient background */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 0,
            background: 'linear-gradient(120deg, #4f8cff 0%, #38e8ff 50%, #a259ff 100%)',
            opacity: 0.85,
            filter: 'blur(18px)',
            animation: 'gradientMove 8s ease-in-out infinite alternate'
          }}
        />
        {/* Glow circle */}
        <div
          style={{
            position: 'absolute',
            left: -80,
            top: -60,
            width: 220,
            height: 220,
            borderRadius: '50%',
            background: 'radial-gradient(circle, #a259ff55 0%, #4f8cff00 80%)',
            filter: 'blur(12px)',
            zIndex: 0
          }}
        />
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, zIndex: 2 }}>
          <div
            style={{
              background: 'linear-gradient(135deg, #fff 10%, #4f8cff 90%)',
              borderRadius: '50%',
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 4px 32px #4f8cff55, 0 0 0 8px #fff3',
              marginRight: 18,
              border: '4px solid #fff',
              position: 'relative'
            }}
          >
            <FaChalkboardTeacher style={{
              fontSize: 44,
              color: '#fff',
              filter: 'drop-shadow(0 2px 12px #a259ff)'
            }} />
            {/* Glow effect */}
            <div style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              boxShadow: '0 0 32px 8px #a259ff55, 0 0 0 0 #fff',
              zIndex: 0,
              pointerEvents: 'none'
            }} />
          </div>
          <div>
            <h1 style={{
              color: '#fff',
              fontWeight: 900,
              fontSize: '2.5rem',
              margin: 0,
              letterSpacing: '-1.5px',
              textShadow: '0 2px 16px #4f8cff99, 0 1px 0 #fff2'
            }}>
              My Dashboard
            </h1>
            <div style={{
              color: '#e0eaff',
              fontWeight: 500,
              fontSize: '1.15rem',
              marginTop: 6,
              letterSpacing: '0.5px',
              textShadow: '0 1px 8px #4f8cff55'
            }}>
              Welcome back,&nbsp;
              <span style={{
                fontWeight: 800,
                color: 'rgba(255,255,255,0.98)',
                background: 'linear-gradient(90deg, #38e8ff 0%, #a259ff 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: '1.18em'
              }}>
                {user?.email || 'User'}
              </span>
              !
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 18, zIndex: 2 }}>
    {/* Avatar với border gradient */}
        <div style={{
          padding: 4,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, #38e8ff 0%, #a259ff 100%)',
          boxShadow: '0 2px 16px #a259ff55'
        }}>
          <img
            src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.email || 'U')}&background=4f8cff&color=fff&size=64`}
            alt="avatar"
            style={{
              borderRadius: '50%',
              border: '3px solid #fff',
              width: 60,
              height: 60,
              objectFit: 'cover',
              boxShadow: '0 2px 12px #4f8cff55'
            }}
          />
        </div>
        {/* Nút Become an Instructor */}
        {!user?.roles?.includes('Instructor') && (
          <Button
            onClick={becomeInstructor}
            type="primary"
            size="large"
            style={{
              background: 'linear-gradient(90deg, #a259ff 0%, #38e8ff 100%)',
              border: 'none',
              fontWeight: 700,
              letterSpacing: '0.5px',
              boxShadow: '0 2px 12px #a259ff55',
              marginLeft: 18
            }}
            className="dashboard__instructor-btn"
          >
            <FaBookOpen style={{ marginRight: 8 }} /> Become an Instructor
          </Button>
        )}
      </div>
      </motion.div>
      <div className="dashboard__tabs">
        <Tabs defaultActiveKey="1" size="large">
          <Tabs.TabPane tab="Courses" key="1">
          <div className="dashboard__courses">
        <Row gutter={[48, 32]}>
          {userCourses.length > 0 ? (
            userCourses.map((course: Course, index: number) => {
              return (
                <ShowCourses key={index} course={course} />
              );
            })
          ) : (
            <h1>You have not bought any courses!</h1>
          )}
        </Row>
      </div>
          </Tabs.TabPane>
          <Tabs.TabPane tab="Đổi mật khẩu" key="2">
            <div className="dashboard__change-password">
              <Form
                name="change-password"
                layout="vertical"
                style={{ maxWidth: 400, margin: '2rem auto' }}
                onFinish={onFinishChangePassword}
              >
                <Form.Item
                  label="Mật khẩu hiện tại"
                  name="currentPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
                >
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item
                  label="Mật khẩu mới"
                  name="newPassword"
                  rules={[{ required: true, message: 'Vui lòng nhập mật khẩu mới!' }, { min: 6, message: 'Mật khẩu phải từ 6 ký tự!' }]}
                >
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item
                  label="Nhập lại mật khẩu mới"
                  name="confirmPassword"
                  dependencies={["newPassword"]}
                  rules={[
                    { required: true, message: 'Vui lòng nhập lại mật khẩu mới!' },
                    ({ getFieldValue }) => ({
                      validator(_, value) {
                        if (!value || getFieldValue('newPassword') === value) {
                          return Promise.resolve();
                        }
                        return Promise.reject(new Error('Mật khẩu nhập lại không khớp!'));
                      },
                    }),
                  ]}
                >
                  <Input.Password size="large" />
                </Form.Item>
                <Form.Item>
                  <Button type="primary" htmlType="submit" size="large" block>
                    Đổi mật khẩu
                  </Button>
                </Form.Item>
              </Form>
            </div>
          </Tabs.TabPane>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;