import React, { useState } from 'react'
import { Table, Input, Button, message } from 'antd'
import * as FaIcons from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { CourseItem } from '../models/basket'
import { removeBasketItemAsync } from '../redux/slice/basketSlice'

const BasketPage = () => {
  const { basket } = useAppSelector((state) => state.basket)
  const dispatch = useAppDispatch()
  const basketCount = basket?.items.length || 0
  const total = basket?.items.reduce((sum, item) => sum + item.price, 0) ?? 0

  const [coupon, setCoupon] = useState('')
  const [discount, setDiscount] = useState(0)
  const [loading, setLoading] = useState(false)

  const handleApplyCoupon = async () => {
    setLoading(true)
    try {
      const res = await fetch('http://localhost:5001/api/basket/apply-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: coupon }),
      })
      const data = await res.json()
      if (res.ok) {
        setDiscount(data.discount)
        // Lưu mã và discount vào localStorage
        localStorage.setItem('appliedDiscount', JSON.stringify({ code: coupon, discount: data.discount }))
        message.success(`Áp dụng mã giảm giá thành công! Giảm ${data.discount} VNĐ`)
      } else {
        setDiscount(0)
        message.error(data.error || 'Mã giảm giá không hợp lệ')
      }
    } finally {
      setLoading(false)
    }
  }

  const columns = [
    {
      title: 'Image',
      dataIndex: 'image',
      key: 'image',
      render: (url: string) => {
        return <img width="100px" src={url} alt={url} />
      },
    },
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <div>$ {price} </div>,
    },
    {
      title: 'Instructor',
      key: 'instructor',
      dataIndex: 'instructor',
    },
    {
      title: 'Action',
      key: 'action',
      render: (item: CourseItem) => (
        <div
          onClick={() =>
            dispatch(removeBasketItemAsync({ courseId: item.courseId }))
          }
        >
          <FaIcons.FaTrash />
        </div>
      ),
    },
  ]

  return (
    <>
      <div className="basket-page">
        <h1 className="basket-page__header">Shopping Cart</h1>
        <h2 className="basket-page__sub-header">
          {`${basketCount} ${
            basketCount! > 1 ? 'courses' : 'course'
          } in the Cart`}
        </h2>
        <div className="basket-page__body">
          <div className="basket-page__body__table">
            <Table
              columns={columns}
              dataSource={basket?.items}
              rowKey="courseId"
            />
          </div>
          <div style={{ marginBottom: 16 }}>
            <Input
              placeholder="Nhập mã giảm giá"
              value={coupon}
              onChange={e => setCoupon(e.target.value)}
              style={{ width: 200, marginRight: 8 }}
              disabled={loading}
            />
            <Button
              type="primary"
              onClick={handleApplyCoupon}
              loading={loading}
              disabled={!coupon}
            >
              Áp dụng
            </Button>
          </div>
          {discount > 0 && (
            <div style={{ color: 'green', marginBottom: 8 }}>
              Đã áp dụng mã giảm giá: <b>{discount.toLocaleString()} VNĐ</b>
            </div>
          )}
          {total! > 0 && (
            <div className="basket-page__body__summary">
              <h2>Total:</h2>
              <div className="basket-page__body__summary__total">
                {' '}
                $ {(total - discount).toLocaleString()}
              </div>
              <Link to="/checkout">
                <div className="basket-page__body__summary__checkout">
                  {' '}
                  Checkout{' '}
                </div>
              </Link>
            </div>
          )}
        </div>
      </div>
    </>
  )
}

export default BasketPage
