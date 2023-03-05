var survey_link = 'https://docs.google.com/forms/d/e/1FAIpQLSfYLPrvxokUEUxnhs5LhDeiOWHoc6KvawBy8D2TP9lfseDy8w/viewform?usp=pp_url&entry.438013958=UUIDTEST'

function validate_uuid(uuid) {
	// https://stackoverflow.com/questions/7905929/how-to-test-valid-uuid-guid
	return /^[0-9A-F]{8}-[0-9A-F]{4}-[4][0-9A-F]{3}-[89AB][0-9A-F]{3}-[0-9A-F]{12}$/i.test(uuid);
}


function generate_uuid() {
	// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
	  var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
	  return v.toString(16);
	});
  }

function get_uuid() {
	let uuid = $("#UUID").val();
	return uuid;
}

function update_survey_link() {
	uuid = get_uuid()
	let valid_uuid = validate_uuid(uuid);
	let updated_survey_link;
	if (valid_uuid) {
		updated_survey_link = survey_link.replace("UUIDTEST", uuid);
		$("#pre-evaluation-link").attr("href", updated_survey_link);
	} else {
		$("#pre-evaluation-link").html("UUID is not valid. Please try refreshing or ensure your modified, entered UUID is correct.")	
		updated_survey_link = null;
	}
	return updated_survey_link;
}
  
$(document).ready(function () {
	$("#pre-evaluation-link").click(function() {
		$("#pre-evaluation-link").html("Please move on below once filled out!");
		//$("#main-demo-window").attr("style.display", "block");
		var video_div = document.getElementById("video");
		video_div.style.display = "block";
	});
});