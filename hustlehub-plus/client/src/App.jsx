import { Navigate, Route, Routes } from "react-router-dom";

import Layout from "./components/Layout.jsx";
import ProtectedRoute from "./components/ProtectedRoute.jsx";
import { useAuth } from "./context/AuthContext.jsx";
import { homeForRole } from "./utils/format.js";

import Home from "./pages/Home.jsx";
import Gigs from "./pages/Gigs.jsx";
import GigDetails from "./pages/GigDetails.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Booking from "./pages/Booking.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import DashboardGigs from "./pages/DashboardGigs.jsx";
import DashboardBookings from "./pages/DashboardBookings.jsx";
import DashboardIncome from "./pages/DashboardIncome.jsx";
import Transactions from "./pages/Transactions.jsx";
import Profile from "./pages/Profile.jsx";
import Admin from "./pages/Admin.jsx";

function StartPage() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Home />;
  }

  return <Navigate to={homeForRole(user?.role)} replace />;
}

function GuestOnly({ children }) {
  const { isAuthenticated, user } = useAuth();

  if (isAuthenticated) {
    return <Navigate to={homeForRole(user?.role)} replace />;
  }

  return children;
}

function Secure({ children, roles }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

export default function App() {
  return (
    <Layout>
      <Routes>
        {/* Website opens here first */}
        <Route path="/" element={<StartPage />} />

        {/* Registration and login */}
        <Route
          path="/login"
          element={
            <GuestOnly>
              <Login />
            </GuestOnly>
          }
        />

        <Route
          path="/register"
          element={
            <GuestOnly>
              <Register />
            </GuestOnly>
          }
        />

        {/* Main application */}
        <Route
          path="/home"
          element={
            <Secure>
              <Home />
            </Secure>
          }
        />

        <Route path="/gigs" element={<Gigs />} />

        <Route path="/gigs/:id" element={<GigDetails />} />

        {/* Client */}
        <Route
          path="/bookings"
          element={
            <Secure roles={["client"]}>
              <MyBookings />
            </Secure>
          }
        />

        <Route
          path="/bookings/:id"
          element={
            <Secure roles={["client"]}>
              <Booking />
            </Secure>
          }
        />

        {/* Freelancer */}
        <Route
          path="/dashboard/gigs"
          element={
            <Secure roles={["freelancer"]}>
              <DashboardGigs />
            </Secure>
          }
        />

        <Route
          path="/dashboard/bookings"
          element={
            <Secure roles={["freelancer"]}>
              <DashboardBookings />
            </Secure>
          }
        />

        <Route
          path="/dashboard/income"
          element={
            <Secure roles={["freelancer"]}>
              <DashboardIncome />
            </Secure>
          }
        />

        {/* Shared account pages */}
        <Route
          path="/transactions"
          element={
            <Secure roles={["client", "freelancer"]}>
              <Transactions />
            </Secure>
          }
        />

        <Route
          path="/profile"
          element={
            <Secure>
              <Profile />
            </Secure>
          }
        />

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <Secure roles={["admin"]}>
              <Admin />
            </Secure>
          }
        />

        <Route path="*" element={<StartPage />} />
      </Routes>
    </Layout>
  );
}
