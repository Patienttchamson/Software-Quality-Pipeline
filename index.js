var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/';	
var Promise = require('promise');
var express = require('express');
var app = express();
var cors = require ('cors');
var bodyParser = require('body-parser');
var http = require('http');
var weatherItem = require('./WeatherItem');
var prediction = require('./Prediction');
let cityName = '';
let PORT = 8082;

// Require dateformat library
var dateFormat = require('dateformat');
app.use(cors());
app.use(express.static('public'));
app.use (bodyParser.json());


// Convert degree Kelvin to degree Celsius
var kelvinToC = function (kelvin) {
    return kelvin - 273;
}


// Get date from Unix timestamp
var dateFromTimestamp = function (timestamp) {
    var date = new Date(timestamp * 1000);
    return dateFormat(date, "dddd, mmmm d");	//TODO	 Komma zwischen mmmm  d  ???
}

// Get time from Unix timestamp
var timeFromTimestamp = function (timestamp) {
    var date = new Date(timestamp * 1000);
    return dateFormat(date, "HH:MM");
}

// get a week's day from a date
function getDayOfWeek(date) {
	
	var dayOfWeek = new  Date(date).getDay();  
	
		return isNaN(dayOfWeek) ? null :[  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek] ; 
};

let x = '';

CityName = function (x) {
	switch (x) {
		case 1: return "Dortmund"; break;
		case 2: return "Bochum"; break;
		case 3: return "Essen"; break;
		case 4: return "Duisburg"; break;
		case 5: return "Aachen"; break;
		case 6: return "Bottrop"; break;
		case 7: return "Gelsenkirchen"; break; 
		case 8: return "Frankfurt"; break; 
		case 9: return "Herne"; break; 
		case 10: return "Bielefeld"; break; 
		case 11: return "Berlin"; break; 
		 
		
	}
};



module.exports = {
	
		// Get Maximum and Minimum Temparature
	 HighLowMeanTemp: function(cityName) {	
			
			return new Promise ( (resolve, reject) => {

			http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + cityName + ',DE&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) =>{
				let data = '';
			
				// A chunk of data has been recieved.
				resp.on('data', (chunk) => {
					data += chunk;
				});
			
				// The whole response has been received. console.log out the result.
				resp.on('end', () => {
					let temperaturesForecast = [],
					temperaturesForecastLabels = [];
					for (var i = 0; i < 16; i++) {
						
					var item = JSON.parse(data).list[i];
					if(getDayOfWeek(new Date())==getDayOfWeek(item.dt_txt)){
					temperaturesForecast[i] = Number(kelvinToC(item.main.temp).toFixed(1));
					temperaturesForecastLabels[i] = timeFromTimestamp(item.dt);
					}
					}
					var sum = temperaturesForecast.reduce(function (accumulator, currentValue) {
					  return accumulator + currentValue;
							}, 0);
											
					let meanTemp =Number((sum / temperaturesForecast.length).toFixed(1));	
					
					const arrMax = arr => Math.max(...arr);
					const arrMin = arr => Math.min(...arr);
					 let maximum = arrMax(temperaturesForecast);
					 let minimum = arrMin(temperaturesForecast);
					var Predicteur = new prediction(cityName, getDayOfWeek(new Date()), minimum, maximum, meanTemp);
					
					MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db("wetter");
					
					 try { dbo.collection("dayly_prediction").replaceOne(
					 { "Predicteur.City_name": cityName   }, {Predicteur}, { upsert: true } );
					 	}
					catch (e){ console.log(e); }
					
					
					//resolve(Prediction);
					db.close();
				  
				  
				}); 
				
					let parameter = [maximum, minimum, meanTemp]
					//console.log('parameters are:', parameter);
					resolve(parameter);
			
					
				})
		
			})
				
	  });
	 }
		
}


// Get Maximum and Minimum Temparature
function getHighLowMeanTemp  (cityName) {	

	return new Promise ( (resolve, reject) => {

		http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + cityName + ',DE&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) =>{
			let data = '';
		
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
		
			// The whole response has been received. console.log out the result.
			resp.on('end', () => {
				let temperaturesForecast = [],
                temperaturesForecastLabels = [];
				for (var i = 0; i < 10; i++) {
					
				var item = JSON.parse(data).list[i];
				if(getDayOfWeek(new Date())==getDayOfWeek(item.dt_txt)){
                temperaturesForecast[i] = Number(kelvinToC(item.main.temp).toFixed(1));
                temperaturesForecastLabels[i] = timeFromTimestamp(item.dt);
				}
				}
				var sum = temperaturesForecast.reduce(function (accumulator, currentValue) {
				  return accumulator + currentValue;
						}, 0);
										
				var meanTemp =Number((sum / temperaturesForecast.length).toFixed(1));
							
				var maximun = Math.max(...temperaturesForecast);
				var minimun = Math.min(...temperaturesForecast);
				
				var Predicteur = new prediction(cityName, getDayOfWeek(new Date()), minimun, maximun, meanTemp);
				
				MongoClient.connect(url, function(err, db) {
					if (err) throw err;
					var dbo = db.db("wetter");
					
					// console.log("Hallo");
					// console.log(Prediction);
					
					try { dbo.collection("dayly_prediction").replaceOne(
					  { "Predicteur.City_name": cityName   }, {Predicteur}, { upsert: true } );
					}
					catch (e){ console.log(e); }
					
					// console.log("resolve");
					// console.log(Predict);
					//resolve(Prediction);
					db.close();
				});
				let parameter = [maximun, minimun, meanTemp]
				//console.log('parameters are:', parameter);
				resolve(parameter);
				//return [maximun, minimun, meanTemp];
				
			})
	
		})
	})
}
 
 

// Returns a JSON Object with Todays Weather Data from the OpenWeather API
// This should only be called once a day and then be saved into the database
function getTodaysWeatherData (cityName) {	

	return new Promise ( (resolve, reject) => {

		http.get('http://api.openweathermap.org/data/2.5/weather?q=' + cityName + '&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) => {
			let data = '';
		
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
		
			// The whole response has been received. console.log out the result.
			resp.on('end', () => {

			// item is the complete JSON-Data of the Object and can be seen by opening - http://api.openweathermap.org/data/2.5/weather?q=Bochum&appid=2edbe7c19ccf47195df9c1edfe3cc98e with FIREFOX
			let item = JSON.parse(data);
			let wItem = new weatherItem(cityName, Number((item.main.temp).toFixed(1)), getDayOfWeek(new Date()), Number((item.main.temp_min).toFixed(1)), Number((item.main.temp_max).toFixed(1)), item.main.humidity, item.wind.speed, new Date(), item.weather[0].description);
			//Insert a data in the "wetter_status" collection:
			MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				var dbo = db.db("wetter");
				try { dbo.collection("wetter_status").replaceOne(
				 { "wItem.City_name": cityName },{wItem}, { upsert: true } );	}
				catch (e){ console.log(e); }
			  
			  db.close();		  
		  
			});	

			resolve(wItem);
			});
		
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}


// Get Data from Weather Station
function getWeeklyWeatherData (cityName) {

	return new Promise ( (resolve, reject) => {

		http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + cityName + ',DE&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) => {
			let data = '';
		
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});	
			// The whole response has been received. console.log out the result.
			resp.on('end', () => {
				MongoClient.connect(url, function(err, db) {
				if (err) throw err;
				//use wetter;
				var dbo2 = db.db("wetter");
				for (var i = 8; i < 38; i++) {
				var item = JSON.parse(data).list[i];
				var wItem1 = new weatherItem(cityName, (item.main.temp).toFixed(1), getDayOfWeek(item.dt_txt), (item.main.temp_min).toFixed(1), (item.main.temp_max).toFixed(1), item.main.humidity, (item.wind.speed).toFixed(1), item.dt_txt, item.weather[0].description);
					//Insert a data in the "weekly" collection:	
				try { dbo2.collection("weekly").replaceOne(
				{  weekday : getDayOfWeek(item.dt_txt)  }, {wItem1}, { upsert: true } );	}
				catch (e){ console.log(e); }
			
				}
				resolve(wItem1);
				db.close();
			  });
			});			
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}

//get weather caracteristique by cityName

function getWeeklyWeatherByCityFronDb(cityName){
	
	return new Promise ( (resolve, reject) => {

		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var db1= db.db("wetter");
			  
				 db1.collection("weekly").find ( { "wItem1.City_name" : cityName  }  ).toArray((err, result) => {	  
				  if (err) return console.log(err);  
					
					console.log("Put data");
					
					//console.log(data);
					resolve(result);
					
					//console.log(data);
					//console.log(result)
					db.close();
					});
		});			
	});
}

function getTodayWeatherByCityFronDb(cityName){
	
	return new Promise ( (resolve, reject) => {

		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var db1= db.db("wetter");
			  
				 db1.collection("wetter_status").find ( { "wItem.City_name" : cityName  }  ).toArray((err, result) => {	  
				  if (err) return console.log(err);  
					
					console.log("Put data");
					
					//console.log(data);
					resolve(result);
					
					//console.log(data);
					//console.log(result)
					db.close();
					});
		});			
	});
}

function getHighLowMeanTempFromDb(cityName){
	
	return new Promise ( (resolve, reject) => {

		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var db1= db.db("wetter");
			  
				 db1.collection("dayly_prediction").find ( { "Predicteur.City_name" : cityName   }  ).toArray((err, result) => {	  
				  if (err) return console.log(err);  
					
					console.log("Put data");
					
					//console.log(data);
					resolve(result);
					
					//console.log(data);
					//console.log(result)
					db.close();
					});
		});			
	});
}

 
// This should only be called once a day and then sent in frontend
function getTodaysWeatherDataForAnotherCity (AnothercityName) {	

	return new Promise ( (resolve, reject) => {

		http.get('http://api.openweathermap.org/data/2.5/weather?q=' + AnothercityName + '&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) => {
			let data = '';
		
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
		
			// The whole response has been received. console.log out the result.
			resp.on('end', () => {

			// item is the complete JSON-Data of the Object and can be seen by opening - http://api.openweathermap.org/data/2.5/weather?q=Bochum&appid=2edbe7c19ccf47195df9c1edfe3cc98e with FIREFOX
			let item = JSON.parse(data);
			resolve(item);
			});
		
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}	

// Get Data from Weather Station
function getWeeklyWeatherDataForAnotherCity (AnothercityName) {	

	return new Promise ( (resolve, reject) => {

		http.get('http://api.openweathermap.org/data/2.5/forecast?q=' + AnothercityName + '&appid=2edbe7c19ccf47195df9c1edfe3cc98e', (resp) => {
			let data = '';
			
			// A chunk of data has been recieved.
			resp.on('data', (chunk) => {
				data += chunk;
			});
		
			// The whole response has been received. console.log out the result.
			resp.on('end', () => {
		
			
				let item = JSON.parse(data);
				resolve(item);
			
			
			
			});
		
		}).on("error", (err) => {
			console.log("Error: " + err.message);
		});
	});
}
	

// Sends Data to the Front-End
app.get('/getTodaysWeatherDataForAnotherCity/:AnothercityName', function (req, res) {

	getTodaysWeatherDataForAnotherCity(req.params.AnothercityName)
	.then( (data) => {
		res.send(data); 
	});
})


// Sends Data to the Front-End
app.get('/getWeeklyWeatherDataForAnotherCity/:AnothercityName', function (req, res) {

	getWeeklyWeatherDataForAnotherCity(req.params.AnothercityName)
	.then( (data) => {
		res.send(data); 
	});
})
	 

	


				 
//Delete old weekly collection
function DelWeeklyWeatherData(){
	
			MongoClient.connect(url, function(err, db) {
							if (err) throw err;
							var dbo = db.db("wetter");
							
							dbo.collection("weekly").drop(function(err, res) {
							if (err) throw err;
							console.log("Old weekly's collection deleted");
							db.close();
						  });
			});
}

//Delete old dayly collection
function DelDaylyWeatherData(){
	
			MongoClient.connect(url, function(err, db) {
							if (err) throw err;
							var dbo = db.db("wetter");
							
							dbo.collection("wetter_status").drop(function(err, res) {
							if (err) throw err;
							console.log("Old dayly's collection deleted");
							db.close();
						  });
			});
}

function DelHighLowMeanTemp(){
	
			MongoClient.connect(url, function(err, db) {
							if (err) throw err;
							var dbo = db.db("wetter");
							
							dbo.collection("dayly_prediction").drop(function(err, res) {
							if (err) throw err;
							console.log("Old dayly_prediction's collection deleted");
							db.close();
						  });
			});
}

// Sends Data to the Front-End
app.get('/TodaysWeatherData/:cityName', function (req, res) {

	getTodayWeatherByCityFronDb(req.params.cityName)
	.then( (data) => {
		res.send(data); 
	});
})



app.get('/getHighLowMeanTemp/:cityName', function (req, res) {

getHighLowMeanTempFromDb(req.params.cityName)
	.then( (data1) => {
		res.send(data1); 
	});   	
})

// Get Weather Data from Database
app.get('/getWeeklyWeatherData/:cityName', function (req, res) {

	getWeeklyWeatherByCityFronDb(req.params.cityName)
	.then( (data2) => {
		res.send(data2); 
	});
	// function (data) { res.send(data)}
	
})

// Daily update for the Database, so that it saves old data and gets
function ThreeHourUpdate (cityName) {
    //DelDaylyWeatherData();
    getTodaysWeatherData (cityName); 
	// Test for a 24 hour update
	setInterval(function() {
		
		console.log("Get Data every Day");

	}, 3*60*60*1000); // Repeat every 3*60*60*1000 Milliseconds (3 Hours)
}

// Daily update for the Database, so that it saves old data and gets
function dailyUpdate (cityName) {
	
		 //DelHighLowMeanTemp()
	     getHighLowMeanTemp  (cityName);
	     //Delete old Weekly's collection
		
		//DelWeeklyWeatherData();
		
		// Update or create new collection
		getWeeklyWeatherData (cityName);
		
		
		// Test for a 24 hour update
		setInterval(function() {
			
			console.log("Get Data every Day");

		}, 24*60*60*1000); // Repeat every 3*60*60*1000 Milliseconds (3 Hours)
}

function main(){
	var j=1;
	while (j<11){

	  dailyUpdate (CityName(j)) ;
	  ThreeHourUpdate (CityName(j));
	  console.log(CityName(j));
	  j++;
	 
	}
}

//The main function to run the global's code
main();

app.listen(PORT);