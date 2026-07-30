<?php

$conn = mysqli_connect(
    "localhost",
    "root",
    "",
    "learning_hub"
);

if(!$conn)
{
    die("Connection Failed: " . mysqli_connect_error());
}

?>