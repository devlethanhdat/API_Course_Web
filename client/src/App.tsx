import { Route, Switch } from 'react-router-dom'
import './sass/main.scss'
import DetailPage from './pages/DetailPage'
import Homepage from './pages/Homepage'
import LoginPage from './pages/LoginPage'
import Navigation from './components/Navigation'
import Categories from './components/Categories'
import CategoryPage from './pages/CategoryPage'
import DescriptionPage from './pages/DescriptionPage'
import BasketPage from './pages/BasketPage'
import { useEffect, useState, useCallback } from 'react'
import { useAppDispatch } from './redux/store/configureStore'
import { fetchBasketAsync } from './redux/slice/basketSlice'
import Dashboard from './pages/Dashboard'
import PrivateRoute from './components/PrivateRoute'
import CheckoutPage from './pages/CheckoutPage'
import { fetchCurrentUser } from './redux/slice/userSlice'
import Loading from './components/Loading'
import CoursePage from './pages/CoursePage'
import InstructorPage from './pages/InstructorPage'
import CreateCourse from './pages/CreateCourse'
import { getCategoriesAsync } from './redux/slice/categorySlice'
import SectionPage from './pages/SectionPage'
import AdminPage from './pages/Admin'
import UserAdmin from './pages/Admin/Users/Users'
import 'antd/dist/antd.css'
import CategoryList from './pages/Admin/Categories/CategoryList'
import CourseList from './pages/Admin/Courses/CourseList'
import EditCourse from './pages/EditCourse'
import Slider from "react-slick";
import banner1 from './assets/Knowledge_Is_Human_Homepage_Animated_Banner.gif';
import banner2 from './assets/475eb095746151.5e9ecde695f7a.gif';
import banner3 from './assets/34220e95746151.5e9ecde696cb0.gif';
import banner4 from './assets/fe441235d728b50c6003b3e59cd807cb.gif';
import OrdersPage from './pages/Admin/Orders/Orders';

const bannerImages = [banner4,banner4,banner4,banner4];
const bannerImages1 = [banner1];


function App() {
  const dispatch = useAppDispatch()
  const [loading, setLoading] = useState(true)

  const appInit = useCallback(async () => {
    try {
      await dispatch(fetchCurrentUser())
      await dispatch(fetchBasketAsync())
      await dispatch(getCategoriesAsync())
    } catch (error) {
      console.log(error)
    }
  }, [dispatch])

  useEffect(() => {
    appInit().then(() => setLoading(false))
  }, [appInit])

  if (loading) return <Loading />

  return (
    <>
  
      <img
      src={bannerImages1[0]}
      alt="banner"
      style={{
        width: '100%',
        height: '50px',
        objectFit: '-moz-initial',
        display: 'block',
      }}
    />

      <Navigation />
      
      <Route exact path="/" component={Categories} />
     
      <Switch>
        <Route exact path="/" component={Homepage} />
        <Route exact path="/course/:id" component={DescriptionPage} />
        <PrivateRoute exact path="/profile" component={Dashboard} />
        <Route exact path="/category/:id" component={CategoryPage} />
        <Route exact path="/login" component={LoginPage} />
        <Route exact path="/detail" component={DetailPage} />
        <Route exact path="/basket" component={BasketPage} />
        <PrivateRoute
          exact
          path="/learn/:course/:lecture"
          component={CoursePage}
        />
        <PrivateRoute exact path="/checkout" component={CheckoutPage} />
        <PrivateRoute exact path="/instructor" component={InstructorPage} />
        <PrivateRoute
          exact
          path="/instructor/course"
          component={CreateCourse}
        />
        <PrivateRoute
          exact
          path="/instructor/course/:id/edit"
          component={EditCourse}
          roles={['Instructor']}
        />
        <PrivateRoute
          exact
          path="/:course/lectures"
          component={SectionPage}
        />
        {/* Place specific admin routes before the general admin route */}
        <PrivateRoute 
          exact
          path="/admin/categories" 
          component={CategoryList}
          roles={['Admin']} 
        />
        <PrivateRoute 
          exact
          path="/admin/courses" 
          component={CourseList}
          roles={['Admin']} 
        />
        <PrivateRoute
          exact
          path="/admin/orders"
          component={OrdersPage}
          roles={['Admin']}
        />
        <Route path="/admin" exact component={AdminPage} />
        <Route path="/admin/users" component={UserAdmin} />
      </Switch>
    </>
  )
}

export default App
