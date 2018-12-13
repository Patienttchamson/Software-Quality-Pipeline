
function doSomething () {

	return new Promise ( (resolve, reject) => {
		setTimeout( function () {   // Function that waits 3 seconds before starting a function
            console.log("a");
            resolve();             // Promise waits to continue until you call the resolve() function
        }, 3000 ); 
	}); 
}

function doSomethingElse () {

	return new Promise ( (resolve, reject) => {
		setTimeout( () => {             // Short version to write a Function:   () => {}
			console.log("b");
		}, 1000 );
	}); 
}

doSomething();          
doSomethingElse();
// =>  b, a

doSomething()
.then( doSomethingElse );
//  =>  a, b
// this waits for the doSomething Function to finish before starting doSomethingElse