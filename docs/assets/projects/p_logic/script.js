// Lim-e debugging 
//var host_name = 'http://lim-e.usc.edu:8050'

// Deployment
// var host_name = 'https://ae6f002c.ngrok.io'
var host_name = 'https://385b-68-181-17-229.ngrok.io'

// Localhost debugging
//var host_name = 'http://localhost:8040'

var cur_env_id = null;
var game_state = 'ready'
var game_result_success = true;


function probe_image(image_url) {
  var http = new XMLHttpRequest();

  http.open('HEAD', image_url, false);
  http.send();

  return http.status != 404;
}

function update_src(ele_name, endpoint, stream, on_done) {
  endpoint += '&nocache=' + Math.random();
  if (stream) {
    $(ele_name).attr('src', endpoint);
    on_done();
  }
  else {
    $.get(endpoint, function(data, status) {
      let img_url = data;
      while (!probe_image(img_url)) {
        // pass time
        console.log('Image does not exist', );
      }
      console.log('Does image exist', probe_image(img_url));
      $(ele_name).attr('src', img_url);
      on_done();
    });
  }
}

function update_img(should_hide_loading=false) {
  console.log('Updating img');
  //set_status('Paused');
  if (!should_hide_loading) {
    disp_loading();
  }
  $('#play-display').one('load', function() {
    // Once the image has actually loaded 
    if (this.complete) {
      console.log('Loading completed');
      if (should_hide_loading) {
        $('#play-display-vid').hide();
      }
      else {
        hide_loading();
      }
    }
  });
  update_src('#play-display', host_name + '/get_img?id=' + cur_env_id, true, function () {});
}

function update_tools() {
  var tool_idx = 1;

  console.log('updating tools');

  $('.tool-img').each(function() {
    update_src(this, host_name + '/get_tool?id=' + cur_env_id + '&tool=' + tool_idx, true, function () {});
    $(this).attr('id', 'tool_' + tool_idx);
    tool_idx += 1;
  });
}

function update_task() {
  $('#play-display-vid').hide();
  if (cur_env_id != null) {
    // Deallocate the previous environment 
    console.log('Removing previous environment')
    $.get(host_name + '/remove?id=' + cur_env_id, function () {
      // should we add some sort of check that the environment was removed? 
    });
  }

  hide_play_error();

  for (var i = 0; i < g_placed_tools.length; ++i) {
    console.log('Removing ' + g_placed_tools[i].place_id);
    $('#' + g_placed_tools[i].place_id).remove();
  }
  g_placed_tools = [];

  let task_name = $('input[name=task_option]:checked').val();
  let full_task_name = 'CreateLevel' + task_name + '-v0';

  console.log('Setting task to ' + full_task_name);
  $.get(host_name + '/create_env?task-name=' + full_task_name, function(data, status) {
    if (status == 'success') {
			set_game_state_ready();
      cur_env_id = data.env_id;
      update_img();
      update_tools();
    }
    else {
      console.log('Could not get the task name')
    }
  }).fail(function() {
    disp_backend_error();
  });
}

function set_game_state_ready() {
	game_state = 'ready'

	$('#play-again-btn').removeClass('glowing-btn');
	$('#reset-btn').removeClass('glowing-btn');
	$('#play-btn').removeClass('disabled-btn');

  $('#play-error-msg').css('color', 'red');
}

$(document).ready(function() {
  console.log('ready')
  $('#play-display-vid').hide();
  hide_play_error();

  $('input[type=radio][name=task_option]').change(function() {
    update_task();
  });

  // Initialize the task. 
  update_task();

  $('.tool-img').on('dragstart', function (event) {
    let ele_id = $(this).attr('id').split('_')[1];
    console.log('Starting drag with tool id ' + ele_id);
    event.originalEvent.dataTransfer.setData('text', ele_id);
    event.originalEvent.dataTransfer.setData('is_move', false);
  });

  $('#play-display-vid').on('ended', function() {
    if (game_result_success == null) {
      return;
    }
    console.log('vid ended');
    // Set to be a static frame.
    update_img(true);

    // Set the final status
    if (game_result_success) {
      disp_game_success();
    }
    else {
      disp_game_over();

      // Automatically retry
      early_reset = false;
      setTimeout(function () {
        console.log('trying to hit play again btn ' + early_reset);
        if (!early_reset) {
          $('#play-again-btn').click();
        }
      }, 4000);
    }
  });

  $('#reset-btn').click(function () {
    console.log('resetting');
    update_task();
  });

  $('#play-again-btn').click(function () {
    $('#play-display-vid').hide();
    hide_play_error();
    game_result_success = null;

    $.get(host_name + '/reset_env?id=' + cur_env_id, function (data, status) {
      console.log('resetting env');
      if (data.ok) {
        update_img();
        for (var i = 0; i < g_placed_tools.length; ++i) {
          console.log('showing ' + g_placed_tools[i].place_id);
          $('#' + g_placed_tools[i].place_id).show();
        }
				set_game_state_ready();
      }
      else {
        // report error
      }
    });
  });

  $('#play-btn').click(function () {
    if (game_state != 'ready') {
      $('#play-error-msg').text('Game has ended, cannot simulate. Press Re-try or Reset to play again');
      console.log('Game state is not prepared');
      return;
    }

    // Actually place all of the tools on the screen
    var place_pos = '';
    var place_idxs = '';
    console.log(g_placed_tools);
    for (var i = 0; i < g_placed_tools.length; ++i) {
      console.log(g_placed_tools[i]);
      let norm_x = g_placed_tools[i].place_loc[0];
      let norm_y = g_placed_tools[i].place_loc[1];
      let idx = g_placed_tools[i].tool_id;
      place_pos += norm_x + ',' + norm_y + ',';
      place_idxs += idx + ',';
    }

    var url = host_name + '/place_tool?id=' + cur_env_id + '&tool=' + place_idxs + '&pos=' + place_pos;
    url = encodeURI(url);
    disp_loading();
    $.get(url, function(data, status) {
      if (data.ok) {
        console.log('simulating');
        for (var i = 0; i < g_placed_tools.length; ++i) {
          console.log('hiding placed tool ' + g_placed_tools[i].place_id);
          $('#' + g_placed_tools[i].place_id).hide();
        }

        // All tools have been placed we are ready to simulate.
        $.get(host_name + '/simulate?id=' + cur_env_id, function(data, status) {
          console.log('Got response ');
          console.log(data);

          $('#play-display-vid').show();

          update_src('#play-display-vid', host_name + '/get_result?id=' + cur_env_id, true, function () {
            $('#play-display-vid')[0].load();
            hide_loading();
            game_result_success = data.goal_hit;

            $('#play-display-vid')[0].play();
          });
        });
      }
      else {
        hide_loading();
        disp_play_error('Simulation error. You cannot place tools on top of each other. ');
      }
    });
  });
});



