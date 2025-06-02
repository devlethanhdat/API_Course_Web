import React, { useEffect, useState } from 'react';
import { Table, Button, Modal, Form, Input, InputNumber, DatePicker, Switch, message, Popconfirm } from 'antd';
import moment from 'moment';

const API_URL = 'http://localhost:5001/api/coupon';

interface Coupon {
  id: number;
  code: string;
  discountAmount: number;
  expiryDate?: string | null;
  isActive: boolean;
}

const CouponList = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);

  const [form] = Form.useForm();

  const fetchCoupons = async () => {
    setLoading(true);
    const res = await fetch(API_URL);
    const data = await res.json();
    setCoupons(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const handleAdd = () => {
    setEditingCoupon(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (record: Coupon) => {
    setEditingCoupon(record);
    form.setFieldsValue({
      ...record,
      expiryDate: record.expiryDate ? moment(record.expiryDate) : null,
    });
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    await fetch(`${API_URL}/${id}`, { method: 'DELETE' });
    message.success('Xóa mã giảm giá thành công!');
    fetchCoupons();
  };

  const handleOk = async () => {
    try {
      const values = await form.validateFields();
      const payload = {
        ...values,
        expiryDate: values.expiryDate ? values.expiryDate.toISOString() : null,
      };
      if (editingCoupon) {
        await fetch(`${API_URL}/${editingCoupon.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...editingCoupon, ...payload }),
        });
        message.success('Cập nhật mã giảm giá thành công!');
      } else {
        await fetch(API_URL, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        message.success('Thêm mã giảm giá thành công!');
      }
      setModalVisible(false);
      fetchCoupons();
    } catch (err) {
      // validation error
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', key: 'id' },
    { title: 'Code', dataIndex: 'code', key: 'code' },
    { title: 'Discount', dataIndex: 'discountAmount', key: 'discountAmount' },
    { title: 'Expiry Date', dataIndex: 'expiryDate', key: 'expiryDate', render: (date: string | null | undefined) => date ? moment(date).format('YYYY-MM-DD') : 'Không giới hạn' },
    { title: 'Active', dataIndex: 'isActive', key: 'isActive', render: (active: boolean) => active ? 'Yes' : 'No' },
    {
      title: 'Action',
      key: 'action',
      render: (_: any, record: Coupon) => (
        <>
          <Button type="link" onClick={() => handleEdit(record)}>Sửa</Button>
          <Popconfirm title="Xóa mã này?" onConfirm={() => handleDelete(record.id)}>
            <Button type="link" danger>Xóa</Button>
          </Popconfirm>
        </>
      ),
    },
  ];

  return (
    <div>
      <h2>Quản lý mã giảm giá</h2>
      <Button type="primary" onClick={handleAdd} style={{ marginBottom: 16 }}>Thêm mã giảm giá</Button>
      <Table columns={columns} dataSource={coupons} rowKey="id" loading={loading} />
      <Modal
        title={editingCoupon ? 'Cập nhật mã giảm giá' : 'Thêm mã giảm giá'}
        open={modalVisible}
        onOk={handleOk}
        onCancel={() => setModalVisible(false)}
        destroyOnClose
      >
        <Form form={form} layout="vertical">
          <Form.Item name="code" label="Mã giảm giá" rules={[{ required: true, message: 'Nhập mã giảm giá!' }]}>
            <Input />
          </Form.Item>
          <Form.Item name="discountAmount" label="Số tiền giảm" rules={[{ required: true, message: 'Nhập số tiền giảm!' }]}>
            <InputNumber min={1} style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="expiryDate" label="Ngày hết hạn">
            <DatePicker style={{ width: '100%' }} />
          </Form.Item>
          <Form.Item name="isActive" label="Kích hoạt" valuePropName="checked" initialValue={true}>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CouponList;
