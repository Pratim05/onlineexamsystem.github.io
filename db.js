require('dotenv').config()

const mongoose = require('mongoose');

// Replace 'your_student_db_connection_string_here' with the connection string for the 'student' database
const studentDbConnectionString = process.env.StudentDbConnectionString

// Replace 'your_admin_db_connection_string_here' with the connection string for the 'adminDb' database
const adminDbConnectionString = process.env.AdminDbConnectionString

// Replace 'your_admin_db_connection_string_here' with the connection string for the 'adminDb' database
const QuestionDBConnectionString = process.env.QuestionDBConnectionString

// Replace 'your_admin_db_connection_string_here' with the connection string for the 'adminDb' database
const ResultDBConnectionString = process.env.ResultDBConnectionString

// Options for both connections (you can modify these based on your requirements)
const options = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
 
};

// Connect to the 'student' database
const studentDb = mongoose.createConnection(studentDbConnectionString, options);
studentDb.on('error', console.error.bind(console, 'Student database connection error:'));
studentDb.once('open', () => {
  console.log('Connected to student database!');
});

// Connect to the 'adminDb' database
const adminDb = mongoose.createConnection(adminDbConnectionString, options);
adminDb.on('error', console.error.bind(console, 'Admin database connection error:'));
adminDb.once('open', () => {
  console.log('Connected to adminDb database!');
});

// Connect to the 'QuestionDb' database
const QuestionDb = mongoose.createConnection(QuestionDBConnectionString, options);
QuestionDb.on('error', console.error.bind(console, 'QuestionDb database connection error:'));
QuestionDb.once('open', () => {
  console.log('Connected to QuestionDb database!');
});

// Connect to the 'StudentResultDb' database
const StudentResultDb = mongoose.createConnection(ResultDBConnectionString, options);
QuestionDb.on('error', console.error.bind(console, 'StudentResultDb database connection error:'));
QuestionDb.once('open', () => {
  console.log('Connected to StudentResultDb database!');
});





const newSchema = mongoose.Schema({
    username:{
        type : String,
        required : true
    },
    RollNo:{
      type :String,
      required : true
    },
    phNumber:{
        type : String,
        required : true
    },
    email:{
        type : String,
        required : true
    },
    password:{
        type : String,
        required : true
    },
    image: {
      filename: String,
      contentType: String,
      data: Buffer
  }, 
    isValid:{
    type: Boolean,
    default: false, 
  }
  
})

const questionSchema = new mongoose.Schema({
  Exam: {
    Subject: String,
    Subject_code: String,
    Exam_name: String,
    question_type: String,
    No_of_questions: Number,
    Per_Question_time: Number,
  },
  QuestionFile: Object, // You may need to adjust this schema based on your needs
});



const StudentResultSchema = new mongoose.Schema({
 StudentName : String,
 StudentRoll : Number,
 Subject : String,
 Subject_code : String,
 Exam_name: String,
 Total_Marks :Number,
 Obtain_Marks :Number,
 Warnings : Number
});





const StudentModel = studentDb.model('Student', newSchema);
// Perform operations with StudentModel

// Use the 'adminDb' connection for 'adminDb' database operations
const AdminModel = adminDb.model('Admin', newSchema);

// Use the 'QuestionDb' connection for 'Question' database operations
const QuestionModel = QuestionDb.model('questions', questionSchema);

// Use the 'QuestionDb' connection for 'Question' database operations
const StudentResultModel = StudentResultDb.model('StudentResult', StudentResultSchema);

module.exports = {
  StudentModel,
  AdminModel,
  QuestionModel,
  StudentResultModel
}