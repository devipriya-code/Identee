// routes/enquiryRoutes.js
// ─────────────────────────────────────────────────────────────
// Validation rules (express-validator) + controller binding.
//
// Mount in server.js / app.js:
//   const enquiryRoutes = require("./routes/enquiryRoutes");
//   app.use("/api/enquiry", enquiryRoutes);
// ─────────────────────────────────────────────────────────────

import express from "express";
import { body } from "express-validator";
import {
  bulkEnquiry,
  internationalEnquiry,
} from "../controlers/Enquirycontroller.js";

const router = express.Router();

// ── Shared validation chains ──────────────────────────────────
const commonRules = [
  body("firstName").trim().notEmpty().withMessage("First name is required."),
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("A valid email address is required."),
  body("phone").trim().notEmpty().withMessage("Phone number is required."),
];

// ════════════════════════════════════════════════════════════
//  POST /api/enquiry/bulk
// ════════════════════════════════════════════════════════════
router.post(
  "/bulk",
  [
    ...commonRules,
    body("preferredTime")
      .notEmpty()
      .withMessage("Preferred call time is required."),
    // Optional fields — sanitise only
    body("gender").optional().trim(),
    body("dobMM").optional().trim(),
    body("dobDD").optional().trim(),
    body("dobYYYY").optional().trim(),
    body("companyName").optional().trim(),
    body("message").optional().trim(),
  ],
  bulkEnquiry,
);

// ════════════════════════════════════════════════════════════
//  POST /api/enquiry/international
// ════════════════════════════════════════════════════════════
router.post(
  "/international",
  [
    ...commonRules,
    body("dobMM").notEmpty().withMessage("Birth month is required."),
    body("dobDD").notEmpty().withMessage("Birth day is required."),
    body("dobYYYY").notEmpty().withMessage("Birth year is required."),
    body("gender").notEmpty().withMessage("Gender is required."),
  ],
  internationalEnquiry,
);

export default router;
