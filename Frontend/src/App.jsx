import { useUser } from '@clerk/react'
import './App.css'
import AppRoutes from './Routes/AppRoutes'
import { BrowserRouter as Router } from 'react-router-dom'
import { useEffect } from 'react'
import axios from 'axios'
import { Toaster } from 'react-hot-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL

function App() {

  const {user} = useUser()

  useEffect(()=>{
    if (user){
      axios.post(`${API_BASE_URL}/create-user`,{
        clerkId: user.id,
        username: user.username
      })
    }
  },[user])

  return (
    <Router>
      <Toaster position='top-center'/>
      <AppRoutes/>
    </Router>
  )
}

export default App
