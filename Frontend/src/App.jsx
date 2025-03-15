import React from 'react'
import './App.css'
import AppRoutes from './Routes/AppRoutes'
import { BrowserRouter as Router } from 'react-router-dom'

function App() {

  return (
    <Router>
      <AppRoutes/>
    </Router>
  )
}

export default App
