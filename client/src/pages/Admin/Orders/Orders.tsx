import React, { useEffect, useState } from 'react';
import { Table, Card, Statistic, Row, Col } from 'antd';
import agent from '../../../actions/agent';
import { Bar } from 'react-chartjs-2';

// Register Chart.js components
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const OrdersPage = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null); // Stats tính từ admin orders
  const [instructorStats, setInstructorStats] = useState<any>(null); // Stats từ API instructor
  const [stats, setStats] = useState<any>(null);

  console.log('OrdersPage mounted');
  useEffect(() => {
    console.log('useEffect called');
    // Gọi API admin orders+revenue
    agent.Admin.getOrdersAndRevenue().then(res => {
      console.log('Admin orders response:', res);
      setOrders(Array.isArray(res.orders) ? res.orders : []);
      setStats(res.stats || null);
    }).catch(err => {
      console.error('Admin orders+revenue error:', err);
      alert(JSON.stringify(err));
    });
    // Gọi API instructor revenue stats
    agent.Instructor.getRevenueStats().then(res => {
      console.log('Instructor stats response:', res);
      setInstructorStats(res);
      // Nếu là instructor, ưu tiên orders từ instructor
      if (res.orders) setOrders(res.orders);
    });
  }, []);

  const statsToUse =
    instructorStats && instructorStats.stats
      ? instructorStats.stats
      : stats;

  console.log('statsToUse:', statsToUse);
  console.log('monthlyStats:', statsToUse?.monthlyStats);

  const chartData = statsToUse && Array.isArray(statsToUse.monthlyStats) && statsToUse.monthlyStats.length > 0 ? {
    labels: statsToUse.monthlyStats.map((m: any) => `${m.month}/${m.year}`),
    datasets: [
      {
        label: 'Doanh thu ($)',
        data: statsToUse.monthlyStats.map((m: any) => m.revenue),
        backgroundColor: '#4f8cff'
      }
    ]
  } : undefined;

  return (
    <div>
      <Row gutter={24} style={{ marginBottom: 24 }}>
        <Col span={8}>
          <Card>
            <Statistic title="Tổng doanh thu" value={statsToUse?.totalRevenue || 0} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Chiết khấu (40%)" value={statsToUse?.commission || 0} prefix="$" />
          </Card>
        </Col>
        <Col span={8}>
          <Card>
            <Statistic title="Thực nhận (60%)" value={statsToUse?.instructorReceive || 0} prefix="$" />
          </Card>
        </Col>
      </Row>
      <Card title="Biểu đồ doanh thu theo tháng" style={{ marginBottom: 24 }}>
        {chartData && <Bar data={chartData} />}
      </Card>
      <Card title="Danh sách đơn hàng">
        <Table
          dataSource={Array.isArray(orders) ? orders : []}
          rowKey="orderId"
          columns={[
            { title: 'Khóa học', dataIndex: 'courseTitle' },
            { title: 'Học viên', dataIndex: 'studentEmail' },
            { title: 'Giá bán', dataIndex: 'price', render: (v: number) => `$${v}` },
            { title: 'Ngày mua', dataIndex: 'purchasedAt', render: (v: string) => new Date(v).toLocaleDateString() }
          ]}
        />
      </Card>
    </div>
  );
};

export default OrdersPage;
