import React, { ChangeEvent, SyntheticEvent, useState } from 'react'
import { Link, useHistory } from 'react-router-dom'
import { useDispatch } from 'react-redux'
import { useAppSelector } from '../redux/store/configureStore'
import { removeBasket } from '../redux/slice/basketSlice'
import { setCourseParams } from '../redux/slice/courseSlice'
import { signOut } from '../redux/slice/userSlice'
import UserMenu from './UserMenu'
import Logo from '../assets/logo.png'
import * as FaIcons from 'react-icons/fa'
import '../sass/components/_navigation.scss'
import debounce from 'lodash.debounce'
import agent from '../actions/agent'
import { Course } from '../models/course'

const Navigation = () => {
  const [sidebar, setSidebar] = useState(false)
  const [searchText, setSearchText] = useState('')
  const { basket } = useAppSelector((state) => state.basket)
  const basketCount = basket?.items.length
  const dispatch = useDispatch()
  const history = useHistory()
  const { user } = useAppSelector((state) => state.user)
  const [suggestions, setSuggestions] = useState<Course[]>([])
  const [showSuggestions, setShowSuggestions] = useState(false)

  const signout = () => {
    dispatch(signOut())
    dispatch(removeBasket())
    history.push('/')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
    setShowSuggestions(true)
    fetchSuggestions(e.target.value)
  }

  const onSearch = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setCourseParams({ search: searchText }))
    history.push('/')
  }

  const fetchSuggestions = debounce(async (value: string) => {
    if (!value) {
      setSuggestions([]);
      return;
    }
    try {
      // Gọi API lấy danh sách course theo search
      const params = new URLSearchParams();
      params.append('search', value);
      params.append('pageIndex', '1');
      params.append('pageSize', '5');
      const result = await agent.Courses.list(params);
      setSuggestions(result.data || []);
    } catch (err) {
      setSuggestions([]);
    }
  }, 300); // 300ms debounce

  return (
    <nav className="nav-main">
      <div className="nav-main__container">
        <Link to="/" className="nav-main__logo">
          <img src={Logo} alt="logo" />
          <span>DH21KPM02</span>
        </Link>

        <ul className="nav-main__links">
          <li>
            <Link to="/"><FaIcons.FaHome /> Home</Link>
          </li>
          {user && (
            <li>
              <Link to="/profile"><FaIcons.FaUserGraduate /> Profile</Link>
            </li>
          )}
          <li>
            <Link to="/courses"><FaIcons.FaBookOpen /> Courses</Link>
          </li>
        </ul>

        <form className="nav-main__search" onSubmit={onSearch} autoComplete="off">
          <input
            type="text"
            placeholder="Search courses..."
            value={searchText}
            onChange={handleChange}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            onFocus={() => searchText && setShowSuggestions(true)}
          />
          <button type="submit" aria-label="Search">
            <FaIcons.FaSearch />
          </button>
          {showSuggestions && suggestions.length > 0 && (
            <ul className="nav-main__suggestions">
              {suggestions.map(course => (
                <li key={course.id}>
                  <Link to={`/course/${course.id}`} onClick={() => setShowSuggestions(false)}>
                    <img
                      src={course.image}
                      alt={course.title}
                      className="nav-main__suggestion-img"
                    />
                    <span className="nav-main__suggestion-title">{course.title}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </form>

        <div className="nav-main__right">
          <Link to="/basket" className="nav-main__cart">
            <FaIcons.FaShoppingCart className="cart-icon" />
            {basketCount! > 0 && (
              <span className="nav-main__cart__count">{basketCount}</span>
            )}
          </Link>
          {user ? (
            <div className="nav-main__avatar-dropdown">
              <img src={Logo} alt="avatar" className="nav-main__avatar" />
              <UserMenu />
            </div>
          ) : (
            <Link to="/login" className="nav-main__login">
              <FaIcons.FaUserCircle />
              <span>Login</span>
            </Link>
          )}
        </div>

        <div className="nav-main__hamburger" onClick={() => setSidebar(!sidebar)}>
          <FaIcons.FaBars />
        </div>
      </div>

      <div className={`nav-main__sidebar${sidebar ? ' open' : ''}`}>
        <div className="nav-main__sidebar__header">
          <img src={Logo} alt="logo" />
          <span>Learnify</span>
          <FaIcons.FaTimes onClick={() => setSidebar(false)} />
        </div>
        <ul>
          <li>
            <Link to="/" onClick={() => setSidebar(false)}>Home</Link>
          </li>
          {user && (
            <li>
              <Link to="/profile" onClick={() => setSidebar(false)}>Profile</Link>
            </li>
          )}
          <li>
            <Link to="/courses" onClick={() => setSidebar(false)}>Courses</Link>
          </li>
          <li>
            <Link to="/basket" onClick={() => setSidebar(false)}>
              <FaIcons.FaShoppingCart /> Cart
            </Link>
          </li>
          {user ? (
            <li>
              <div onClick={() => { signout(); setSidebar(false); }}>
                <FaIcons.FaSignOutAlt /> Logout
              </div>
            </li>
          ) : (
            <li>
              <Link to="/login" onClick={() => setSidebar(false)}>
                <FaIcons.FaUserCircle /> Login
              </Link>
            </li>
          )}
        </ul>
      </div>
      {sidebar && <div className="nav-main__overlay" onClick={() => setSidebar(false)} />}
    </nav>
  )
}

export default Navigation
