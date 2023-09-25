require('dotenv').config()
const mongoose = require('mongoose');
const express = require('express')
const {StudentModel,AdminModel, QuestionModel, StudentResultModel} = require('./db.js')
const { MongoClient } = require('mongodb');

const cors = require('cors')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const cookieParser = require('cookie-parser')
//const multer = require('multer')
const validator = require('validator')
const session = require('express-session')
const fileUpload = require("express-fileupload");
const XLSX = require("xlsx"); // To parse Excel files
const fs = require("fs"); 

const nodemailer = require('nodemailer')

const path = require("path")


const app = express()
app.use(express.static(path.join(__dirname , './client/build')))

app.get('*',function(req,res){
  res.sendFile(path.join(__dirname,'./client/build/index.html'))
})


app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use("*",cors({
    origin:true,
    credentials : true,
}))
app.use(cookieParser())
 
const {hashPassword , comparePassword, authToken, isAuthenticated} = require('./helpers/Auth.js');

app.use(fileUpload());

app.use(session({
  secret: 'L0G0UT', // Change this to a strong, randomly-generated key
  resave: false,
  saveUninitialized: false,
}));


app.use((req,res,next)=>{
  res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
  res.header('Expires', '-1');
  res.header('Pragma', 'no-cache');
  next();
})
app.get('/',cors(),(req,res)=>{
 
})

//Homepage 
app.get('/home', (req,res)=>{
  res.send('home page worked')

})


//login
app.post('/login', async(req,res) =>{
    const {username, RollNo,password} = req.body

    try {
      const user = await StudentModel.findOne({
        $and: [
          { username: username },
          { RollNo: RollNo } 
        ]
      });

        
        if(user){
            // console.log(user.isValid)
            if (!user.isValid) {
              // If user.isValid is false, return a response indicating that the login is not allowed.
              return res.json({message :'Not Valid'});
          }
      
            const match = await comparePassword(password , user.password)
            if(match){

                //Token Generation
                const token = jwt.sign({_id : user._id, email: user.email},process.env.SECRET_KEY)
                

                res.cookie('jwt', token, {
                    expires: new Date(Date.now() + 10), // Set an expiration time (1 hour in this case)
                    httpOnly: true, // Cookie is accessible only by the web server
                    secure: false, // Change to true if using HTTPS
                });
                // console.log(user)
                const userDetails = {
                    name: user.username,
                    RollNo: user.RollNo,
                    mobile : user.phNumber,
                    email: user.email,
                    image : user.image,
                    
                    // Add more properties as needed
                };
                    
                res.json({ message: "exist", user: userDetails });
            
            }else{
                res.json({message:'Wrong Password'})
                //console.log('wrong password')
          
            }
        
        }else{
            res.json({message :'Not exist'})
        }
    } catch (error) {
        res.json('Not exist')
        console.log(error)
    }
})

//signup
//Make Image place for Profile image
// const storage = multer.memoryStorage();
// const upload = multer({storage: storage});

app.post('/signup', async(req , res) =>{
    const {username,RollNo, phNumber, email , password} = req.body
   
    console.log(req.files)

    try {
        const check = await StudentModel.findOne({email:email})
     if(!validator.isEmail(email)){
        res.json('invalid email')
     }else if(!validator.isMobilePhone(phNumber,'en-IN')){
        res.json('invalid Mobile')
     }else{
        if(check){
            res.json("exist")
        } else {

            const hashedPassword = await hashPassword(password)
            
            //  console.log(req.body,req.file)
            const imageFile = req.files.image;
        const imageData = {
          filename: imageFile.name,
          contentType: imageFile.mimetype,
          data: imageFile.data,
        };
              // console.log(imageData)

            const data = {
              username:username,
              RollNo:RollNo,
              phNumber: phNumber,
              email: email,
              password: hashedPassword,
              image : imageData,
              isValid :false
            };
      
            await StudentModel.insertMany([data]);
            console.log('worked')
            res.json('Not_exist');
          }
        }
    } catch (error) {
        console.log(error)
        res.json('error-occured')
    }
})

//admin login
app.post('/Adminlogin', async(req,res) =>{
    const {username,password} = req.body

    try {
        const check = await AdminModel.findOne({username:username , password: password})
        

        if(check){
            res.json("exist")
        }else{
            res.json('Not exist')
        }
    } catch (error) {
        res.json('Not-exist')
        console.log(error)
    }
})


 //Settings for sent mail to student

 const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
      user: 'mernwebdevelopment@gmail.com',
      pass: 'aopoldzvmjufrgwz'
  }
});

 

//Get the all student Data
app.post('/Dashboard', async (req, res) => {

  const {studentId,examId,action} = req.body
  //  console.log(req.body)

   //Get the all student Data
  if (action  === 'studentData'){ 
    try {
      
      // Fetch student data from MongoDB using the StudentModel
      const students = await StudentModel.find();
      res.json(students);
  
  
    } catch (error) {
      console.error('Error fetching student data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  }


  //Fetch all Exam Data
  else if (action  === 'manageExam'){
    try {
      // Connect to the MongoDB using mongoose
      await mongoose.connect('mongodb+srv://pratim592020:PMongooseAdmin5@admin.zrs1b1j.mongodb.net/QuestionPaper?retryWrites=true&w=majority', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
  
      // Fetch Exam data from MongoDB using the StudentModel
      const Exams = await QuestionModel.find();
      res.json(Exams);
  
  
    } catch (error) {
      console.error('Error fetching Exam data:', error);
      res.status(500).json({ error: 'An error occurred' });
    }
  }

 

  //Give Student Permission
  else if (action === 'permission'){
    try {
      // Update the student's Validation status in the database
      await StudentModel.findByIdAndUpdate(studentId, { isValid: true });
    const studentInfo = await StudentModel.findById(studentId)
     //Sending an email
     var mailoptions = {
      from : ' 💻 ONLINE EXAMINATION SYSTEM <mernwebdevelopment@gmail.com>',
      to: studentInfo.email,
      subject :'ADMIN VERIFICATION',
      html : '<h3>Dear Student  👨‍🎓 , Now Your are verified by Admin</h3> <br> <h4>Now You Can Login into Online Examination System</h4>'
     }
     transporter.sendMail(mailoptions,
      function (error , info) {
        if(error){
          console.log(error);
        }else{
          console.log('Email sent : ' + info.response)
        }
      }
      )

      res.json({ message: 'Permission granted successfully' });
    } catch (error) {
      console.error('Error granting permission:', error);
      res.status(500).json({ error: 'An error occurred' });
    }


} 

//Delete student
else  if(action === 'deletestudent'){
    try {
        // Delete the student's data from the database
        await StudentModel.findByIdAndDelete(studentId);
    
        res.json({ message: 'Student data deleted successfully' });
      } catch (error) {
        console.error('Error deleting student data:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
}

//Delete Exam
else if(action === 'deleteExam'){
    try {
      // console.log(examId)
        // Delete the exam's data from the database
        await QuestionModel.findByIdAndDelete(examId);
    
        res.json({ message: 'Exam data deleted successfully' });
      } catch (error) {
        console.error('Error deleting Exam data:', error);
        res.status(500).json({ error: 'An error occurred' });
      }
}
  });






app.post('/Dashboard/create-exam', async (req, res) => {
  try {
    
    // Access the uploaded Excel file
    const excelFile = req.files['Qfile[]'];

    console.log(excelFile);

    // Convert the Excel file to JSON (adjust as needed)
    const workbook = XLSX.read(excelFile.data);
    const sheetName = workbook.SheetNames[0]; 
    const jsonData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // console.log(jsonData);

    // Extract exam data from req.body
    const examData = {
      Subject: req.body['Exam[Subject]'],
      Subject_code: req.body['Exam[Subject_code]'],
      Exam_name: req.body['Exam[Exam_name]'],
      question_type: req.body['Exam[question_type]'],
      No_of_questions: req.body['Exam[No_of_questions]'],
      Per_Question_time: req.body['Exam[Per_Question_time]'],
    };

    // Create an object containing both exam data and the parsed Excel data
    const ExamData = {
      Exam: examData,
      QuestionFile: jsonData,
    };
    // console.log(ExamData)

    // Insert the data into MongoDB
    await QuestionModel.insertMany([ExamData]);

    res.status(201).json({ message: 'Exam data saved successfully.' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error.' });
  }
});


// Exam Name choose from Question Database

app.post('/home/exam_start',async(req,res)=>{

  try {
   

    // Fetch Exam data from MongoDB using the QuestionModel
    const Exams = await QuestionModel.find();
    res.json(Exams);
    
    


  } catch (error) {
    console.error('Error fetching Exam data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }

})

//Show Every Student Result
app.post("/Dashboard/ViewResult",async(req,res)=>{

  const {StudentName,StudentRollNo,action,ExamData,Score,Warnings} = req.body
  // console.log("req from result",req.body)

  if (action == "SaveResult") {
    try {
      const resultIdentifier = {
        StudentName: StudentName,
        StudentRoll: StudentRollNo,
        Subject: ExamData["Subject"],
        Subject_code: ExamData["Subject_code"],
        Exam_name: ExamData["Exam_name"],
        Total_Marks: ExamData["No_of_questions"],
      };
      // console.log("ResultIdentifier", resultIdentifier);

      // Check if a record with the same identifier already exists
      const existingResult = await StudentResultModel.findOne(resultIdentifier);

      if (!existingResult) {
        // If it doesn't exist, save the ResultData
        const ResultData = {
          ...resultIdentifier,
          Obtain_Marks: Score,
          Warnings : Warnings
        };
        await StudentResultModel.create(ResultData);
        res.json("Result saved successfully.");
      } else {
        // If it already exists, log a message indicating that it's a duplicate
        res.json("Result already exists. Not saved.");
      }
    } catch (e) {
      console.log("Error in result saving", e);
    }
  }
  
  else if(action == "ViewResult"){
    try {
   
    // Fetch student  Result data from MongoDB using the StudentResultModel
    const Results = await StudentResultModel.find();
    res.json(Results);


  } catch (error) {
    console.error('Error fetching StudentResultModel  data:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
  }
 

})






 
  

// Start server
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});