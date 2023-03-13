function disp_loading() {
  $('#loading-gif').show();
}

function hide_loading() {
  $('#loading-gif').hide();
}

GAME_OVER_COLOR = '#f18b80';
GAME_SUCCESS_COLOR = '#2ecc7159';

function disp_play_error(msg) {
  $('.play-container').css('background-color', GAME_OVER_COLOR);
  $('#play-display').css('opacity', 0.5);
  $('#play-error-msg').text(msg);
  $('#play-error-msg').show();

  // Hide this error message after 2 seconds.
  setTimeout(function () {
    hide_play_error();
  }, 2000);
}

function disp_game_over() {
  console.log('game over')
  //$('.play-container').css('background-color', GAME_OVER_COLOR);
  //$('#play-display').css('opacity', 0.5);
  //$('#play-display-vid').css('opacity', 0.5);
  $('#play-error-msg').text('Game over. Press Retry.');
  $('#play-error-msg').show();
  game_state = 'done'
	//$('#play-again-btn').addClass('glowing-btn');
	//$('#reset-btn').addClass('glowing-btn');
	$('#play-btn').addClass('disabled-btn');

  setTimeout(function () {
    hide_play_error(false);
  }, 1000);
}

function disp_game_success() {
  console.log('game over')
  //$('.play-container').css('background-color', GAME_SUCCESS_COLOR);
  //$('#play-display').css('opacity', 0.5);
  //$('#play-display-vid').css('opacity', 0.5);
  $('#play-error-msg').text('Game Success');
  $('#play-error-msg').show();
  game_state = 'done';
  $('#reset-btn').removeClass('disabled-btn');
	$('#reset-btn').addClass('glowing-btn');
  $('#play-again-btn').addClass('disabled-btn');
	$('#play-btn').addClass('disabled-btn');
  $('#play-error-msg').css('color', '#2ecc71');

  setTimeout(function () {
    hide_play_error(false);
  }, 1000);
}

function hide_play_error(hide_error=true) {
  console.log('hidding error msg');
  $('.play-container').css('background-color', 'white');
  $('#play-display').css('opacity', 1.0);
  $('#play-display-vid').css('opacity', 1.0);
  if (hide_error)
    $('#play-error-msg').hide(500);
}

function disp_backend_error() {
  $('#main-demo-window').hide();
  $('#error-window').show();
}
