const checkLogin = document.getElementById('login-text');  

if (checkLogin.innerHTML == "Failed Login! Incorrect Details!") {     
	checkLogin.style.color = "red"; 
} else {     
	checkLogin.style.color = "white"; 
}
