import { Router } from 'express';
import { initializeApp } from 'firebase/app';
import { getDownloadURL, getStorage, ref, uploadBytesResumable } from 'firebase/storage';
import multer from 'multer';
import { firebaseConfig } from '../config/firebase';
import { User } from '../models/User';
import { authGuard } from '../utils/authGuard';

const router: Router = Router();

// Initialize Firebase
initializeApp(firebaseConfig);

const storage = getStorage();

const upload = multer({ storage: multer.memoryStorage() });

interface MulterRequest extends Request {
  file: any;
}

router.post('/', authGuard, upload.single('file'), async (req, res) => {
  try {
    if (!req.body.id) {
      return res.status(404).json({ success: false, message: 'Send a file is mandatory.' });
    }

    if (!req?.file) {
      return res.status(404).json({ success: false, message: 'Send a file is mandatory.' });
    }

    const userLogged = req.user;
    const user = await User.findById(req.body.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found.' });
    }

    if (userLogged?._id?.toString() !== user?._id?.toString()) {
      return res.status(401).json({ success: false, message: 'Unauthorized! Access Token invalid!' });
    }

    const folderName = req.body.folderName ?? 'files';
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(storage, `${folderName}/${req?.file?.originalname + '-' + dateTime}`);

    //Create file metadata including the content type
    const metadata = {
      contentType: req?.file?.mimetype,
    };

    //Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(storageRef, req?.file?.buffer, metadata);

    const downloadURL = await getDownloadURL(snapshot.ref);

    if (!downloadURL) {
      return res.status(404).json({ success: false, message: 'Error uploading image.' });
    }

    res.status(200).json({ success: true, data: downloadURL });
  } catch (error) {
    res.status(404);
  }
});

export { router as uploadRouter };

const giveCurrentDateTime = () => {
  const today = new Date();
  const date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDay();
  const time = today.getHours() + ':' + today.getMinutes() + ':' + today.getSeconds();
  const dateTime = date + '-' + time;
  return dateTime;
};
