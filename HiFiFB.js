//Deine out Scope
var DEV_MODE = true;
(function() {
  
  //////////////////////////////
  /////////// Overlay //////////
  //////////////////////////////
  
  var DEV_STRING = DEV_MODE ? "?dev=" + Date.now() : "";

  var overlayHTML = "fb.html" + DEV_STRING;
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
