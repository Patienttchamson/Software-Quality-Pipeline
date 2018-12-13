var expect  = require('chai').expect;
var assert = require('chai').assert;
var request = require('request');
let PORT = 8082;
var index = require('../index.js');
var HighLowMeanTemp = index.HighLowMeanTemp;
//var getcityName = index.getcityName;
//var HighLowMeanTempFromDb = indx.HighLowMeanTempFromDb;
var assert = require('assert');
let cityName = 'Dortmund';
var Promise = require('promise');
var getcityName = function (x) {
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
		}
	}
var HighLowMeanTempFromDb = function (cityName){	
	return new Promise ( (resolve, reject) => {

		MongoClient.connect(url, function(err, db) {
			  if (err) throw err;
			  var db1= db.db("wetter");
			  
				 db1.collection("dayly_prediction").find ({"Predicteur.City_name" : cityName}, {_id:0, "Predicteur.City_name" : 0, "Predicteur.weekday":0}   ).toArray((err, result) => {	  
				  if (err) return console.log(err);  
					
					console.log("Get data from Db");
					resolve(result);
					
					//console.log(data);
					//console.log(result)
					db.close();
					});
		});			
	});
}

			

describe('getHighLowMeanTemp from weather station', function() {

	 describe('getHighLowMeanTemp', function() {
		
			it(' should return an array',  (done) => { 
				
				let i=1
				while( i<8){
					HighLowMeanTemp(getcityName(i)).then( (result) => {
						// console.log("asd");
						 expect(result).to.be.an('array');
						
					 });
					 i++;
				}
				done();
			
			})
			
			
			it("should return numerique's values", function (done) {  
			
				let i=1
				while( i<10){
					HighLowMeanTemp(getcityName(i)).then( (result) => {
						let max = result[1];
						let min = result[2];
						let meanTemp = result[3];
						expect(max).to.be.a('number');
						expect(min).to.be.a('number');
						expect(meanTemp).to.be.a('number');			
						
					 });
					i++;
				}
				done();	
			})
			
			it(' should return random values', function (done) {  
			
				let i=1
				while( i<11){
			
					 HighLowMeanTemp(getcityName(i)).then( (result) => {
									
						let max = result[1];
						let min = result[2];
						let meanTemp = result[3];
						let i = 1;
						let limit = 1
						while(!max && !min && !meanTemp && limit <10) {
									   let value = random();

									   if(!max) {
										  max = (value == firstValue);
									   }

									   if(!min) {
										  min = (value == secondValue);
									   }
									   if(!meanTemp) {
										  meanTemp = (value == thirdValue);
									   }
									   i++;
									   limit++;
															  
						}
						
						assertTrue(max && min && meanTemp);
						
					 });
					 i++;
				}
				 
				done();		
							
			}); 
			
					
			it('Main page content', function(done) {
				request('http://localhost:' + PORT + '/getHighLowMeanTemp'+'/cityName' , function(error, response, body) {
				expect(response.statusCode).to.equal(200);
				done();
				});
		 
			});
		});
		
		describe('getHighLowMeanTemp from Database', function() {
		
		it(' should return an array',  (done) => { 
				
				let i=1
				while( i<8){
					HighLowMeanTempFromDb(getcityName(i)).then( (result) => {
					
						 expect(result).to.be.an('array');
						
					 });
					 i++;
				}
				done();
			
		})
		
		it(' should return random values', function (done) {  
			
				let i=1
				while( i<11){
			
					 HighLowMeanTempFromDb(getcityName(i)).then( (result) => {
									
						let max = result[0].Predicteur.Max_Temperature;
						let min = result[0].Predicteur.Min_Temperature;
						let meanTemp = result[0].Predicteur.Mettlewert;
						let i = 1;
						let limit = 1
						while(!max && !min && !meanTemp && limit <10) {
									   let value = random();

									   if(!max) {
										  max = (value == firstValue);
									   }

									   if(!min) {
										  min = (value == secondValue);
									   }
									   if(!meanTemp) {
										  meanTemp = (value == thirdValue);
									   }
									   i++;
									   limit++;
															  
						}
						
						assertTrue(max && min && meanTemp);
						
					 });
					 i++;
				}
				 
				done();		
							
		}); 
		
	
	
	});
	
});



