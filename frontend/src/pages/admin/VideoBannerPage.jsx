import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import { getProducts } from "../../redux/slices/productSlice";
import { getVideoBanner, addVideoBanner, deleteVideoBanner, reset } from "../../redux/slices/bannerSlice";
import { THEME, inputStyle, labelStyle } from "../../theme/theme";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function VideoBannerPage() {
  const dispatch = useDispatch();
  const { products } = useSelector((s) => s.product);
  const { videoBanner, isLoading, isError, isSuccess, message } = useSelector((s) => s.banner);
  const [productId, setProductId] = useState("");
  const [file, setFile] = useState(null);

  useEffect(() => {
    dispatch(getProducts());
    dispatch(getVideoBanner());
    return () => dispatch(reset());
  }, [dispatch]);

  useEffect(() => {
    if (isSuccess) {
      toast.success("Video banner uploaded");
      setFile(null);
      setProductId("");
      dispatch(reset());
    }
    if (isError) {
      toast.error(message || "Upload failed");
      dispatch(reset());
    }
  }, [isSuccess, isError, message, dispatch]);

  const handleUpload = (e) => {
    e.preventDefault();
    if (!productId) return toast.error("Select a product first");
    if (!file) return toast.error("Choose a video file");

    const formData = new FormData();
    formData.append("productId", productId);
    formData.append("video", file);
    dispatch(addVideoBanner(formData));
  };

  const handleDelete = () => {
    if (!videoBanner?._id) return;
    if (!window.confirm("Remove the current home page video?")) return;
    dispatch(deleteVideoBanner(videoBanner._id))
      .unwrap()
      .then(() => toast.success("Video removed"))
      .catch((err) => toast.error(err || "Delete failed"));
  };

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.text, padding: "32px 40px", fontFamily: "'Inter', sans-serif" }}>
      <p style={{ ...labelStyle, margin: 0, color: THEME.gold }}>Admin · Content</p>
      <h1 style={{ margin: "4px 0 4px", fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>
        Home Page Video
      </h1>
      <p style={{ margin: "0 0 24px", fontSize: 14, color: THEME.textMuted }}>
        Controls the hero video on the Home page. Only one video can be live at a time — upload a new one after deleting the current one.
      </p>

      {videoBanner ? (
        <div style={{ maxWidth: 480 }}>
          <video
            src={`${BACKEND_URL}${videoBanner.videoUrl}`}
            controls
            style={{ width: "100%", borderRadius: 12, border: `1px solid ${THEME.border}` }}
          />
          <button
            onClick={handleDelete}
            style={{
              marginTop: 14,
              background: THEME.dangerBg,
              border: `1px solid ${THEME.dangerBorder}`,
              color: THEME.danger,
              borderRadius: 8,
              padding: "9px 18px",
              cursor: "pointer",
            }}
          >
            Remove Video
          </button>
        </div>
      ) : (
        <form onSubmit={handleUpload} style={{ maxWidth: 480, display: "flex", flexDirection: "column", gap: 14 }}>
          <div>
            <label style={labelStyle}>Attach to Product *</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)} style={{ ...inputStyle, marginTop: 5 }}>
              <option value="">Select a product…</option>
              {Array.isArray(products) &&
                products.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.brandname} — {p.productdetails?.color} ({p.SKU})
                  </option>
                ))}
            </select>
          </div>
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
              padding: "10px 20px",
              borderRadius: 8,
              border: "none",
              background: isLoading ? "#8A6F2E" : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
              color: "#0B0B0C",
              fontWeight: 700,
              cursor: isLoading ? "not-allowed" : "pointer",
            }}
          >
            {isLoading ? "Uploading…" : "Upload Video"}
          </button>
        </form>
      )}
    </div>
  );
}