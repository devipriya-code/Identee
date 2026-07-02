import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { getProducts, deleteProduct } from "../../redux/slices/productSlice";
import { toast } from "react-toastify";
import { THEME } from "../../theme/theme";

export default function ProductListPage() {
  const dispatch = useDispatch();
  const { products, isLoading, isError, message } = useSelector(
    (state) => state.product
  );

  useEffect(() => {
    dispatch(getProducts());
  }, [dispatch]);

  const handleDelete = (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    dispatch(deleteProduct(id))
      .unwrap()
      .then(() => toast.success("Product deleted"))
      .catch((err) => toast.error(err || "Delete failed"));
  };

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
      <p style={{ margin: 0, fontSize: 11, fontWeight: 600, letterSpacing: "0.08em", textTransform: "uppercase", color: THEME.gold }}>
        Admin · Catalogue
      </p>
      <h1 style={{ margin: "4px 0 16px", fontSize: 26, fontWeight: 600, fontFamily: "'Cormorant Garamond', serif" }}>
        Product List
      </h1>

      {isLoading && <p style={{ color: THEME.textMuted }}>Loading products…</p>}
      {isError && <p style={{ color: THEME.danger }}>{message}</p>}

      {!isLoading && Array.isArray(products) && products.length === 0 && (
        <p style={{ color: THEME.textMuted }}>
          No products yet. <Link to="/admin/upload-product" style={{ color: THEME.gold }}>Create one</Link>.
        </p>
      )}

      {Array.isArray(products) && products.length > 0 && (
        <div style={{ overflowX: "auto", border: `1px solid ${THEME.border}`, borderRadius: 12 }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: THEME.surface2, textAlign: "left" }}>
                {["Image", "Brand", "SKU", "Color", "Price", "Stock", "Featured", ""].map((h) => (
                  <th key={h} style={{ padding: "10px 14px", color: THEME.textMuted, fontWeight: 600, borderBottom: `1px solid ${THEME.border}` }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p) => {
                const totalStock =
                  p.productdetails?.stockBySize?.reduce((sum, s) => sum + (s.stock || 0), 0) ?? 0;
                return (
                  <tr key={p._id} style={{ borderBottom: `1px solid ${THEME.border}` }}>
                    <td style={{ padding: "10px 14px" }}>
                      <img
                        src={p.images?.[0] ? `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/${p.images[0]}` : ""}
                        alt=""
                        style={{ width: 40, height: 40, objectFit: "cover", borderRadius: 6, background: THEME.surface2 }}
                      />
                    </td>
                    <td style={{ padding: "10px 14px" }}>{p.brandname}</td>
                    <td style={{ padding: "10px 14px", color: THEME.textMuted }}>{p.SKU}</td>
                    <td style={{ padding: "10px 14px" }}>{p.productdetails?.color}</td>
                    <td style={{ padding: "10px 14px", color: THEME.goldBright, fontWeight: 600 }}>₹{p.price}</td>
                    <td style={{ padding: "10px 14px" }}>{totalStock}</td>
                    <td style={{ padding: "10px 14px" }}>{p.isFeatured ? "★" : "—"}</td>
                    <td style={{ padding: "10px 14px" }}>
                      <button
                        onClick={() => handleDelete(p._id, p.brandname)}
                        style={{
                          background: THEME.dangerBg,
                          border: `1px solid ${THEME.dangerBorder}`,
                          color: THEME.danger,
                          borderRadius: 6,
                          padding: "4px 10px",
                          cursor: "pointer",
                          fontSize: 12,
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}