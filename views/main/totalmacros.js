var removeString = (number) => { return number.replace(/[^\d.-]/g, ''); } // removes a string
var totalMacros = document.getElementById('totalMacros'); // selects the button that calculates the total macros
totalMacros.addEventListener('click', () => computeTotal()); // adds a click event to the total macros, which calls the computeTotal function

var computeTotal = () => {
	// selects the table that contains the total macros
	var sumCalories = document.getElementById('total-calories');     
	var sumCarbs = document.getElementById('total-carbs');     
	var sumFat = document.getElementById('total-fat');     
	var sumProtein = document.getElementById('total-protein');     
	var sumSalt = document.getElementById('total-salt');     
	var sumSugar = document.getElementById('total-sugar');  

	// creates an object that will store the total macros
	var finalMacros = {
		finalCalories: 0,
		finalCarbs: 0,
		finalFat: 0,
		finalProtein: 0,
		finalSalt: 0,
		finalSugar: 0
	}

	// selects all checkboxes
	document.querySelectorAll("#check-food").forEach(selector => {
		var foodRecord = (selector.parentNode.parentElement); // selects each row of the table
	
		// current macros to be checked
		var checkedCalories = removeString(foodRecord.querySelector('#calories').innerHTML);     
		var checkedCarbs = removeString(foodRecord.querySelector('#carbs').innerHTML);     
		var checkedFat = removeString(foodRecord.querySelector('#fat').innerHTML);     
		var checkedProtein = removeString(foodRecord.querySelector('#protein').innerHTML);     
		var checkedSalt = removeString(foodRecord.querySelector('#salt').innerHTML);     
		var checkedSugar = removeString(foodRecord.querySelector('#sugar').innerHTML);

		var quantity = foodRecord.querySelector("#text-food").value; // quantity textbox

		// checks if the checkbox has been checked
		if (selector.checked) {
			// multiplies the current macros by the quantities entered
			// increments the data of each macro onto their respective properties of the object
			finalMacros.finalCalories += Number(checkedCalories) * quantity;
			finalMacros.finalCarbs += Number(checkedCarbs) * quantity;
			finalMacros.finalFat += Number(checkedFat) * quantity;
			finalMacros.finalProtein += Number(checkedProtein) * quantity;
			finalMacros.finalSalt += Number(checkedSalt) * quantity;
			finalMacros.finalSugar += Number(checkedSugar) * quantity;
		}
	});

	// adds the final macro results onto the table that contains the total macros
	sumCalories.innerHTML = finalMacros.finalCalories + " kilocalories";
	sumCarbs.innerHTML = finalMacros.finalCarbs + "g";
	sumFat.innerHTML = finalMacros.finalFat + "g";
	sumProtein.innerHTML = finalMacros.finalProtein + "g";
	sumSalt.innerHTML = finalMacros.finalSalt + "g";
	sumSugar.innerHTML = finalMacros.finalSugar + "g";
}
