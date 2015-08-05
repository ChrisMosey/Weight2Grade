/*	util.js
	functions and methods to make the application work

	Revision history
		Daniel Franz	 2015.04.01: created
*/

//{ Toggles the Add Class Form Open & Closed
function toggleAddForm(close) {
	if(close) {
		$(".addClassForm").toggle(false);
	}
	else {
		$(".addClassForm").toggle("fast");
	}
	var str = $("#addToggle").text();
	if(str == "Add Class" && !close)
	{
		$("#addToggle").text("Cancel")
					   .removeClass("ui-icon-plus")
					   .addClass("ui-icon-minus");
	}
	else
	{
		$("#addToggle").text("Add Class")
					   .removeClass("ui-icon-minus")
					   .addClass("ui-icon-plus");
	}
}//}

//{ Toggles the Add Task Form Open & Closed
function toggleTaskForm(close) {
	if(close) {
		$(".taskForm").toggle(false);
	}
	else {
		$(".taskForm").toggle("fast");
	}
	var str = $("#taskToggle").text();
	if(str == "Add Task" && !close)
	{
		$("#taskToggle").text("Cancel")
					   .removeClass("ui-icon-plus")
					   .addClass("ui-icon-minus");
		$("#addSpace1 .ui-collapsible").collapsible("collapse");
		
	}
	else
	{
		$("#taskToggle").text("Add Task")
					   .removeClass("ui-icon-minus")
					   .addClass("ui-icon-plus");
	}
}//}

//{ Toggle the Edit Task Form 
function toggleEditForm(close) {
	if(close) {
		$("#assCtrlGroup").toggle(false);
		$("#assView footer").toggle(true);
	}
	else {
		$("#assCtrlGroup").toggle("fast");
		$("#assView footer").toggle("fast");
	}
	
	var state = $("#state").val().trim();
	var str = $("#editTaskBtn").prop('title').trim();
	if(str == "Edit Task" && !close)
	{
		$("#editTaskBtn").prop('title', 'Cancel')
						.addClass("ui-state-persist")
						.addClass("ui-btn-active");
						
		$("#editAssName, #editAssDesc, #editAssDate, #editAssWeight").removeClass('disabled');
		$("#editAssName, #editAssDesc, #editAssDate, #editAssWeight").removeAttr('readonly');
		if(state == "MARK")
		{
			$("#editAssGrade, #editAssSubm").removeClass('disabled');
			$("#editAssGrade, #editAssSubm").removeAttr('readonly');
			$("#assEdit div.ui-slider-track").css('pointer-events', 'auto');
		}
		else if(state == "COMP")
		{
			$("#editAssSubm").removeClass('disabled');
			$("#editAssSubm").removeAttr('readonly');
		}
		$("#assEdit div.ui-slider.ui-slider-switch," +
		  "#assEdit div.ui-select.ui-mini," +
		  "#assEdit div.ui-btn.ui-icon-minus.ui-first-child," +
		  "#assEdit div.ui-btn.ui-icon-plus.ui-last-child").css('pointer-events','auto');
	}
	else
	{
		$("#editTaskBtn").prop('title', 'Edit Task')
						.removeClass("ui-state-persist")
						.removeClass("ui-btn-active");
						
		$("#assEdit input, #assEdit textarea").addClass('disabled');
		$("#assEdit input, #assEdit textarea").attr('readonly', 'readonly');
		$("#assEdit div.ui-slider-track:not(.ignore)," +
		  "#assEdit div.ui-slider.ui-slider-switch," +
		  "#assEdit div.ui-select.ui-mini," +
		  "#assEdit div.ui-btn.ui-icon-minus.ui-first-child," +
		  "#assEdit div.ui-btn.ui-icon-plus.ui-last-child").css('pointer-events','none');
	}	
}//}

//{ Moves the badges to their proper location 
function resetBadges(event, ui) {
	$(".badge-box").each(function(index){
		var numb = $(this).text().trim() + "%";
		$(this).animate({marginLeft: numb}, "faster");
		$(this).animate({marginLeft: "-=13px"}, "faster");
	});
}//}

/* Moves the badges to the origin
function resetBadges(event, ui) {
	$(".badge-box").each(function(index){
		$(this).css(marginLeft, "0px");
	});
}*/

//{ Animates the circular progress bars
function revealCircles() {
	$.each($(".circle"), function(key, value){
		var percent = parseFloat($(value).attr('data-value'));
		$(value).circleProgress({
			value: percent,
			size: 80,
			reverse: true,
			thickness: 12,
			startAngle: 0,
			fill: {color: "#337ab7"},
			animation: { duration: 600 }
		}).on('circle-animation-progress', function(event, progress){
			$(value).find('strong').html(parseInt(100 * percent * progress) + '<i>%</i>');
		});
	});
}//}

//{ Animates both the circular progress bar and the class bar
function pumpCircle(circle){
	$(".hoverGrade").show();
	var weight = parseInt($(circle).attr('data-weight'));
	var total = parseInt($("#bar").attr('data-total-weight'));
	var percent = Math.ceil(weight / total * 100);
	$(".hoverGrade").width(percent.toString() + "%");
	$(circle).circleProgress({
		value: 1,
		size: 80,
		reverse: true,
		thickness: 12,
		startAngle: 0,
		fill: {color: "#FFAA3B"},
		animation: { duration: 600 }
	}).on('circle-animation-progress', function(event, progress){
		var width = parseInt(percent * progress);
		$(".hoverGrade").text(width);
	});
}//}

//{ Resets both the circular progress bar and the class bar
function deflateCircle(circle){
	$(".hoverGrade").hide();
	$(".hoverGrade").text("");
	$(".hoverGrade").width(0);
	$(circle).circleProgress({
		value: 0,
	})
}//}

//{ Capitalizes only first letter of a string for TYPE NAME
function typeFormat(str){
	str = str.trim();
	return str.substring(0,1).toUpperCase() + str.substring(1,str.length).toLowerCase();
}//}

//{ Escapes special characters 
function sanitize(str, code){
	// required sanitation
	var regex;
	switch(code){
		default:
	}
	
	return str;
}//}

//{ Sets the classId session variable
function setClassId(id) {
	localStorage.setItem("classID", id);
}//}

//{ Sets the className session variable
function setClassName(name) {
	localStorage.setItem("className", name);
}
//}

//{ Sets the assignmnetId session variable
function setAssId(id) {
	localStorage.setItem("assignmentID", id);
}//}

//{ Sets the hover event for assignments li 
function setHoverStates() {
	$("#outstandingAssList > li > a").hover(function() {
		pumpCircle($(this).find(".circle"));
	}, function(){
		deflateCircle($(this).find(".circle"));
	});
	$("#completedAssList > li > a").hover(function() {
		pumpCircle($(this).find(".circle"));
	}, function(){
		deflateCircle($(this).find(".circle"));
	});
}//}

//{ Rebuilds all the jquery components on a page
function refreshLists() {
	$('ul[data-role="listview"]').listview().listview("refresh");
	resetBadges(null, null);
	revealCircles();
	setHoverStates();
}//}

//{ Function that gets today's date
function getTodayDate() {
	var today = new Date();
	var dd = today.getDate();
	var mm = today.getMonth()+1; //January is 0!
	var yyyy = today.getFullYear();

	if(dd<10) {
		dd='0'+dd
	} 

	if(mm<10) {
		mm='0'+mm
	} 

	return(yyyy + '-' + mm + '-' + dd);
}//}

/****************************
 *		  VALIDATION		*
 ****************************/
function refreshValidation() {
	//{ Sets up the Class Add Form validation
	$("#classAdd").validate({
		errorPlacement: function(error, element) {
			error.appendTo(element.parent("div").parent("li"));
		},
		rules: {
			addClassCode: {
				required: true,
				rangelength: [2,30]
			},
			addClassDesc: {
				rangelength: [0,250]
			},
			addClassGoal: {
				range: [0,100]
			}
		},
		messages: {
			addClassCode: "Class Code must be between 2 and 30 characters long.",
			addClassDesc: "Description must be less than 250 characters long.",
			addClassGoal: "Target Grade is a percent between 0 and 100."
		}
	});//}
	//{ Sets up the Assignment Add Form validation
	$("#assAdd").validate({
		errorPlacement: function(error, element) {
			error.appendTo(element.closest("li"));
		},
		rules: {
			addAssName: {
				required: true,
				rangelength: [2,30]
			},
			addAssDesc: {
				rangelength: [0,250]
			},
			addAssDate: {
				required: true,
				date: true
			},
			addAssWeight: {
				required: true,
				range: [0,1000]
			}
		},
		messages: {
			addAssName: "Name must be between 2 and 30 characters long.",
			addAssDesc: "Description must be less than 250 characters long.",
			addAssDate: "Due Date is required.",
			addAssWeight: "Weight must be whole number between 1 and 1,000."
		}
	});//}
	//{ Sets up the Edit Class Form validation
	$("#classEdit").validate({
		errorPlacement: function(error, element) {
			$(element).parent("div").after(error);
		},
		rules: {
			editClassCode: {
				required: true,
				rangelength: [2,30]
			},
			editClassDesc: {
				rangelength: [0,250]
			},
			editClassGoal: {
				range: [0,100]
			},
			editClassPass: {
				range: [0,100]
			}
		},
		messages: {
			editClassCode: "Class Code must be between 2 and 30 characters long.",
			editClassDesc: "Description must be less than 250 characters long.",
			editClassGoal: "Target Grade is a percent between 0 and 100.",
			editClassPass: "Pass Grade is a percent between 0 and 100."
		}
	});//}
	//{ Sets up the Submit Assignment Form validation
	$("#assSubmit").validate({
		errorPlacement: function(error, element) {
			$(element).parent("div").after(error);
		},
		rules: {
			submitAssDate: {
				required: true,
				date: true
			}
		},
		messages: {
			submitAssDate: "Date Handed In is required."
		}
	});//}
	//{ Sets up the Record Assignment Form validation
	$("#assRecord").validate({
		errorPlacement: function(error, element) {
			$(element).parent("div").after(error);
		},
		rules: {
			recordAssGrade: {
				required: true,
				range: [0,100]
			}
		},
		messages: {
			recordAssGrade: "Recieved Mark is a percent between 0 and 100."
		}
	});//}
	//{ Sets up the Edit Assignment Form validation
	$("#assEdit").validate({
		errorPlacement: function(error, element) {
			error.appendTo(element.closest("li"));
		},
		rules: {
			editAssName: {
				required: true,
				rangelength: [2,30]
			},
			editAssDesc: {
				rangelength: [0,250]
			},
			editAssDate: {
				required: true,
				date: true
			},
			editAssWeight: {
				required: true,
				range: [0,1000]
			}
		},
		messages: {
			addAssName: "Name must be between 2 and 30 characters long.",
			addAssDesc: "Description must be less than 250 characters long.",
			addAssDate: "Due Date is required.",
			addAssWeight: "Weight must be whole number between 1 and 1,000."
		}
	});//}
}