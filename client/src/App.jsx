import React, { useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import { NotificationProvider } from "./contexts/NotificationContext";

// صفحات عامة
import VisitPage from "./pages/farmer/VisitPage";
import ChatPage from "./pages/ChatPage";
import SignInSignUp from "./pages/login/SignInSignUp";
import FarmerHistory from "./pages/farmer/FarmerHistory";
import FeedbackForm from "./pages/farmer/FeedbackForm";
import SupportRequestForm from "./pages/farmer/SupportRequestForm";
import DiagnosticQuestions from "./pages/farmer/DiagnosticQuestions";
import AutoDiagnosis from "./pages/farmer/AutoDiagnosis";

// صفحات مشتركة للمدير والمهندس
import DiseaseForm from "./pages/Shared/DiseaseForm";
import EditDisease from "./pages/Shared/EditDisease";

// صفحات المدير (manager)
import ManageDiseaseRequests from "./pages/manager/ManageDiseaseRequests";
import ManagerDashboard from "./pages/manager/ManagerDashboard";
import PendingApprovals from "./pages/manager/PendingApprovals";
import RoleChangeRequests from "./pages/manager/RoleChangeRequests";
import ChangeUserRole from "./pages/manager/ChangeUserRole";
import DiseaseList from "./pages/manager/DiseaseList";
import AddDisease from "./pages/manager/AddDisease";

// صفحات الأدمن (administrator)
import AdminDashboard from "./pages/administrator/AdminDashboard";
import UserManagement from "./pages/administrator/UserManagement";
import DatabaseManagement from "./pages/administrator/DatabaseManagement";
import RequestHandling from "./pages/administrator/RequestHandling";
import SystemMonitoring from "./pages/administrator/SystemMonitoring";

// صفحات المهندس (engineer)
import EngineerDashboard from "./pages/engineer/EngineerDashboard"; // (إذا كانت موجودة)
import AddDiseaseForm from "./pages/engineer/AddDiseaseForm";

import AuthService from "./services/AuthService";

function App() {
  const [user, setUser] = useState(AuthService.getCurrentUser());

  const handleLogin = (userData) => {
    setUser(userData);
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
  };

  return (
    <ErrorBoundary>
      <NotificationProvider>
        <div className="app">
          <Routes>
            {/* الصفحة العامة */}
            <Route path="/" element={<VisitPage user={user} onLogout={handleLogout} />} />

            {/* تسجيل الدخول */}
            <Route path="/login" element={<SignInSignUp onLogin={handleLogin} />} />

            {/* صفحة الشات */}
            <Route path="/chatbot" element={<ChatPage />} />

            {/* صفحات المدير */}
            <Route path="/manager/dashboard" element={<ManagerDashboard onLogout={handleLogout} />} />
            <Route path="/manager/add-disease" element={user && user.role === 'manager' ? <AddDisease onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/manager/edit-disease" element={<EditDisease onLogout={handleLogout} />} />
            <Route path="/manager/edit-disease/:diseaseId" element={<EditDisease onLogout={handleLogout} />} />
            <Route path="/manager/requests" element={<ManageDiseaseRequests onLogout={handleLogout} />} />
            <Route path="/manager/approvals" element={user && user.role === 'manager' ? <PendingApprovals onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/manager/role-requests" element={user && user.role === 'manager' ? <RoleChangeRequests onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/manager/change-role" element={user && user.role === 'manager' ? <ChangeUserRole onLogout={handleLogout} /> : <Navigate to="/login" />} />
            <Route path="/manager/diseases" element={user && user.role === 'manager' ? <DiseaseList onLogout={handleLogout} /> : <Navigate to="/login" />} />

            {/* صفحات الأدمن */}
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/user-management" element={<UserManagement />} />
            <Route path="/admin/database-management" element={<DatabaseManagement />} />
            <Route path="/admin/request-handling" element={<RequestHandling />} />
            <Route path="/admin/system-monitoring" element={<SystemMonitoring />} />

            {/* صفحات المهندس */}
            <Route path="/engineer/dashboard" element={<EngineerDashboard />} />
            <Route path="/engineer/add-disease" element={<DiseaseForm />} />
            <Route path="/engineer/edit-disease" element={<EditDisease onLogout={handleLogout} />} />
            <Route path="/engineer/edit-disease/:diseaseId" element={<EditDisease onLogout={handleLogout} />} />
            <Route path="/engineer/add-disease-form" element={<AddDiseaseForm />} />

            {/* صفحة التاريخ الزراعي */}
            <Route path="/farmer/history" element={user && user.role === 'farmer' ? <FarmerHistory /> : <Navigate to="/login" />} />

            {/* صفحة التقييم الزراعي */}
            <Route path="/farmer/feedback" element={user && user.role === 'farmer' ? <FeedbackForm /> : <Navigate to="/login" />} />

            {/* صفحة الدعم الزراعي */}
            <Route path="/farmer/support" element={user && user.role === 'farmer' ? <SupportRequestForm /> : <Navigate to="/login" />} />

            {/* صفحة الأسئلة التشخيصية */}
            <Route path="/farmer/questions" element={user && user.role === 'farmer' ? <DiagnosticQuestions /> : <Navigate to="/login" />} />

            {/* صفحة التشخيص التلقائي */}
            <Route path="/farmer/auto-diagnosis" element={user && user.role === 'farmer' ? <AutoDiagnosis /> : <Navigate to="/login" />} />
          </Routes>
        </div>
      </NotificationProvider>
    </ErrorBoundary>
  );
}

export default App;
