import React, { useState } from 'react'
import { Table, Input, Button, message, Card, Row, Col, Typography, Tag, Tooltip } from 'antd'
import * as FaIcons from 'react-icons/fa'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { CourseItem } from '../models/basket'
import { removeBasketItemAsync } from '../redux/slice/basketSlice'
import { motion } from 'framer-motion'
import '../sass/pages/_basket.scss'

const { Title, Text } = Typography

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
        localStorage.setItem('appliedDiscount', JSON.stringify({ code: coupon, discount: data.discount }))
        message.success({
          content: `🎉 Áp dụng mã giảm giá thành công! Giảm ${data.discount.toLocaleString()} VNĐ`,
          style: { fontWeight: 600, color: '#52c41a' },
        })
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
      title: '',
      dataIndex: 'image',
      key: 'image',
      render: (url: string) => (
        <motion.div whileHover={{ scale: 1.08 }}>
          <img className="basket-img" src={url} alt={url} />
        </motion.div>
      ),
      width: 120,
    },
    {
      title: 'Tên khóa học',
      dataIndex: 'title',
      key: 'title',
      render: (title: string) => <Text strong ellipsis style={{ fontSize: 18 }}>{title}</Text>,
    },
    {
      title: 'Giảng viên',
      key: 'instructor',
      dataIndex: 'instructor',
      render: (instructor: string) => <Tag color="geekblue">{instructor}</Tag>,
    },
    {
      title: 'Giá',
      dataIndex: 'price',
      key: 'price',
      render: (price: number) => <Text strong style={{ color: '#fa541c', fontSize: 18 }}>$ {price}</Text>,
    },
    {
      title: '',
      key: 'action',
      render: (item: CourseItem) => (
        <Tooltip title="Xóa khỏi giỏ hàng">
          <Button
            type="text"
            danger
            icon={<FaIcons.FaTrash size={20} />}
            onClick={() => dispatch(removeBasketItemAsync({ courseId: item.courseId }))}
            style={{ borderRadius: '50%' }}
          />
        </Tooltip>
      ),
      width: 60,
    },
  ]

  return (
    <motion.div
      className="basket-bg"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <Row justify="center" align="top" gutter={[32, 32]}>
        <Col xs={24} md={16}>
          <motion.div
            className="basket-card glass"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 80 }}
          >
            <Title level={2} className="basket-title">
              <FaIcons.FaShoppingCart style={{ marginRight: 12, color: '#1890ff' }} />
              Giỏ hàng của bạn
            </Title>
            <Text type="secondary" style={{ fontSize: 16 }}>
              {basketCount} {basketCount > 1 ? 'khóa học' : 'khóa học'} trong giỏ hàng
            </Text>
            <div className="basket-table-wrapper">
              <Table
                columns={columns}
                dataSource={basket?.items}
                rowKey="courseId"
                pagination={false}
                className="basket-table"
              />
            </div>
            <div className="basket-coupon-row">
              <Input
                placeholder="Nhập mã giảm giá"
                value={coupon}
                onChange={e => setCoupon(e.target.value)}
                style={{ width: 220, marginRight: 8, borderRadius: 8 }}
                disabled={loading}
                size="large"
              />
              <Button
                type="primary"
                onClick={handleApplyCoupon}
                loading={loading}
                disabled={!coupon}
                size="large"
                style={{ borderRadius: 8, fontWeight: 600 }}
                icon={<FaIcons.FaGift style={{ marginRight: 4 }} />}
              >
                Áp dụng
              </Button>
            </div>
            {discount > 0 && (
              <motion.div
                className="basket-discount-info"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                style={{ color: '#52c41a', fontWeight: 600, margin: '12px 0' }}
              >
                <FaIcons.FaCheckCircle style={{ marginRight: 6 }} />
                Đã áp dụng mã giảm giá: <b>{discount.toLocaleString()} VNĐ</b>
              </motion.div>
            )}
          </motion.div>
        </Col>
        <Col xs={24} md={8}>
          <motion.div
            className="basket-summary glass"
            initial={{ y: 40, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 80 }}
          >
            <Title level={3} style={{ marginBottom: 24, color: '#1890ff' }}>
              <FaIcons.FaReceipt style={{ marginRight: 8 }} /> Thanh toán
            </Title>
            <div className="basket-summary-row">
              <Text type="secondary">Tổng tiền gốc:</Text>
              <Text strong style={{ fontSize: 18 }}>$ {total.toLocaleString()}</Text>
            </div>
            {discount > 0 && (
              <div className="basket-summary-row">
                <Text type="secondary">Giảm giá:</Text>
                <Text strong style={{ color: '#52c41a', fontSize: 18 }}>- $ {discount.toLocaleString()}</Text>
              </div>
            )}
            <div className="basket-summary-row basket-summary-total">
              <Text strong style={{ fontSize: 22, color: '#fa541c' }}>Thành tiền:</Text>
              <Text strong style={{ fontSize: 28, color: '#fa541c' }}>$ {(total - discount).toLocaleString()}</Text>
            </div>
            <Link to="/checkout">
              <motion.div
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.98 }}
                className="basket-summary-checkout"
              >
                <FaIcons.FaCreditCard style={{ marginRight: 8 }} /> Thanh toán ngay
              </motion.div>
            </Link>
          </motion.div>
        </Col>
      </Row>
      <div className="basket-gradient-bg" />
    </motion.div>
  )
}

export default BasketPage
