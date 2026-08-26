import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";
const API_URL = `${BACKEND_URL}/api/users/profile`;

const getProfile = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.get(API_URL, config)).data;
};

// formData may include: name, lastName, email, gender, dateOfBirth,
// password (only if changing it), profilePicture (file, field name
// must be "profilePicture" — matches multer's uploadProfileImage).
const updateProfile = async (formData, token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (await axios.put(API_URL, formData, config)).data;
};

const deleteProfilePicture = async (token) => {
  const config = { headers: { Authorization: `Bearer ${token}` } };
  return (
    await axios.delete(`${BACKEND_URL}/api/users/profile/picture`, config)
  ).data;
};

export default { getProfile, updateProfile, deleteProfilePicture };
