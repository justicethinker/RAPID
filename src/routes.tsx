import { lazy, Suspense } from "react";
import { Routes, Route, Outlet } from "react-router-dom";
import Home from "./pages/Home";
import Join from "./pages/Join";
import Founders from "./pages/Founders";
import Contact from "./pages/Contact";
import HowItWorks from "./pages/HowItWorks";
import About from "./pages/About";
import PublicStartup from "./pages/PublicStartup";
import Discover from "./pages/Discover";
import { ThanksPage } from "./pages/Thanks";
import NotFound from "./pages/NotFound";
import { AuthRoot } from "./auth/AuthProvider";
import { RequireAuth, RequireRole, RequireStaff } from "./auth/Guards";

const AppLayout = lazy(() => import("./pages/app/AppLayout"));
const AppHome = lazy(() => import("./pages/app/AppHome"));
const TesterOverview = lazy(() => import("./pages/app/TesterOverview"));
const TesterInvitations = lazy(() => import("./pages/app/TesterInvitations"));
const TesterInvitationDetail = lazy(() => import("./pages/app/TesterInvitationDetail"));
const TesterHistory = lazy(() => import("./pages/app/TesterHistory"));
const TesterProfile = lazy(() => import("./pages/app/TesterProfile"));
const Notifications = lazy(() => import("./pages/app/Notifications"));
const FounderOverview = lazy(() => import("./pages/app/FounderOverview"));
const FounderNewTest = lazy(() => import("./pages/app/FounderNewTest"));
const FounderIntake = lazy(() => import("./pages/app/FounderIntake"));
const FounderTestDetail = lazy(() => import("./pages/app/FounderTestDetail"));
const FounderProfile = lazy(() => import("./pages/app/FounderProfile"));
const FounderStartup = lazy(() => import("./pages/app/FounderStartup"));
const FounderPosts = lazy(() => import("./pages/app/FounderPosts"));
const FounderAudience = lazy(() => import("./pages/app/FounderAudience"));
const StaffModeration = lazy(() => import("./pages/app/StaffModeration"));
const StaffHome = lazy(() => import("./pages/app/StaffHome"));
const StaffApplications = lazy(() => import("./pages/app/StaffApplications"));
const StaffApplicationDetail = lazy(() => import("./pages/app/StaffApplicationDetail"));
const StaffTests = lazy(() => import("./pages/app/StaffTests"));
const StaffTestDetail = lazy(() => import("./pages/app/StaffTestDetail"));
const StaffTeam = lazy(() => import("./pages/app/StaffTeam"));

const Privacy = lazy(() => import("./pages/Privacy"));
const SignIn = lazy(() => import("./pages/SignIn"));
const SignUp = lazy(() => import("./pages/SignUp"));
const SignUpRole = lazy(() => import("./pages/SignUpRole"));
const Admin = lazy(() => import("./pages/Admin"));
const AdminSignIn = lazy(() => import("./pages/AdminSignIn"));
const AdminSignUp = lazy(() => import("./pages/AdminSignUp"));

export function AppRoutes() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-white" />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/join" element={<Join />} />
        <Route path="/founders" element={<Founders />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/about" element={<About />} />
        <Route path="/thanks/tester" element={<ThanksPage kind="tester" />} />
        <Route path="/thanks/founder" element={<ThanksPage kind="founder" />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/discover" element={<Discover />} />

        {/* Account routes mount the session only when one matches, keeping Clerk
            and the dashboard code out of the public bundle. */}
        <Route
          element={
            <AuthRoot>
              <Outlet />
            </AuthRoot>
          }
        >
          <Route path="/sign-in/*" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/sign-up/:role" element={<SignUpRole />} />

          {/* The profile is public, but follow, feedback and reporting need an
              account. Mounting the session provider here lets those actions use
              the same token as the rest of the app. */}
          <Route path="/startup/:slug" element={<PublicStartup />} />

          {/* Staff access is invited, never self-served, so it has its own
              door instead of a card in the public sign-up picker. */}
          <Route path="/admin" element={<Admin />} />
          <Route path="/admin/sign-in" element={<AdminSignIn />} />
          <Route path="/admin/sign-up" element={<AdminSignUp />} />

          <Route
            path="/app"
            element={
              <RequireAuth>
                <AppLayout />
              </RequireAuth>
            }
          >
            <Route index element={<AppHome />} />
            <Route path="notifications" element={<Notifications />} />
            <Route
              path="tester"
              element={
                <RequireRole role="tester">
                  <TesterOverview />
                </RequireRole>
              }
            />
            <Route
              path="tester/invitations"
              element={
                <RequireRole role="tester">
                  <TesterInvitations />
                </RequireRole>
              }
            />
            <Route
              path="tester/invitations/:id"
              element={
                <RequireRole role="tester">
                  <TesterInvitationDetail />
                </RequireRole>
              }
            />
            <Route
              path="tester/history"
              element={
                <RequireRole role="tester">
                  <TesterHistory />
                </RequireRole>
              }
            />
            <Route
              path="tester/profile"
              element={
                <RequireRole role="tester">
                  <TesterProfile />
                </RequireRole>
              }
            />

            <Route
              path="founder"
              element={
                <RequireRole role="founder">
                  <FounderOverview />
                </RequireRole>
              }
            />
            <Route
              path="founder/startup"
              element={
                <RequireRole role="founder">
                  <FounderStartup />
                </RequireRole>
              }
            />
            <Route
              path="founder/posts"
              element={
                <RequireRole role="founder">
                  <FounderPosts />
                </RequireRole>
              }
            />
            <Route
              path="founder/audience"
              element={
                <RequireRole role="founder">
                  <FounderAudience />
                </RequireRole>
              }
            />
            <Route
              path="founder/new"
              element={
                <RequireRole role="founder">
                  <FounderNewTest />
                </RequireRole>
              }
            />
            <Route
              path="founder/intake"
              element={<RequireRole role="founder"><FounderIntake /></RequireRole>}
            />
            <Route
              path="founder/intake/:id"
              element={<RequireRole role="founder"><FounderIntake /></RequireRole>}
            />
            <Route
              path="founder/tests/:id"
              element={
                <RequireRole role="founder">
                  <FounderTestDetail />
                </RequireRole>
              }
            />
            <Route
              path="founder/profile"
              element={
                <RequireRole role="founder">
                  <FounderProfile />
                </RequireRole>
              }
            />
          </Route>

          <Route
            path="/staff"
            element={
              <RequireAuth>
                <RequireStaff>
                  <AppLayout />
                </RequireStaff>
              </RequireAuth>
            }
          >
            <Route index element={<StaffHome />} />
            <Route path="applications" element={<StaffApplications />} />
            <Route
              path="applications/:id"
              element={<StaffApplicationDetail />}
            />
            <Route path="tests" element={<StaffTests />} />
            <Route path="tests/:id" element={<StaffTestDetail />} />
            <Route path="moderation" element={<StaffModeration />} />
            <Route path="team" element={<StaffTeam />} />
          </Route>
        </Route>

        <Route path="*" element={<NotFound />} />
      </Routes>
    </Suspense>
  );
}
