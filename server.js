let mongoose = require("mongoose");
let express = require("express");
let cors = require("cors");
let multer = require("multer");
let jwt = require("jsonwebtoken");
let bcrypt = require("bcrypt");
let dotenv = require("dotenv")

dotenv.config()

let app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded());
app.use('/profilePics', express.static('profilePics'));

const path = require("path");

app.use(express.static(path.join(__dirname,"./client/build")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "./client/build/index.html"));
});


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    console.log(req.file);
    cb(null, 'profilePics');
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// Validate Token
app.post("/validateToken", upload.none(), async (req, res) => {
  console.log(req.body);

  let decryptedCredintials = jwt.verify(req.body.token, "brn");
  console.log(decryptedCredintials);

  let userArr = await student.find().and([{ email: decryptedCredintials.email }]);

  if (userArr.length > 0) {

    if (userArr[0].password === decryptedCredintials.password) {

      let dataToSend = {
        firstName: userArr[0].firstName,
        lastName: userArr[0].lastName,
        email: userArr[0].email,
        age: userArr[0].age,
        mobileNo: userArr[0].mobileNo,
        profilePic: userArr[0].profilePic,
      };

      res.json({ status: "Success", msg: "Credintials are correct", data: dataToSend });

    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }

  } else {
    res.json({ status: "failure", msg: "User Does not exist" });
  }
});

app.post("/login", upload.none(), async (req, res) => {

  console.log(req.body);

  let userArr = await student.find().and([{ email: req.body.email }]);
  let token = jwt.sign({ email: req.body.email, password: req.body.password }, "brn");

  let validPassword = await bcrypt.compare(req.body.password, userArr[0].password);

  if (userArr.length > 0) {

    if (validPassword === true) {

      let dataToSend = {
        firstName: userArr[0].firstName,
        lastName: userArr[0].lastName,
        email: userArr[0].email,
        age: userArr[0].age,
        mobileNo: userArr[0].mobileNo,
        profilePic: userArr[0].profilePic,
        token: token
      };

      res.json({ status: "Success", msg: "Credintials are correct", data: dataToSend });

    } else {
      res.json({ status: "failure", msg: "Invalid Password" });
    }

  } else {
    res.json({ status: "failure", msg: "User Does not exist" });
  }
});

// Signup
app.post("/signup", upload.single("profilePic"), async (req, res) => {

  console.log(req.file);
  console.log(req.body);

  let hashedpassword = await bcrypt.hash(req.body.password, 10);

  try {
    let user = new student({
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      password: hashedpassword,
      age: req.body.age,
      mobileNo: req.body.mobileNo,
      profilePic: req.file.path
    });

    await student.insertMany([user]);

    res.json({ status: "Success", msg: "Account Created Successfully" });

  } catch (err) {
    res.json({ status: "Failure", msg: "Unable to create account" });
  }
});


// Update Profile
app.patch("/updateProfile", upload.single("profilePic"), async (req, res) => {

  console.log(req.body);

  try {

    if (req.body.firstName.trim().length > 0) {
      await student.updateMany({ email: req.body.email }, { firstName: req.body.firstName });
    }
    if (req.body.lastName.trim().length > 0) {
      await student.updateMany({ email: req.body.email }, { lastName: req.body.lastName });
    }
    if (req.body.password.trim().length > 0) {
      await student.updateMany({ email: req.body.email }, { password: req.body.password });
    }
    if (req.body.age > 0) {
      await student.updateMany({ email: req.body.email }, { age: req.body.age });
    }
    if (req.body.mobileNo.trim().length > 0) {
      await student.updateMany({ email: req.body.email }, { mobileNo: req.body.mobileNo });
    }
    if (req.file) {
      await student.updateMany({ email: req.body.email }, { profilePic: req.file.path });
    }

    res.json({ status: "Success", msg: "Updated Successfully" });

  } catch (err) {
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


app.listen(process.env.PORT, () => {
  console.log(`Listening to port ${process.env.PORT}`);
});



let studentSchema = new mongoose.Schema({
    firstName:String,
    lastName:String,
    email:String,
    password:String,
    age:Number,
    mobileNo:Number,
    profilePic:String

});

let student = new mongoose.model("Student", studentSchema, "2507NewBatch");
let ConctedToMDB = async()=>{
    try{
         await mongoose.connect(process.env.MDBURL);
         console.log("Successfully Connected to MDB");
         

    }catch(err){
        console.log("Unable to Connected to MDB");

    }
  
}
ConctedToMDB();