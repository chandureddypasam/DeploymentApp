let mongoose = require("mongoose");
let express = require("express");
let cors = require("cors");
let multer = require("multer");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let dotenv = require("dotenv");
const path = require("path");
dotenv.config();

let app = express();

// ---------- COMMON MIDDLEWARE ----------
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded profile pics (Render compatible)
app.use(
  "/profilePics",
  express.static(path.join(__dirname, "profilePics"))
);

// Serve React build
app.use(express.static(path.join(__dirname, "./client/build")));

// ---------- MULTER CONFIG ----------
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "profilePics");
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage: storage });

// ---------- MONGOOSE SETUP ----------
let studentSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  password: String,
  age: Number,
  mobileNo: Number,
  profilePic: String,
});

let student = new mongoose.model(
  "students",
  studentSchema,
  "2507MERNStudents"
);

let ConctedToMDB = async () => {
  try {
    await mongoose.connect(process.env.MDBURL);
    console.log("Successfully Connected to MDB");
  } catch (err) {
    console.log("Unable to Connected to MDB");
  }
};
ConctedToMDB();

// ---------- ROUTES ----------

// Validate token and get user details
app.post("/validateToken", upload.none(), async (req, res) => {
  try {
    let decryptedCredintials = jwt.verify(req.body.token, "brn");

    let userArr = await student.find({ email: decryptedCredintials.email });

    if (userArr.length === 0) {
      return res.json({ status: "failure", msg: "User Does not exist" });
    }

    let user = userArr[0];

    // password stored as hash → compare using bcrypt
    let isValidPassword = await bcrypt.compare(
      decryptedCredintials.password,
      user.password
    );

    if (!isValidPassword) {
      return res.json({ status: "failure", msg: "Invalid Password" });
    }

    let dataToSend = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      mobileNo: user.mobileNo,
      profilePic: user.profilePic,
    };

    res.json({
      status: "Success",
      msg: "Credintials are correct",
      data: dataToSend,
    });
  } catch (err) {
    res.json({ status: "failure", msg: "Invalid or expired token" });
  }
});

// Login
app.post("/login", upload.none(), async (req, res) => {
  try {
    let userArr = await student.find({ email: req.body.email });

    if (userArr.length === 0) {
      return res.json({ status: "failure", msg: "User Does not exist" });
    }

    let user = userArr[0];

    let isValidPassword = await bcrypt.compare(
      req.body.password,
      user.password
    );

    if (!isValidPassword) {
      return res.json({ status: "failure", msg: "Invalid Password" });
    }

    let token = jwt.sign(
      { email: req.body.email, password: req.body.password },
      "brn"
    );

    let dataToSend = {
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      age: user.age,
      mobileNo: user.mobileNo,
      profilePic: user.profilePic,
      token: token,
    };

    res.json({
      status: "Success",
      msg: "Credintials are correct",
      data: dataToSend,
    });
  } catch (err) {
    res.json({ status: "failure", msg: "Something went wrong in login" });
  }
});

// Signup
app.post("/signup", upload.single("profilePic"), async (req, res) => {
  console.log(req.file);
  console.log(req.body);

  try {
    let hashedPassword = await bcrypt.hash(req.body.password, 10);

    let user = new student({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedPassword,
      age: req.body.age,
      mobileNo: req.body.mobileNo,
      // IMPORTANT: fix slashes for URL
      profilePic: req.file.path.replace(/\\/g, "/"),
    });

    await student.insertMany([user]);
    res.json({ status: "Success", msg: "Account Created Successfully" });
  } catch (err) {
    console.log(err);
    res.json({ status: "Failure", msg: "Unable to create account" });
  }
});

// Update Profile
app.patch("/updateProfile", upload.single("profilePic"), async (req, res) => {
  console.log(req.body);
  try {
    let updateData = {};

    if (req.body.firstName && req.body.firstName.trim().length > 0) {
      updateData.firstName = req.body.firstName;
    }
    if (req.body.lastName && req.body.lastName.trim().length > 0) {
      updateData.lastName = req.body.lastName;
    }
    if (req.body.password && req.body.password.trim().length > 0) {
      // hash new password
      updateData.password = await bcrypt.hash(req.body.password, 10);
    }
    if (req.body.age && req.body.age > 0) {
      updateData.age = req.body.age;
    }
    if (req.body.mobileNo && req.body.mobileNo.trim().length > 0) {
      updateData.mobileNo = req.body.mobileNo;
    }
    if (req.file) {
      updateData.profilePic = req.file.path.replace(/\\/g, "/");
    }

    await student.updateMany({ email: req.body.email }, updateData);

    res.json({ status: "Success", msg: "Updated Successfully" });
  } catch (err) {
    console.log(err);
    res.json({ status: "Failure", msg: "Nothing is updated" });
  }
});

// Delete Profile
app.delete("/deleteProfile", upload.none(), async (req, res) => {
  let delResult = await student.deleteMany({ email: req.body.email });
  if (delResult.deletedCount > 0) {
    res.json({ Status: "Success", msg: "Account deleted Successfully" });
  } else {
    res.json({ Status: "Failure", msg: "Nothing is deleted" });
  }
});

// ---------- REACT FALLBACK (KEEP LAST) ----------
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "client/build/index.html"));
});

// ---------- START SERVER ----------
app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});