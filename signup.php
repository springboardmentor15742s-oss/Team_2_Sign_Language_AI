<?php
include 'db.php';

if(isset($_POST['signup']))
{
    $fullname = $_POST['fullname'];
    $email = $_POST['email'];
    $phone = $_POST['phone'];
    $course = $_POST['course'];
    $password = $_POST['password'];

    $check = mysqli_query($conn,"SELECT * FROM users WHERE email='$email'");

    if(mysqli_num_rows($check) > 0)
    {
        echo "<script>alert('Email already exists');</script>";
    }
    else
    {
        $sql = "INSERT INTO users(fullname,email,phone,course,password)
                VALUES('$fullname','$email','$phone','$course','$password')";

        if(mysqli_query($conn,$sql))
        {
            echo "<script>
                    alert('Registration Successful');
                    window.location='index.php';
                  </script>";
        }
    }
}
?>

<!DOCTYPE html>
<html>
<head>
<title>Learning Hub - Sign Up</title>

<style>

*{
    margin:0;
    padding:0;
    box-sizing:border-box;
    font-family:Arial,sans-serif;
}

body{
    background:linear-gradient(135deg,#cbb4ff,#f0e8ff);
    height:100vh;
    display:flex;
    justify-content:center;
    align-items:center;
}

.container{
    width:900px;
    background:white;
    display:flex;
    border-radius:20px;
    overflow:hidden;
    box-shadow:0 10px 25px rgba(0,0,0,0.15);
}

.left{
    width:40%;
    background:linear-gradient(135deg,#7b4dff,#a57cff);
    color:white;
    padding:40px;
    display:flex;
    flex-direction:column;
    justify-content:center;
}

.left h1{
    font-size:40px;
    margin-bottom:20px;
}

.left p{
    line-height:1.8;
    font-size:17px;
}

.right{
    width:60%;
    padding:40px;
}

.right h2{
    text-align:center;
    color:#6a3df0;
    margin-bottom:25px;
}

input,
select{
    width:100%;
    padding:12px;
    margin-bottom:15px;
    border:1px solid #ccc;
    border-radius:10px;
    font-size:15px;
}

.btn{
    width:100%;
    padding:12px;
    background:#6a3df0;
    color:white;
    border:none;
    border-radius:10px;
    font-size:16px;
    cursor:pointer;
}

.btn:hover{
    background:#5930d8;
}

.google-btn{
    width:100%;
    padding:12px;
    margin-top:10px;
    background:#db4437;
    color:white;
    border:none;
    border-radius:10px;
    cursor:pointer;
}

.google-btn:hover{
    background:#c23321;
}

.link{
    text-align:center;
    margin-top:15px;
}

.link a{
    text-decoration:none;
    color:#6a3df0;
    font-weight:bold;
}

</style>

</head>

<body>

<div class="container">

    <div class="left">
        <h1>Learning Hub</h1>

        <p>
            Create your learner account and start your learning journey.
            Track progress, complete lessons and improve your skills.
        </p>
    </div>

    <div class="right">

        <h2>Create Account</h2>

        <form method="POST" autocomplete="off">

            <input
            type="text"
            name="fullname"
            placeholder="Full Name"
            autocomplete="off"
            required>

            <input
            type="email"
            name="email"
            placeholder="Email Address"
            autocomplete="off"
            required>

            <input
            type="text"
            name="phone"
            placeholder="Phone Number"
            autocomplete="off"
            required>

            <select name="course" required>
                <option value="">Select Learning Level</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Expert">Expert</option>
            </select>

            <input
            type="password"
            name="password"
            placeholder="Create Password"
            autocomplete="new-password"
            required>

            <button
            type="submit"
            name="signup"
            class="btn">
                Create Account
            </button>

            <button
            type="button"
            class="google-btn">
                Continue with Google
            </button>

        </form>

        <div class="link">
            Already have an account?
            <a href="index.php">Login</a>
        </div>

    </div>

</div>

</body>
</html>