const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const bcrypt = require("bcrypt");
const cors = require('cors');

// const argon2 = require('argon2');
const fs = require("fs");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5001;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

// Middleware to parse JSON
app.use(express.json());
app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname,"../frontend")));



app.get("/ui_page",(req,res)=>{
  res.sendFile(path.join(__dirname,"../frontend/ui_for_osmc.html"));
})


// MongoDB connection
async function connectToMongoDB() {
  try {
    await mongoose.connect(DB_CONNECTION_STRING);
    console.log("MongoDB connected");
    // await insertFeverImages();
    // await insertFeverData(); // Insert fever data after connecting to MongoDB
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

// Read the JSON file containing fever data
const filePath = path.join(__dirname, "feversData.json");
const rawData = fs.readFileSync(filePath);
const feverData = JSON.parse(rawData);

// Define mongoose schema for Fever
const feverSchema = new mongoose.Schema({
  fid: Number,
  fever_type: String,
  Causative_Agent: [String],
  Symptoms: [String],
  vector: [String],
  Complications: [String],
  Treatment: [String],
  allopathy: [String],
  homeopathy: [String],
  ayurvedic: [String],
  imageBase64: String,
});

const Fever = mongoose.model("Fever", feverSchema);

// // Function to insert fever data into the database
// async function insertFeverData() {
//   try {
//     await Fever.insertMany(feverData);
//     console.log("Fever data inserted successfully");
//   } catch (error) {
//     console.error("Error inserting fever data:", error);
//   }
// }

// // Function to read fevers from JSON file, convert images to base64, and insert into MongoDB
// async function insertFeverImages() {
//   try {

//     for (const fever of feverData) {
//       const { fid, imagePath } = fever;

//       // Read the image file as binary data
//       const imagesDirectory = path.join(__dirname, imagePath);
//       const imageData = fs.readFileSync(imagesDirectory);

//       // Convert binary data to base64
//       const imageBase64 = Buffer.from(imageData).toString("base64");

//       // Find the corresponding Fever document by fid
//       const existingFever = await Fever.findOne({ fid });

//       if (existingFever) {
//         // Update the existing Fever document with the imageBase64
//         existingFever.imageBase64 = imageBase64;
//         await existingFever.save();
//         console.log(`Updated base64 image for fever with fid ${fid}`);
//       } else {
//         console.log(`Fever with fid ${fid} not found`);
//       }
//     }

//     console.log("Fever images inserted successfully");
//   } catch (error) {
//     console.error("Error inserting fever images:", error);
//   }
// }



//Define Admin schema
const adminSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Define mongoose schema for User
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  userId: {
    type: String,
    require: true,
  },

  resetToken: String,
  resetTokenExpiration: Date,
  // Add other fields as needed
});

userSchema.pre("save", async function (next) {
  try {
    // Check if the password is modified or this is a new user
    if (!this.isModified("password")) {
      return next();
    }

    // Hash the password
    const saltRounds = 10; // You can adjust the number of salt rounds as needed
    const hashedPassword = await bcrypt.hash(this.password, saltRounds);

    // Replace the plain-text password with the hashed one
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});



const User = mongoose.model("User", userSchema);
const Admin = mongoose.model("Admin", adminSchema);

// async function insertAdminData() {
//   try {
//     // Load admin details from .env file
//     const { ADMIN_EMAIL, ADMIN_PASSWORD } = process.env;

//     // Check if admin details exist
//     if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
//       throw new Error("Admin details are missing in the .env file");
//     }

//     const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 10);
//     // Create admin data object
//     const adminData = new Admin({
//       email: ADMIN_EMAIL,
//       password: hashedPassword, // We'll let the middleware handle hashing
//     });

//     // Save admin data to the database
//     await adminData.save();

//     console.log("Admin data inserted successfully");
//   } catch (error) {
//     console.error("Error inserting admin data:", error);
//   }
// }

// insertAdminData();

// Route handler for signup
app.post("/signup", async (req, res) => {
  try {
    // Extract signup data from request body
    const { name, email, password, userId } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("email already registered");
      return res.status(400).json({ message: "Email already registered" });
    }

    // Create a new user instance
    const newUser = new User({ name, email, password, userId });

    // Save the new user to the database
    await newUser.save();

    // Send success response
    console.log("User signed up successfully:", newUser);
    res
      .status(200)
      .json({ message: "User signed up successfully", user: newUser });
  } catch (err) {
    console.error("Error signing up user:", err);

    // Send error response
    res.status(400).json({ error: err.message });
  }
});

// // Route handler to fetch all admin details
// app.get("/admins", async (req, res) => {
//   try {
//     // Fetch all admins from the database
//     const admins = await Admin.find({});
//     console.log(adminEmail);
//     // Print admin details
//     console.log("Admins:");
//     admins.forEach((admin) => {
//       console.log("Admin Email:", admin.email);
//     });

//     // Send success response with admin details
//     res.status(200).json({ message: "Admin details fetched successfully", admins });
//   } catch (error) {
//     console.error("Error fetching admin details:", error);
//     // Send error response
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

app.get("/fevers", async (req, res) => {
  try {
    console.log("fevers data is called");
    // Fetch all fevers from the database
    const fevers = await Fever.find({}, { _id: 0, __v: 0, imageBase64:0 }); // Exclude _id, __v, and fid fields

    // Send success response
    res.status(200).json(fevers);
  } catch (error) {
    console.error("Error fetching fevers details:", error);
    // Send error response
    res.status(500).json({ error: "Internal server error" });
  }
});

// admin login route
app.post("/adminLogin", async (req, res) => {
  try {
    console.log("Admin login is called");
    const { email, password } = req.body;
    console.log(email);
    // Find admin by email
    const adminDetails = await Admin.findOne({ email });
    if (!adminDetails) {
      console.log(adminDetails);
      return res.status(404).json({ message: "Admin not found" });
    }
    console.log(adminDetails);
    // Check password
    const isPasswordValid = await bcrypt.compare(password, adminDetails.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ adminId: adminDetails._id }, process.env.JWT_SECRET, {
      expiresIn: "20h", // Set expiration to 20 hours
    });

    // Send success response with JWT token
    console.log("Admin login successful", token);
    res.status(200).json({ message: "Admin login successful", token });
  } catch (err) {
    console.error("Error logging in:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
});


// Login routeconst bcrypt = require('bcrypt');

app.post("/Login", async (req, res) => {
  try {
    // console.log("Login is called");
    const { email, password } = req.body;
    // console.log(email);
   
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    console.log(password);
    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
  
    if (!isPasswordValid) {
      // console.log("Password wrong");
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "20h", // Set expiration to 20 hours
    });
    // Send success response with JWT token
    console.log("Login successful", token);
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error logging in:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
});


// Route handler for forgetting password
app.post("/forgetPassword", async (req, res) => {
  try {
    console.log("forget password is called");
    const { email } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Generate password reset token
    const resetToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h", // Set expiration to 1 hour
    });

    // Update user's reset token and expiration
    user.resetToken = resetToken;
    user.resetTokenExpiration = Date.now() + 3600000; // 1 hour
    await user.save();

    // Send password reset email with the reset token
    const transporter = nodemailer.createTransport({
      host: "smtp.mailtrap.io",
      port: 2525,
      auth: {
        user: process.env.MAILTRAP_USER,
        pass: process.env.MAILTRAP_PASS,
      },
    });

    const mailOptions = {
      from: process.env.MAILTRAP_USER,
      to: email,
      subject: "Password Reset",
      html: `
        <p>You requested a password reset. Click this <a href="http://localhost:5000/resetPassword/${resetToken}">link</a> to set a new password.</p>
      `,
    };

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.error("Error sending password reset email:", error);
        return res.status(500).json({ error: "Failed to send email" });
      }
      console.log("Password reset email sent:", info.response);
      res
        .status(200)
        .json({ message: "Password reset email sent successfully" });
    });
  } catch (err) {
    console.error("Error sending password reset email:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler for resetting password
app.patch("/resetPassword", async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    // Find user by reset token and check expiration
    const user = await User.findOne({
      resetToken: token,
      resetTokenExpiration: { $gt: Date.now() },
    });
    if (!user) {
      return res.status(401).json({ message: "Invalid or expired token" });
    }

    // Update user's password
    user.password = newPassword;
    user.resetToken = undefined;
    user.resetTokenExpiration = undefined;
    await user.save();

    res.status(200).json({ message: "Password reset successfully" });
  } catch (err) {
    console.error("Error resetting password:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler for fetching fever details by fid
app.get("/fever_BI/:fid", async (req, res) => {
  try {
    // Extract fid from request parameters
    console.log("fetch fever details based on fid is called");
    const fid = req.params.fid;

    // Find fever details based on fid
    const feverDetails = await Fever.findOne({ fid });

    // Check if fever details exist
    if (!feverDetails) {
      console.log("Fever not found");
      return res.status(404).json({
        message: "Fever details not found for the provided fever id",
      });
    }

    // Send fever details as response
    res
      .status(200)
      .json({ message: "Fever details fetched successfully", feverDetails });
  } catch (error) {
    console.error("Error fetching fever details:", error);
    // Send error response
    res.status(500).json({ error: "Internal server error" });
  }
});



// Route handler for fetching user details
app.get("/userDetails", async (req, res) => {
  try {
    // Extract token from request headers
    console.log("user details is called");
    const token = req.headers.authorization;

    // Check if token is provided
    if (!token) {
      console.log("error token is not there");
      return res.status(401).json({ message: "Access denied. Token not provided" });
    }

    // Verify the token
    jwt.verify(token, process.env.JWT_SECRET, async (err, decoded) => {
      if (err) {
        console.log("ERROR");
        console.error("Error verifying token:", err);
        return res.status(401).json({ message: "Access denied. Invalid token" });
      }

      // Token is valid, extract user ID from decoded token
      const userId = decoded.userId;
      console.log(userId);
      // Find user details based on user ID
      const userDetails = await User.findById(userId);
      console.log(userDetails);
      // Check if user details exist
      if (!userDetails) {
        return res.status(404).json({ message: "User details not found" });
      }

      // Send user details as response
      res.status(200).json({ message: "User details fetched successfully", userDetails });
    });
  } catch (error) {
    console.error("Error fetching user details:", error);
    // Send error response
    res.status(500).json({ error: "Internal server error" });
  }
});


// Middleware function to verify JWT token
function verifyToken(req, res, next) {
  // Get token from the request headers
  const token = req.headers.authorization;

  // Check if token is provided
  if (!token) {
    return res.status(401).json({ message: 'Access denied. Token not provided' });
  }

  // Verify the token
  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      console.error('Error verifying token:', err);
      return res.status(401).json({ message: 'Access denied. Invalid token' });
    }

    // Token is valid, extract decoded data
    req.authData = decoded;
    next();
  });
}


// Route handler for updating username
app.patch("/updateuserName", verifyToken, async (req, res) => {
  try {
    // Extract user details from the request after token verification
    console.log("updateUserName is called");
    const { userId } = req.authData;
    const { newuserName } = req.body;

    // Update username in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { name: newuserName },
      { new: true }
    );

    res.status(200).json({ message: "Username updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating username:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler for updating email
app.patch("/updateuserEmail", verifyToken, async (req, res) => {
  try {
    console.log("updagte User email is called");
    // Extract user details from the request after token verification
    const { userId } = req.authData;
    const { newuserEmail } = req.body;
    console.log(newuserEmail);
    // Update email in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { email: newuserEmail },
      { new: true }
    );

    res.status(200).json({ message: "Email updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating email:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Route handler for updating password
app.patch("/updateuserPassword", verifyToken, async (req, res) => {
  try {
    console.log("updatede user password");
    // Extract user details from the request after token verification
    const { userId } = req.authData;
    const { newuserPassword } = req.body;

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newuserPassword, 10);

    // Update password in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { password: hashedPassword },
      { new: true }
    );

    res.status(200).json({ message: "Password updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Error updating password:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// // Route handler for fetching all user details
// app.get("/users", async (req, res) => {
//   try {
//     // Fetch all users from the database
//     const {email}= 'suguna@gmail.com';
//     const users = await User.findOne({email}); // Exclude password field from response
//     console.log(users);
//     // Send success response with user details
//     res.status(200).json({ message: "User details fetched successfully", users });
//   } catch (error) {
//     console.error("Error fetching user details:", error);
//     // Send error response
//     res.status(500).json({ error: "Internal server error" });
//   }
// });

// Route handler for fetching all users
app.get("/users", async (req, res) => {
  try {
    // Find all user details with projection to include only name, email, and userId
    const users = await User.find({}, { name: 1, email: 1, userId: 1, _id: 0 });

    // Check if any users exist
    if (!users || users.length === 0) {
      return res.status(404).json({ message: "No users found" });
    }

    // Send user details as response
    res.status(200).json(users);
  } catch (error) {
    console.error("Error fetching user details:", error);
    // Send error response
    res.status(500).json({ error: "Internal server error" });
  }
});



app.post("/addFever", async (req, res) => {
  try {
      // Extract fever data from request body
      const feverData = req.body;
      // console.log(feverData);

      // Check if fever data is provided
      if (!feverData) {
          return res.status(400).json({ error: "Fever data not provided" });
      }

      // // Check if fever already exists based on fid or fever_type
      // const existingFever = await Fever.findOne({ $or: [{ fid: feverData.fid }, { fever_type: feverData.fever_type }] });

      // if (existingFever) {
      //   console.log("fever is already existed");
      //     return res.status(400).json({ error: "Fever with the same fid or fever_type already exists" });
      // }

      // Insert fever data into the database
      const newFever = new Fever(feverData);
      await newFever.save();

      // Send success response
      res.status(200).json({ message: "Fever data added successfully", fever: newFever });
  } catch (error) {
      console.error("Error adding fever data:", error);
      // Send error response
      res.status(500).json({ error: "Internal server error" });
  }
});

// // Route handler to serve images
// app.get("/images", async (req, res) => {
//   try {
//     // Extract image name from request parameters

//     // Construct the path to the image file on your server
//     const imagePath = path.join(__dirname, "images/logo.png"); // Assuming images are stored in a directory named "images" within your project directory

//     // Check if the image file exists
//     if (!fs.existsSync(imagePath)) {
//       // If image file not found, send 404 Not Found response
//       return res.status(404).json({ message: "Image not found" });
//     }

//     // Set appropriate headers to indicate that you are serving an image
//     res.setHeader("Content-Type", "image/png"); // Change content type based on your image format

//     // Send the image file as the response
//     res.sendFile(imagePath);
//   } catch (error) {
//     console.error("Error serving image:", error);
//     // Send 500 Internal Server Error response in case of any error
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// // Route handler to serve images of fever by fid
// app.get("/feverImage/:fid", async (req, res) => {
//   try {
//     // Extract fid from request parameters
//     const fid = req.params.fid;

//     // Find fever details based on fid
//     const feverDetails = await Fever.findOne({ fid });

//     // Check if fever details exist
//     if (!feverDetails || !feverDetails.imageBase64) {
//       return res.status(404).json({ message: "Fever image not found" });
//     }

//     // Set appropriate headers to indicate that you are serving an image
//     res.setHeader("Content-Type", "image/png"); // Assuming the image format is PNG, adjust as needed

//     // Send the base64-encoded image data as the response
//     res.send(Buffer.from(feverDetails.imageBase64, "base64"));
//   } catch (error) {
//     console.error("Error serving fever image:", error);
//     // Send 500 Internal Server Error response in case of any error
//     res.status(500).json({ error: "Internal server error" });
//   }
// });



// Route to get all fever images and names
app.get('/feversforUI', async (req, res) => {
  try {
    // Fetch fever data from the database
    console.log("fevers called");
    const feverData = await Fever.find({}, { _id: 0, fever_type: 1, imageBase64: 1, fid: 1 });

    // Format the response
    const response = feverData.map(data => ({
      imagePath: data.imageBase64,
      fever_type: data.fever_type,
      fever_id: data.fid
    }));
    console.log(response.length);
    // Send the response
    res.status(200).json(response);
  } catch (err) {
    console.error('Error fetching fever data:', err);
    res.status(500).json({ error: 'Server error' });
  }
});


app.delete("/deleteFever/:fid", async (req, res) => {
  try {
      const { fid } = req.params;

      // Check if fever exists with the given fid
      const existingFever = await Fever.findOne({ fid });

      if (!existingFever) {
          return res.status(404).json({ error: "Fever not found" });
      }

      // Delete the fever
      await Fever.deleteOne({ fid });

      // Send success response
      res.status(200).json({ message: "Fever deleted successfully" });
  } catch (error) {
      console.error("Error deleting fever:", error);
      // Send error response
      res.status(500).json({ error: "Internal server error" });
  }
});



// Start the server
app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});
