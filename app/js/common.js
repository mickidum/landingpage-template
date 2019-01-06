jQuery(document).ready(function($) {
$(document).foundation();
	// FORM
$('#myform').on('submit',  function(event) {
		event.preventDefault();
		
	var inputs = validForm($('#myform input'));
	
	if (!inputs) {
		swal({
			title: 'שגיאה',
			text: 'חובה למלא כל השדות',
			type: 'error',
			confirmButtonText: 'OK'
		});
		return;
	}

	$('.hollow-dots-spinner-cont').show();
		var a = $('#myform').serialize();
		
		$.post('api/api.php', a, function(data) {
			var final_data = JSON.parse(data);
			$('.hollow-dots-spinner-cont').hide();
			if(final_data.valid) {
				swal({
					type: 'success',
					title: 'נשלח בהצלחה',
					text: final_data.message,
				});
				document.getElementById('myform').reset();
			}
			else {
				swal({
					title: 'שגיאה',
					text: final_data.message,
					type: 'error',
					confirmButtonText: 'OK'
				});
			}
		});
});

function validForm(form) {
	for (var i = 0; i < form.length; i++) {
		var element = form[i];
		if (!element.value) {
			return false;
		}
	}
	return true;
}
});

