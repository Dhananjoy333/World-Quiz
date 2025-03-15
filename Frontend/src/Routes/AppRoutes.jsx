import {BrowserRouter as Router,Routes,Route} from "react-router-dom"
import GuessCountry from "../pages/GuessCountry"
import GuessCapital from "../pages/GuessCapital"
import Main from "../pages/Main"

import React from 'react'

const AppRoutes = () => {
  return (
    <Routes>
        <Route path="/" element={<Main/>}></Route>
        <Route path="/guess-country" element={<GuessCountry/>}></Route>
        <Route path="/guess-capital" element={<GuessCapital/>}></Route>
    </Routes>
  )
}

export default AppRoutes