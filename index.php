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
function dump($var) {
	echo "<pre>";
	print_r($var);
	echo "</pre>";
}

function startsWith($haystack, $needle) {
	$length = strlen($needle);
	return (substr($haystack, 0, $length) === $needle);
}

function endsWith($haystack, $needle) {
	$length = strlen($needle);

	return $length === 0 ||
		(substr($haystack, -$length) === $needle);
}

function scan($dir) {

	$files = array();

	// Is there actually such a folder/file?

	if (file_exists($dir)) {

		foreach (scandir($dir) as $f) {

			if (!$f || $f[0] == '.') {
				continue; // Ignore hidden files
			}

			if (is_dir($dir . '/' . $f)) {

				// The path is a folder

				$files[] = array(
					"name" => $f,
					"type" => "folder",
					"path" => $dir . '/' . $f,
					"items" => scan($dir . '/' . $f), // Recursively get the contents of the folder
				);
			} else {

				// It is a file

				$files[] = array(
					"name" => $f,
					"type" => "file",
					"path" => $dir . '/' . $f,
					"size" => filesize($dir . '/' . $f), // Gets the size of this file
				);
			}
		}

	}

	return $files;
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
} else {
	$uri[] = "";
}

//dump($uri);

$readfile = null;

$headers = [];
$jsonResponse = [];
$blockDownload = false;

switch ($_SERVER["REQUEST_METHOD"]) {
case "GET":
	switch (strtolower($uri[0])) {
	case "json";
		$jsonResponse = [
			"name" => "Assets",
			"type" => "folder",
			"path" => "Assets",
			"items" => scan("Assets"),
		];
		break;
	}
case "POST":

	break;
default:

	break;
}

if (!empty($jsonResponse)) {
	header('Content-Type: application/json');
	echo json_encode($jsonResponse);
} else if (!empty($readfile)) {
	$finfo = finfo_open(FILEINFO_MIME_TYPE);
	$type = finfo_file($finfo, $readfile);
	finfo_close($finfo);

	if (!$blockDownload && !startsWith($type, "text")) {
		header('Content-Description: File Transfer');
		header('Content-Type: application/octet-stream');
		header('Content-Disposition: attachment; filename="' . basename($readfile) . '"');
		header('Expires: 0');
		header('Cache-Control: must-revalidate');
		header('Pragma: public');
		header('Content-Length: ' . filesize($readfile));
	}
	$parts = explode(".", $readfile);
	if (strtolower($parts[count($parts) - 1]) == "json") {
		header('Content-Type: application/json');
	}
	if ($readfile !== null) {
		readfile($readfile);
	}
} else {
	http_response_code(404);
}
