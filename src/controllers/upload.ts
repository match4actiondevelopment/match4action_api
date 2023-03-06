import { Request, Response } from "express";
import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { firebaseConfig } from "../config/firebase";
import { User } from "../models/User";

// Initialize Firebase
initializeApp(firebaseConfig);

const storage = getStorage();

export class UploadController {
  async create(
    req: Request,
    res: Response
  ): Promise<{ success: boolean; data?: string | null; message?: string }> {
    try {
      if (!req?.body?.id) {
        return { success: false, message: "User Id field is mandatory." };
      }

      if (!req?.file) {
        return { success: false, message: "File field is mandatory." };
      }

      const userLogged = req.user;
      const user = await User.findById(req.body.id);

      if (!user) {
        return { success: false, message: "User not found." };
      }

      if (userLogged?._id?.toString() !== user?._id?.toString()) {
        return {
          success: false,
          message: "Unauthorized! Access Token invalid!",
        };
      }

      const folderName = req.body.folderName ?? "files";

      const dateTime = giveCurrentDateTime();
      const storageRef = ref(
        storage,
        `${folderName}/${req?.file?.originalname + "-" + dateTime}`
      );

      //Create file metadata including the content type
      const metadata = {
        contentType: req?.file?.mimetype,
      };

      //Upload the file in the bucket storage
      const snapshot = await uploadBytesResumable(
        storageRef,
        req?.file?.buffer,
        metadata
      );

      const downloadURL = await getDownloadURL(snapshot.ref);

      if (!downloadURL) {
        return { success: false, message: "Error uploading image." };
      }

      return { success: true, data: downloadURL };
    } catch (error) {
      return { success: false, data: null, message: "Error." };
    }
  }
}

const giveCurrentDateTime = () => {
  const today = new Date();
  const date =
    today.getFullYear() + "-" + (today.getMonth() + 1) + "-" + today.getDay();
  const time =
    today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
  const dateTime = date + "-" + time;
  return dateTime;
};
