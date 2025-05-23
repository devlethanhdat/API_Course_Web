import {
  CardCvcElement,
  CardExpiryElement,
  CardNumberElement,
  useElements,
  useStripe,
} from '@stripe/react-stripe-js'
import { Card, Form, Input, notification } from 'antd'
import { SyntheticEvent, useState } from 'react'
import { useHistory } from 'react-router-dom'
import agent from '../actions/agent'
import CheckoutSummary from '../components/CheckoutSummary'
import { removeBasket } from '../redux/slice/basketSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'

const CheckoutPage = () => {
  const [cardName, setCardName] = useState<string>('')
  const [isLoading, setIsLoading] = useState<boolean>(false) // Add loading state

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

      console.log('Processing payment with secret:', basket.clientSecret)

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
        await agent.Users.addCourse()
        notification.success({
          message: 'Payment Successful',
          description: 'Your payment has been processed successfully',
        })
        dispatch(removeBasket())
        await agent.Baskets.clear()
        history.push('/profile')
      }
    } catch (error: any) {
      console.error('Payment error:', error)
      notification.error({
        message: 'Payment Failed',
        description: error?.message || 'An error occurred during payment',
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <div className="checkout">
        <div className="checkout__form">
          <h1>Checkout Page</h1>
          <Card title="Fill your Card details here">
            <Form name="payment" form={form} layout="vertical">
              <Form.Item
                name="cardName"
                rules={[
                  { required: true, message: 'Card Name is required', min: 5 },
                ]}
                label="Name on Card"
              >
                <Input
                  name="cardName"
                  onChange={handleChange}
                  value={cardName}
                  placeholder="Mention the name on your card"
                />
              </Form.Item>
              <Form.Item label="Card Number">
                <div className="stripe-input">
                  <CardNumberElement />
                </div>
              </Form.Item>
              <div className="inline">
                <Form.Item label="Expiry Date">
                  <div className="stripe-input">
                    <CardExpiryElement />
                  </div>
                </Form.Item>
                <Form.Item label="CVV">
                  <div className="stripe-input">
                    <CardCvcElement />
                  </div>
                </Form.Item>
              </div>
            </Form>
          </Card>
        </div>
        <div className="checkout__summary">
          <CheckoutSummary handleSubmit={handlePayment} stripe={stripe} />
        </div>
      </div>
    </>
  )
}

export default CheckoutPage
