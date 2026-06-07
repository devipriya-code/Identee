import bcrypt from "bcryptjs";
import { adminOrSeller } from "../middleware/authMiddleware";

const Users = [
  {
    name: "admin",
    email: "admin@gmail.com",
    password: "$2a$10$MmapIGAhKsm/SnNUNpfC.uKcAiXdUlC3/lBOBvbMui/SeQld.0Z8i",
    // password: "$2a$10$R9e0zByk1KdrYxihSCOzmu0X7aWv8ZDaZ0cFefR6UqYF1q5v0Sd4K",
    isAdmin: true,
    isDelivery: false,
    isSeller:false,
    profilePicture: "/uploads/default.png",
    lastName: "",
    dateOfBirth: null,
    gender: "Male",
    address: {
      doorNo: null,
      street: "",
      nearestLandmark: "",
      city: "",
      state: "",
      pin: null,
      phoneNumber: null,
    },
    orderHistory: [],
    favorites: [],
    cartItems: [],
  },
];
export default Users;
