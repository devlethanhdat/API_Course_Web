import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAppSelector } from '../../redux/store/configureStore';
import { BookOutlined, UsergroupAddOutlined, ShoppingCartOutlined, AppstoreOutlined } from '@ant-design/icons';
import { Typography } from 'antd';
import './styles/Admin.scss';



const { Title } = Typography;

const AdminPage = () => {
  const user = useAppSelector((state) => state.user.user);
  const isAdmin = user?.roles?.includes('Admin');

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  const adminCards = [
    {
      title: 'Manage Courses',
      description: 'Add, edit, or remove courses',
      icon: <BookOutlined className="admin-card-icon" />,
      path: '/admin/courses'
    },
    {
      title: 'Manage Categories',
      description: 'Add, edit, or remove categories',
      icon: <AppstoreOutlined className="admin-card-icon" />,
      path: '/admin/categories'
    },
    {
      title: 'Manage Users',
      description: 'View and manage user accounts',
      icon: <UsergroupAddOutlined className="admin-card-icon" />,
      path: '/admin/users'
    },
    {
      title: 'Manage Orders',
      description: 'View and manage course orders',
      icon: <ShoppingCartOutlined className="admin-card-icon" />,
      path: '/admin/orders'
    }
  ];

  return (
    <div className="admin-container">
      <div className="admin-header fade-in">
        <Title level={2} className="admin-title">
          Admin Dashboard
        </Title>
      </div>
      <div className="admin-grid">
        {adminCards.map((card, index) => (
          <Link 
            to={card.path} 
            className="admin-card fade-in" 
            key={index}
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="admin-card-content">
              {card.icon}
              <h3>{card.title}</h3>
              <p>{card.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default AdminPage;
