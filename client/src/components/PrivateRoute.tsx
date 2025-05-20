import React from 'react';
import { useAppSelector } from '../redux/store/configureStore';
import { Redirect, Route, RouteProps } from 'react-router-dom';
import { RootState } from '../redux/store/configureStore';

interface Props extends RouteProps {
  roles?: string[];
  component: React.ComponentType<any>;
}

const PrivateRoute: React.FC<Props> = ({ component: Component, roles, ...rest }) => {
  const { user } = useAppSelector((state: RootState) => state.user);
  
  return (
    <Route 
      {...rest} 
      render={(props) => {
        if (!user) {
          return <Redirect to="/login" />;
        }

        if (roles && !roles.some(role => user.roles?.includes(role))) {
          return <Redirect to="/" />;
        }

        return <Component {...props} />;
      }} 
    />
  );
};

export default PrivateRoute;
