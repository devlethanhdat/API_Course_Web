import React from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useAppSelector } from '../../redux/store/configureStore';

const AdminPage = () => {
  const user = useAppSelector((state) => state.user.user);
  const isAdmin = user?.roles?.includes('Admin');

  if (!isAdmin) {
    return <Redirect to="/" />;
  }

  return (
    <div className="container">
      <h2 className="admin-title">Admin Dashboard</h2>
      <div className="admin-grid">
        <Link to="/admin/courses" className="admin-card">
          <div className="admin-card-content">
            <h3>Manage Courses</h3>
            <p>Add, edit, or remove courses</p>
          </div>
        </Link>
        <Link to="/admin/users" className="admin-card">
          <div className="admin-card-content">
            <h3>Manage Users</h3>
            <p>View and manage user accounts</p>
          </div>
        </Link>
        <Link to="/admin/orders" className="admin-card">
          <div className="admin-card-content">
            <h3>Manage Orders</h3>
            <p>View and manage course orders</p>
          </div>
        </Link>
        <Link to="/admin/categories" className="admin-card">
          <div className="admin-card-content">
            <h3>Manage Categories</h3>
            <p>Add, edit, or remove categories</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default AdminPage;
