import React, {useEffect, useState} from 'react'
import io from 'socket.io-client'
import {useLocation, useNavigate} from 'react-router-dom'
import s from '../styles/Chat.module.css'
import icon from '../images/emoji.svg'
import EmojiPicker from 'emoji-picker-react'
import {Messages} from './Messages'

const socket = io.connect('https://online-chat-server-ml72.onrender.com')

export const Chat = () => {
  const [state, setState] = useState([])
  const {search} = useLocation()
  const [params, setParams] = useState({room: '', user: ''})
  const [message, setMessage] = useState('')
  const [isOpen, setIsOpen] = useState(false)
  const [users, setUsers] = useState(0)
  const navigate = useNavigate()

  useEffect(() => {
    const searchParams = Object.fromEntries(new URLSearchParams(search))
    setParams(searchParams)

    socket.emit('join', searchParams)
  }, [search])

  useEffect(() => {
    socket.on('message', ({data}) => {
      setState(_state => [..._state, data])
    })
  }, [])

  useEffect(() => {
    socket.on('joinRoom', ({data: {users}}) => {
      setUsers(users.length)
    })
  }, [])

  const handleChange = ({target: {value}}) => setMessage(value)

  const leftRoom = () => {
    socket.emit('leftRoom', {params})
    navigate('/')
  }

  const onEmojiClick = ({emoji}) => {
    setMessage(`${message}${emoji}`)
    setIsOpen(false)
  }

  const handleSubmit = (e) => {
    e.preventDefault()

    if (!message) return

    socket.emit('sendMessage', {message, params})
    setMessage('')
  }

  return <div className={s.wrap}>
    <div className={s.header}>
      <div className={s.title}>
        {params.room}
      </div>
      <div className={s.users}>
        {users} users in this room
      </div>
      <button className={s.left} onClick={leftRoom}>
        Left the room
      </button>
    </div>
    <div className={s.messages}>
      <Messages messages={state} name={params.name}/>
    </div>
    <form className={s.form} onSubmit={handleSubmit}>
      <div className={s.input}>
        <input type="text" name="message"
               placeholder="Wtah do you want to say?"
               value={message}
               onChange={handleChange}
               autoComplete="off" required/>
      </div>
      <div className={s.emoji}>
        <img src={icon} alt="Icon" onClick={() => setIsOpen(!isOpen)}/>
        <div className={s.emojies}>
          {
            isOpen && <EmojiPicker onEmojiClick={onEmojiClick}/>
          }
        </div>
      </div>
      <div className={s.button}>
        <input type="submit" onSubmit={handleSubmit} value="Send a message"/>
      </div>
    </form>
  </div>
}
