import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "react-toastify";
import {
  getAllCategoryBanners,
  upsertCategoryBanner,
  deleteCategoryBanner,
  reset,
} from "../../redux/slices/categoryBannerSlice";
import { THEME, SIZE_CHARTS, labelStyle, inputStyle } from "../../theme/theme";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const GARMENT_STYLES = Object.keys(SIZE_CHARTS);

function CategoryCard({ category, banner, onUpload, onDelete, isLoading }) {
  const inputId = `cat-banner-${category.replace(/\s+/g, "-")}`;

  return (
    <div
      style={{
        border: `1px solid ${THEME.border}`,
        borderRadius: 12,
        padding: 16,
        background: THEME.surface,
      }}
    >
      <p style={{ margin: "0 0 10px", fontSize: 14, fontWeight: 700, color: THEME.text }}>
        {category}
      </p>

      <div
        style={{
          width: "100%",
          aspectRatio: "16/9",
          borderRadius: 8,
          overflow: "hidden",
          background: THEME.surface2,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        {banner?.image ? (
          <img
            src={`${BACKEND_URL}${banner.image}`}
            alt={category}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
          />
        ) : (
          <span style={{ fontSize: 12, color: THEME.textMuted }}>No banner uploaded</span>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        style={{ display: "none" }}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(category, file);
          e.target.value = "";
        }}
      />

      <div style={{ display: "flex", gap: 8 }}>
        <label
          htmlFor={inputId}
          style={{
            flex: 1,
            textAlign: "center",
            padding: "8px 0",
            borderRadius: 6,
            background: isLoading ? "#8A6F2E" : `linear-gradient(135deg, ${THEME.gold}, ${THEME.goldBright})`,
            color: "#0B0B0C",
            fontWeight: 700,
            fontSize: 12,
            cursor: isLoading ? "not-allowed" : "pointer",
          }}
        >
          {banner?.image ? "Replace" : "Upload"}
        </label>
        {banner?.image && (
          <button
            onClick={() => onDelete(category)}
            style={{
              padding: "8px 14px",
              borderRadius: 6,
              border: `1px solid ${THEME.dangerBorder}`,
              background: THEME.dangerBg,
              color: THEME.danger,
              cursor: "pointer",
              fontSize: 12,
            }}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default function CategoryBannerPage() {
  const dispatch = useDispatch();
  const { banners, isLoading, isError, message } = useSelector((s) => s.categoryBanner);
  const [newCategory, setNewCategory] = useState("");
  // Categories the admin has typed in but not yet uploaded an image for.
  // Kept in local state so the card shows up immediately on "+ Add".
  const [pendingCategories, setPendingCategories] = useState([]);

  useEffect(() => {
    dispatch(getAllCategoryBanners());
    return () => dispatch(reset());
  }, [dispatch]);

  const bannerFor = (category) => banners.find((b) => b.category === category);

  // Once a pending category actually gets a banner saved in the DB,
  // it will appear in `banners` — drop it from the pending list then.
  useEffect(() => {
    setPendingCategories((prev) => prev.filter((c) => !bannerFor(c)));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [banners]);

  const handleUpload = (category, file) => {
    const formData = new FormData();
    formData.append("category", category);
    formData.append("image", file);
    dispatch(upsertCategoryBanner(formData))
      .unwrap()
      .then(() => toast.success(`${category} banner uploaded`))
      .catch((err) => toast.error(err || "Upload failed"));
  };

  const handleDelete = (category) => {
    if (!window.confirm(`Delete banner for ${category}?`)) return;
    dispatch(deleteCategoryBanner(category))
      .unwrap()
      .then(() => toast.success(`${category} banner deleted`))
      .catch((err) => toast.error(err || "Delete failed"));
  };

  const savedCategories = banners.map((b) => b.category);
  const extraCategories = savedCategories.filter((c) => !GARMENT_STYLES.includes(c));

  const allCategories = [
    ...GARMENT_STYLES,
    ...extraCategories,
    ...pendingCategories.filter(
      (c) => !GARMENT_STYLES.includes(c) && !extraCategories.includes(c),
    ),
  ];

  const handleAddCategory = (e) => {
    e.preventDefault();
    const name = newCategory.trim();
    if (!name) return;
    if (allCategories.includes(name)) {
      toast.error("Category already exists");
      return;
    }
    setPendingCategories((prev) => [...prev, name]);
    setNewCategory("");
    toast.info(`"${name}" added below — upload a banner image to save it`);
  };

  return (
    <div style={{ minHeight: "100vh", background: THEME.bg, color: THEME.text, padding: "32px 40px", fontFamily: "'Inter', sans-serif" }}>
      <p style={{ ...labelStyle, margin: 0, color: THEME.gold }}>Admin · Content</p>
      <h1 style={{ margin: "4px 0 4px", fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>
        Category Banners
      </h1>
      <p style={{ margin: "0 0 20px", fontSize: 14, color: THEME.textMuted }}>
        One banner image per garment category. These power the Home page category grid and link to that category's product listing.
      </p>

      <form onSubmit={handleAddCategory} style={{ display: "flex", gap: 10, marginBottom: 24, maxWidth: 420 }}>
        <input
          value={newCategory}
          onChange={(e) => setNewCategory(e.target.value)}
          placeholder="Add a new category (e.g. Denim Jackets)"
          style={{ ...inputStyle, flex: 1 }}
        />
        <button
          type="submit"
          style={{
            padding: "0 16px",
            borderRadius: 8,
            border: `1px dashed ${THEME.gold}`,
            background: "transparent",
            color: THEME.goldBright,
            fontWeight: 600,
            cursor: "pointer",
            fontSize: 13,
          }}
        >
          + Add
        </button>
      </form>

      {isError && <p style={{ color: THEME.danger }}>{message}</p>}

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
        {allCategories.map((category) => (
          <CategoryCard
            key={category}
            category={category}
            banner={bannerFor(category)}
            onUpload={handleUpload}
            onDelete={handleDelete}
            isLoading={isLoading}
          />
        ))}
      </div>
    </div>
  );
}