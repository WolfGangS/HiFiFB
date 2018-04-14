//Deine out Scope
var DEV_MODE = true;
(function() {

    //////////////////////////////
    /////////// Overlay //////////
    //////////////////////////////

    var DEV_STRING = DEV_MODE ? "?dev=" + Date.now() : "";

    var overlayHTML = "fb.html" + DEV_STRING;
    var overlayName = "File Browser";

    var baseURL = "";

    var overlayProps = {
        title: overlayName,
        source: Script.resolvePath(overlayHTML),
        width: 400,
        height: 800,
        visible: true,
        pinnable: false,
    };
    var NAME = "HiFiFB";
    ScriptDiscoveryService.getRunning().forEach(function(s){
        if(!s.local){
            if(s.name == "HiFiFB.js"){
                var url = s.url.split("://");
                NAME = url[1].split("/")[0];
            }
        }
    });

    var webOverlay = new OverlayWebWindow(overlayProps);

    webOverlay.webEventReceived.connect(webEvent);

    function webEvent(msgs) {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        for (var i = 0; i < msgs.length; i++) {
            var msg = msgs[i];
            switch (msg.type) {
                case "log":
                    console.log("FROM WEB: ", msg);
                    break;
                case "fileClick":
                    var url = baseURL + msg.data;
                    spawnURL(url);
                    break;
            }
        }
    }

    function sendScriptEvent(type, data) {
        data = JSON.stringify({ type: type, data: data });
        webOverlay.emitScriptEvent(data);
    }


    function toggleWebOverlay() {
        setWebOverlay(!webOverlay.isVisible());
    }

    function openWebOverlay() {
        setWebOverlay(true);
    }

    function closeOverlay() {
        setWebOverlay(false);
    }

    function setWebOverlay(state) {
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
        text: NAME,
        isActive: overlayProps.visible,
        sortOrder: 30
    });

    button.clicked.connect(toggleWebOverlay);


    function spawnURL(url){
        var ext = getExtension(url);
        var fullURL = Script.resolvePath(url);
        switch(ext){
            case "fbx":
            spawnFBX(fullURL);
            break;
        }
    }


    function spawnFBX(url){
        var prts = url.split("/");
        var name = prts[prts.length -1];
        Entities.addEntity({
            type: "Model",
            modelURL: url,
            position: getPosInfrontOfAvatar(5),
            name: name,
            dimensions: {x:1,y:1,z:1},
            rotation: MyAvatar.orientation,
        });
    }


    function getPosInfrontOfAvatar(dist){
        return Vec3.sum(MyAvatar.position,Vec3.multiply(dist,Quat.getForward(MyAvatar.orientation)));
    }


    function getExtension(str){
        str = str.split("#")[0];
        str = str.split("?")[0];
        str = str.split(".");
        if(str.length > 0){
            return str[str.length - 1].toLowerCase();
        } else {
            return null;
        }
    }

    //////////////////////////////
    ////////// Cleanup ///////////
    //////////////////////////////

    //Connect to the scriptEnding event to cleanup our objects
    Script.scriptEnding.connect(scriptEnding);

    function scriptEnding() {
        button.clicked.disconnect(toggleWebOverlay);
        tablet.removeButton(button);
        webOverlay.webEventReceived.disconnect(webEvent);
        webOverlay.close();
    }
})();