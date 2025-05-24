import React, { useEffect } from 'react'
import { Card, Col, Radio, Row, Skeleton } from 'antd'
import { Course } from '../models/course'
import ShowCourses from '../components/ShowCourses'
import { Pagination } from 'antd'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import {
  coursesSelector,
  getCoursesAsync,
  setCourseParams,
  setPageNumber,
} from '../redux/slice/courseSlice'
import { categoriesSelector } from '../redux/slice/categorySlice'
import { Category } from '../models/category'
import '../styles/Homepage.scss'
import { FaFire, FaStar } from 'react-icons/fa'
import AOS from 'aos'
import 'aos/dist/aos.css'
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import Slider from "react-slick";
import { Typewriter } from 'react-simple-typewriter'
import banner4 from '../assets/fe441235d728b50c6003b3e59cd807cb.gif';

const bannerImages = [banner4,banner4,banner4,banner4];
const sortOptions = [
  { value: 'title', label: 'Alphabetical' },
  { value: 'priceDescending', label: 'Price - High to low' },
  { value: 'priceAscending', label: 'Price - Low to high' },
]

const Homepage = () => {
  const data = useAppSelector(coursesSelector.selectAll)
  const dispatch = useAppDispatch()
  const { coursesLoaded, pagination, courseParams } = useAppSelector(
    (state) => state.course,
  )
  const categories = useAppSelector(categoriesSelector.selectAll)

  const getCategories = () => {
    const catArray: any[] = []
    categories.forEach((category: Category) => {
      catArray.push({ value: category.id, label: category.name })
    })
    return catArray
  }


  const sliderSettings = {
    dots: true,
    autoplay: true,
    infinite: data.length > 3,
    speed: 500,
    slidesToShow: Math.min(4, data.length),
    slidesToScroll: 1,
    responsive: [
      {
        breakpoint: 1024,
        settings: { slidesToShow: Math.min(2, data.length) }
      },
      {
        breakpoint: 768,
        settings: { slidesToShow: 1 }
      }
    ]
  };
  useEffect(() => {
    AOS.init({ duration: 800, once: true })
    if (!coursesLoaded) dispatch(getCoursesAsync())
  }, [coursesLoaded, dispatch])

  function onChange(pageNumber: number) {
    dispatch(setPageNumber({ pageIndex: pageNumber }))
  }

  const featuredCourses = data.slice(0, 5); // lấy 5 khóa học đầu

  return (
    
    <div className="course">  
     <Slider
          dots
          infinite
          autoplay
          speed={800}
          slidesToShow={1}
          slidesToScroll={1}
          arrows={false}
          className="category-banner-slider"
        >
          {bannerImages.map((img, idx) => (
            <div key={idx}>
              <img
                src={img}
                alt={`banner-${idx}`}
                style={{
                  width: '100vw',
                  minHeight: '500px',
                  maxHeight: '500px',
                  marginTop: '-100px',
                  objectFit: 'unset',
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            </div>
          ))}
        </Slider>
      <div className="course__header" data-aos="fade-down">
        <h1>
          <FaFire color="#ff9800" style={{ marginRight: 8 }} />
          <Typewriter
            words={['What to learn Next?', 'Explore new skills!', 'Upgrade your knowledge!']}
            loop={0}
            cursor
            cursorStyle='_'
            typeSpeed={70}
            deleteSpeed={50}
            delaySpeed={1500}
          />
        </h1>
        <h2>
          <FaStar color="#ffd700" style={{ marginRight: 6 }} />
          New Courses picked just for you...
        </h2>
      </div>
      <div style={{ width: '100%', height: '30%', maxWidth: 1280, margin: '0 auto' }}>
            {!coursesLoaded ? (
              <Skeleton active paragraph={{ rows: 4 }} />
            ) : (
              <Slider {...sliderSettings}>
                {featuredCourses.map((course, idx) => (
                  <div key={idx} className="slide-item">
                    <ShowCourses course={course} noCol />
                  </div>
                ))}
              </Slider>
            )}
          </div>
      <Row gutter={[24, 32]}>
        <Col span={4}>
          <Card title="Sorting Options">
            <Radio.Group
              options={sortOptions}
              value={courseParams.sort}
              onChange={(e) =>
                dispatch(setCourseParams({ sort: e.target.value }))
              }
            />
          </Card>
          <Card title="Choose Category">
            <Radio.Group
              options={getCategories()}
              value={courseParams.category}
              onChange={(e) => {
                dispatch(setCourseParams({ category: e.target.value }))
              }}
            />
          </Card>
        </Col>
        <Col span={20}>
          

          <Row gutter={[24, 32]}>
            {data &&
              data.map((course: Course, index: number) => (
                <ShowCourses key={index} course={course} />
              ))}
          </Row>
          <div className="pagination">
            {pagination && (
              <Pagination
                defaultCurrent={pagination?.pageIndex}
                total={pagination?.totalCount}
                onChange={onChange}
                pageSize={pagination?.pageSize}
              />
            )}
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Homepage
