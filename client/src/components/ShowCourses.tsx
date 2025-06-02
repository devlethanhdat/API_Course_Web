import React, { useEffect, useLayoutEffect, useState } from 'react'
import { Card, Col } from 'antd'
import * as FaIcons from 'react-icons/fa'
import { Course } from '../models/course'
import { Link } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { addBasketItemAsync } from '../redux/slice/basketSlice'

interface Props {
  course: Course
  noCol?: boolean
}

const ShowCourses = ({ course, noCol }: Props) => {
  const [spanVal, setSpanVal] = useState<number>()
  const [avgRating, setAvgRating] = useState<number | null>(null);

  const { basket } = useAppSelector((state) => state.basket)
  const dispatch = useAppDispatch()
  const { userCourses } = useAppSelector((state) => state.user)
  const { currentLecture } = useAppSelector((state) => state.lecture)

  const checkWidth = (): void => {
    if (window.innerWidth > 1024) {
      setSpanVal(6)
    } else if (window.innerWidth < 1024 && window.innerWidth > 768) {
      setSpanVal(8)
    } else {
      setSpanVal(12)
    }
  }

  useLayoutEffect(() => {
    window.addEventListener('resize', checkWidth)
    return () => window.addEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    checkWidth()
  }, [])

  useEffect(() => {
    if (course && course.id) {
      fetch(`http://localhost:5001/api/courses/${course.id}/ratings`)
        .then(res => res.json())
        .then(data => setAvgRating(data.avg))
        .catch(() => setAvgRating(null));
    }
  }, [course]);

  const showStars = (rating: number): JSX.Element[] => {
    const options: JSX.Element[] = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        options.push(<FaIcons.FaStar key={i} />);
      } else if (rating > i - 1 && rating < i) {
        options.push(<FaIcons.FaStarHalf key={i} />);
      } else {
        options.push(<FaIcons.FaRegStar key={i} />);
      }
    }
    return options;
  };

  const card = (
        <Card
          hoverable
          cover={<img width="100%" alt="course-cover" src={course.image} />}
      className="show-course"
        >
          <Link to={`/course/${course.id}`}>
            <div className="course__title">{course.title}</div>
          </Link>
          <div className="course__instructor">Giảng viên: {course.instructor}</div>
          <div className="course__rating">
            {avgRating !== null ? avgRating.toFixed(1) : '...'}
            <span>{showStars(avgRating || 0)}</span>
          </div>
          <div className="course__bottom">
            <div className="course__bottom__price">{course.price}&nbsp;VNĐ</div>
        {userCourses?.find((item) => item.id === course.id) !== undefined ? (
              <Link to={`/learn/${course.id}/${currentLecture}`}>
                <div className="course__bottom__cart">Go to Course</div>
              </Link>
        ) : basket?.items.find((item) => item.courseId === course.id) !== undefined ? (
              <Link to="/basket">
                <div className="course__bottom__cart">Go to Cart</div>
              </Link>
            ) : (
              <div
                onClick={() => {
                  dispatch(addBasketItemAsync({ courseId: course.id }))
                }}
                className="course__bottom__cart"
              >
               Add To 🛒
              </div>
            )}
          </div>
        </Card>
  );

  if (noCol) return card;

  return (
    <Col className="gutter-row" span={spanVal}>
      {card}
      </Col>
  );
}

export default ShowCourses
