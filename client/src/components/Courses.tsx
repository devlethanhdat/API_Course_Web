import React, { useState, useLayoutEffect, useEffect } from 'react'
import { Card, Col, Row } from 'antd'
import * as FaIcons from 'react-icons/fa'
import agent from '../actions/agent'
import { Course } from '../models/course'
import { PaginatedCourse } from '../models/paginatedCourse'

const Courses = () => {
  const [data, setData] = useState<PaginatedCourse>()
  const [spanVal, setSpanVal] = useState<number>()
  const [loading, setLoading] = useState(false)
  const [avgRatings, setAvgRatings] = useState<{ [key: string]: number }>({})

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
    return () => window.removeEventListener('resize', checkWidth)
  }, [])

  useEffect(() => {
    agent.Courses.list().then((response) => {
      setLoading(true)
      setData(response)
      setLoading(false)
    })
    checkWidth()
  }, [])

  useEffect(() => {
    if (data && data.data && data.data.length > 0) {
      data.data.forEach((course: Course) => {
        console.log('Course:', course);
        fetch(`http://localhost:5001/api/courses/${course.id}/ratings`)
          .then(res => {
            console.log('Fetch rating for', course.id, res.status);
            return res.json();
          })
          .then(ratingData => {
            console.log('Rating data for', course.id, ratingData);
            setAvgRatings(prev => ({ ...prev, [course.id]: ratingData.avg }));
          })
          .catch(err => console.error('Error fetching rating for', course.id, err));
      });
    }
  }, [data]);

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

  console.log('data', data);
  console.log('avgRatings', avgRatings);

  return (
    <div className="course">
      <div className="course__header">
        <h1>What to Learn Next?</h1>
        <h2>New Courses picked just for you...</h2>
      </div>
      <Row gutter={[24, 32]}>
        {data &&
          data.data.map((course: Course, index: number) => {
            return (
              <Col key={index.toString()} className="gutter-row" span={spanVal}>
                <Card
                  hoverable
                  loading={loading}
                  cover={
                    <img width="100%" alt="course-cover" src={course.image} />
                  }
                >
                  <div className="course__title">{course.title} </div>
                  <div className="course__instructor">{course.instructor} </div>
                  <div className="course__rating">
                    {avgRatings[course.id] ? avgRatings[course.id].toFixed(1) : '...'}
                    <span> {showStars(avgRatings[course.id] || 0)}</span>
                  </div>
                  <div className="course__price">{`$ ${course.price}`}</div>
                </Card>
              </Col>
            )
          })}
      </Row>
    </div>
  )
}

export default Courses

