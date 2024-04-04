// const express = require("express");
// const jwt = require("jsonwebtoken");
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const bcrypt = require("bcrypt");
// require("dotenv").config();

// const app = express();
// const PORT = process.env.PORT || 5000;
// const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

// // Middleware to parse JSON
// app.use(express.json());
// app.use(bodyParser.urlencoded({ extended: true }));
// app.use(bodyParser.json());

// // MongoDB connection
// async function connectToMongoDB() {
//   try {
//     await mongoose.connect(DB_CONNECTION_STRING);
//     console.log("MongoDB connected");
//   } catch (error) {
//     console.error("Error connecting to MongoDB:", error);
//   }
// }

// // Define mongoose schema for User
// const userSchema = new mongoose.Schema({
//   name: {
//     type: String,
//     required: true,
//   },
//   email: {
//     type: String,
//     required: true,
//     unique: true,
//   },
//   password: {
//     type: String,
//     required: true,
//   },
//   userId: {
//     type: String,
//   },
//   // Add other fields as needed
// });

// // Middleware to hash the password before saving
// userSchema.pre("save", async function (next) {
//   try {
//     // Check if the password is modified or this is a new user
//     if (!this.isModified("password")) {
//       return next();
//     }

//     // Hash the password
//     const hashedPassword = await bcrypt.hash(this.password, 10);

//     // Replace the plain-text password with the hashed one
//     this.password = hashedPassword;
//     next();
//   } catch (error) {
//     next(error);
//   }
// });

// const User = mongoose.model("User", userSchema);

// // Route handler for signup
// app.post("/signup", async (req, res) => {
//   try {
//     // Extract signup data from request body
//     const { name, email, password, userId } = req.body;

//     // Check if the email is already registered
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       console.log("email already registered");
//       return res.status(200).json({ message: "Email already registered" });
//     }

//     // Create a new user instance
//     const newUser = new User({ name, email, password, userId });

//     // Save the new user to the database
//     await newUser.save();

//     // Send success response
//     console.log("User signed up successfully:", newUser);
//     res
//       .status(200)
//       .json({ message: "User signed up successfully", user: newUser });
//   } catch (err) {
//     console.error("Error signing up user:", err);

//     // Send error response
//     res.status(400).json({ error: err.message });
//   }
// });

// // Login route
// app.post("/login", async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Find user by email
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//     // Check password
//     const isPasswordValid = await bcrypt.compare(password, user.password);
//     if (!isPasswordValid) {
//       return res.status(401).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT token
//     const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
//       expiresIn: "20h", // Set expiration to 20 hours
//     });
//     // Send success response with JWT token
//     console.log("Login successful");
//     res.status(200).json({ message: "Login successful", token });
//   } catch (err) {
//     console.error("Error logging in:", err);
//     res
//       .status(500)
//       .json({ error: "Internal server error", message: err.message });
//   }
// });

// app.get("/userDetails", (req, res) => {
//   res.status(200).json();
// });

// // Start the server
// app.listen(PORT, async () => {
//   await connectToMongoDB();
//   console.log(`Server is running on port ${PORT}`);
// });

const express = require("express");
const jwt = require("jsonwebtoken");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;
const DB_CONNECTION_STRING = process.env.DB_CONNECTION_STRING;

// Middleware to parse JSON
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// MongoDB connection
async function connectToMongoDB() {
  try {
    await mongoose.connect(DB_CONNECTION_STRING);
    console.log("MongoDB connected");
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}

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
  },
  // Add other fields as needed
});

// Middleware to hash the password before saving
userSchema.pre("save", async function (next) {
  try {
    // Check if the password is modified or this is a new user
    if (!this.isModified("password")) {
      return next();
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(this.password, 10);

    // Replace the plain-text password with the hashed one
    this.password = hashedPassword;
    next();
  } catch (error) {
    next(error);
  }
});

const User = mongoose.model("User", userSchema);

// Route handler for signup
app.post("/signup", async (req, res) => {
  try {
    // Extract signup data from request body
    const { name, email, password, userId } = req.body;

    // Check if the email is already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("email already registered");
      return res.status(200).json({ message: "Email already registered" });
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

// Login route
app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user.userId }, process.env.JWT_SECRET, {
      expiresIn: "20h", // Set expiration to 20 hours
    });
    // Send success response with JWT token
    console.log("Login successful");
    res.status(200).json({ message: "Login successful", token });
  } catch (err) {
    console.error("Error logging in:", err);
    res
      .status(500)
      .json({ error: "Internal server error", message: err.message });
  }
});

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const token = req.headers["authorization"];
  if (!token) {
    return res.status(403).json({ message: "Token is required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.userId = decoded.userId;
    next();
  });
}

// Route to fetch user details
app.get("/userDetails", verifyToken, (req, res) => {
  // Here you can fetch user details based on req.userId
  // Return user details in response
  res.status(200).json({ userId: req.userId });
});

// Start the server
app.listen(PORT, async () => {
  await connectToMongoDB();
  console.log(`Server is running on port ${PORT}`);
});

// Read the JSON file containing fever data
const filePath = path.join(__dirname, "feversData.json");
const rawData = fs.readFileSync(filePath);
const feverData = JSON.parse(rawData);

// Define mongoose schema for Fever
const feverSchema = new mongoose.Schema({
  fever_type: String,
  Causative_Agent: [String],
  Symptoms: [String],
  vector: [String],
  Complications: [String],
  Treatment: [String],
  allopathy: [String],
  homeopathy: [String],
  ayurvedic: [String],
});

const Fever = mongoose.model("Fever", feverSchema);

async function insertFeverData() {
  try {
    await Fever.insertMany(feverData);
    console.log("Fever data inserted successfully");
  } catch (error) {
    console.error("Error inserting fever data:", error);
  }
}
