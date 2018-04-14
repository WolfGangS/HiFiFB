//Deine out Scope
(function() {
  
  //////////////////////////////
  /////////// Overlay //////////
  //////////////////////////////
  
  var overlayHTML = "fb.html";
  var overlayName = "File Browser";
  
  var overlayProps = {
    title: overlayName,  
    source: Script.resolvePath(overlayHTML), 
    width: 400, 
    height: 800, 
    visible: true, 
    pinnable: false,
  };
  
  var webOverlay = new OverlayWebWindow(overlayProps);

  webOverlay.webEventReceived.connect(webEvent);
  function webEvent(msg){
    switch(msg.type){
        case "log":
            console.log("FROM WEB: ",msg);
            break;
    }
  }
  
  function sendScriptEvent(type,data){
    data = JSON.stringify({ type: type, data: data });
    webOverlay.emitScriptEvent(data);
  }
  

  function toggleWebOverlay(){
    setWebOverlay(!webOverlay.isVisible());
  }

  function openWebOverlay(){
    setWebOverlay(true);
  }

  function closeOverlay(){
    setWebOverlay(false);
  }
  
  function setWebOverlay(state){
    webOverlay.setVisible(state);
    button.editProperties({ isActive: state });
  }
  
  
  
  //////////////////////////////
  /////////// Button ///////////
  //////////////////////////////
  
  var tablet = Tablet.getTablet("com.highfidelity.interface.tablet.system");
  
  var button = tablet.addButton({
    icon: Script.resolvePath("folder-white.svg"),
    activeIcon: Script.resolvePath("folder-black.svg"),
    text: "Web Example",
    isActive: false,
    sortOrder: 30
  });

  button.clicked.connect(toggleWebOverlay);
  
  
  
  //////////////////////////////
  //////// Do Something ////////
  //////////////////////////////
  
  //Lets send something to our overlay to show that the connection works,
  //and as an example of how you can use the connection
  //Script.setInterval works like window.setInterval in a browser, it starts a timer that will call the function inside every so many miliseconds
  /*
  Script.setInterval(function(){
    //send a script event with the function we made earlier, setting a type so that we can tell in the overlay what to do with it
    sendScriptEvent("avatar-position",MyAvatar.position);
  },2000);//2000 will result in a call every 2 seconds
  */
  
  
  //////////////////////////////
  ////////// Cleanup ///////////
  //////////////////////////////
  
  //Connect to the scriptEnding event to cleanup our objects
  Script.scriptEnding.connect(scriptEnding);
  function scriptEnding(){
    button.clicked.disconnect(toggleWebOverlay);
    tablet.removeButton(button);
    webOverlay.webEventReceived.disconnect(webEvent);
    webOverlay.close();
  }
})();
