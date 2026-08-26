// controllers/settingController.js
import asyncHandler from "express-async-handler";
import Setting from "../models/settingModel.js";
import {
  GENERAL_SETTINGS_DEFAULTS,
  CATEGORY,
} from "../utils/settingsDefaults.js";

const MASK = "********";

// Ensures the General Settings defaults exist in the DB. Cheap
// (findOneAndUpdate with upsert per key) and safe to call on every
// request to the admin settings endpoints — only inserts keys that
// don't already exist, never overwrites a saved value.
const ensureGeneralDefaults = async () => {
  await Promise.all(
    GENERAL_SETTINGS_DEFAULTS.map((def) =>
      Setting.findOneAndUpdate(
        { key: def.key },
        { $setOnInsert: { ...def, category: CATEGORY } },
        { upsert: true, new: true },
      ),
    ),
  );
};

// @desc    Public, unauthenticated settings — safe for the storefront
//          (store name, logo, socials, currency, etc.)
// @route   GET /api/settings/public
// @access  Public
export const getPublicSettings = asyncHandler(async (req, res) => {
  await ensureGeneralDefaults();

  const settings = await Setting.find({
    isPublic: true,
    type: { $ne: "secret" },
  })
    .select("key value")
    .lean();

  const map = {};
  settings.forEach((s) => {
    map[s.key] = s.value;
  });
  res.json(map);
});

// @desc    Full settings for the admin panel, optionally filtered by
//          category. Secret-typed values are masked, never returned
//          in full, even to admins — they can only be replaced, not read back.
// @route   GET /api/settings?category=general
// @access  Private/Admin (or Seller, view-only)
export const getSettings = asyncHandler(async (req, res) => {
  await ensureGeneralDefaults();

  const filter = req.query.category ? { category: req.query.category } : {};
  const settings = await Setting.find(filter).lean();

  const result = settings.map((s) => ({
    key: s.key,
    type: s.type,
    category: s.category,
    description: s.description,
    isPublic: s.isPublic,
    updatedAt: s.updatedAt,
    value: s.type === "secret" && s.value ? MASK : s.value,
    hasValue: s.type === "secret" ? !!s.value : undefined,
  }));

  res.json(result);
});

// @desc    Bulk update every setting in one category (one "Save
//          Changes" click on a settings tab). Skips any key sent as
//          the mask placeholder, so re-saving a form that displays
//          "********" for a secret never overwrites the real value
//          with the mask itself.
// @route   PUT /api/settings/bulk
// @access  Private/Admin only (security-sensitive — never seller)
export const updateSettingsBulk = asyncHandler(async (req, res) => {
  const { category, values } = req.body;

  if (!category || typeof values !== "object" || values === null) {
    res.status(400);
    throw new Error("category and values are required");
  }

  const keys = Object.keys(values);
  if (keys.length === 0) {
    res.status(400);
    throw new Error("No settings provided to update");
  }

  const existing = await Setting.find({ category, key: { $in: keys } });
  const existingMap = Object.fromEntries(existing.map((s) => [s.key, s]));

  const updates = [];
  for (const key of keys) {
    const doc = existingMap[key];
    if (!doc) continue; // unknown key for this category — ignore, don't create arbitrary settings via bulk save
    if (doc.type === "secret" && values[key] === MASK) continue; // untouched secret — skip

    doc.value = values[key];
    doc.updatedBy = req.user._id;
    updates.push(doc.save());
  }

  await Promise.all(updates);

  const refreshed = await Setting.find({ category }).lean();
  const responseMap = {};
  refreshed.forEach((s) => {
    responseMap[s.key] = s.type === "secret" && s.value ? MASK : s.value;
  });

  res.json({ message: "Settings updated", category, values: responseMap });
});

// @desc    Update a single setting by key (used for quick toggles,
//          e.g. flipping maintenance mode from a dashboard shortcut).
// @route   PUT /api/settings/:key
// @access  Private/Admin only
export const updateSetting = asyncHandler(async (req, res) => {
  const { key } = req.params;
  const { value } = req.body;

  const setting = await Setting.findOne({ key });
  if (!setting) {
    res.status(404);
    throw new Error("Setting not found");
  }
  if (setting.type === "secret" && value === MASK) {
    return res.json({ key, value: MASK }); // no-op, mask sent back unchanged
  }

  setting.value = value;
  setting.updatedBy = req.user._id;
  await setting.save();

  res.json({
    key: setting.key,
    value: setting.type === "secret" ? MASK : setting.value,
  });
});

// @desc    Store the uploaded settings asset's relative path (logo,
//          favicon). Uses the shared multer/multer.js pipeline
//          (uploadSettingsAsset), same as every other upload in the app.
// @route   PUT /api/settings/upload-asset
// @access  Private/Admin only
export const uploadSettingAsset = asyncHandler(async (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error("No file uploaded");
  }
  res.status(201).json({ path: req.file.path });
});
