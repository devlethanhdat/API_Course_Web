import { Content } from 'antd/lib/layout/layout'
import { useState } from 'react'
import RegisterComponent from '../components/Register'
import Signin from '../components/Signin'
import { useHistory } from 'react-router-dom';
import { useAppDispatch } from '../redux/store/configureStore';
import { signInUser } from '../redux/slice/userSlice';
import { User } from '../models/user';

const LoginPage = () => {
  const [register, setRegister] = useState(false)
  const dispatch = useAppDispatch();
  const history = useHistory();

  const toggleRegister = () => setRegister(!register)

  const handleSubmit = async (values: any) => {
    try {
      const actionResult = await dispatch(signInUser(values));
      const user = actionResult.payload as User;
      if (user && user.token) {
        localStorage.setItem('token', user.token);
      }
      history.push('/profile');
    } catch (error) {
      console.log('Failed to login:', error);
    }
  };

  return (
    <Content className="log-in">
      {register ? (
        <RegisterComponent toggleRegister={toggleRegister} />
      ) : (
        <Signin toggleRegister={toggleRegister} onSubmit={handleSubmit} />
      )}
    </Content>
  )
}

export default LoginPage
