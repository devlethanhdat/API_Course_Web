import { Button, Card, Form, Input, notification, Typography } from 'antd'
import { Content } from 'antd/lib/layout/layout'
import { ChangeEvent, SyntheticEvent, useState } from 'react'
import { useHistory } from 'react-router-dom'
import { Register } from '../models/user'
import { registerUser } from '../redux/slice/userSlice'
import { useAppDispatch } from '../redux/store/configureStore'
import { UserOutlined, LockOutlined, MailOutlined } from '@ant-design/icons'
import logo from '../assets/Knowledge_Is_Human_Homepage_Animated_Banner.gif'
import { motion } from 'framer-motion'

const { Text, Title } = Typography

interface Props {
  toggleRegister: () => void
}

const cardVariants = {
  hidden: { opacity: 0, y: 60, scale: 0.95 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.7, type: 'spring' } },
  hover: { scale: 1.025, boxShadow: '0 16px 48px 0 rgba(30,60,114,0.18)' }
}

const RegisterComponent = ({ toggleRegister }: Props) => {
  const dispatch = useAppDispatch()

  const [values, setValues] = useState<Register>({
    email: '',
    password: '',
    username: '',
  })

  const { email, password, username } = values

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setValues({ ...values, [name]: value })
  }
  const [form] = Form.useForm()

  const resetForm = () => {
    setValues({ ...values, email: '', password: '', username: '' })
    form.resetFields()
  }

  const history = useHistory()

  const submitUser = async (e: SyntheticEvent) => {
    e.preventDefault()
    try {
      if (
        email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/) &&
        password.length >= 6 &&
        username.length >= 5
      ) {
        await dispatch(registerUser(values))
        history.push('profile')
      }
      resetForm()
    } catch (err: any) {
      if (err.error) {
        for (const val of err.error) {
          notification.error({
            message: val,
          })
        }
      }
      resetForm()
    }
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
                  Sign up with DH21KPM02!
                </Title>
                <Text className="login-modern-subtitle">Use your Username, Email and Password to Register</Text>
              </Typography>
            </div>
            <Content className="log-in__form login-modern-form">
              <Form
                name="register"
                layout="vertical"
                autoComplete="off"
                onSubmitCapture={submitUser}
                form={form}
              >
                <Form.Item
                  label="Username"
                  name="username"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your username!',
                      min: 5,
                    },
                  ]}
                >
                  <Input
                    prefix={<UserOutlined style={{ color: '#3b82f6' }} />}
                    value={username}
                    name="username"
                    onChange={handleChange}
                    size="large"
                    placeholder="Username"
                    className="login-modern-input login-animated-input"
                  />
                </Form.Item>
                <Form.Item
                  label="Email"
                  name="email"
                  rules={[
                    {
                      required: true,
                      message: 'Please input your email!',
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
                      message: 'Please input your password!',
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
                <Form.Item>
                  <motion.div whileTap={{ scale: 0.96 }}>
                    <Button
                      type="primary"
                      htmlType="submit"
                      size="large"
                      className="login-modern-btn login-animated-btn"
                      block
                    >
                      Register
                    </Button>
                  </motion.div>
                </Form.Item>
              </Form>
            </Content>
            <div onClick={toggleRegister} className="log-in-card__toggle login-modern-toggle">
              Already a User? <span>Sign in</span>
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

export default RegisterComponent
