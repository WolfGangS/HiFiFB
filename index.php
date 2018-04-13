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
function predump($var) {
	echo "<pre>";
	print_r($var);
	echo "</pre>";
}

$uri = [];
$_uri = trim(trim($_SERVER["REQUEST_URI"]), "\\/");
if (strlen($_uri) > 0) {
	$_uri = explode("/", $_uri);
	foreach ($_uri as $ur) {
		if (strlen($ur) > 0 && substr($ur, 0, 1) !== ".") {
			$uri[] = $ur;
		}
	}
}

predump($uri);
die();

switch ($_SERVER["REQUEST_METHOD"]) {
case "GET":
	//if()
	break;
case "POST":

	break;
default:

	break;
}