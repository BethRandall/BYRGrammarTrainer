/*
 * 
 * Find more about this template by visiting
 * http://miniapps.co.uk/
 *
 * Copyright (c) 2010 Alex Gibson, http://miniapps.co.uk/
 * Released under MIT license 
 * http://miniapps.co.uk/license/
 * 
 * Version 1.5 - Last updated: March 24 2010
 * 
 */

var touchGesture = {

    touchArray: null, //array of elements to be registered with a touch event
    element: null, //the element being touched
    touch: null, //stores the touch information for an element
    rotation: null, //stores the value of a rotation gesture being performed
    width: null, //stores the width value of an element when performing a gesture
    height: null, //stores the height value of an element when performing a gesture
    startX: null, //stores the starting X coordinates when moving an element
    startY: null, //stores the starting Y coordinates when moving an element
    elementPosX: null, //stores the X coordinate for the center of an element
    elementPosY: null, //stores the Y coordinate for the center of an element
    scale: 1.0, //default scale value for gesture
	
	//function to handle touch events
	handleEvent: function(e) {
		switch(e.type) {
			case 'touchstart': this.onTouchStart(e); break;
			case 'touchmove': this.onTouchMove(e); break;
			case 'touchend': this.onTouchEnd(e); break;
			case 'gesturestart': this.onGestureStart(e); break;
			case 'gesturechange': this.onGestureChange(e); break;
			case 'gestureend': this.onGestureEnd(e); break;
		}
	},

	init: function() { //initialises touch events on elements stored in touchArray.
        
        // N.B. this function is the source of the weird blacking-out of the multiple choice box.

		this.touchArray = [];	
		//this.touchArray = document.querySelectorAll('#multipleChoiceButton');
        //alert("inside touchArray");
  		
  		//for each card, listen for a touchstart event.
		for (var i = 0; i < this.touchArray.length; i++) {
			this.touchArray[i].addEventListener('touchstart', this, false);
            //this.touchArray[i].addEventListener('gesturestart', this, false);
            //alert("Say Hay!");

  		}	
	},

	onTouchStart: function(e) {
    
        // One finger touch start event
        if(e.touches.length == 1) { 
            e.preventDefault();
            this.element = e.target;
        
            //highlight touched element and change opacity
            this.element.style.background = 'blue';
            this.element.style.opacity = '0.5';
            
            //get the starting coordinates
            this.startX = e.touches[0].clientX;
    		this.startY = e.touches[0].clientY;
    		
            //get the offset center coordinates of the element being touched
    		this.elementPosX = this.element.offsetLeft;
            this.elementPosY = this.element.offsetTop;
        
            //add touchmove and touchend event listeners to the element.
            this.element.addEventListener('touchmove', this, false);
            this.element.addEventListener('touchend', this, false);
        }
	},
	
	onTouchMove: function(e) {
    
        // One finger touch move event
        if(e.touches.length == 1) {
    
            //get the target element of the touch event
            this.element = e.target;
            
            //calculate the distance of the drag
            var leftDelta = e.touches[0].clientX - this.startX;
   			var topDelta = e.touches[0].clientY - this.startY;
            
            //set the position of the element being dragged
            this.element.style.left = (this.elementPosX + leftDelta) + "px";
            this.element.style.top = (this.elementPosY + topDelta) + "px"; 
        }
	},
	
	onTouchEnd: function(e) {
    
		//get the target element of the touch event			
		this.element = e.target;
		
		//remove the highlight colour that was applied on touchstart
		this.element.style.background = 'black';
		this.element.style.opacity = '1';
        
		//remove touchmove and touchend event listeners.
		this.element.removeEventListener('touchmove', this, false);
		this.element.removeEventListener('touchend', this, false);
		
    },
    
    onGestureStart: function(e) {
    
        //prevent default browser behaviour
        e.preventDefault();
        
        //get the target element of the touch event
        this.element = e.target;
        
        //add a new highlight color for gesture and change opacity
        this.element.style.background = 'red';
        this.element.style.opacity = '0.5';
        
        //add gesturechange and gestureend event listeners to the element
        this.element.addEventListener('gesturechange', this, false);
        this.element.addEventListener('gestureend', this, false);
    
    },
    
    onGestureChange: function(e) {
    
        //prevent default browser behaviour
        e.preventDefault();
    
        //get the target element of the touch event
        this.element = e.target;
        
        //apply a CSS transformation to the element according to the scale and rotation values of the gesture
        this.element.style.webkitTransform = "scale(" + (this.scale * e.scale) + ")" + "rotate(" + ((this.rotation + e.rotation) % 360) + "deg)";
    },

    onGestureEnd: function(e) {
    
        //get the target element of the touch event
        this.element = e.target;
        
        //set ighlight colour and opacity back to default state
        this.element.style.background = 'black';
        this.element.style.opacity = '1';
        
        //store the scale and rotate values should a gesture be performed on the element again
        this.scale *= e.scale;
        this.rotation = (this.rotation + e.rotation) % 360;
        
        //remove gesturechange and gestureend event listeners
        this.element.removeEventListener('gesturechange', this, false);
        this.element.removeEventListener('gestureend', this, false);
    }
	   
};

//function that runs once the document has loaded.
function loaded() {
	//hide the address bar if visible in a browser such as Mobile Safari.
	//window.scrollTo(0,0);
    
	//initialise touchGesture	
	touchGesture.init();
}

window.addEventListener("load", loaded, true);