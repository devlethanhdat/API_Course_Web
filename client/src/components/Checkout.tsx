import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { Card, Form, Input, notification, Typography, Button, Row, Col } from 'antd'
import { SyntheticEvent, useState } from 'react'
import { useHistory } from 'react-router-dom'
import agent from '../actions/agent'
import CheckoutSummary from '../components/CheckoutSummary'
import { removeBasket } from '../redux/slice/basketSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { setBasket } from '../redux/slice/basketSlice'
import { motion } from 'framer-motion'
import { FaCreditCard, FaLock, FaUser } from 'react-icons/fa'
import '../sass/pages/_checkout.scss'

const { Title, Text } = Typography

const discountData = JSON.parse(localStorage.getItem('appliedDiscount') || '{}');
const discount = discountData.discount || 0;

const CheckoutPage = () => {
  const [cardName, setCardName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false)
  const [form] = Form.useForm()
  const stripe = useStripe()
  const elements = useElements()
  const dispatch = useAppDispatch()
  const history = useHistory()
  const { basket } = useAppSelector((state) => state.basket)

  const handleChange = (e: any) => {
    setCardName(e.target.value)
  }

  const handlePayment = async (event: SyntheticEvent) => {
    event.preventDefault()
    setIsLoading(true)
    try {
      if (!stripe || !elements || !basket?.clientSecret) {
        throw new Error('Payment cannot be initialized')
      }
      const cardElement = elements.getElement(CardNumberElement)
      if (!cardElement) {
        throw new Error('Card element not found')
      }
      const { error, paymentIntent } = await stripe.confirmCardPayment(
        basket.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardName || 'Anonymous',
            },
          },
        }
      )
      if (error) {
        throw new Error(error.message)
      }
      if (paymentIntent?.status === 'succeeded') {
        try {
          await agent.Payments.confirmPayment(paymentIntent.id)
          dispatch(removeBasket())
          notification.success({
            message: 'Thanh toán thành công',
            description: 'Bạn đã thanh toán thành công!'
          })
          history.push('/profile')
        } catch (err) {
          notification.error({
            message: 'Lưu đơn hàng thất bại',
            description: (err as Error)?.message || 'Không thể lưu đơn hàng. Vui lòng liên hệ hỗ trợ.'
          })
          return
        }
      }
    } catch (error: unknown) {
      notification.error({
        message: 'Thanh toán thất bại',
        description: error instanceof Error ? error.message : 'Có lỗi xảy ra khi thanh toán',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <motion.div
      className="checkout-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Row justify="center" align="top" gutter={[32, 32]}>
        <Col xs={24} md={14}>
          <motion.div
            className="checkout-card glass"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80 }}
          >
            <Title level={2} className="checkout-title">
              <FaCreditCard style={{ marginRight: 12, color: '#1890ff' }} /> Thanh toán bằng thẻ
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              Điền thông tin thẻ của bạn để hoàn tất đơn hàng
            </Text>
            <Form name="payment" form={form} layout="vertical" style={{ marginTop: 24 }}>
              <Form.Item
                name="cardName"
                rules={[
                  { required: true, message: 'Vui lòng nhập tên trên thẻ', min: 5 },
                ]}
                label={<span><FaUser style={{ marginRight: 6 }} />Tên trên thẻ</span>}
              >
                <Input
                  name="cardName"
                  onChange={handleChange}
                  value={cardName}
                  placeholder="Nhập tên trên thẻ"
                  size="large"
                  autoComplete="cc-name"
                />
              </Form.Item>
              <Form.Item label={<span><FaCreditCard style={{ marginRight: 6 }} />Số thẻ</span>}>
                <div className="stripe-input">
                  <CardNumberElement options={{ style: { base: { fontSize: '18px', letterSpacing: '1.2px' } } }} />
                </div>
              </Form.Item>
              <Row gutter={12}>
                <Col xs={12}>
                  <Form.Item label="Ngày hết hạn">
                    <div className="stripe-input">
                      <CardExpiryElement options={{ style: { base: { fontSize: '18px' } } }} />
                    </div>
                  </Form.Item>
                </Col>
                <Col xs={12}>
                  <Form.Item label="CVV">
                    <div className="stripe-input">
                      <CardCvcElement options={{ style: { base: { fontSize: '18px' } } }} />
                    </div>
                  </Form.Item>
                </Col>
              </Row>
              <Button
                type="primary"
                size="large"
                className="checkout-pay-btn"
                icon={<FaLock style={{ marginRight: 6 }} />}
                loading={isLoading}
                disabled={!cardName || isLoading}
                onClick={handlePayment}
                style={{ marginTop: 18, fontWeight: 600, borderRadius: 10 }}
                block
              >
                {isLoading ? 'Đang xử lý...' : 'Thanh toán ngay'}
              </Button>
            </Form>
          </motion.div>
        </Col>
        <Col xs={24} md={10}>
          <motion.div
            className="checkout-summary glass"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 80 }}
          >
            <CheckoutSummary handleSubmit={handlePayment} stripe={stripe} isLoading={isLoading} />
          </motion.div>
        </Col>
      </Row>
      <div className="checkout-gradient-bg" />
    </motion.div>
  )
}

export default CheckoutPage
