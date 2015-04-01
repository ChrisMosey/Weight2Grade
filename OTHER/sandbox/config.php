<?php
/* config.php
 * contains defaults and global constants for the application
 * 
 * @author 	Daniel Franz <kwantum0@gmail.com>
 * @date 	March 21, 2015
 * @project	PROG3180 - Sec3 final project
 */

 
/*******************************
 *	FORM VALIDATION FUNCTIONS  *
 *******************************/
function format($data)
{
	$data = trim($data);
	$data = stripslashes($data);
	$data = htmlspecialchars($data);
	return $data;
}
function parse_int($data)
{
	return intval($data);
}

/****************************
 *	VIEW BUILDER FUNCTIONS	*
 ****************************/
function printHeader($int)
{
	$activeStr = "class=\"ui-btn-active ui-state-persist\"";
	$result = "";
	$result .= "<!DOCTYPE HTML>";
	$result .= "<html lang=\"en\">";
	$result .= "<head>";
	$result .= "<meta charset=\"UTF-8\">";
	$result .= "<meta name=\"author\" content=\"Daniel Franz, Chris Mosey, Zachary Taylor\">";
	$result .= "<meta name=\"description\" content=\"Mobile Application Development 2015 - Final Project\">";
	$result .= "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1, user-scalable=no\" />";
	$result .= "<title>Weight2Grade App</title>";
	$result .= "<link rel=\"stylesheet\" type=\"text/css\" href=\"http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.css\" />";
	$result .= "</head>";
	$result .= "<body>";
	$result .= 
	"<div id=\"activity\" data-role=\"page\">
		<div data-role=\"header\">
		<h1>Your Activity</h1>	
			<div data-role=\"navbar\" data-iconpos=\"bottom\">
				<ul>
					<li><a data-icon=\"star\"" . ($int == 0 ? $activeStr : "") . "href=\"index.php?action=home\">Home</a></li>
					<li><a data-icon=\"bullets\"" . ($int == 1 ? $activeStr : "") . "href=\"index.php?action=list\">Todo List</a></li>
					<li><a data-icon=\"gear\"" . ($int == 2 ? $activeStr : "") . "href=\"index.php?action=options\">Options</a></li>
				</ul>
			</div><!-- /navbar -->
		</div><!-- /header -->";
	return $result;
}
function printFooter($int)
{
	$result = "";
	$result .=
	"	<div data-role=\"footer\">
			<h3> &copy; <span class=\"year\">" . date("Y") . "</span></h3>
		</div><!-- /footer -->
	</div><!-- /page -->";
	$result .= "<script src=\"http://code.jquery.com/jquery-1.11.1.min.js\"></script>";
	$result .= "<script src=\"http://code.jquery.com/mobile/1.4.5/jquery.mobile-1.4.5.min.js\"></script>";
	$result .= "</body>";
	$result .= "</html>";
	return $result;
}
?>