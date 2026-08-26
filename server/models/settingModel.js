import mongoose from "mongoose";

// Centralized key/value settings store. One document per setting key,
// grouped by category so the admin UI can fetch/save a whole settings
// tab (e.g. "general") in one request. `type` drives both frontend
// rendering (toggle vs input vs file) and backend masking — "secret"
// values are never returned in full over the API once saved.
const settingSchema = mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    type: {
      type: String,
      enum: ["string", "number", "boolean", "json", "image", "secret"],
      default: "string",
    },
    category: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: "",
    },
    // true => safe to serve from the unauthenticated /public endpoint
    // (store name, logo, socials, currency). Never true for `type: "secret"`.
    isPublic: {
      type: Boolean,
      default: false,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

// Safety net: a secret-typed setting can never be marked public, even
// if someone passes isPublic:true by mistake in a bulk update.
settingSchema.pre("save", function (next) {
  if (this.type === "secret") this.isPublic = false;
  next();
});

const Setting = mongoose.model("Setting", settingSchema);
export default Setting;
