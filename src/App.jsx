import { Route, Routes } from "react-router-dom";
import Login from "./Page/Login";
import Support from "./Page/Support";
import TeacherDashboard from "./Page/teacher/Dashboard";
import TeacherLayout from "./Page/teacher/Layout";
import AllStudent from "./Page/teacher/AllStudent";
import StudentProfile from "./Page/teacher/studentProfile";
import TeacherCourses from "./Page/teacher/Courses/TeacherCourses";
import TeacherCourseDetails from "./Page/teacher/Courses/CourseDetail";
import ScrollToTop from "./lib/scrolltop";
import { PrivateRoute, PublicRoute } from "./lib/PrivateRoutes";
import { useEffect, useState } from "react";
import { GlobalContext } from "./Context/GlobalProvider";
import { useContext } from "react";
import LoadingLoader from "./CustomComponent/LoadingLoader";
import { io } from "socket.io-client";
import AllTeacher from "./Page/teacher/AllTeacher";
import TeacherProfile from "./Page/teacher/teacherProfile";
import Category from "./Page/teacher/Category";
import Subcategory from "./Page/teacher/Subcategory";
import SchoolProfile from "./Page/teacher/Schoolproile";
import Newsletter from "./Page/teacher/Newsletter";
import ManageGradeScale from "./Page/manageGradeScale";
import GradeScaleForm from "./Page/GradeScale";
import Semester from "./Page/teacher/Semester";
import LandingPage from "./Page/teacher/LandingPage";
import VerifyOTP from "./Page/teacher/VerifyOTP";
import ForgetPassword from "./Page/teacher/forgetPassword";
import VerifyForgetPasswordOTP from "./Page/teacher/VerifyForgetPasswordOTP";
import NewPassword from "./Page/teacher/NewPassword";
import SignupPage from "./Page/teacher/signup";
import Account from "./Page/teacher/Account";
import EditGeneralInfo from "./Page/Account/EditGeneralInfo";
import { EditCredentials } from "./Page/Account/EditCredentials";
import AllSubmission from "./Page/teacher/Assessment/allSubmission";
import AssessmentReview from "./Page/teacher/Assessment/submittedAssessment";
import CreateAssessmentPage from "./Page/teacher/CreateAssessment";
import EditCourse from "./Page/teacher/Courses/EditCoursesBasics";
import SemesterDetail from "./Page/teacher/Courses/SemesterDetail";
import QuarterDetail from "./Page/teacher/Courses/QuarterDetail";
import TeacherChapterDetail from "./Page/teacher/Courses/quarter/chapter-detail";
import { AssessmentPage } from "./Page/teacher/Courses/quarter/assessment-dialog";
import StdPreview from "./Page/teacher/Courses/StdPreview";
import CoursesBasis from "./Page/teacher/Courses/CoursesBasics";
import CoursesChapter from "./Page/teacher/Courses/CourseChapters";
import GpaScaleForm from "./Page/teacher/GPA/manageGPA";
import ManageGpaScale from "./Page/teacher/GPA/createNewGPAScale";
import BulkSignupPage from "./Page/teacher/BulkSignupPage";
import CourseGradebook from "./CustomComponent/teacher/CourseGradebook";

function App() {
  const { checkAuth, user, Authloading, socket, setSocket, setOnlineUser } =
    useContext(GlobalContext);

  const connectsocket = () => {
    const newSocket = io("http://localhost:5050", {
      query: { userId: user?._id || "" },
    });

    setSocket(newSocket);

    newSocket.on("getOnlineUsers", (usersIds) => {
      setOnlineUser(usersIds);
    });

    newSocket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });
  };

  useEffect(() => {
    checkAuth();
  }, []);

  useEffect(() => {
    return () => {
      connectsocket();
    };
  }, [user]);

  if (Authloading) {
    return <LoadingLoader />;
  }

  return (
    <>
      <ScrollToTop />
      <Routes>
        <Route
          element={
            <PublicRoute
              user={user}
              redirectTo={user?.role === "admin" ? "/admin" : "/admin"}
            />
          }
        >
          <Route path="/" element={<Login />}></Route>
        </Route>

        {/* Admin Routes */}
        <Route
          element={
            <PrivateRoute
              user={user}
              allowedRole="admin"
              loading={Authloading}
            />
          }
        >
          <Route path="/admin" element={<TeacherLayout />}>
            <Route index element={<TeacherDashboard />} />
            <Route path="SchoolProfile" element={<SchoolProfile />} />
            <Route path="category" element={<Category />} />
            <Route path="subcategory/:categoryName" element={<Subcategory />} />
            <Route path="allStudent" element={<AllStudent />} />
            <Route path="newsletter" element={<Newsletter />} />
            <Route path="allTeacher" element={<AllTeacher />} />
            <Route path="studentProfile/:id" element={<StudentProfile />} />

            <Route path="teacherProfile/:id" element={<TeacherProfile />} />
            <Route path="account">
              <Route path=":id" element={<Account />} />
              <Route path=":id/editGeneralInfo" element={<EditGeneralInfo />} />
              <Route path=":id/editCredentials" element={<EditCredentials />} />
            </Route>
            <Route path="support" element={<Support />} />
            <Route path="semester" element={<Semester />} />
            <Route path="signup" element={<SignupPage />}></Route>
            <Route path="landing" element={<LandingPage />} />
            <Route path="bulksignup" element={<BulkSignupPage />} />
            <Route path="verifyOTP/:email" element={<VerifyOTP />} />
            <Route path="forgetPassword">
              <Route index element={<ForgetPassword />} />
              <Route
                path="verifyOTP/:email"
                element={<VerifyForgetPasswordOTP />}
              />
              <Route path="resetPassword/:email" element={<NewPassword />} />
            </Route>
            <Route path="gradescale">
              <Route index element={<GradeScaleForm />} />
              <Route path="managegradescale" element={<ManageGradeScale />} />
            </Route>

            <Route path="GPA">
              <Route index element={<GpaScaleForm />} />
              <Route path="managegpascale" element={<ManageGpaScale />} />
            </Route>

            <Route path="assessments">
              {/* <Route index element={<TeacherrAssessment />} /> */}
              <Route path="allsubmissions/:id" element={<AllSubmission />} />
              <Route path=":id" element={<AssessmentReview />} />
              <Route
                path="create/:type/:id/:courseId/:startDate/:endDate"
                element={<CreateAssessmentPage />}
              />
            </Route>

            <Route
              path="gradebook/:courseId"
              element={<CourseGradebook />}
            />

            <Route path="courses">
              <Route index element={<TeacherCourses />} />
              <Route
                path="courseDetail/:id"
                element={<TeacherCourseDetails />}
              />
              <Route path="edit/:courseId" element={<EditCourse />} />
              <Route
                path=":courseId/semester/:id"
                element={<SemesterDetail />}
              />
              <Route path=":courseId/quarter/:id" element={<QuarterDetail />} />
              <Route
                path="quarter/:quarterId/chapter/:chapterId"
                element={<TeacherChapterDetail />}
              />
              <Route
                path="assessment/:assessmentid"
                element={<AssessmentPage />}
              />


              <Route path="stdPreview/:id" element={<StdPreview />} />
              <Route path="createCourses">
                <Route index element={<CoursesBasis />} />
                <Route path="addChapter/:id" element={<CoursesChapter />} />
                {/* <Route path="gradebook" element={<TeacherGradebook />} /> */}
              </Route>
            </Route>
          </Route>
        </Route>
      </Routes>
    </>
  );
}

export default App;
