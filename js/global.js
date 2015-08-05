/*	global.js
	runs on the initial set-up and binds event handlers

	Revision history
		Daniel Franz	 2015.04.01: created
*/

/****************************
 *		DOCUMENT READY		*
 ****************************/
$(document).ready(function() {
	// turn off all animations
	//jQuery.fx.off = true;
	//{ DATABASE
	// check if setup is complete
	var setup_complete = localStorage.getItem("setup");
	if(setup_complete == null || setup_complete != "COMPLETE")
	{
		// drop all data, it might be corrupt
		dbDropTables();
		
		// create the tables
		dbCreateTables();
		
		// populate the type table
		tblTypePopulate();
		
		// reset default pass grade to 55
		localStorage.setItem("defaultPassGrade", "55");
		
		// reset IDs
		setClassId(-1);
		setAssId(-1);
		
		// set setup as COMPLETE
		localStorage.setItem("setup", "COMPLETE");
	}
	//}
});

/****************************
 *		  CONTROLLER		*
 ****************************/
// Controller for navigation events
$(window).on("pagebeforeshow", function() {
	// actions that always happen
	refreshValidation();
	// actions that only happen on certain pages
	var page = location.hash;
	switch(page){
		case "":
		case "#homeView":
			populateClassList();
			break;
		case "#classView":
			displayClass();
			break;
		case "#assView":
			displayAssignment();
			break;
		default:
			$.mobile.changePage("index.html#homeView");
			break;
	}
});


//{ Shared Callback
function moreClassInfo(item, fn) {
	return function(tx, res) {
		var rs = res.rows;
		var total = 0;
		var weight = 0;
		var achieved = 0;
		var lost = 0;
		var comp = 0;
		for(var i = 0; i < rs.length; i++){
			var r = rs.item(i);
			if(r.state == "COMP"){
				comp += r.Ass_Count;
			}
			if(r.state == "MARK"){
				comp += r.Ass_Count;
				achieved += r.Achieved_Weight;
				lost += r.Lost_Weight;
			}
			weight += r.Total_Weight;
			total += r.Ass_Count;
		}
		fn(item, total, weight, achieved, lost, comp);
	};
}//}

//{ Action that populates the select dropdown
function populateTypeList(str) {
	// reset the type list
	$('.AssType').empty();
	// iterate over each item in callback
	tblTypeList(typeListIterate(typeFormat(str)));
}
// { Populate Type List dependences
function typeListIterate(str) {
	return function(tx, res) {
		var rs = res.rows;
		for(var i = 0; i < rs.length; i++){
			var name = rs.item(i).type_name;
			var opt = '<option value="' + name + '" ' 
					+ (name == str ? 'selected' : '') + '>' 
					+ name + '</option>';
			$('#addAssType').append(opt);
			$('#editAssType').append(opt);
		}
		if($('#addAssType').length){
			$('#addAssType').selectmenu().selectmenu( "refresh" );
		}
		if($('#editAssType').length){
			$('#editAssType').selectmenu().selectmenu( "refresh" );
		}
	}
}//}
//}	
	
//{ Action that populates the class list
function populateClassList() {
	// reset the class list
	$('#classList li:not(:first):not(:last):not(.addClassForm)').remove();
	// iterate over each item in callback
	tblClassList(classListIterate);
}
//{ Populate Class List dependences
function classListIterate(tx, res) {
	var rs = res.rows;
	for(var i = 0; i < rs.length; i++){
		// get the record and id, from the record set
		var r = rs.item(i);
		var id = r.class_id;
		// get more class information through callback
		dbGetClassInfo(id, moreClassInfo(r, buildClassListItem));
	}
	if(rs.length <= 0){
		toggleAddForm(true);
		toggleAddForm(false);
	}
	else {
		toggleAddForm(true);
	}
}
function buildClassListItem(item, total, weight, achieved, lost, comp){
	// convert weight to percentages
	achieved = (weight <= 0 ? 0 : Math.ceil(achieved / weight * 100));
	lost	 = (weight <= 0 ? 0 : Math.floor(lost / weight * 100));
	// build the element
	var li = '<li data-icon="false"><a href="#classView" class="ui-link-inherit" onclick="setClassId(' + item.class_id + ');setClassName(\'' + item.class_code +'\');">'
		   + 	'<h2>' + item.class_code + '</h2><p>' + item.class_description + '</p>'
		   + 	'<p class="ui-li-aside">' + comp.toString() + ' / ' + total.toString() + '</p>'
		   + '<div class="progress-wrapper">'
		   + 	'<div class="badge-box" style="padding-left: 0px">'
		   + 		'<div class="carat-up"></div>'
		   +		'<span class="badge">' + item.pass_grade + '</span>'
		   +	'</div>'
		   + 	'<div class="badge-box" style="padding-left: 0px">'
		   +		'<div class="carat-up carat-up-success"></div>'
		   + 		'<span class="badge badge-success" >' + item.target_grade + '</span>'
		   + 	'</div>'
		   + 	'<div class="progress">'
		   + 		'<div style=" width: '+ achieved +'%" role="progressbar" class="progress-bar progress-bar-default">'
		   + 			achieved 
		   +		'</div>'
		   +		'<div style="float: right; width: '+ lost +'%" role="progressbar" class="progress-bar progress-bar-danger">'
		   +			lost
		   +		'</div>'
		   +	'</div>'
		   + '</div></a></li>';
	// add the element to the page
	$(li).insertAfter("#insertClass");
	refreshLists();
}//}
//}

//{ Action that adds a new class
function handleAddClassForm() {
	if($("#classAdd").valid()) {
		var code = $("#addClassCode").val().trim();
		var desc = $("#addClassDesc").val().trim();
		var target = $("#addClassGoal").val();
		
		tblClassInsert(code, desc, target, addClassSuccess, addClassFail);
	}
}
//{ Add Class dependences
function addClassSuccess(tx, result) {
	var id = result.rows.item(0).id;
	setClassId(id);
	$.mobile.changePage("#classView");
	$('#classAdd').trigger("reset");
	toggleAddForm(true);
}
function addClassFail(tx, result) {
	alert("There was a problem adding the class.\nERROR MESSAGE: " + result.message);
}//}
//}
 
//{ Action that displays a class
function displayClass() {
	// reset all the lists
	$('.hasBadges.addToHead').remove();
	// get the class item through callback
	tblClassRead(classCurry);
	// populate type list
	populateTypeList('other');
	// populate the task list
	populateAssList();
}
//{ Display Class dependences
function classCurry(tx, res) {
	// get the record and id from the record set
	var r = res.rows.item(0);
	var id = r.class_id;
	// get more class info
	dbGetClassInfo(id, moreClassInfo(r, buildClassHeader));
}
function buildClassHeader(item, total, weight, achieved, lost, comp){
	setClassId(item.class_id);
	setClassName(item.class_code);
	// convert weight to percentages
	var achieved = (weight <= 0 ? 0 : Math.ceil(achieved / weight * 100));
	var lost	 = (weight <= 0 ? 0 : Math.floor(lost / weight * 100));
	achieved = Math.min(achieved, 100);
	lost = Math.min(lost, 100 - achieved);
	// build the element
	var ul = '<ul data-role="listview" class="hasBadges addToHead" data-split-icon="edit">'
		   + '<li data-icon="false"><a href="#classView" class="ui-link-inherit not-active">'
		   + 	'<h2>' + item.class_code + '</h2><p>' + item.class_description + '</p>'
		   + 	'<p class="ui-li-aside">' + comp.toString() + ' / ' + total.toString() + '</p>'
		   + '<div class="progress-wrapper">'
		   + 	'<div class="badge-box" style="padding-left: 0px">'
		   + 		'<div class="carat-up"></div>'
		   +		'<span class="badge">' + item.pass_grade + '</span>'
		   +	'</div>'
		   + 	'<div class="badge-box" style="padding-left: 0px">'
		   +		'<div class="carat-up carat-up-success"></div>'
		   + 		'<span class="badge badge-success" >' + item.target_grade + '</span>'
		   + 	'</div>'
		   + 	'<div class="progress" data-total-weight="' + weight +'" id="bar">'
		   + 		'<div style=" width: '+ achieved +'%" role="progressbar" class="progress-bar progress-bar-default">'
		   + 			achieved 
		   +		'</div>'
		   +		'<div style="height:20px;margin-left:' + achieved + '%;position:absolute;width: 0%; display: none" role="progressbar" class="progress-bar progress-bar-warning hoverGrade">'
		   +			0
		   +		'</div>'
		   +		'<div style="float: right; width: '+ lost +'%" role="progressbar" class="progress-bar progress-bar-danger">'
		   +			lost
		   +		'</div>'
		   +	'</div>'
		   + '</div><h3><span class="small">&Sigma; Weight:</span>' + weight + '</h3>'
		   + '</a><a href="#editView" data-rel="popup" data-position-to="window" data-transition="pop">Edit Class</a></li></ul>';
	// add the element to the page
	$("div#classView section").prepend(ul);
	refreshLists();
	
	// change the defaults in the edit Form
	$("#editClassCode").val(item.class_code);
	$("#editClassDesc").val(item.class_description);
	$("#editClassGoal").val(item.target_grade);
	$("#editClassPass").val(item.pass_grade);
	$('#editClassGoal, #editClassPass').slider("refresh");
}//}
//}

//{ Action that adds a new assignment
function handleAddAssForm() {
	if($("#assAdd").valid()) {
		var type = $("#addAssType").val();
		var name = $("#addAssName").val().trim();
		var desc = $("#addAssDesc").val().trim();
		var bonus = $("#addAssBonus").val() === 'true';
		var due = $("#addAssDate").val();
		var weight = $("#addAssWeight").val();
		
		tblAssignmentInsert(type, name, desc, due, weight, bonus, addAssSuccess, addAssFail);
	}
}
//{ Add Ass dependences
function addAssSuccess(tx, result) {
	var id = result.rows.item(0).id;
	$('#assAdd').trigger("reset");
	toggleTaskForm(true);
	displayClass();
	$('#showOnAdd').collapsible("expand");
}
function addAssFail(tx, result) {
	alert("There was a problem adding the assignment.\nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that populate the assignment lists
function populateAssList() {
	// empty out the lists
	$("#markedAssList").empty();
	$("#completedAssList").empty();
	$("#outstandingAssList").empty();
	// iterate over each item in a callback
	tblAssignmentList(assListIterate);
}
// { Populate Ass List dependences 
function assListIterate(tx, res) {
	var rs = res.rows;
	for(var i = 0; i < rs.length; i++){
		// get the record and state
		var r = rs.item(i);
		var weight = parseFloat(r.weight_achieved);
		weight = isNaN(weight) ? 0 : weight;
		// build the date string
		var isOut = r.state == 'OUTS';
		var dateDue = new Date(r.date_due);
		dateDue = new Date(dateDue.getTimezoneOffset()*60000 + dateDue.getTime());
		var dateSub = new Date(r.date_submitted);
		dateSub = new Date(dateSub.getTimezoneOffset()*60000 + dateSub.getTime());
		var onTime = dateDue.getTime() >= (isOut ? Date.now() : dateSub.getTime());
		var date = isOut ? dateDue.toDateString() : dateSub.toDateString();
		var color = onTime ? 'style="color:#606060;text-shadow:1px 1px 0px #fff"' : 'style="color:#b65455;text-shadow:1px 1px 0px #fff"';
		// build the element
		var li = '<li><a href="#assView" class="ui-link-inherit" onclick="setAssId(' + r.ass_id + ');">'
			   + 	'<div class="circle" data-value="' + weight + '" data-weight="' + r.weight_total + '">'
			   +		'<strong></strong>'
			   +	'</div>'
			   +	'<h2>' + r.ass_name + '</h2><p>' + r.ass_description + '</p>'
			   +	'<p class="ui-li-aside"' + color + '>' + date + '</p>'
			   +	'<strong><span>&#215;</span>' + r.weight_total + '</strong>'
			   + '</a></li>';
		// place element in the right list
		if(r.state == "MARK"){
			$("#markedAssList").append(li);
		}else if(r.state == "COMP"){
			$("#completedAssList").append(li);
		}else{
			$("#outstandingAssList").append(li);
		}
	}
	if(rs.length <= 0){
		toggleTaskForm(true);
		toggleTaskForm(false);
	}
	else {
		toggleTaskForm(true);
	}
	refreshLists();
}//}
//}

//{ Action that edits a class
function handleEditClassForm() {
	if($("#classEdit").valid()) {
		var code = $("#editClassCode").val().trim();
		var desc = $("#editClassDesc").val().trim();
		var target = $("#editClassGoal").val();
		var pass = $("#editClassPass").val();
		
		tblClassUpdate(code, desc, pass, target, editClassSuccess, editClassFail);
	}
}
//{ Edit Class dependences
function editClassSuccess(tx, result) {
	displayClass();
	$( "#editView" ).popup( "close" )
}
function editClassFail(tx, result) {
	alert("There was a problem modifying the class. \nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that deletes a class
function handleDeleteClassForm() {
	var result = confirm("You are about to permanently delete this Class along with all its Tasks.\n\nContinue?");
	if(result) {
		tblClassDelete(deleteClassSuccess, deleteClassFail);
	}
}
//{ Delete class dependences
function deleteClassSuccess(tx, result) {
	$.mobile.changePage("index.html#homeView");
}
function deleteClassFail(tx, result) {
	alert("There was a problem deleting the class. \nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that displays an assignment
function displayAssignment() {
	//reset the list
	$('#assView ul.addToHead').empty();
	// get the assignment item through callback
	tblAssignmentRead(assignmentCurry);
}
//{ Display assignment dependences
function assignmentCurry(tx, res) {
	// get the record and class id from the record set
	var r = res.rows.item(0);
	var classId = r.class_id;
	// get class info
	dbGetClassInfo(classId, moreClassInfo(r, buildAssignmentHeader));
}
function buildAssignmentHeader(item, total, weight, achieved, lost, comp){
	// get class name
	className = localStorage.getItem("className");
	// convert weight to percentages
	var achieved 	= (weight <= 0 ? 0 : Math.ceil(achieved / weight * 100));
	var lost	 	= (weight <= 0 ? 0 : Math.floor(lost / weight * 100));
	var itemTotal 	= (weight <= 0 ? 100 : Math.ceil(item.weight_total / weight * 100));
	var itemAchieved = 0;
	var itemLost = 0;
	achieved = Math.min(achieved, 100);
	lost = Math.min(lost, 100 - achieved);

	// current item state
	var isMarked = item.state.trim() == "MARK";
	var isComplete = item.state.trim() == "COMP";
	
	// set footer actions
	if(isMarked){
		$("#submit, #record").addClass('ui-state-disabled');
	}
	else if(isComplete){
		$("#record").removeClass('ui-state-disabled');
		$("#submit").addClass('ui-state-disabled');
	}
	else{
		$("#submit").removeClass('ui-state-disabled');
		$("#record").addClass('ui-state-disabled');
	}
	
	// set middle bars in class item
	var centerBars = '<div style="height:20px;margin-left:' + achieved + '%;position:absolute;width: '+ itemTotal +'%" role="progressbar" class="progress-bar progress-bar-warning">'
			   + itemTotal + '</div>';
	if(isMarked){
		itemAchieved = Math.ceil(itemTotal * item.weight_achieved);
		itemLost = item.is_bonus == 'true' ? 0 : itemTotal - itemAchieved;
		achieved -= itemAchieved;
		lost -= itemLost;
		centerBars = '<div style="height:20px;margin-left:' + achieved + '%;position:absolute;width: '+ itemAchieved +'%" role="progressbar" class="progress-bar progress-bar-info">'
				   + itemAchieved + '</div>'
				   + '<div style="float: right; height:20px;right:' + lost + '%;position:absolute;width: '+ itemLost +'%" role="progressbar" class="progress-bar progress-bar-alert">'
				   + itemLost + '</div>'
	}
	
	// create class item
	var li1	= '<li data-icon="false"><a class="ui-link-inherit not-active">'
			+ '<h2>' + className + '</h2>'
			+ '<div class="progress-wrapper">'
			+ 	'<div class="progress" data-total-weight="100" id="bar">'
			+ 	'<div style="width: '+ achieved +'%" role="progressbar" class="progress-bar progress-bar-default">'
			+ 		achieved
			+ 	'</div>'
			+ 	'<div id="fail" style="float: right; width: '+ lost +'%" role="progressbar" class="progress-bar progress-bar-danger ">'
			+		lost
			+	 '</div>' + centerBars + '</div>'
			+ '</div></a></li>';
	// append class item
	$("#assView ul.addToHead").append(li1);
	
	// create assignment item
	var li2 = '<li data-icon="false"><a class="ui-link-inherit not-active">'
			+ 	'<h2 style="float:left" id="Name">' + item.ass_name + '</h2>'
			+	'<h2 style="float:right"><span class="small">Weight:</span><span id="Weight">'+ item.weight_total +' / '+ weight +'</span></h2>'
			+	'</a><a id="editTaskBtn" onclick="toggleEditForm(false);">Edit Task</a>'
			+ '</li>';
	// append assignment item and refresh list
	$("#assView ul.addToHead").append(li2);
	
	// set the edit form values
	populateTypeList(item.type_name);
	$("#state").val(item.state);
	$("#editAssBonus").val(item.is_bonus);
	$("#editAssBonus").slider("refresh");
	$("#editAssName").val(item.ass_name);
	$("#editAssDesc").val(item.ass_description);
	$("#editAssDate").val(item.date_due);
	$("#editAssSubm").val(item.date_submitted);
	$("#submitAssDate").val(getTodayDate());
	$("#editAssGrade").val(Math.ceil(item.weight_achieved * 100));
	$("#editAssGrade").slider("refresh");
	$("#recordAssGrade").val(55);
	$("#recordAssGrade").slider("refresh");
	$("#editAssWeight").val(item.weight_total);
	
	// set the late label
	var due = (new Date(item.date_due)).getTime();
	var compare = item.state == "OUTS" ? Date.now() : new Date((item.date_submitted)).getTime();
	if(due < compare){
		$("#isLate").show()
	}
	else {
		$("#isLate").hide()
	}
	
	// toggle form off
	toggleEditForm(true);
	refreshLists();
}//}
//}

//{ Action that changes an assignment's state to COMP
function handleSubmitAssForm() {
	if($("#assSubmit").valid()) {
		var date = $("#submitAssDate").val();
		
		tblAssignmentSetCompleted(date, submitAssSuccess, submitAssFail);
	}
}
//{ Sumbit ass dependences
function submitAssSuccess(tx, res) {
	displayAssignment();
	$( "#submitView" ).popup( "close" )
}
function submitAssFail(tx, res) {
	alert("There was a problem setting the task's submitted date. \nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that changes an assignment's state to MARK
function handleRecordAssForm() {
	if($("#assRecord").valid()) {
		var mark = parseFloat($("#recordAssGrade").val()) / 100;
		
		tblAssignmentSetMarked(mark, recordAssSuccess, recordAssFail);
	}
}
//{ Record ass dependences
function recordAssSuccess(){
	displayAssignment();
	$( "#recordView" ).popup( "close" )
}
function recordAssFail() {
	alert("There was a problem recording the task's mark. \nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that deletes an assignment
function handleDeleteAssForm() {
	var result = confirm("You are about to permanently delete this Task.\n\nContinue?");
	if(result) {
		tblAssignmentDelete(deleteAssSuccess, deleteAssFail);
	}
}
//{ Delete ass dependences
function deleteAssSuccess() {
	$.mobile.changePage("index.html#classView");
}
function deleteAssFail() {
	alert("There was a problem delete the task. \nERROR MESSAGE: " + result.message);
}//}
//}

//{ Action that edits an assignment
function handleEditAssForm() {
	if($("#assEdit").valid()) {
		var type = $("#editAssType").val();
		var name = $("#editAssName").val().trim();
		var desc = $("#editAssDesc").val().trim();
		var bonus = $("#editAssBonus").val() === 'true';
		var due = $("#editAssDate").val();
		var weight = $("#editAssWeight").val();
		var mark = parseFloat($("#editAssGrade").val()) / 100;
		var submit = $("#editAssSubm").val();
		
		tblAssignmentUpdate(type, name, desc, due, submit, weight, mark, bonus, editAssSuccess, editAssFail)
	}
}
//{ Edit ass dependences
function editAssSuccess() {
	displayAssignment();
}
function editAssFail() {
	alert("There was a problem modifying the task. \nERROR MESSAGE: " + result.message);
}//}
//}
/****************************
 *	 	EVENT BINDINGS		*
 ****************************/

//{ Clear Data Event
$(".resetData").on( "click", function() {
	var result = confirm("You are about to reset all your Weight2Grade data." 
						 + "There is no way to undo this change.\n\nContinue?");
	if(result){
		// set setup as RESET
		localStorage.setItem("setup", "RESET");
		parent.window.location.href = "index.html";
	}
});
//}

//{ Window Resize Event
var doit;
window.onresize = function(){
  clearTimeout(doit);
  doit = setTimeout(resetBadges, 500);
};
//}

//{ Page Show Events
$(window).on("pageshow", resetBadges);
$(window).on("pageshow", revealCircles);
//}

//{ Assignment List Expand Event
$(document).on("collapsibleexpand", function() {
	var str = $("#taskToggle").text();
	if(str == "Cancel"){
		toggleTaskForm(false);
	}
	$(".circle").circleProgress("redraw");
});
//}