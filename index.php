<?php
/*
 * jQuery File Upload Plugin PHP Example
 * https://github.com/blueimp/jQuery-File-Upload
 *
 * Copyright 2010, Sebastian Tschan
 * https://blueimp.net
 *
 * Licensed under the MIT license:
 * https://opensource.org/licenses/MIT
 */
/*
error_reporting(E_ALL | E_STRICT);
require('UploadHandler.php');
$upload_handler = new UploadHandler();

 */

$uri = trim(trim($_SERVER["REQUEST_URI"]),"\\/");
echo $uri;die();


switch($_SERVER["REQUEST_METHOD"]){
    case "GET":
        if($_SERVER["REQUEST_URI"] ==)
        break;
    case "POST":

        break;
    default:

        break;
}