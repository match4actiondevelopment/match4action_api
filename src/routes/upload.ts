import { Router } from "express";
import { UploadController } from "../controllers/upload";
import { verifyToken } from "../middleware/jwt";
import { multerUpload } from "../utils/multer";

const router: Router = Router();

const uploadController = new UploadController();

router.post("/", verifyToken, multerUpload.single("file"), async (req, res) => {
  try {
    const response = await uploadController.create(req, res);

    if (!response?.success) {
      res.status(404).json({ success: false, message: response?.message });
    }

    res.status(200).json({ success: true, data: response?.data });
  } catch (error) {
    res.status(404);
  }
});

export { router as uploadRouter };
