import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import FAQs from "./pages/FAQs"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import UpdateStock from "./pages/UpdateStock"
import NewSale from "./pages/NewSale"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/faqs" element={<FAQs />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/stock" element={<UpdateStock />} />
        <Route path="/billing/new" element={<NewSale />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App