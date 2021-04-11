module.exports = (app) => {      
	const {check, validationResult} = require('express-validator'); // this line will allow all routes to check for validation on forms
	const redirectLogin = (req, res, next) => { // if there are active sessions on the logged in page, the user will be redirected to the login page
		if (!req.session.userId) { // if there is active users in the session
			res.redirect('./login'); // send the user back to the login page
		} else { 
			next(); // otherwise the next matching route will take control
		}    
	
	};

	var checkDetails = ""; // this variable will be passed onto register.ejs as a string object, to check for validation
	var checkLogin = "Calorie Buddy"; // this variable will be passed onto login.ejs as a string object to check for validation
	var foodName = ""; // this variable will be used for updating or deleting a record
	
	// Home Page
	app.get('/', (req, res) => {
		res.render('index.html') // renders the home page
	});
	
	// About Page
	app.get('/about', (req, res) => {         
		res.render('about.html'); // renders the about page
	});

	// Addfood Page                  
	app.get('/addfood', redirectLogin, (req, res) => {
		res.render("addFood.html"); // renders the addfood page with all its form data         
	});

	// Search Page
	app.get('/searchfood', (req, res) => {           
		res.render("search.html"); // renders the search page with the form and buttons
	});

	// Update Page
	app.get('/updatefood', redirectLogin, (req, res) => {           
		res.render("update.html"); // renders the update page with the form and buttons
	});

	// Update Form
	app.get('/updateform', redirectLogin, (req, res) => {          
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module                                  
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection

		// creates a mongodb connection                 
		MongoClient.connect(url, (err, client) => {                         
			if (err) throw err; // if an error occurs, the application will throw an error                         
			var db = client.db('fooddatabase'); // connects to the myfirstdatabase database                         
			var food = removeSpecialChar(foodName); // escapes any special characters in the username                                                                                                                                                                                                                                                      
			// retrieves the username from the database to see if it exists                          
			db.collection('foods').find({foodname: food}).toArray((findErr, result) => {                                 
				if (findErr) throw findErr; // if an error occurs, the application will throw an error                                 
				// if the foodname is undefined or is empty, an ejs file will be rendered displaying an error message                                 
				else if (result == null || result.length <= 0) res.render('failedupdate.ejs');                                 
				// loops through the user's records to see if the foodname matches the given foodname                                 
				result.forEach((getFood) => {
					var formFields = {
						foodname: getFood.foodname, // stores the name of the food
						value: getFood.value, // stores the typical value
						unit: getFood.unit, // stores the unit
						calories: getFood.calories, // stores the calories
						carbs: getFood.carbs, // stores the carbs
						fat: getFood.fat, // stores the fat
						protein: getFood.protein, // stores the protein
						salt: getFood.salt, // stores the salt
						sugar: getFood.sugar // stores the sugar
					}		
			
					// checks if the user that added this record can update it                                         
					if (req.session.userId != getFood.username) {                                                 
						res.render('adminonly.ejs', {admin: getFood.username}); // renders a page to say only admins can update 
					} else {
						res.render("updateform.ejs", formFields); // renders the update form page with the form and buttons
					}                                 
				});                                 
				client.close(); // exits the fooddatabase database                         
			});                 
		});
	});
	
	// Register Page         
	app.get('/register', (req, res) => {
		// checks if there are any validation message displayed on the register form - if there is, it will be reset
		if (checkDetails == "Please enter valid details" || "This username has been taken!") checkDetails = "";
		res.render('register.ejs', {checkDetails}); // renders the register page with the registration form
	});

	// User Login Page         
	app.get('/login', (req, res) => {
		if (req.session.userId) {
			var userName = req.session.userId; // stores the user's session id inside a variable
			res.render('activesession.ejs', {userName}); // renders the activesession page if the user is already logged in
		} else {	
			if (checkLogin == "Failed Login! Incorrect Details!") checkLogin = "Calorie Buddy"; // checks if there are validation messages on the login form and resets it
			res.render('login.ejs', {checkLogin}); // renders the login page with the login form
		}
	});

	// Logout Page         
	app.get('/logout', redirectLogin, (req,res) => {
		req.session.destroy(err => { // destroys the active session when the user clicks logout                        
			if (err) { // checks for an error
				return res.redirect('./') // if there is an error, the user will be redirected to the homepage                  
			}                         
			res.render('logout.ejs'); // otherwise the logout.ejs file will be rendered
		})         
	})

	// API GET-ALL Page 
	app.get('/api', (req,res) => {      
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection 

		MongoClient.connect(url, (err, client) => { // creates a mongodb connection
			if (err) throw err // if an error occurs, an error message is thrown                                                                                                
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                                                                                                                                
			// searches for all records stored in the foods collection in fooddatabase
			db.collection('foods').find().toArray((findErr, results) => {                                                                                                         
				if (findErr) throw findErr; // if an error occurs, an error message is thrown       
				else res.json(results); // outputs all the records in a json format
				client.close(); // closes the fooddatabase database
			}); 
		}); 
	});

	// API GET
	app.get('/api/search/:foodName', (req,res) => {      
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection 
		var {foodName} = req.params; // stores the name of the foodName parameter inside a variable

		MongoClient.connect(url, (err, client) => { // creates a mongodb connection
			if (err) throw err // if an error occurs, an error message is thrown                                                                                                
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                                                                                                                                
			// searches for the foodName parameter in the foods collection in fooddatabase
			db.collection('foods').find({ foodname: new RegExp(foodName, 'si') }).toArray((findErr, results) => {                                 
				if (findErr) throw findErr; // if an error occurs, an error message is thrown       
				else res.json(results); // outputs all the records in a json format
				client.close(); // closes the fooddatabase database
			}); 
		}); 
	});

	// API PUSH
	//app.push('/api/search/:foodName', (req,res) => {
	
	//});

	// API POST
	app.post('/api/add/', (req,res) => {
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection 
		var food = req.body; // retrieves the name of the object stored in the body

		MongoClient.connect(url, (err, client) => { // creates a mongodb connection
			if (err) throw err // if an error occurs, an error message is thrown                                                                                                
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                                                                                                                                
			db.collection('foods').insertOne({                                                         
				username: food.userName, // stores the name of the user                                                                                                  
				foodname: req.sanitize(food.foodName), // stores the name of the food                                                                                         
				value: Number(food.value), // stores the typical value                                                                                                  
				unit: req.sanitize(food.unit), // stores the unit of the typical value                                                                                    
				calories: Number(food.calories), // stores the calories                                                                                                 
				carbs: Number(food.carbs), // stores the carbs                                                                                                  
				fat: Number(food.fat), // stores the fat                                                                                                 
				protein: Number(food.protein), // stores the protein                                                                                                  
				salt: Number(food.salt), // stores the salt                                                                                                  
				sugar: Number(food.sugar) // stores the sugar                                                                                  
			});                                                 
			res.send("FOOD ITEM HAS SUCCESSFULLY BEEN ADDED!"); // displays a message that insertion has been successful{
			client.close(); // exits the fooddatabase database
		}); 
	});

	// API DELETE
	app.delete('/api/delete/:foodName', (req,res) => {
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection 
		var {foodName} = req.params; // stores the name of the foodName parameter inside a variable

		MongoClient.connect(url, (err, client) => { // creates a mongodb connection
			if (err) throw err // if an error occurs, an error message is thrown                                                                                                
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                                                                                          
			db.collection('foods').deleteOne({foodname:foodName});	// deletes the foodName given in the parameter
			res.send("FOOD ITEM HAS SUCCESSFULLY BEEN DELETED");
			client.close(); // closes the fooddatabase database 
		}); 
	});

	// helper function that escapes any special character entered, to prevent virtual server from crashing                                         
	var removeSpecialChar = (regex) => {                 
		// escapes any special character by replacing it with a back slash and the exact special character                                             
		return regex.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');         
	};

	// Search Result Page         
	app.get('/search-result', (req, res) => {                 
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module                 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection                                                                                                                                                                                                                 
		MongoClient.connect(url, (err, client) => { // creates a mongodb connection                         
			if(err) throw err; // if occurs, the application will throw an error                         
			var searchRecord = req.query.keyword; // stores the search query inside a variable                         
			var db = client.db('fooddatabase'); // retrieves the database collection which stores all the book records                         
			var specialRecord = removeSpecialChar(searchRecord); // calls the helper function above with the                                                                      
									    // search query as a parameter                                                                                                                                                                                                                         
			// execute mongodb search and retrive the search results from the database (as an object)                         
			db.collection('foods').find({ foodname: new RegExp(specialRecord, 'si') }).toArray((findErr, result) => {                                 
				if (findErr) throw findErr; // if occurs, the application will throw an error                                        
				else                                         
					var searchCount = [result.length]; // stores the number of results                                         
					// depending on the number of results, the text will either display "result" or "results"                                         
					var strresult = searchCount == 1 ? "result" : "results";                                         
					// otherwise an ejs file will be rendered, displaying the search results                                         
					res.render('search-result.ejs', {searchedFoods: result, searchRecord, searchCount, strresult});                                 
				client.close(); // exits the fooddatabase database                         
			});                 
		});                                                                                                                                                                           
	});

	// Update Search Page         
	app.post('/updatesearch', (req, res) => {                 
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module                 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection                                                                                                                                                                                                                 
		MongoClient.connect(url, (err, client) => { // creates a mongodb connection                         
			if(err) throw err; // if occurs, the application will throw an error                         
			var searchRecord = req.body.keyword; // stores the search query inside a variable                         
			var db = client.db('fooddatabase'); // retrieves the database collection which stores all the book records                         
			
			// execute mongodb search and retrive the search results from the database (as an object)                         
			db.collection('foods').find({ foodname: searchRecord }).toArray((findErr, result) => {                                 
				if (findErr) throw findErr; // if occurs, the application will throw an error                                        
				else if (result == null || result.length <= 0) res.render('failedsearch.ejs');
				else {                                        
					var searchCount = [result.length]; // stores the number of results                                         
					// depending on the number of results, the text will either display "result" or "results"                                         
					var strresult = searchCount == 1 ? "result" : "results";                                         
					// otherwise an ejs file will be rendered, displaying the search results                                         
					foodName = searchRecord;
					res.render('updatesearch.ejs', {searchedFoods: result, searchRecord, searchCount, strresult});                                 
				}
				client.close(); // exits the fooddatabase database                         
			});                 
		});                                                                                                                                                                           
	});

	// Masking the password
	var maskPassword = (password) => { // helper function to mask the password
		var mask = password.slice(0, 1) + "•".repeat(password.length - 1); // masks all the letters of the password
										  // except the first letter, just to be sure
		return password.replace(password, mask); // returns the password as a masked password
	}

	// Register Result Page
	app.post('/registered', [check('firstname').notEmpty(),
				check('lastname').notEmpty(),
				check('email').notEmpty().isEmail().normalizeEmail(), /*callback function to check for validation*/
				check('username').notEmpty().isAlphanumeric(), 
				check('password').notEmpty().isLength({min: 8})], (req,res) => {
		const errors = validationResult(req); // stores the validation results as an object inside erros
		if (!errors.isEmpty()) {            // checks if errors is not empty
			checkDetails = "Please enter valid details!"; // sets the validation message for all details

			// if the first name or last name is empty, email is incorrect, username does not exist or password does not meet requirements, a validation message will appear
			res.render('register.ejs', {checkDetails});
		} else {
			// saving data in database                         
			var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features
			var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection
			const bcrypt = require('bcrypt'); // includes the bcrypt module to use its callback functions
			const saltRounds = 10; // stores the number of salts that will be added to the password
			const plainPassword = req.sanitize(req.body.password); // sanitises and stores the password input by the user
			var maskedPassword = maskPassword(req.body.password); // masks the inputted password using the helper function

			// hash the password and storing it in the database
			bcrypt.hash(plainPassword, saltRounds, (err, hashedPassword) => {
				if (err) throw err; // if an error occurs, the application will throw an error
				// store hashed password in your database.                                                                            
				MongoClient.connect(url, (err, client) => { // connects to the mongodb database                        
					if (err) throw err; // if an error occurs, the application will throw an error
					var db = client.db('myfirstdatabase'); // connects to the myfirstdatabase client
					var findUser = req.sanitize(req.body.username); // stores the sanitised username in a variable
			
					db.collection('accounts').findOne({username: findUser}, (findErr, result) => {		
						if (findErr) throw findErr; // if an error occurs, the application will throw an error                                                  
						var userData = { // stores all the user data inside an object to be passed through the ejs file
							firstname: req.sanitize(req.body.firstname), // stores the first name
							lastname: req.sanitize(req.body.lastname), // stores the last name
							email: req.sanitize(req.body.email), // stores the email
							username: findUser, // stores the username                                                
							maskedP: maskedPassword, // stores the masked password                                
							hashedP: hashedPassword // stores the hashed password                                 
						};
						
						checkDetails = result != null ? "This username has been taken!" : ""; // stores the string message based on the condition of result
			
						if (result != null) {
							// if the first name or last name is empty, email is incorrect, username does not exist or password does not meet requirements, a validation message will appear
							res.render('register.ejs', {checkDetails});
						} else if (result == null) { // however, if the username does not exist in the database, the user will be registered
							// inserts all the inputted data into one record of the accounts collection in the myfirstdatabase client
							db.collection('accounts').insertOne({                         
								firstname: req.sanitize(req.body.firstname), // inserts the first name of the user
								lastname: req.sanitize(req.body.lastname), // inserts the last name of the user
								username: findUser, // inserts the user name of the user
								email: req.sanitize(req.body.email), // inserts the email of the user
								password: hashedPassword // inserts the hashed password of the user
							});
							res.render('registered.ejs', userData); // renders the ejs file once the record has been inserted
						}                  
						client.close(); // exits the myfirstdatabase database           
                                	});        
				}); // end of mongodb connection function
			}); // end of bcrypt function
		}         
	});

	// User Login Result Page
	app.post('/loggedin', (req,res) => {
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection
		var findUser = req.sanitize(req.body.userName); // stores the sanitised username input inside a variable

		// creates a mongodb connection
		MongoClient.connect(url, (err, client) => {                         
			if(err) throw err; // if an error occurs, the application will throw an error                                          
			var db = client.db('myfirstdatabase'); // connects to the myfirstdatabase database
			
			// execute mongodb search 
			db.collection('accounts').find({username: findUser}).toArray((findErr, result) => { // retrieves the record of
													    // the users data based on
													    // the username query
				if (findErr) throw findErr; // if an error occurs, the application will throw an error
				// if the result is empty or undefined, an ejs file will be rendered displaying an error message 
				else if (result == null || result.length <= 0) {
					//res.render('failedlogin.ejs');
					checkLogin = "Failed Login! Incorrect Details!"
					res.render('login.ejs', {checkLogin}); // display login page with login result message
				}
			
				// retrieves the hashed password from the database by looping through the result object
				result.forEach((getUserData) => {
					const bcrypt = require('bcrypt'); // includes the brcypt module to use its callback functions
					const plainPassword = req.sanitize(req.body.password); // sanitises and stores the password input by the user
					const hashedPassword = getUserData.password; // gets the hashed password from the forEach loop
					
					// load hashed password from password database
					bcrypt.compare(plainPassword, hashedPassword, (err, result) => {     
						if (err) throw err; // if an error occurs, the application will throw an error
						var userData = { // creates an object to store the user's data
							firstname: getUserData.firstname, // stores the user's first name
							lastname: getUserData.lastname, // stores the user's last name
						};

						// checks if the username and passwords match
						if (result == true && findUser == getUserData.username) {
							// **** save user session here, when login is successful
							req.session.userId = findUser;
							res.render('loggedin.ejs', userData); // display logged in page with results
						} else {
							checkLogin = "Failed Login! Incorrect Details!" // incorrect details
							res.render('login.ejs', {checkLogin}); // display login page with login result message
						}
					});
				});                                                         
				client.close(); // exits the myfirstdatabase database
			});                 
		});
	});
	
	// Food Data         
	app.get('/listfood', (req, res) => {                 
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features                                  
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection                                                                                                                                                                                                                 
		// creates a mongodb connection                 
		MongoClient.connect(url, (err, client) => {                         
			if (err) throw err; // if an error occurs, the application will throw an error                         
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                         
			db.collection('foods').find().toArray((findErr, results) => { // retrieves all the records of the users                                                            
										     // stored in the accounts collection                                 
				if (findErr) throw findErr; // if an error occurs, the application will throw an error                                 
				else res.render('listfood.ejs', {food:results}); // otherwise an ejs file will be rendered,                                                                 
										// displaying the list of all registered users                                 
				client.close(); // exits the fooddatabase database                         
			});                 
		});         
	});

	// Food Updated Page
	app.post('/foodupdated', (req, res) => {                 
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features                 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection                                                                                                                                                                                                                  
		// creates a mongodb connection                 
		MongoClient.connect(url, (err, client) => {                         
			if (err) throw err; // if an error occurs, the application will throw an error
                         
			var db = client.db('fooddatabase'); // connects to the fooddatabase database                         
			var food = removeSpecialChar(foodName); // escapes any special characters in the username                                                                                                                                                                                                                                                      
			// retrieves the username from the database to see if it exists                          
			db.collection('foods').find({foodname: food}).toArray((findErr, result) => {                                 
				if (findErr) throw findErr; // if an error occurs, the application will throw an error                                 
				// if the foodname or fields are undefined or empty, an ejs file will be rendered displaying an error message                            
				else if (result == null || result.length <= 0 || 
					req.body.name.trim().length <= 0 || 
					req.body.value.trim().length <= 0 ||                                               
					req.body.unit.trim().length <= 0 ||                                                                                          
					req.body.calories.trim().length <= 0 ||                                                                           
					req.body.carbs.trim().length <= 0 ||                                                                                   
					req.body.fat.trim().length <= 0 ||                                                                                     
					req.body.protein.trim().length <= 0 ||                                                                             
					req.body.salt.trim().length <= 0 ||                                                                                        
					req.body.sugar.trim().length <= 0                                                                                                                     					) {
					res.render('failedupdate.ejs');	
				} else {                                                                 
					// loops through the user's records to see if the foodname matches the given foodname                                 
					result.forEach((getFoodName) => {                                         
						if (req.session.userId != getFoodName.username) {                                                 
							res.render('adminonly.ejs', {admin: getFoodName.username});                                         
						} else {
							// checks if the database foodname matches the given foodname                                                 
							if (food == getFoodName.foodname) {                                                         
								// updates this food record from the database                                                         
								db.collection('foods').updateOne({foodname: food}, {$set:{
									foodname: req.sanitize(req.body.name), // updates the food name
									value: Number(req.body.value), // updates the typical value
									unit: req.sanitize(req.body.unit), // updates the unit
									calories: Number(req.body.calories), // updates the calories value
									carbs: Number(req.body.carbs), // updates the carbs value
									fat: Number(req.body.fat), // updates the fat value
									protein: Number(req.body.protein), // updates the protein value
									salt: Number(req.body.salt), // updates the salt value
									sugar: Number(req.body.sugar) // updates the sugar value
								}});
								// an ejs file will be rendered to confirm that the food record has been updated                                              
								res.render('foodupdated.ejs', {foodName: food});                                                 
							} else res.render('failedupdate.ejs'); // if all else fails, an ejs file will be rendered                                                     											     // displaying an error message                                         
						}                                 
					});     
				}                            
				client.close(); // exits the fooddatabase database                         
			});                 
		});         
	});

	// Food Deleted Page
	app.post('/fooddeleted', (req, res) => {
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection 

		// creates a mongodb connection
		MongoClient.connect(url, (err, client) => {                         
			if (err) throw err; // if an error occurs, the application will throw an error
			var db = client.db('fooddatabase'); // connects to the myfirstdatabase database
			var food = removeSpecialChar(foodName); // escapes any special characters in the username                             
		
			// retrieves the username from the database to see if it exists	
			db.collection('foods').find({foodname: food}).toArray((findErr, result) => {	
				if (findErr) throw findErr; // if an error occurs, the application will throw an error
				// if the foodname is undefined or is empty, an ejs file will be rendered displaying an error message
				else if (result == null || result.length <= 0) res.render('faileddelete.ejs');
				// loops through the user's records to see if the foodname matches the given foodname
				result.forEach((getFoodName) => {
					// checks if the logged in username matches the database username
					if (req.session.userId != getFoodName.username) {
						// if it doesn't, an error message is displayed
						res.render('adminonly.ejs', {admin: getFoodName.username});
					} else {
						// checks if the database foodname matches the given foodname
						if (food == getFoodName.foodname) {
							// deletes this food record from the database
							db.collection('foods').deleteOne({foodname:food});
							// an ejs file will be rendered to confirm that the food record has been deleted
							res.render('fooddeleted.ejs', {foodName: food}); 
						} else res.render('faileddelete.ejs'); // if all else fails, an ejs file will be rendered
										      // displaying an error message
					}
				});
				client.close(); // exits the fooddatabase database
			});	
		});
	});

	//Food Added Page         
	app.post('/foodadded', (req,res) => {                 
		// saving data in database                         
		var MongoClient = require('mongodb').MongoClient; // includes the mongodb module to use its features                 
		var url = 'mongodb://localhost'; // retrieves the mongodb url to create a connection
		
		// creates a mongodb connection                 
		MongoClient.connect(url, (err, client) => {                         
			if (err) throw err; // if an error occurs, the application will throw an error
			// checks for input validation in the form - if there are undefined inputs, whitespace inputs
			else if (!req.session.userId || req.body.name == null || req.body.name.trim().length <= 0 ||                                                                           
				req.body.value == null || req.body.value.trim().length <= 0 ||
				req.body.unit == null || req.body.unit.trim().length <= 0 ||                                                                                               
				req.body.calories == null || req.body.calories.trim().length <= 0 ||
				req.body.carbs == null || req.body.carbs.trim().length <= 0 ||
				req.body.fat == null || req.body.fat.trim().length <= 0 ||
				req.body.protein == null || req.body.protein.trim().length <= 0 || 
				req.body.salt == null || req.body.salt.trim().length <= 0 ||
				req.body.sugar == null || 
				req.body.sugar.trim().length <= 0) {                                         
					res.render('failedinsert.ejs'); // displays an error message if the condition is met
			} else {         
				var db = client.db ('fooddatabase'); // connects to the fooddatabase database                                                         
				db.collection('foods').findOne({foodname: req.body.name}, (findErr, result) => {                                 
					if (findErr) throw findErr; // if an error occurs, the application will throw an error                                 
					
					var foodData = { // stores all the food data inside an object to be passed through the ejs file                                     
						username: req.session.userId, // stores the username                                                                        
						name: req.body.name, // stores the name of the food                                                                        
						value: req.body.value, // stores the typical value                                         
						unit: req.body.unit, // stores the unit of the typical value                                         
						calories: req.body.calories, // stores the calories                                         
						carbs: req.body.carbs, // stores the carbs                                         
						fat: req.body.fat, // stores the fat                                         
						protein: req.body.protein, // stores the protein                                         
						salt: req.body.salt, // stores the salt                                         
						sugar: req.body.sugar // stores the sugar                                 
					};                                 

					if (result != null) { //checks if the foodname exists in the database
						res.render('foodexists.ejs'); // if it does then an error message will be displayed
					} else { // otherwise, if the foodname doesn't exist in the database then it will be added                               
						// inserts one new record into the food item database collection                                                          
						db.collection('foods').insertOne({                                         
							username: req.session.userId, // stores the name of the user                                         
							foodname: req.sanitize(req.body.name), // stores the name of the food                                         
							value: Number(req.body.value), // stores the typical value                                         
							unit: req.sanitize(req.body.unit), // stores the unit of the typical value                                         
							calories: Number(req.body.calories), // stores the calories                                         
							carbs: Number(req.body.carbs), // stores the carbs                                         
							fat: Number(req.body.fat), // stores the fat                                        
							protein: Number(req.body.protein), // stores the protein                                         
							salt: Number(req.body.salt), // stores the salt                                         
							sugar: Number(req.body.sugar) // stores the sugar                                 
						});                                                                                                                                   
						res.render('foodadded.ejs', foodData); // renders the ejs file once the record has been inserted	
					}
					client.close(); // exits the fooddatabase database                         
				});
			}
		});         
	});
}
