const hamburger = document.getElementsByClassName('hamburger')[0] 
const showDesktop = document.getElementsByClassName('show-desktop')[0]  

hamburger.addEventListener('click', () => {     
	showDesktop.classList.toggle('active') 
})
