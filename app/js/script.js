function sendWebEvent(type, data) {
    data = { type: type, data: data };
   	if (typeof EventBridge !== "undefined") {
    	EventBridge.emitWebEvent(data);
    }
}

function fileClick(url) {
    sendWebEvent("fileClick", url);
}

var baseURL = "";

(function() {

    var templates = {};
    $(document).ready(function() {

        sendWebEvent("init", true);
        if (typeof EventBridge !== "undefined") {
            EventBridge.scriptEventReceived.connect(scriptEvent);
        }

        $('script[type="x-tmpl-mustache"]').each(function() {
            var id = $(this).attr("id").split("-");
            id.pop();
            id = id.join('');
            templates[id] = $(this).html().trim();
            Mustache.parse(templates[id]);
        });

        filemanager.find('input[type="search"]').on('input', function(e) {

            folders = [];
            files = [];

            var value = this.value.trim();

            if (value.length) {

                filemanager.addClass('searching');

                // Update the hash on every key stroke
                window.location.hash = 'search=' + value.trim();

            } else {

                filemanager.removeClass('searching');
                window.location.hash = encodeURIComponent(currentPath);

            }

        }).focusout(function(e) {
            var search = $(this);
            if (!search.val().trim().length) {
                window.location.hash = encodeURIComponent(currentPath);
            }
        });

        filemanager.find('input[type="checkbox"]').on("change", function(e){
        	recalcShownExtensions();
        	goto(window.location.hash);
        });


        // Clicking on folders

        fileList.on('click', 'li.folders', function(e) {
            e.preventDefault();

            var nextDir = $(this).find('a.folders').attr('href');

            if (filemanager.hasClass('searching')) {

                // Building the breadcrumbs

                breadcrumbsUrls = generateBreadcrumbs(nextDir);

                filemanager.removeClass('searching');
                filemanager.find('input[type=search]').val('').hide();
                filemanager.find('span').show();
            } else {
                breadcrumbsUrls.push(nextDir);
            }

            window.location.hash = encodeURIComponent(nextDir);
            currentPath = nextDir;
        });


        // Clicking on breadcrumbs

        breadcrumbs.on('click', 'a', function(e) {
            e.preventDefault();

            var index = breadcrumbs.find('a').index($(this)),
                nextDir = breadcrumbsUrls[index];

            breadcrumbsUrls.length = Number(index);

            window.location.hash = encodeURIComponent(nextDir);

        });
        getData();
    });

    function scriptEvent(msgs) {
        if (!Array.isArray(msgs)) {
            msgs = [msgs];
        }
        for (var i = 0; i < msgs.length; i++) {
            var msg = msgs[i];
            switch (msg.type) {
                case "baseURL":

                    break;
            }
        }
    }

    var filemanager = $('.filemanager'),
        breadcrumbs = $('.breadcrumbs'),
        fileList = filemanager.find('.data');

    // Start by fetching the file data from scan.php with an AJAX request


    var response = [],
        currentPath = '',
        breadcrumbsUrls = [];

    var folders = [],
        files = [];

    function getData() {
        if (document.protocol == "file:") {
            dataResponse({ "name": "Assets", "type": "folder", "path": "Assets", "items": [{ "name": "file a", "type": "file", "path": "Assets\/file a", "size": 0 }, { "name": "file b", "type": "file", "path": "Assets\/file b", "size": 0 }, { "name": "file c", "type": "file", "path": "Assets\/file c", "size": 0 }, { "name": "folder", "type": "folder", "path": "Assets\/folder", "items": [{ "name": "sub a", "type": "file", "path": "Assets\/folder\/sub a", "size": 0 }, { "name": "sub b", "type": "file", "path": "Assets\/folder\/sub b", "size": 0 }, { "name": "sub v", "type": "file", "path": "Assets\/folder\/sub v", "size": 0 }] }, { "name": "pupper", "type": "folder", "path": "Assets\/pupper", "items": [{ "name": "toy", "type": "file", "path": "Assets\/pupper\/toy", "size": 0 }] }] });
        } else {
            $.get("json", dataResponse);
        }
    }

    function parseData(data) {
        for (var i = 0; i < data.length; i++) {
            var datum = data[i];
            datum.safeName = escapeHTML(datum.name);
            switch (datum.type) {
                case "file":
                    datum.fileSize = bytesToSize(datum.size);
                    datum.extension = datum.safeName.split('.').pop().toLowerCase();
                    break;
                case "folder":
                    if (!Array.isArray(datum.items)) {
                        datum.items = [];
                    }
                    datum.items = parseData(datum.items);
                    datum.state = datum.items.length > 0 ? "full" : "empty";
                    datum.count = datum.items.length > 0 ? (datum.items.length + " Item" + (datum.items.length > 1 ? "s" : "")) : 'Empty';
                    break;
            }
        }
        return data;
    }


    function dataResponse(data) {
        response = parseData([data]);
        $(window).trigger('hashchange');
    }

    // This event listener monitors changes on the URL. We use it to
    // capture back/forward navigation in the browser.

    $(window).on('hashchange', function() {

        goto(window.location.hash);

        // We are triggering the event. This will execute 
        // this function on page load, so that we show the correct folder:

    });


    // Hiding and showing the search box

    /*filemanager.find('.search').click(function() {

        var search = $(this);

        search.find('span').hide();
        search.find('input[type=search]').show().focus();

    });*/


    // Listening for keyboard input on the search field.
    // We are using the "input" event which detects cut and paste
    // in addition to keyboard input.




    // Navigates to the given hash (path)

    function goto(hash) {

        hash = decodeURIComponent(hash).slice(1).split('=');

        if (hash.length) {
            var rendered = '';

            // if hash has search in it
            if (hash[0] === 'search') {

                filemanager.addClass('searching');
                var searchString = hash[1].toLowerCase();
                rendered = searchData(response, searchString);

                if (filemanager.find('input').val().length !== searchString) {
                    filemanager.find('input').val(searchString);
                }

                if (rendered.length) {
                    currentPath = hash[0];
                    render(rendered);
                } else {
                    render(rendered);
                }

            }

            // if hash is some path
            else if (hash[0].trim().length) {

                rendered = searchByPath(hash[0]);

                if (rendered.length) {

                    currentPath = hash[0];
                    breadcrumbsUrls = generateBreadcrumbs(hash[0]);
                    render(rendered);

                } else {
                    currentPath = hash[0];
                    breadcrumbsUrls = generateBreadcrumbs(hash[0]);
                    render(rendered);
                }

            }

            // if there is no hash
            else {
                currentPath = response[0].path;
                breadcrumbsUrls.push(currentPath);
                render(searchByPath(currentPath));
            }
        }
    }

    // Splits a file path and turns it into clickable breadcrumbs

    function generateBreadcrumbs(nextDir) {
        var path = nextDir.split('/').slice(0);
        for (var i = 1; i < path.length; i++) {
            path[i] = path[i - 1] + '/' + path[i];
        }
        return path;
    }


    // Locates a file by path

    function searchByPath(dir) {
        if (typeof dir !== "string") dir = "";
        var path = dir.split('/'),
            demo = response,
            flag = 0;

        for (var i = 0; i < path.length; i++) {
            for (var j = 0; j < demo.length; j++) {
                if (demo[j].name === path[i]) {
                    flag = 1;
                    demo = demo[j].items;
                    break;
                }
            }
        }

        demo = flag ? demo : [];
        return demo;
    }


    // Recursively search through the file tree

    function searchData(data, searchTerms) {

        data.forEach(function(d) {
            if (d.type === 'folder') {

                searchData(d.items, searchTerms);

                if (d.name.toLowerCase().match(searchTerms)) {
                    folders.push(d);
                }
            } else if (d.type === 'file') {
                if (d.name.toLowerCase().match(searchTerms)) {
                    files.push(d);
                }
            }
        });
        return { folders: folders, files: files };
    }

    var knownExtensions = ["fbx","fst","obj","png","svg","jpg","jpeg","gif","ogg","js"];
    var hiddenExtenstions = [];
    var showMiscExtensions = true;
    function recalcShownExtensions(){
    	hiddenExtenstions = [];
    	if(!$("#showScripts").prop("checked")){
    		hiddenExtenstions.push("js");
    	}
    	if(!$("#showModels").prop("checked")){
    		hiddenExtenstions.push(...["fst","obj","fbx"]);
    	}
    	if(!$("#showSounds").prop("checked")){
    		hiddenExtenstions.push(...["ogg"]);
    	}
    	if(!$("#showImages").prop("checked")){
    		hiddenExtenstions.push(...["png","svg","jpg","jpeg","gif"]);
    	}
    	showMiscExtensions = $("#showMisc").prop("checked");
    }

    function showThisExtension(ext){
    	ext = ext.trim().toLowerCase();
    	if(knownExtensions.indexOf(ext)){
    		return (hiddenExtenstions.indexOf(ext) < 0);
    	} else {
    		return showMiscExtensions;
    	}
    }

    // Render the HTML for the file manager

    function render(data) {

        var scannedFolders = [],
            scannedFiles = [];

        if (Array.isArray(data)) {
            data.forEach(function(d) {
                if (d.type === 'folder') {
                    scannedFolders.push(d);
                } else if (d.type === 'file') {
                	if(showThisExtension(d.extension)){
                    	scannedFiles.push(d);	
                	}
                }
            });
        } else if (typeof data === 'object') {
            scannedFolders = data.folders;
            scannedFiles = data.files;
        }


        // Empty the old result and make the new one

        fileList.empty().hide();

        if (!scannedFolders.length && !scannedFiles.length) {
            filemanager.find('.nothingfound').show();
        } else {
            filemanager.find('.nothingfound').hide();
        }

        renderSet(templates.folder, scannedFolders, fileList);
        renderSet(templates.file, scannedFiles, fileList);


        // Generate the breadcrumbs

        var url = '';

        if (filemanager.hasClass('searching')) {

            url = '<span>Search results: </span>';
            fileList.removeClass('animated');

        } else {

            fileList.addClass('animated');

            var shortend = false;
            if (breadcrumbsUrls.length > 2) {
                while (breadcrumbsUrls.length > 3) {
                    breadcrumbsUrls.shift();
                }
                shortend = true;
            }

            breadcrumbsUrls.forEach(function(u, i) {

                var name = u.split('/');
                name = name[name.length - 1];

                if (shortend && i == 0) {
                    name = "...";
                }

                if (i !== breadcrumbsUrls.length - 1) {
                    url += '<a href="' + u + '"><span class="folderName">' + name + '</span></a> <span class="arrow">&gt;</span> ';
                } else {
                    url += '<span class="folderName">' + name + '</span>';
                }

            });

        }

        breadcrumbs.text('').append(url);


        // Show the generated elements

        fileList.fadeIn();

    }

    function renderSet(template, set, appendTo) {
        set.forEach(function(s) {
            $(Mustache.render(template, s)).appendTo(appendTo);
        });
    }


    // This function escapes special html characters in names

    function escapeHTML(text) {
        return text.replace(/\&/g, '&amp;').replace(/\</g, '&lt;').replace(/\>/g, '&gt;');
    }


    // Convert file sizes from bytes to human readable units

    function bytesToSize(bytes) {
        var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
        if (bytes == 0) return '0 Bytes';
        var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
        return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
    }

})();