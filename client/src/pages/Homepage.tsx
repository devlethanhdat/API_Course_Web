import React, { useEffect } from 'react'
import { Card, Col, Radio, Row, Skeleton, Select, Tooltip } from 'antd'
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
import { SortAscendingOutlined, SortDescendingOutlined, FontSizeOutlined, InfoCircleOutlined } from '@ant-design/icons';

const bannerImages = [banner4,banner4,banner4,banner4];
const sortOptions = [
  {
    value: 'title',
    label: (
      <span>
        <FontSizeOutlined style={{ marginRight: 8, color: '#1890ff' }} />
        Theo bảng chữ cái
      </span>
    ),
  },
  {
    value: 'priceDescending',
    label: (
      <span>
        <SortDescendingOutlined style={{ marginRight: 8, color: '#fa541c' }} />
        Giá cao đến thấp
      </span>
    ),
  },
  {
    value: 'priceAscending',
    label: (
      <span>
        <SortAscendingOutlined style={{ marginRight: 8, color: '#52c41a' }} />
        Giá thấp đến cao
      </span>
    ),
  },
];

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
            words={[
              'Bạn muốn học gì tiếp theo?',
              'Khám phá kỹ năng mới!',
              'Nâng cấp kiến thức của bạn!',
            ]}
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
          Các khóa học mới dành cho bạn...
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
          <Card
            title={
              <span style={{ fontWeight: 700, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <SortAscendingOutlined style={{ marginRight: 8, color: '#722ed1' }} />
                Sắp xếp khóa học
                <Tooltip title="Chọn cách sắp xếp danh sách khóa học" placement="right">
                  <InfoCircleOutlined style={{ marginLeft: 8, color: '#1890ff' }} />
                </Tooltip>
              </span>
            }
            style={{
              marginBottom: 24,
              borderRadius: 16,
              boxShadow: '0 4px 24px #e3e9f7',
              border: 'none',
              background: 'linear-gradient(135deg, #f0f5ff 0%, #e6fffb 100%)',
            }}
          >
            <Select
              style={{
                width: '100%',
                fontWeight: 600,
                fontSize: 16,
                borderRadius: 8,
                background: '#fff',
              }}
              value={courseParams.sort}
              options={sortOptions}
              onChange={(value) => dispatch(setCourseParams({ sort: value }))}
              size="large"
              dropdownStyle={{ minWidth: 220, fontSize: 16 }}
              placeholder="Chọn cách sắp xếp"
            />
          </Card>
          <Card title="Chọn danh mục">
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
