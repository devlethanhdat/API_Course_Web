import { Button, Card, Form, Input, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { ChangeEvent, useState } from 'react'
import { Login } from '../models/user'
import { LockOutlined, MailOutlined } from '@ant-design/icons'
import logo from '../assets/Knowledge_Is_Human_Homepage_Animated_Banner.gif'
import { motion } from 'framer-motion'
import { GoogleLogin, GoogleOAuthProvider } from '@react-oauth/google'
import FacebookLogin from 'react-facebook-login'
import { FaFacebook } from 'react-icons/fa'
const { Text, Title } = Typography

interface Props {
  toggleRegister: () => void
  onSubmit: (values: Login) => Promise<void>
}

const API_URL = process.env.REACT_APP_API_URL || "http://localhost:5001/api";

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, type: 'spring' } },
  hover: { scale: 1.025, boxShadow: '0 16px 48px 0 rgba(30,60,114,0.18)' }
}

const Signin = ({ toggleRegister, onSubmit }: Props) => {
  const [values, setValues] = useState<Login>({
    email: '',
    password: '',
  })

  const { email, password } = values

  const [form] = Form.useForm()

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }

  const onFinish = (values: Login) => {
    onSubmit(values)
  }

  return (
    <div className="login-animated-bg">
      <motion.div
        className="login-modern-wrapper"
        initial="hidden"
        animate="visible"
        variants={cardVariants}
      >
        <motion.div
          whileHover="hover"
          variants={cardVariants}
        >
          <div className="login-modern-logo" style={{ marginTop: 32, marginBottom: -32, zIndex: 20, position: 'relative', display: 'flex', justifyContent: 'center' }}>
            <motion.img
              src={logo}
              alt="logo"
              animate={{ rotate: [0, 8, -8, 0] }}
              transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
              style={{ background: '#fff', borderRadius: '50%', boxShadow: '0 2px 16px #e3e9f7', width: 80, height: 80, objectFit: 'cover', border: '4px solid #fff' }}
            />
          </div>
          <Card className="log-in-card login-modern-card glass-card" style={{ borderRadius: 32, marginTop: -40 }}>
        <div className="log-in-card__intro">
          <Typography>
                <Title level={2} className="log-in-card__intro-title login-modern-title">
                  Welcome back!
            </Title>
                <Text className="login-modern-subtitle">Sign in to your Learnify account</Text>
          </Typography>
        </div>
            <Content className="log-in__form login-modern-form">
          <Form
            name="login"
                layout="vertical"
            autoComplete="off"
            initialValues={values}
            onFinish={onFinish}
            form={form}
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                {
                  required: true,
                  message: 'Please enter a valid email!',
                  pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                },
              ]}
            >
                  <Input
                    prefix={<MailOutlined style={{ color: '#3b82f6' }} />}
                    value={email}
                    name="email"
                    onChange={handleChange}
                    size="large"
                    placeholder="Email address"
                    className="login-modern-input login-animated-input"
                  />
            </Form.Item>

            <Form.Item
              label="Password"
              name="password"
              rules={[
                {
                  required: true,
                  message: 'Please enter a valid password!',
                  min: 6,
                },
              ]}
            >
              <Input.Password
                    prefix={<LockOutlined style={{ color: '#3b82f6' }} />}
                name="password"
                value={password}
                onChange={handleChange}
                    size="large"
                    placeholder="Password"
                    className="login-modern-input login-animated-input"
              />
            </Form.Item>
                <div className="login-modern-forgot">
                  <a href="#" className="login-modern-forgot-link">Forgot password?</a>
                </div>
                <Form.Item>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="login-modern-btn login-animated-btn"
                      block
                    >
                      Sign In
              </Button>
                  </motion.div>
            </Form.Item>

                <div className="login-social-divider">
                  <span>or</span>
                </div>
                <div className="login-social-btns">
                  <GoogleOAuthProvider clientId="993497899406-e5k6f7qq03atapa4napb3cknvp6qmi79.apps.googleusercontent.com">
                    <GoogleLogin
                      onSuccess={async credentialResponse => {
                        console.log('Google callback', credentialResponse);
                        const token = credentialResponse.credential;
                        if (!token) {
                          alert('Không nhận được token từ Google');
                          return;
                        }
                        const res = await fetch(`${API_URL}/users/google-login`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token })
                        });
                        const text = await res.text();
                        console.log('Raw response:', text);
                        try {
                          const data = JSON.parse(text);
                          if (data.token) {
                            localStorage.setItem('token', data.token);
                            // Gọi API lấy user info
                            fetch(`${API_URL}/users/currentUser`, {
                              headers: { 'Authorization': `Bearer ${data.token}` }
                            })
                              .then(res => res.json())
                              .then(user => {
                                localStorage.setItem('user', JSON.stringify(user));
                                console.log('Redirecting to /profile');
                                window.location.href = '/profile';
                              });
                          } else {
                            alert('Login failed');
                          }
                          console.log('Google login response:', data);
                        } catch (e) {
                          alert('API không trả về JSON. Xem console để biết chi tiết.');
                        }
                      }}
                      onError={() => {
                        alert('Google login failed');
                      }}
                      width="100%"
                      useOneTap
                    />
                  </GoogleOAuthProvider>
                  <FacebookLogin
                    appId="574266017389174"
                    autoLoad={false}
                    fields="name,email,picture"
                    scope="email,public_profile"
                    callback={async (response) => {
                      console.log('Facebook callback', response);
                      if ('accessToken' in response) {
                        const token = response.accessToken;
                        const res = await fetch(`${API_URL}/users/facebook-login`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ token })
                        });
                        const data = await res.json();
                        if (data.token) {
                          localStorage.setItem('token', data.token);
                          // dispatch(setUser(data.user));
                          window.location.href = '/profile';
                        }
                      } else {
                        alert('Không nhận được accessToken từ Facebook');
                      }
                    }}
                    textButton="Sign in with Facebook"
                    icon={<FaFacebook style={{ color: '#1877f3', marginRight: 8, fontSize: 20 }} />}
                    cssClass="login-facebook-btn ant-btn ant-btn-lg ant-btn-block"
                  />
                </div>
          </Form>
        </Content>
            <div onClick={toggleRegister} className="log-in-card__toggle login-modern-toggle">
              Not a user yet? <span>Register here</span>
        </div>
      </Card>
        </motion.div>
      </motion.div>
      <div className="login-animated-bg__gradient"></div>
      <div className="login-animated-bg__particles">
        {/* SVG hoặc canvas particles có thể thêm ở đây nếu muốn */}
      </div>
    </div>
  )
}

export default Signin
