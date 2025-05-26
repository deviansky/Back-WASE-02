import { BrowserRouter as Router, Routes, Route } from "react-router";
import SignIn from "./pages/AuthPages/SignIn";
import SignUp from "./pages/AuthPages/SignUp";
import NotFound from "./pages/OtherPage/NotFound";
import UserProfiles from "./pages/UserProfiles";
import Videos from "./pages/UiElements/Videos";
import Images from "./pages/UiElements/Images";
import Alerts from "./pages/UiElements/Alerts";
import Badges from "./pages/UiElements/Badges";
import Avatars from "./pages/UiElements/Avatars";
import Buttons from "./pages/UiElements/Buttons";
import LineChart from "./pages/Charts/LineChart";
import BarChart from "./pages/Charts/BarChart";
import Calendar from "./pages/Calendar";
import BasicTables from "./pages/Tables/BasicTables";
import FormElements from "./pages/Forms/FormElements";
import Blank from "./pages/Blank";
import AppLayout from "./layout/AppLayout";
import { ScrollToTop } from "./components/common/ScrollToTop";
import Home from "./pages/Dashboard/Home";
import Kegiatan from "./pages/Kegiatana/kegiatan";
import Pemasukan from "./pages/Keuangan/keuangan";
import Products from "./pages/tesAPI";
import PenghuniCRUD from "./pages/Penghuni";
import AdminRoute from "./components/routes/AdminRoute";
import User from "./components/header/SigOut";
import DashboardView from "./pages/TampilanPenghuni/DashboardView"
import KegiatanView from "./pages/TampilanPenghuni/KegiatanView"
import PenghuniView from "./pages/TampilanPenghuni/PenghuniView"
export default function App() {
  return (
    <>
      <Router>
        <ScrollToTop />
        <Routes>
          {/* Dashboard Layout */}
          <Route element={<AppLayout />}>
            <Route index path="/product" element={<Products />} />
                        <Route
              path="/home"
              element={
                <AdminRoute>
                  <Home />
                </AdminRoute>
              }
            />
            <Route
              path="/penghuni"
              element={
                <AdminRoute>
                  <PenghuniCRUD />
                </AdminRoute>
              }
            />

            {/* Keuangan */}
            <Route
              path="/Pemasukan"
              element={
                <AdminRoute>
                  <Pemasukan />
                </AdminRoute>
              }
            />

            {/* Kegiatan */}
            <Route
              path="/kegiatan"
              element={
                <AdminRoute>
                  <Kegiatan />
                </AdminRoute>
              }
            />


            {/* Penghuni View */}
            <Route path="/" element={<DashboardView />} />
            <Route path="/Kegiatan." element={<KegiatanView />} />
            <Route path="/Penghuni." element={<PenghuniView />} />

            {/* Others Page */}
            <Route path="/user" element={<User />} />
            <Route path="/profile" element={<UserProfiles />} />
            <Route path="/calendar" element={<Calendar />} />
            <Route path="/blank" element={<Blank />} />

            {/* Forms */}
            <Route path="/form-elements" element={<FormElements />} />

            {/* Tables */}
            <Route path="/basic-tables" element={<BasicTables />} />

            {/* Ui Elements */}
            <Route path="/alerts" element={<Alerts />} />
            <Route path="/avatars" element={<Avatars />} />
            <Route path="/badge" element={<Badges />} />
            <Route path="/buttons" element={<Buttons />} />
            <Route path="/images" element={<Images />} />
            <Route path="/videos" element={<Videos />} />

            {/* Charts */}
            <Route path="/line-chart" element={<LineChart />} />
            <Route path="/bar-chart" element={<BarChart />} />
          </Route>

          {/* Auth Layout */}
          <Route path="/login" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Fallback Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </>
  );
}
