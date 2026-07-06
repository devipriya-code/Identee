import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = path.join("uploads", "designs");

if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const uniqueName = `design-${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`;
    cb(null, uniqueName);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|svg|webp/;
  const isValid = allowedTypes.test(
    path.extname(file.originalname).toLowerCase(),
  );
  if (isValid) {
    cb(null, true);
  } else {
    cb(new Error("Only image files (jpg, png, svg, webp) are allowed"));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 10 * 1024 * 1024 },
});

const rewritePaths = (req, res, next) => {
  if (req.file) {
    req.file.path = req.file.path.split(path.sep).join("/");
  }
  next();
};

export const uploadDesignFile = [upload.single("design"), rewritePaths];