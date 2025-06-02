import React, { useEffect, useState } from 'react'
import { Learning, Requirement, Lecture, Section, CourseReview, Course } from '../models/course'
import { useParams } from 'react-router'
import { Link, useHistory } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { getCourseAsync, coursesSelector } from '../redux/slice/courseSlice'
import { addBasketItemAsync } from '../redux/slice/basketSlice'
import ReactPlayer from 'react-player'
import { FaLock, FaPlay, FaChalkboardTeacher, FaLanguage, FaUsers, FaTag, FaBookOpen, FaCheckCircle } from 'react-icons/fa'
import { Card, Button, Tag, Collapse, Progress, Tooltip, Row, Col, Typography, Divider, Space, Rate } from 'antd'
import { PlayCircleOutlined, ShoppingCartOutlined, CheckCircleOutlined, LikeOutlined, DislikeOutlined } from '@ant-design/icons'
import Tilt from 'react-parallax-tilt'
import { motion } from 'framer-motion'
import Skeleton from 'react-loading-skeleton'
import 'react-loading-skeleton/dist/skeleton.css'
import toast, { Toaster } from 'react-hot-toast'
import dayjs from 'dayjs'
import '../sass/pages/_description.scss'

const { Title, Text, Paragraph } = Typography;
const { Panel } = Collapse;

const fadeIn = {
  hidden: { opacity: 0, y: 40 },
  visible: (i = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 * i, duration: 0.7, type: 'spring' }
  })
}

const DescriptionPage = () => {
  const { id } = useParams<{ id: string }>()
  const course = useAppSelector((state) =>
    coursesSelector.selectById(state, id),
  )
  const dispatch = useAppDispatch()
  const history = useHistory();
  const { basket } = useAppSelector((state) => state.basket)
  const [loading, setLoading] = useState(true)
  const [reviews, setReviews] = useState<CourseReview[]>([])
  const userCourses = useAppSelector(state => state.user.userCourses);

  const fetchReviews = async () => {
    try {
      console.log('Fetching reviews for course id:', id);
      const res = await fetch(`http://localhost:5001/api/courses/${id}/reviews`, {
        credentials: 'include',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token') || ''}`
        }
      });
      if (!res.ok) {
        console.error('Failed to fetch reviews:', res.status, await res.text());
        setReviews([]);
        return;
      }
      const data = await res.json();
      console.log('Fetched reviews:', data);
      setReviews(data);
    } catch (err) {
      console.error('Error fetching reviews:', err);
      setReviews([]);
    }
  };

  useEffect(() => {
    if (!course) dispatch(getCourseAsync({ courseId: id }))
    setTimeout(() => setLoading(false), 800)
  }, [id, dispatch, course])

  useEffect(() => {
    if (id) fetchReviews();
  }, [id]);

  const getParsedDate = (strDate: any) => {
    let date: Date;
    if (!strDate) {
      date = new Date();
    } else {
      let strSplitDate = String(strDate).split(' ');
      date = new Date(strSplitDate[0]);
      if (isNaN(date.getTime())) {
        date = new Date();
      }
    }
    return dayjs(date).format('DD MMM YYYY')
  }

   const bookNow = (id: string) => {
    if(basket?.items.find((item) => item.courseId === id) === undefined) {
     dispatch(addBasketItemAsync({ courseId: id }));
      toast.success('Added to cart!')
    }
    dispatch(getCourseAsync({ courseId: id }));
    history.push('/checkout')
  }

  const handleAddToCart = () => {
    if (course) {
      dispatch(addBasketItemAsync({ courseId: course.id }))
      toast.success('Added to cart!')
    }
  }

  const handleLike = async (reviewId: string) => {
    await fetch(`http://localhost:5001/api/courses/reviews/${reviewId}/like`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    fetchReviews();
  };

  const handleDislike = async (reviewId: string) => {
    await fetch(`http://localhost:5001/api/courses/reviews/${reviewId}/dislike`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
      }
    });
    fetchReviews();
  };

  const isPurchased = userCourses?.some((c: Course) => c.id === course?.id);

  return (
    <motion.div
      className="descpage-ant-wrapper"
      initial="hidden"
      animate="visible"
      variants={fadeIn}
    >
      <Toaster position="top-right" toastOptions={{ style: { fontSize: 16, fontWeight: 600 } }} />
      <Row gutter={[32, 32]} justify="center">
        <Col xs={24} md={16} lg={16} xl={16}>
          <motion.div variants={fadeIn} custom={1}>
            <Card className="descpage-maincard glass-card" bordered={false}>
              <Row gutter={[24, 24]} align="middle">
                <Col xs={24} md={18}>
                  {loading ? (
                    <Skeleton height={40} width={320} style={{ marginBottom: 12 }} />
                  ) : (
                    <Title level={1} className="descpage-title">{course?.title}</Title>
                  )}
                  <Space size="large" className="descpage-meta">
                    <Tooltip title="Instructor" placement="top"><span><FaChalkboardTeacher /> {loading ? <Skeleton width={80} /> : course?.instructor}</span></Tooltip>
                    <Tooltip title="Language" placement="top"><span><FaLanguage /> {loading ? <Skeleton width={40} /> : course?.language}</span></Tooltip>
                    <Tooltip title="Category" placement="top"><span><FaTag /> {loading ? <Skeleton width={60} /> : course?.category}</span></Tooltip>
                    <Tooltip title="Enrolled" placement="top">
                      <span>
                        <FaUsers /> {loading ? <Skeleton width={30} /> : course?.students}
              </span>
                    </Tooltip>
                    <Tooltip title="Level" placement="top"><span>{loading ? <Skeleton width={40} /> : course?.level}</span></Tooltip>
                    <Tooltip title="Last updated" placement="top"><span>{loading ? <Skeleton width={80} /> : getParsedDate(course?.lastUpdated)}</span></Tooltip>
                  </Space>
                  <Divider />
                  {loading ? (
                    <Skeleton count={2} />
                  ) : (
                    <Paragraph className="descpage-subtitle">{course?.subTitle}</Paragraph>
                  )}
                </Col>
                <Col xs={24} md={6} className="descpage-image-col">
                  <Tilt glareEnable={true} glareMaxOpacity={0.25} scale={1.04} tiltMaxAngleX={12} tiltMaxAngleY={12}>
                    <motion.div whileHover={{ scale: 1.04 }} className="descpage-image-card glass-card" style={{ position: 'relative' }}>
                      {loading ? (
                        <Skeleton height={200} width={"100%"} />
                      ) : (
                        <>
                          <img alt="course" src={course?.image} className="descpage-image" />
                          <div className="descpage-image-overlay">
                            <PlayCircleOutlined style={{ fontSize: 48, color: '#fff', filter: 'drop-shadow(0 2px 8px #3b82f6)' }} />
            </div>
                        </>
                      )}
                    </motion.div>
                  </Tilt>
                </Col>
              </Row>
              <Divider />
              <Row gutter={[24, 24]}>
                <Col xs={24} md={14}>
                  <motion.div variants={fadeIn} custom={2}>
                    <Title level={3} className="descpage-section-title"><FaBookOpen /> Description</Title>
                    {loading ? (
                      <Skeleton count={5} />
                    ) : (
                      <div className="descpage-description" dangerouslySetInnerHTML={{ __html: course?.description || '' }} />
                    )}
                    <Divider />
                    <Title level={4} className="descpage-section-title"><FaPlay /> Preview Lectures</Title>
                    {loading ? (
                      <Skeleton count={3} />
                    ) : course?.sections && course.sections.length > 0 ? (
                      <Collapse accordion className="descpage-collapse">
                        {course.sections.map((section: Section, sectionIdx: number) => (
                          <Panel header={section.sectionName} key={sectionIdx}>
                            <ul className="descpage-lecture-list">
                  {section.lectures.map((lecture: Lecture, idx: number) => (
                                <motion.li key={lecture.id} className="descpage-lecture-item" variants={fadeIn} custom={idx+1} whileHover={{ scale: 1.03, x: 8 }}>
                      {sectionIdx === 0 && idx === 0 ? (
                                    <div className="descpage-lecture-preview">
                                      <PlayCircleOutlined style={{ color: '#52c41a', fontSize: 20, marginRight: 8 }} />
                                      <span className="descpage-lecture-title">{lecture.title}</span>
                          {lecture.videoUrl && (
                                        <div className="descpage-player-wrapper">
                                          <ReactPlayer url={lecture.videoUrl} controls width="100%" height="220px" style={{ borderRadius: 8, marginTop: 12 }} />
                                        </div>
                          )}
                        </div>
                      ) : (
                                    <Tooltip title="Locked. Enroll to unlock!">
                                      <div className="descpage-lecture-locked">
                                        <FaLock color="#888" style={{ marginRight: 8 }} />
                                        <span className="descpage-lecture-title">{lecture.title}</span>
                                        <span className="descpage-locked-label">(Locked)</span>
                        </div>
                                    </Tooltip>
                      )}
                                </motion.li>
                  ))}
                </ul>
                          </Panel>
                        ))}
                      </Collapse>
                    ) : (
                      <Text type="secondary">No preview lectures available.</Text>
                    )}
                    <Divider />
                    <Title level={4} className="descpage-section-title"><CheckCircleOutlined /> What will you learn?</Title>
                    <ul className="descpage-learnings">
                      {loading ? (
                        Array.from({ length: 4 }).map((_, i) => <li key={i}><Skeleton width={180} /></li>)
                      ) : course?.learnings.map((learning: Learning, index: number) => (
                        <motion.li key={index} className="descpage-learnings-item" variants={fadeIn} custom={index+1} whileHover={{ scale: 1.04 }}>
                          <CheckCircleOutlined style={{ color: '#52c41a', marginRight: 8 }} />
                          {learning.name}
                        </motion.li>
                      ))}
                    </ul>
                    <Divider />
                    <Title level={4} className="descpage-section-title">Requirements</Title>
                    <ul className="descpage-requirements">
                      {loading ? (
                        Array.from({ length: 3 }).map((_, i) => <li key={i}><Skeleton width={120} /></li>)
                      ) : course?.requirements.map((req: Requirement, index: number) => (
                        <motion.li key={index} className="descpage-requirements-item" variants={fadeIn} custom={index+1} whileHover={{ scale: 1.04 }}>
                          <FaCheckCircle color="#1890ff" style={{ marginRight: 8 }} />
                          {req.name}
                        </motion.li>
                      ))}
                    </ul>
                    <div className="descpage-reviews">
                      <Typography.Title level={4} className="descpage-section-title">Đánh giá của học viên</Typography.Title>
                      {reviews.length === 0 ? (
                        <Typography.Text type="secondary">Chưa có đánh giá nào.</Typography.Text>
                      ) : (
                        reviews.map((review, idx) => (
                          <div key={idx} className="descpage-review-item" style={{
                            background: '#fff',
                            borderRadius: 12,
                            boxShadow: '0 2px 8px #e3e9f7',
                            padding: 16,
                            marginBottom: 16
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', marginBottom: 8 }}>
                              <span style={{ fontWeight: 600, color: '#3b82f6', marginRight: 12 }}>
                                {review.userName}
                              </span>
                              <Rate disabled value={review.value} style={{ fontSize: 18, marginRight: 8 }} />
                              <span style={{ color: '#888', fontSize: 13 }}>{new Date(review.createdAt).toLocaleDateString()}</span>
        </div>
                            <div style={{ fontSize: 16 }}>{review.reviewText}</div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginTop: 8 }}>
                              <Button
                                size="small"
                                icon={<LikeOutlined />}
                                onClick={() => handleLike(review.id || '')}
                              >
                                {review.likes || 0}
                              </Button>
                              <Button
                                size="small"
                                icon={<DislikeOutlined />}
                                onClick={() => handleDislike(review.id || '')}
                              >
                                {review.dislikes || 0}
                              </Button>
        </div>
      </div>
                        ))
                      )}
          </div>
                  </motion.div>
                </Col>
                <Col xs={24} md={10}>
                  <motion.div variants={fadeIn} custom={3}>
                    <Card className="descpage-sidebar-card glass-card" bordered={false}>
                      <div className="descpage-sidebar-price">
                        <span className="descpage-price-real">{loading ? <Skeleton width={60} /> : `$${course?.price}`}</span>
                        <span className="descpage-price-before">$100</span>
                        <Tag color="red" className="descpage-discount">{loading ? <Skeleton width={40} /> : course && `${Math.floor(100 - course!.price)}% off`}</Tag>
          </div>
                      <Divider />
                      <Space direction="vertical" style={{ width: '100%' }}>
                        {isPurchased ? (
                          <Link to={`/learn/${course?.id}`}>
                            <Button
                              type="primary"
                              block
                              size="large"
                              style={{ background: '#52c41a', borderColor: '#52c41a' }}
                            >
                              Go to course
                            </Button>
                          </Link>
                        ) : (
                          <>
                            {basket?.items.find((item) => item.courseId === course?.id) !== undefined ? (
                              <Link to="/basket">
                                <Button type="primary" icon={<ShoppingCartOutlined />} block size="large">
                Go to cart
                                </Button>
              </Link>
            ) : (
                              <Button
                                type="primary"
                                icon={<ShoppingCartOutlined />}
                                block
                                size="large"
                                onClick={handleAddToCart}
              >
                Add to cart
                              </Button>
                            )}
                            <Button
                              type="default"
                              block
                              size="large"
                              className="descpage-booknow-btn"
                              onClick={() => bookNow(course!.id)}
                            >
              Book now
                            </Button>
                          </>
                        )}
                      </Space>
                      <Divider />
                      <div className="descpage-progress">
                        <Text strong>Course Progress</Text>
                        <Progress percent={0} showInfo={false} strokeColor="#52c41a" />
            </div>
                    </Card>
                  </motion.div>
                </Col>
              </Row>
            </Card>
          </motion.div>
        </Col>
      </Row>
    </motion.div>
  )
}

export default DescriptionPage
