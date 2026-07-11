import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export async function uploadImage(file: File, folder = "images") {
  const filename = `${crypto.randomUUID()}-${file.name}`;

  const storageRef = ref(storage, `${folder}/${filename}`);

  await uploadBytes(storageRef, file);

  return getDownloadURL(storageRef);
}
