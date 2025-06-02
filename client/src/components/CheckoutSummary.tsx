import { Stripe } from '@stripe/stripe-js'
import { Button, Card, Divider } from 'antd'
import { SyntheticEvent } from 'react'
import { useAppSelector } from '../redux/store/configureStore'

interface Props {
  stripe: Stripe | null
  handleSubmit: (event: SyntheticEvent) => Promise<void>
  isLoading?: boolean
}

const CheckoutSummary = ({ stripe, handleSubmit, isLoading }: Props) => {
  const { basket } = useAppSelector((state) => state.basket)
  const total = basket?.items.reduce((sum, item) => sum + item.price, 0) ?? 0
  const discount = basket?.discount ?? 0

  console.log('Basket in CheckoutSummary:', basket)
  console.log('Total:', total, 'Discount:', discount)

  return (
    <>
      <Card>
        <h2>Summary</h2>
        <Divider type="horizontal" />
        <div className="checkout__summary__total">
          <span>Tổng tiền gốc: </span>
          <span>$ {total.toLocaleString()}</span>
        </div>
        {discount > 0 && (
          <div style={{ color: 'green' }}>
            <span>Giảm giá: </span>
            <span>-${discount.toLocaleString()}</span>
          </div>
        )}
        <div className="checkout__summary__total">
          <span>Thành tiền: </span>
          <span>$ {(total - discount).toLocaleString()}</span>
        </div>
        <Divider type="horizontal" />
        <Button
          type="primary"
          className="checkout__summary__button"
          size="large"
          disabled={!stripe || isLoading}
          loading={isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? 'Processing...' : 'Pay Now'}
        </Button>
      </Card>
    </>
  )
}

export default CheckoutSummary
