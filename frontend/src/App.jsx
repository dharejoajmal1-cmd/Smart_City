import { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import PublicLayout from "./routes/PublicLayout";
import DashboardLayout from "./components/layout/DashboardLayout";
import ProtectedRoute from "./routes/ProtectedRoute";
import AdminRoute from "./routes/AdminRoute";
import Loader from "./components/common/Loader";

// Public pages are lazy-loaded to keep the initial bundle lean.
const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Properties = lazy(() => import("./pages/Properties"));
const PropertyDetails = lazy(() => import("./pages/PropertyDetails"));
const Contact = lazy(() => import("./pages/Contact"));
const Login = lazy(() => import("./pages/Login"));
const Register = lazy(() => import("./pages/Register"));
const NotFound = lazy(() => import("./pages/NotFound"));
const BuyPlot = lazy(() => import("./pages/BuyPlot"));
const ForgotPassword = lazy(() => import("./pages/ForgotPassword"));
const ResetPassword = lazy(() => import("./pages/ResetPassword"));

// Dashboard pages
const DashboardHome = lazy(() => import("./pages/dashboard/DashboardHome"));
const Profile = lazy(() => import("./pages/dashboard/Profile"));
const SavedProperties = lazy(() => import("./pages/dashboard/SavedProperties"));
const MyProperties = lazy(() => import("./pages/dashboard/MyProperties"));
const MyInquiries = lazy(() => import("./pages/dashboard/MyInquiries"));
const Settings = lazy(() => import("./pages/dashboard/Settings"));
const Users = lazy(() => import("./pages/dashboard/Users"));
const Messages = lazy(() => import("./pages/dashboard/Messages"));

export default function App() {
  return (
    <Suspense fallback={<Loader fullPage />}>
      <Routes>
        {/* Public site ------------------------------------------------- */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/properties/:slug" element={<PropertyDetails />} />
          <Route path="/properties/id/:id" element={<PropertyDetails />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/buy-plot" element={<BuyPlot />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
        </Route>

        {/* Protected dashboard ------------------------------------------ */}
        <Route element={<ProtectedRoute />}>
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardHome />} />
            <Route path="profile" element={<Profile />} />
            <Route path="saved" element={<SavedProperties />} />
            <Route path="my-properties" element={<MyProperties />} />
            <Route path="inquiries" element={<MyInquiries />} />
            <Route path="settings" element={<Settings />} />

            {/* Admin-only ---------------------------------------------- */}
            <Route element={<AdminRoute />}>
              <Route path="users" element={<Users />} />
              <Route path="messages" element={<Messages />} />
            </Route>
          </Route>
        </Route>

        {/* 404 ------------------------------------------------------------ */}
        <Route element={<PublicLayout />}>
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
