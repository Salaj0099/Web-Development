import { BrowserRouter, Routes, Route } from "react-router-dom"
import Home from "./pages/Home"
import SignIn from "./pages/SignIn"
import SignUp from "./pages/SignUp"
import FAQs from "./pages/FAQs"
import ForgotPassword from "./pages/ForgotPassword"
import Dashboard from "./pages/Dashboard"
import UpdateStock from "./pages/UpdateStock"
import NewSale from "./pages/NewSale"
import Rate from "./pages/Rate"
import CollectCredit from "./pages/CollectCredit"
import DayReport from "./pages/DayReport"
import Settings from "./pages/Settings"
import Reports from "./pages/Reports"
import Supplier from "./pages/Supplier"

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
        <Route path="/rate" element={<Rate />} />
        <Route path="/credit" element={<CollectCredit />} />
        <Route path="/report" element={<DayReport />} />
        <Route path="/settings" element={<Settings />} />
        <Route path="/reports" element={<Reports />} />
        <Route path="/suppliers" element={<Supplier />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App