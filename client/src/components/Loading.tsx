import React from 'react';
import { Spin } from 'antd';

const LoadingComponent = () => (
  <div style={{ padding: '20px', textAlign: 'center' }}>
    <Spin tip="Loading...">
      <div style={{ height: '200px' }}>
        {/* Content that is loading */}
      </div>
    </Spin>
  </div>
);

export default LoadingComponent;
