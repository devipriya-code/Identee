import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getVideoBanner,
  addVideoBanner,
  deleteVideoBanner,
  reset,
} from "../../redux/slices/bannerSlice";
import { THEME, inputStyle, labelStyle } from "../../theme/theme";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

// Fixed sections — must match the enum in videoBannerModel.js
const SECTIONS = [
  {
    key: "hero",
    title: "Hero Video",
    desc: "Full-screen video at the top of the Home page.",
  },
  {
    key: "styleOutlookMain",
    title: "Style Outlook — Main Video",
    desc: "Big left video in the black 'Style Outlook' section.",
  },
  {
    key: "styleOutlookSide1",
    title: "Style Outlook — Side Video 1",
    desc: "Top-right (taller) video in the 'Style Outlook' section.",
  },
  {
    key: "styleOutlookSide2",
    title: "Style Outlook — Side Video 2",
    desc: "Bottom-right (shorter) video in the 'Style Outlook' section.",
  },
  {
    key: "designYourOwn",
    title: "Design Your Own Video",
    desc: "Video in the yellow 'Design Your Own' section.",
  },
];

function SectionVideoCard({ section, title, desc, existing, isLoading }) {
  const dispatch = useDispatch();
  const [file, setFile] = useState(null);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!file) return toast.error("Choose a video file first");

    const formData = new FormData();
    formData.append("section", section);
    formData.append("video", file);

    dispatch(addVideoBanner(formData))
      .unwrap()
      .then(() => {
        toast.success(`${title} saved`);
        setFile(null);
      })
      .catch((err) => {
        // err here is the exact message the backend sent back
        // (or a network-level message if the request never reached it)
        console.error("Upload failed:", err);
        toast.error(err || "Upload failed — check console for details");
      });
  };

  const handleDelete = () => {
    if (!existing?._id) return;
    if (!window.confirm(`Remove the ${title}?`)) return;
    dispatch(deleteVideoBanner(existing._id))
      .unwrap()
      .then(() => toast.success(`${title} removed`))
      .catch((err) => toast.error(err || "Delete failed"));
  };

  return (
    <div
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 14,
        padding: 22,
        marginBottom: 22,
      }}
    >
      <h3 style={{ margin: "0 0 4px", fontSize: 17, fontWeight: 600 }}>
        {title}
      </h3>
      <p style={{ margin: "0 0 16px", fontSize: 13, color: THEME.textMuted }}>
        {desc}
      </p>

      {existing ? (
        <div>
          <video
            src={`${BACKEND_URL}${existing.videoUrl}`}
            controls
            style={{
              width: "100%",
              maxWidth: 420,
              borderRadius: 10,
              border: `1px solid ${THEME.border}`,
            }}
          />
          <div>
            <button
              onClick={handleDelete}
              style={{
                marginTop: 12,
                background: THEME.dangerBg,
                border: `1px solid ${THEME.dangerBorder}`,
                color: THEME.danger,
                borderRadius: 8,
                padding: "8px 16px",
                cursor: "pointer",
                fontSize: 13,
              }}
            >
              Remove Video
            </button>
          </div>
        </div>
      ) : (
        <form
          onSubmit={handleUpload}
          style={{
            display: "flex",
            flexDirection: "column",
            gap: 12,
            maxWidth: 420,
          }}
        >
          <div>
            <label style={labelStyle}>Video File *</label>
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              style={{ ...inputStyle, marginTop: 5, padding: 8 }}
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            style={{
              padding: "9px 18px",
              borderRadius: 8,
              border: "none",
              background: isLoading
                ? "#8A6F2E"
                : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
              color: "#0B0B0C",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
              alignSelf: "flex-start",
            }}
          >
            {isLoading ? "Uploading…" : "Upload Video"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function VideoBannerPage() {
  const dispatch = useDispatch();
  const { videoBanners, isLoading, isError, isSuccess, message } = useSelector(
    (s) => s.banner,
  );

  useEffect(() => {
    dispatch(getVideoBanner());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Video banner saved");
      dispatch(reset());
      dispatch(getVideoBanner());
    }
    if (isError) {
      toast.error(message || "Something went wrong");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  const findBySection = (key) =>
    (videoBanners || []).find((v) => v.section === key) || null;

  return (
    <div
      style={{
        minHeight: "100vh",
        background: THEME.bg,
        color: THEME.text,
        padding: "32px 40px",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      <p style={{ ...labelStyle, margin: 0, color: THEME.gold }}>
        Admin · Content
      </p>
      <h1
        style={{
          margin: "4px 0 4px",
          fontSize: 26,
          fontWeight: 600,
          fontFamily: "'Cormorant Garamond', serif",
        }}
      >
        Home Page Videos
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: THEME.textMuted }}>
        Controls the 3 videos on the Home page — Hero, Style Outlook, and Design
        Your Own. Each section holds one video; upload a new one after removing
        the current one.
      </p>

      <div style={{ maxWidth: 480 }}>
        {SECTIONS.map((s) => (
          <SectionVideoCard
            key={s.key}
            section={s.key}
            title={s.title}
            desc={s.desc}
            existing={findBySection(s.key)}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}
   