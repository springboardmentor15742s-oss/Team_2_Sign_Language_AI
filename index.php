<?php

session_start();
include 'db.php';

if(isset($_POST['login']))
{
    $email = $_POST['email'];
    $password = $_POST['password'];

    $sql = "SELECT * FROM users

    WHERE email='$email'

    AND password='$password'";

    $result = mysqli_query($conn,$sql);

    if(mysqli_num_rows($result) > 0)
    {
        $row = mysqli_fetch_assoc($result);

        $_SESSION['fullname']
        = $row['fullname'];

        $_SESSION['email']
        = $row['email'];

        $_SESSION['course']
        = $row['course'];

        header("Location:dashboard.php");
        exit();
    }
    else
    {
        echo "<script>
        alert('Invalid Email or Password');
        </script>";
    }
}

?>

<!DOCTYPE html>
<html>
<head>
<title>Learning Hub Login</title>

<style>

*{
margin:0;
padding:0;
box-sizing:border-box;
font-family:Arial,sans-serif;
}

body{
background:linear-gradient(135deg,#cbb4ff,#e8e1ff);
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
box-shadow:0 10px 25px rgba(0,0,0,0.2);
}

.left{
width:45%;
background:#7b4dff;
color:white;
padding:40px;
display:flex;
flex-direction:column;
justify-content:center;
}

.left h1{
font-size:38px;
margin-bottom:20px;
}

.right{
width:55%;
padding:40px;
}

.right h2{
text-align:center;
margin-bottom:25px;
color:#6a3df0;
}

input{
width:100%;
padding:12px;
margin-bottom:15px;
border:1px solid #ccc;
border-radius:10px;
}

.btn{
width:100%;
padding:12px;
background:#6a3df0;
color:white;
border:none;
border-radius:10px;
cursor:pointer;
font-size:16px;
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
Track progress, manage learning,
and achieve your goals.
</p>

</div>

<div class="right">

<h2>Login</h2>

<form method="POST">

<input
type="email"
name="email"
placeholder="Email Address"
required>

<input
type="password"
name="password"
placeholder="Password"
required>

<button
type="submit"
name="login"
class="btn">

Login

</button>

<button
type="button"
class="google-btn">

Login with Google

</button>

</form>

<div class="link">

New User?

<a href="signup.php">
Create Account
</a>

</div>

</div>

</div>

</body>
</html>