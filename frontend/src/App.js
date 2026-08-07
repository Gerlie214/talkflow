import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import Dashboard from "@/pages/Dashboard";
import Library from "@/pages/Library";
import TopicDetail from "@/pages/TopicDetail";
import Practice from "@/pages/Practice";
import CustomScript from "@/pages/CustomScript";
import FreeSpeaking from "@/pages/FreeSpeaking";
import PracticeComplete from "@/pages/PracticeComplete";
import History from "@/pages/History";
import ProgressPage from "@/pages/ProgressPage";
import Settings from "@/pages/Settings";

export default function App() {
  return (
    <div className="App">
      <div className="tf-grain" aria-hidden />
      <BrowserRouter>
        <Routes>
          {/* Immersive routes without layout chrome */}
          <Route path="/practice" element={<Practice />} />
          <Route path="/complete" element={<PracticeComplete />} />

          {/* Routes with layout chrome */}
          <Route element={<Layout />}>
            <Route path="/" element={<Dashboard />} />
            <Route path="/library" element={<Library />} />
            <Route path="/topic/:id" element={<TopicDetail />} />
            <Route path="/custom" element={<CustomScript />} />
            <Route path="/free" element={<FreeSpeaking />} />
            <Route path="/history" element={<History />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
        </Routes>
      </BrowserRouter>
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
