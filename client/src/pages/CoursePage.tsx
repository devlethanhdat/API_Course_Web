import { useEffect, useState, useRef } from 'react'
import { Link, RouteComponentProps, useHistory } from 'react-router-dom'
import * as FaIcons from 'react-icons/fa'
import Loading from '../components/Loading'
import { LectureDto } from '../models/lecture'
import {
  getLecturesAsync,
  setCurrentLecture,
  setCurrentVideo,
} from '../redux/slice/lectureSlice'
import { useAppDispatch, useAppSelector } from '../redux/store/configureStore'
import { motion } from 'framer-motion'
import { Skeleton, Tooltip, Rate, Modal, Row, Col, Typography } from 'antd'
import '../sass/pages/_coursepage.scss';
import axios from 'axios';

const { Text } = Typography;

const CoursePage = ({ match }: RouteComponentProps<any>) => {
  const {
    lecture,
    lectureLoaded,
    currentLecture,
    currentVideo,
  } = useAppSelector((state) => state.lecture)

  const dispatch = useAppDispatch()
  const history = useHistory()
  const [videoLoading, setVideoLoading] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement>(null)
  const [userRating, setUserRating] = useState<number | undefined>(undefined);
  const [avgRating, setAvgRating] = useState<number>(0);
  const [ratingCount, setRatingCount] = useState<number>(0);
  const [ratingLoading, setRatingLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [tempRating, setTempRating] = useState<number>(0);

  const { basket } = useAppSelector((state) => state.basket);
  const course = lecture; // Nếu lecture chính là course, hoặc lấy từ nơi khác nếu cần

  useEffect(() => {
    if (!lecture) dispatch(getLecturesAsync({ courseId: match.params.course }))
  }, [dispatch, match, lecture])

  useEffect(() => {
    if (lecture && !currentLecture) {
      const firstLecture = lecture.sections?.[0]?.lectures?.[0];
      if (firstLecture) {
        dispatch(setCurrentLecture(firstLecture.id));
        dispatch(setCurrentVideo(firstLecture.videoUrl));
      }
    }
    currentLecture && history.replace(`${currentLecture}`)
    let lectureItem: LectureDto
    if (lecture) {
      for (const item of lecture?.sections!) {
        lectureItem = item.lectures.find((lec) => lec.id === currentLecture)!
        if (lectureItem) {
          dispatch(setCurrentVideo(lectureItem.videoUrl))
          return
        }
      }
    }
  }, [currentLecture, dispatch, lecture, history])

  useEffect(() => {
    const fetchRatings = async () => {
      const res = await fetch(`http://localhost:5001/api/courses/${match.params.course}/ratings`, {
        headers: {
          'Authorization': 'Bearer ' + localStorage.getItem('token')
        }
      });
      const data = await res.json();
      setAvgRating(data.avg);
      setRatingCount(data.count);
      setUserRating(data.userRating ?? undefined);
    };
    fetchRatings();
  }, [match.params.course]);

  // Lấy danh sách tất cả bài giảng (flatten)
  const allLectures: LectureDto[] = lecture
    ? lecture.sections.flatMap((section) => section.lectures)
    : [];
  const currentIndex = allLectures.findIndex((l) => l.id === currentLecture);

  // Control handlers
  const handlePrev = () => {
    if (currentIndex > 0) {
      const prev = allLectures[currentIndex - 1];
      selectLecture(prev.id, prev.videoUrl);
    }
  };
  const handleNext = () => {
    if (currentIndex < allLectures.length - 1) {
      const next = allLectures[currentIndex + 1];
      selectLecture(next.id, next.videoUrl);
    }
  };
  const handleFullscreen = () => {
    const iframe = iframeRef.current;
    if (iframe) {
      if (iframe.requestFullscreen) iframe.requestFullscreen();
      // Safari
      // @ts-ignore
      else if (iframe.webkitRequestFullscreen) iframe.webkitRequestFullscreen();
    }
  };
  const handlePiP = () => {
    // PiP chỉ hỗ trợ với video tag, không hỗ trợ iframe YouTube
    // Có thể show thông báo nếu là YouTube
    window.alert('Picture-in-Picture chỉ hỗ trợ với video file trực tiếp.');
  };
  // Play/Pause không điều khiển được iframe YouTube, chỉ có thể dùng với video tag
  const handlePlayPause = () => {
    window.alert('Play/Pause chỉ hỗ trợ với video file trực tiếp.');
  };

  const selectLecture = (id: number, videoUrl: string) => {
    setVideoLoading(true)
    history.push(`${id}`)
    dispatch(setCurrentLecture(id))
    setTimeout(() => {
      dispatch(setCurrentVideo(videoUrl))
      setVideoLoading(false)
    }, 400) // fake loading for UX
  }

  if (!lectureLoaded) return <Loading />

  // Lấy tên bài giảng đang học
  let currentLectureTitle = ''
  if (lecture && currentLecture) {
    for (const section of lecture.sections) {
      const lec = section.lectures.find((l) => l.id === currentLecture)
      if (lec) currentLectureTitle = lec.title
    }
  }

  return (
    <div className="coursepage">
      <motion.aside
        className="coursepage__sidebar glassmorphism"
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <div className="coursepage__sidebar__course">
          <FaIcons.FaBookOpen className="coursepage__sidebar__icon" />
          <span>{lecture?.courseName}</span>
        </div>
        <div className="coursepage__sidebar__sections">
          {lecture &&
            lecture.sections.map((section, idx) => (
              <div key={idx} className="coursepage__sidebar__section">
                <div className="coursepage__sidebar__section-title">
                  <FaIcons.FaLayerGroup style={{ marginRight: 8 }} />
                  {section.sectionName}
                </div>
                <div className="coursepage__sidebar__lectures">
                  {section.lectures.map((lec, lidx) => (
                    <Link
                      key={lidx}
                      onClick={() => selectLecture(lec.id, lec.videoUrl)}
                      className={
                        lec.id === currentLecture
                          ? 'coursepage__sidebar__lecture--active'
                          : 'coursepage__sidebar__lecture'
                      }
                      to={`${lec.id}`}
                    >
                      <FaIcons.FaPlay className="coursepage__sidebar__lecture-icon" />
                      <span>{lec.title}</span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
        </div>
      </motion.aside>
      <motion.main
        className="coursepage__main"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
      >
        <div className="coursepage__video-container">
          <div className="coursepage__video-controls">
            <Tooltip title="Bài trước" placement="top">
              <button className="coursepage__video-btn" onClick={handlePrev} disabled={currentIndex <= 0} title="Bài trước">
                <FaIcons.FaStepBackward />
              </button>
            </Tooltip>
            <Tooltip title="Play/Pause" placement="top">
              <button className="coursepage__video-btn" onClick={handlePlayPause} title="Play/Pause">
                <FaIcons.FaPlay />
              </button>
            </Tooltip>
            <Tooltip title="Bài tiếp theo" placement="top">
              <button className="coursepage__video-btn" onClick={handleNext} disabled={currentIndex >= allLectures.length - 1} title="Bài tiếp theo">
                <FaIcons.FaStepForward />
              </button>
            </Tooltip>
            <Tooltip title="Picture-in-Picture" placement="top">
              <button className="coursepage__video-btn" onClick={handlePiP} title="Picture-in-Picture">
                <FaIcons.FaRegWindowRestore />
              </button>
            </Tooltip>
            <Tooltip title="Fullscreen" placement="top">
              <button className="coursepage__video-btn" onClick={handleFullscreen} title="Fullscreen">
                <FaIcons.FaExpand />
              </button>
            </Tooltip>
          </div>
          {videoLoading ? (
            <Skeleton.Image style={{ width: '100%', height: 400, borderRadius: 20 }} active />
          ) : currentVideo ? (
            <iframe
              ref={iframeRef}
              width="100%"
              height="400"
              title="Learnify"
              src={currentVideo}
              allowFullScreen
              frameBorder="0"
              className="coursepage__video"
              style={{ borderRadius: 20, boxShadow: '0 8px 32px #4f8cff22' }}
            ></iframe>
          ) : (
            <div style={{textAlign: 'center', padding: '2rem', color: '#888'}}>Không có video để hiển thị</div>
          )}
        </div>
        <Row align="middle" style={{ marginBottom: 16, justifyContent: 'center' }}>
          <Col>
            <div style={{ marginLeft: 24 }}>
              <Text>Đánh giá khóa học: </Text>
              <Rate
                allowHalf
                value={userRating ?? undefined}
                onChange={(value) => {
                  setTempRating(value);
                  setIsModalVisible(true);
                }}
                disabled={ratingLoading}
              />
              <Modal
                title="Đánh giá khóa học"
                open={isModalVisible}
                onOk={async () => {
                  setRatingLoading(true);
                  try {
                    await axios.post('http://localhost:5001/api/courses/rate', {
                      courseId: match.params.course,
                      rating: tempRating,
                      review: reviewText,
                    });
                    setUserRating(tempRating);
                    Modal.success({ title: 'Cảm ơn bạn đã đánh giá!' });
                    // Cập nhật lại rating
                    const res = await fetch(`http://localhost:5001/api/courses/${match.params.course}/ratings`, {
                      headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                      }
                    });
                    const data = await res.json();
                    setAvgRating(data.avg);
                    setRatingCount(data.count);
                    setUserRating(data.userRating ?? undefined);
                  } catch (err) {
                    Modal.error({ title: 'Gửi đánh giá thất bại!', content: 'Vui lòng thử lại.' });
                  }
                  setRatingLoading(false);
                  setIsModalVisible(false);
                  setReviewText('');
                }}
                onCancel={() => setIsModalVisible(false)}
                okText="Gửi đánh giá"
                cancelText="Hủy"
                confirmLoading={ratingLoading}
                okButtonProps={{
                  disabled: tempRating === 0 || reviewText.trim().length < 5,
                }}
              >
                <div style={{ marginBottom: 12 }}>
                  <Rate allowHalf value={tempRating} onChange={setTempRating} />
                </div>
                <textarea
                  style={{ width: '100%', minHeight: 80, borderRadius: 8, padding: 8, border: '1px solid #eee' }}
                  placeholder="Nhập nhận xét của bạn về khóa học này (tối thiểu 5 ký tự)..."
                  value={reviewText}
                  onChange={e => setReviewText(e.target.value)}
                  maxLength={500}
                />
              </Modal>
            </div>
          </Col>
        </Row>
      </motion.main>
    </div>
  )
}

export default CoursePage
