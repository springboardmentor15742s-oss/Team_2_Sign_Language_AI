import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PublicLayout } from '../layouts/PublicLayout';
import { AuthLayout } from '../layouts/AuthLayout';
import { DashboardLayout } from '../layouts/DashboardLayout';

import Home from '../pages/landing/Home';
import AboutPage from '../pages/landing/About';
import ContactPage from '../pages/landing/Contact';
import FAQPage from '../pages/landing/FAQ';

import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';
import ForgotPassword from '../pages/auth/ForgotPassword';

import Dashboard from '../pages/dashboard/Dashboard';

import Profile from '../pages/profile/Profile';
import EditProfile from '../pages/profile/EditProfile';

import Courses from '../pages/courses/Courses';
import CourseDetails from '../pages/courses/CourseDetails';
import Lesson from '../pages/lessons/Lesson';

import Practice from '../pages/practice/Practice';

import Assessments from '../pages/assessments/Assessments';
import Assessment from '../pages/assessments/Assessment';
import AssessmentResults from '../pages/assessments/AssessmentResults';

import Reports from '../pages/reports/Reports';

import Notifications from '../pages/notifications/Notifications';

import Settings from '../pages/settings/Settings';

import Help from '../pages/help/Help';
import Contact from '../pages/help/Contact';
import About from '../pages/help/About';

import AdminDashboard from '../pages/admin/AdminDashboard';

import NotFound from '../pages/NotFound';
import { ProtectedRoute } from './ProtectedRoute';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'about', element: <AboutPage /> },
      { path: 'contact', element: <ContactPage /> },
      { path: 'faq', element: <FAQPage /> },
    ],
  },
  {
    path: '/',
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <Login /> },
      { path: 'register', element: <Register /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
    ],
  },
  {
    path: '/',
    element: <ProtectedRoute />,
    children: [
      {
        element: <DashboardLayout />,
        children: [
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'profile', element: <Profile /> },
      { path: 'profile/edit', element: <EditProfile /> },
      { path: 'courses', element: <Courses /> },
      { path: 'course/:id', element: <CourseDetails /> },
      { path: 'lesson/:courseId/:lessonId', element: <Lesson /> },
      { path: 'practice', element: <Practice /> },
      { path: 'assessments', element: <Assessments /> },
      { path: 'assessment/:id', element: <Assessment /> },
      { path: 'assessment-results', element: <AssessmentResults /> },
      { path: 'reports', element: <Reports /> },
      { path: 'notifications', element: <Notifications /> },
      { path: 'settings', element: <Settings /> },
      { path: 'help', element: <Help /> },
      { path: 'help/contact', element: <Contact /> },
      { path: 'help/about', element: <About /> },
      { path: 'admin', element: <ProtectedRoute roles={['admin']} />, children: [{ index: true, element: <AdminDashboard /> }] },
        ],
      },
    ],
  },
  { path: '*', element: <NotFound /> },
]);
