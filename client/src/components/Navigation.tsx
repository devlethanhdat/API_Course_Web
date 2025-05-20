import React, { ChangeEvent, SyntheticEvent, useState } from 'react'
import * as FaIcons from 'react-icons/fa'
import { useDispatch } from 'react-redux'
import { Link, useHistory } from 'react-router-dom'
import Logo from '../assets/logo.png'
import { removeBasket } from '../redux/slice/basketSlice'
import { setCourseParams } from '../redux/slice/courseSlice'
import { signOut } from '../redux/slice/userSlice'
import { useAppSelector } from '../redux/store/configureStore'
import UserMenu from './UserMenu'

const Navigation = () => {
  const [sidebar, setSidebar] = useState(false)
  const [searchText, setSearchText] = useState('')
  const { basket } = useAppSelector((state) => state.basket)
  const basketCount = basket?.items.length
  const showSidebar = () => setSidebar(!sidebar)
  const dispatch = useDispatch()

  const history = useHistory()

  const signout = () => {
    dispatch(signOut())
    dispatch(removeBasket())
    history.push('/')
  }

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setSearchText(e.target.value)
  }

  const { user } = useAppSelector((state) => state.user)

  const onSearch = (e: SyntheticEvent) => {
    e.preventDefault()
    dispatch(setCourseParams({ search: searchText }))
  }

  return (
    <div className="nav-container">
      <div className="nav">
        <div className="nav__left">
          <div className="nav__left__hamburger">
            <FaIcons.FaBars onClick={showSidebar} />
            <nav className={sidebar ? 'nav-menu active' : 'nav-menu'}>
              <ul className="nav-menu-items" onClick={showSidebar}>
                <li className="cancel">
                  <FaIcons.FaChevronLeft />
                </li>

                <li className="nav-menu-items__header">Navigation</li>
                <li>
                  <Link to="/">Home</Link>
                </li>
                {user ? (
                  <>
                    <li>
                      <Link to="/profile">Profile</Link>
                    </li>
                    <li>
                      <div onClick={signout}>Logout</div>
                    </li>
                  </>
                ) : (
                  <li>
                    <Link to="/login">Login</Link>
                  </li>
                )}
              </ul>
            </nav>
          </div>
          <img src={Logo} className="nav__left__logo" alt="logo" />

          <ul className="nav__left__list">
            <li className="nav__left__list__item">
              <Link to="/">Home</Link>
            </li>
            {user ? (
              <li className="nav__left__list__item">
                <UserMenu />
              </li>
            ) : (
              <li className="nav__left__list__item">
                <Link to="/login">Login</Link>
              </li>
            )}
          </ul>
        </div>
        <div className="nav__right">
          <form onSubmit={onSearch} className="nav__right__search">
            <input
              type="text"
              className="nav__right__search__input"
              placeholder="Search Courses..."
              value={searchText}
              onChange={handleChange}
            />
            <button
              className="nav__right__search__button"
              aria-label="Search courses"
              title="Search"
            >
              <i className="fas fa-search"></i>
            </button>
          </form>
          <Link to="/basket">
            <div className="nav__right__cart">
              <FaIcons.FaShoppingCart />
              {basketCount! > 0 && (
                <span className="nav__right__cart__count">{basketCount}</span>
              )}
            </div>
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Navigation
