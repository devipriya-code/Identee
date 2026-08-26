import mongoose from "mongoose";

/**
 * Standalone video banner — NOT linked to a product anymore.
 * One document per "section". Sections are fixed to the 3 spots
 * on the Home page that need an admin-editable video:
 *   - hero          -> full-screen hero video at the top of Home
 *   - styleOutlook  -> big video in the "Style Outlook" section
 *   - designYourOwn -> video in the yellow "Design Your Own" section
 *
 * `section` is unique, so there can only ever be ONE live video per
 * section (uploading again for the same section replaces it).
 */
const videoBannerSchema = mongoose.Schema(
  {
    section: {
      type: String,
      required: true,
      enum: [
        "hero",
        "styleOutlookMain",
        "styleOutlookSide1",
        "styleOutlookSide2",
        "designYourOwn",
      ],
      unique: true,
    },
    videoUrl: {
      type: String,
      required: true,
    },
  },
  { timestamps: true },
);

const VideoBanner = mongoose.model("VideoBanner", videoBannerSchema);

export default VideoBanner;
