# Software Quality Pipeline realizable on microcomputers?

The challenge of continuous integration and continuous delivery of quality software still discourages many companies today from setting up and using
a software quality stack. In particular, setting up the individual tools, such as source code management, code integration or the deployment of images and connecting
them to form a complete system, is initially associated with greater effort. For this reason, this paper examines the extent to which such a software quality stack can be mapped as a cluster on single-board computers. The effort involved in setting up the cluster will be examined in more detail and evaluated in terms of performance using a small web application. The special feature described in this paper is to map the software quality stack as a distributed system on different Raspberry Pi’s.
To read more read the complet paper here

## Back-end with Raspberry Pi 3

Backend data from OpenWeatherMap to MongoDb using NodeJs and Express.

Tasks Programming:
 - Save data from weather side (OpenWeatherMap) in databases [Backend]. 
	-> to clarify: Which databases to install on Raspberry Pi 3? I used Mongo DB.
	-> 1st function: Update or insert of the data
	-> 2nd function: plausibility check of the data
	-> The following data ist saved:
		<> Temperature (every 3 hours)
		<> probability of rain (every 3 hours)
		<> Wind speed (every 3 hours)
		<> Wind direction
		<> Weather picture
- To test the application, install Nodejs and Mongo DB and then Download the application with all modules (node_modules) to test.

Enjoy!
