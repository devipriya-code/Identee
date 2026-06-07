import express from "express";
import {sendContactEmail} from "../controlers/contactController.js";

const router = express.Router();

router.post("/send", sendContactEmail);

export default router;
