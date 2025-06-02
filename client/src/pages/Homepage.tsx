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
import banner4 from '../assets/3.gif';
import banner3 from '../assets/1.gif';
import banner2 from '../assets/4.gif';
import banner1 from '../assets/2.gif';
import { AiFillFire } from 'react-icons/ai';
import { SortAscendingOutlined, SortDescendingOutlined, FontSizeOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { Swiper, SwiperSlide } from 'swiper/react';
import { EffectCoverflow, Autoplay, Pagination as SwiperPagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'animate.css';
import sponsor1 from '../assets/google_meet_240px.png';
import sponsor2 from '../assets/reddit_480px.png';
import sponsor3 from '../assets/twitter_480px.png';
import sponsor4 from '../assets/instagram_480px.png';
import sponsor5 from '../assets/dish_tv_512px.png';

const bannerImages = [banner4,banner3,banner2,banner1];
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

const sponsorLogos = [sponsor1, sponsor2, sponsor3, sponsor4, sponsor5, sponsor1, sponsor2];

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
        {/* <div className="sponsor-slider-wrapper"  style={{
                width: '63vw',
             
              }}>
      <Slider
        dots={false}
        infinite
        autoplay
        autoplaySpeed={0}
        speed={4000}
        slidesToShow={5}
        slidesToScroll={1}
        arrows={false}
        cssEase="linear"
        pauseOnHover={false}
        variableWidth={true}
      >
        {sponsorLogos.map((logo, idx) => (
          <div key={idx} className="sponsor-logo-slide">
            <img src={logo} alt={`sponsor-${idx}`} className="sponsor-logo-img" />
          </div>
        ))}
      </Slider>
    </div> */}
     <div className="course__banner-swiper" style={{ position: 'relative' }}>
      <Swiper
        modules={[EffectCoverflow, Autoplay, SwiperPagination]}
        effect="coverflow"
        loop
        autoplay={{ delay: 3500, disableOnInteraction: false }}
        pagination={{ clickable: true }}
        speed={1200}
        className="banner-swiper"
        coverflowEffect={{
          rotate: 50,
          stretch: 0,
          depth: 100,
          modifier: 1,
          slideShadows: true,
        }}
      >
        {bannerImages.map((img, idx) => (
          <SwiperSlide key={idx}>
            <div
              style={{
                width: '63vw',
                height: '500px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
                overflow: 'hidden',
              }}
            >
              <img
                src={img}
                alt={`banner-${idx}`}
                style={{
                  maxWidth: '100%',
                  maxHeight: '100%',
                  objectFit: 'contain',
                  borderRadius: 0,
                  display: 'block',
                }}
              />
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
      <div className="course__header-on-slider">
        <h1 className="animate__animated animate__fadeInDown big-title-glow-purple">
          {/* <span className="icon-bounce">
            <AiFillFire style={{ color: '#db0eed', marginRight: 12, fontSize: 48, filter: 'drop-shadow(0 0 12px #7509f1)' }} />
          </span> */}
          <span className="typewriter-gradient-purple">
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
          </span>
        </h1>
        {/* <h2 className="animate__animated animate__fadeInUp subtitle-underline-purple">
          <span className="icon-bounce">
            <FaStar style={{ color: '#760cef', marginRight: 10, fontSize: 28, filter: 'drop-shadow(0 0 8px #e806cd)' }} />
          </span>
          Các khóa học mới dành cho bạn...
        </h2> */}
      </div>
    </div>

      <div className="course__section">
        <h2 className="course__section-title">
          <FaFire style={{ color: '#ff9800', marginRight: 8 }} />
          Khóa học bán chạy nhất
        </h2>
        <div className="course__slider-wrapper">
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
      </div>
      
      <h3 className="" style={{textAlign: 'center', fontSize: '1.5rem', fontWeight: 'bold', color: '#1a237e'}}>
      Được hơn 16.000 công ty và hàng triệu học viên trên khắp thế giới tin dùng
        </h3>
      <div className="course__section">
      <div className="sponsor-slider-wrapper"  style={{
                width: '63vw',
             
              }}>
      <Slider
        dots={false}
        infinite
        autoplay
        autoplaySpeed={0}
        speed={4000}
        slidesToShow={5}
        slidesToScroll={1}
        arrows={false}
        cssEase="linear"
        pauseOnHover={false}
        variableWidth={true}
      >
        {sponsorLogos.map((logo, idx) => (
          <div key={idx} className="sponsor-logo-slide">
            <img src={logo} alt={`sponsor-${idx}`} className="sponsor-logo-img" />
          </div>
        ))}
      </Slider>
    </div>
        <h2 className="course__section-title">
          <FaStar style={{ color: '#ffd700', marginRight: 8 }} />
          Tất cả khóa học
        </h2>
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
    </div>
  )
}

export default Homepage
