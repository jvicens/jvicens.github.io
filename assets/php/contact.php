<?php $name = $_POST['name']; 
$email = $_POST['email'];
$message = $_POST['message'];
$formcontent="From: $name \n Message: $message";
$recipient = "julianvicens@gmail.com";
$subject = "[Contact Web]";
$mailheader = "From: $email \r\n";
console.log($name)
console.log('Sending')
mail($recipient, $subject, $formcontent, $mailheader) or die("Error!");
echo "Thank You!";
console.log('Sended')
?>