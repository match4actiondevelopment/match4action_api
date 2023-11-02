import { initializeApp } from "firebase/app";
import {
  getDownloadURL,
  getStorage,
  ref,
  uploadBytesResumable,
} from "firebase/storage";
import { firebaseConfig } from "../config/firebase";
import { giveCurrentDateTime } from "../utils/currentDateTime";

// Initialize Firebase
initializeApp(firebaseConfig);

const storage = getStorage();

interface UploadBusinessInterface {
  folderName: string;
  file: Express.Multer.File;
}

export const uploadBusiness = async ({
  folderName = "files",
  file,
}: UploadBusinessInterface): Promise<{
  success: boolean;
  url?: string;
  message?: string;
}> => {
  try {
    const dateTime = giveCurrentDateTime();
    const storageRef = ref(
      storage,
      `${folderName}/${file?.originalname + "-" + dateTime}`
    );

    //Create file metadata including the content type
    const metadata = {
      contentType: file?.mimetype,
    };

    //Upload the file in the bucket storage
    const snapshot = await uploadBytesResumable(
      storageRef,
      file?.buffer,
      metadata
    );

    const downloadURL = await getDownloadURL(snapshot.ref);

    return {
      success: true,
      url: downloadURL,
    };
  } catch (error) {
    return {
      success: false,
      message: (error as Error).message,
    };
  }
};
