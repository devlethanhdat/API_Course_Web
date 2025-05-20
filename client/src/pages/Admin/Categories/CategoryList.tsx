import React, { useEffect, useState } from 'react';
import { Button, Table, Space, Modal, Form, Input, Popconfirm, message } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import agent from '../../../actions/agent';
import { Category, CategoryFormValues } from '../../../models/category';

const CategoryList = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [form] = Form.useForm();

  useEffect(() => {
    loadCategories();
  }, []);

  const loadCategories = async () => {
    try {
      const response = await agent.Categories.list();
      setCategories(response);
    } catch (error) {
      message.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const handleAdd = () => {
    setEditingCategory(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (category: Category) => {
    setEditingCategory(category);
    form.setFieldsValue(category);
    setModalVisible(true);
  };

  const handleDelete = async (id: number) => {
    try {
      await agent.Categories.delete(id);
      message.success('Category deleted successfully');
      loadCategories();
    } catch (error) {
      message.error('Failed to delete category');
    }
  };

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields();
      const categoryData = {
        id: editingCategory?.id || 0,
        name: values.name.trim(),
        courses: []
      };

      if (editingCategory) {
        console.log('Updating category:', categoryData);
        await agent.Categories.update(editingCategory.id, categoryData);
        message.success('Category updated successfully');
      } else {
        await agent.Categories.create({ name: values.name.trim() });
        message.success('Category created successfully');
      }
      
      setModalVisible(false);
      form.resetFields();
      setEditingCategory(null);
      loadCategories();
    } catch (error: any) {
      console.error('Error details:', error.response?.data);
      message.error(error.response?.data?.errorMessage || 'Failed to save category');
    }
  };

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: Category) => (
        <Space>
          <Button icon={<EditOutlined />} onClick={() => handleEdit(record)} />
          <Popconfirm
            title="Are you sure you want to delete this category?"
            onConfirm={() => handleDelete(record.id)}
            okText="Yes"
            cancelText="No"
          >
            <Button icon={<DeleteOutlined />} danger />
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div className="admin-container">
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 16 }}>
        <h2>Category Management</h2>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Add Category
        </Button>
      </div>

      <Table 
        columns={columns} 
        dataSource={categories}
        rowKey="id"
        loading={loading}
      />

      <Modal
        title={editingCategory ? 'Edit Category' : 'Add Category'}
        visible={modalVisible}
        onOk={handleModalOk}
        onCancel={() => setModalVisible(false)}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="Category Name"
            rules={[{ required: true, message: 'Please input category name!' }]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default CategoryList;
