import { Elements } from '@stripe/react-stripe-js'
import { loadStripe } from '@stripe/stripe-js'
import { useEffect } from 'react'
import agent from '../actions/agent'
import Checkout from '../components/Checkout'
import { setBasket } from '../redux/slice/basketSlice'
import { useAppDispatch } from '../redux/store/configureStore'

const stripePromise = loadStripe(
  'pk_test_51OMnWzLYIWPiSLtJ9YHPpuFp9exub9tTgWxIq3isz7pnPdVLkWF03rN3LEkl38xMHRI03fbGlO0iVqwd1POW5PnM00eLJaoM6g',
)

export default function CheckoutWrapper() {
  const dispatch = useAppDispatch()

  const discountData = JSON.parse(localStorage.getItem('appliedDiscount') || '{}');
  const discount = discountData.discount || 0;
  const couponCode = discountData.code || '';

  useEffect(() => {
    agent.Payments.paymentIntent({ couponCode })
      .then((basket) => {
        dispatch(setBasket(basket))
      })
      .catch((error) => console.log(error))
  }, [dispatch, couponCode])

  return (
    <Elements stripe={stripePromise}>
      <Checkout />
    </Elements>
  )
}
