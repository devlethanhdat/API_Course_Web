import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Row } from 'antd'
import agent from '../actions/agent'
import { Category } from '../models/category'
import { Course } from '../models/course'
import ShowCourses from '../components/ShowCourses'

const CategoryPage = () => {
  const { id } = useParams<{ id: string }>()
  const [data, setData] = useState<Category & { courses: Course[] } | null>(null)

  useEffect(() => {
    agent.Categories.details(parseInt(id))
      .then((response) => {
        setData(response as Category & { courses: Course[] })
      })
      .catch(error => console.log('Error loading category:', error))
  }, [id])

  return (
    <div className="course-container">
      <div className="course-category__header">
        <h1>{data?.name}</h1>
      </div>
      <Row gutter={[24, 32]}>
        {data?.courses?.length ? (
          data.courses.map((course: Course) => (
            <ShowCourses key={course.id} course={course} />
          ))
        ) : (
          <p>No courses found in this category</p>
        )}
      </Row>
    </div>
  )
}

export default CategoryPage
