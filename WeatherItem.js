class Item {
	constructor(City_name, temperature, weekday, minTemp, maxTemp, humidity, wind, date, icon) {

	this.City_name  = City_name
		this.temperature  = temperature - 273,
		this.weekday  = weekday,
		this.minTemp  = minTemp - 273,
		this.maxTemp  = maxTemp - 273
		this.humidity  = humidity,
		this.wind  = wind,
		this.date  = date,
		this.icon = icon
		
	}
}

module.exports = Item;