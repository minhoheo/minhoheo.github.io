// Lim-e debugging 
//var host_name = 'http://lim-e.usc.edu:8050'

// Deployment
// var host_name = 'https://ae6f002c.ngrok.io'
var host_name = 'https://cd1c-68-181-17-71.ngrok.io'

var DEBUG_MODE = true;

// Localhost debugging
//var host_name = 'http://localhost:8040'

var cur_env_id = null;
var game_state = 'ready'
var game_result_success = true;

const task_names = [
    "TestLevel",
    "Push",
    "Navigate",
    "Obstacle",
    "Basket",
    "Belt",
    "Buckets",
    "Collide",
    "Ladder",
    "Moving",
    "Cannon",
    "Seesaw",
    "Funnel",
    "TwoGoal",
    "TwoGoalFlip",
]

var current_task_index = 0;
var current_task_plays = 0;
const TOTAL_TASK_PLAYS = 5;

function auto_play_again() {
  $('#play-display-vid').hide();
  hide_play_error();
  game_result_success = null;

  $.get(host_name + '/reset_env?id=' + cur_env_id + get_time_and_uuid() + "&intentional=" + false, function (data, status) {
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
  }

  function probe_image(image_url) {
    var http = new XMLHttpRequest();

    http.open('HEAD', image_url, false);
    http.send();

    return http.status != 404;
  }

  function get_time_and_uuid() {
    var now_time = new Date().getTime();
    var url_suffix = '&send_time=' + now_time + '&uuid=' + get_uuid();
    return url_suffix;
  }

  function update_src(ele_name, endpoint, stream, on_done) {
    endpoint += '&nocache=' + Math.random();
    if (stream) {
      $(ele_name).attr('src', endpoint);
      on_done();
    }
    else {
      $.get(endpoint, function (data, status) {
        let img_url = data;
        while (!probe_image(img_url)) {
          // pass time
          console.log('Image does not exist',);
        }
        console.log('Does image exist', probe_image(img_url));
        $(ele_name).attr('src', img_url);
        on_done();
      });
    }
  }

  function update_img(should_hide_loading = false) {
    console.log('Updating img');
    //set_status('Paused');
    if (!should_hide_loading) {
      disp_loading();
    }
    $('#play-display').one('load', function () {
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
    update_src('#play-display', host_name + '/get_img?id=' + cur_env_id, true, function () { });
  }

  function update_tools() {
    var tool_idx = 1;

    console.log('updating tools');

    $('.tool-img').each(function () {
      update_src(this, host_name + '/get_tool?id=' + cur_env_id + '&tool=' + tool_idx, true, function () { });
      $(this).attr('id', 'tool_' + tool_idx);
      tool_idx += 1;
    });
  }

  function reinit() {
    $('#play-display-vid').hide();
    if (cur_env_id != null) {
      // Deallocate the previous environment 
      console.log('Removing previous environment')
      $.get(host_name + '/reinit?id=' + cur_env_id + get_time_and_uuid(), function () {
        // should we add some sort of check that the environment was removed? 
      });
    }
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
    get_new_task();
  }

  function display_finished_message() {
    $('#play-display-vid').hide();
    $('#play-error-msg').text('Finished!');
    $('#play-error-msg').css('color', 'green');
    $('#play-error-msg').show();
    $('#play-btn').addClass('disabled-btn');
    $('#play-again-btn').addClass('disabled-btn');
    $('#reset-btn').addClass('disabled-btn');
  }

  function get_new_task() {
    hide_play_error();

    for (var i = 0; i < g_placed_tools.length; ++i) {
      console.log('Removing ' + g_placed_tools[i].place_id);
      $('#' + g_placed_tools[i].place_id).remove();
    }
    g_placed_tools = [];
    g_removed_tools = [];
    g_tool_occurences = {};
    
    console.log('Current task index: ' +  current_task_index + ', Current task play: ' + current_task_plays);
    // exploration task is second case of current_task_index == 0
    if (current_task_plays >= TOTAL_TASK_PLAYS || current_task_index == 0 && current_task_plays >= 1) {
      // Go to next task if appropriate
    $(`#${task_names[current_task_index]}_label`).removeClass('active');
      current_task_index = current_task_index + 1;
      current_task_plays = 0;
    }
    current_task_plays = current_task_plays + 1;
    if (current_task_index >= task_names.length) {
      // Finished all tasks
      display_finished_message();  
    }
    //let task_name = $('input[name=task_option]:checked').val();
    //$(`input[name=task_option][value=${task_names[current_task_index]}]`).prop('checked', true);
    if (current_task_index != 0) {
      $('#test-level-instructions').hide();
      $('#task_name_header').text(`Current Task: ${task_names[current_task_index]}, Trials Remaining: ${TOTAL_TASK_PLAYS - current_task_plays + 1}`);
    } else {
      $('#task_name_header').text(`Current Task: ${task_names[current_task_index]}, Trials Remaining: 1`);
    }
    $(`#${task_names[current_task_index]}_label`).addClass('active');
    let task_name = task_names[current_task_index];
    let full_task_name = 'CreateLevel' + task_name + '-v0';
    //TODO: Uncomment this line once the server is updated with Dweep's changes
    //let full_task_name = 'CreateLevel' + task_name + 'Config' + current_task_plays - 1 + '-v0';

    console.log('Setting task to ' + full_task_name);
    $.get(host_name + '/create_env?task-name=' + full_task_name + get_time_and_uuid(), function (data, status) {
      if (status == 'success') {
        set_game_state_ready();
        cur_env_id = data.env_id;
        update_img();
        update_tools();
      }
      else {
        console.log('Could not get the task name')
      }
    }).fail(function () {
      disp_backend_error();
    });
  }

  function set_game_state_ready() {
    game_state = 'ready'

    $('#play-again-btn').removeClass('glowing-btn');
    $('#play-again-btn').removeClass('disabled-btn');
    $('#reset-btn').removeClass('glowing-btn');
    $('#reset-btn').addClass('disabled-btn');
    if (DEBUG_MODE) {
      $('#reset-btn').removeClass('disabled-btn');
      $('#reset-btn').addClass('glowing-btn');
    }
    $('#play-btn').removeClass('disabled-btn');

    $('#play-error-msg').css('color', 'red');
  }

  $(document).ready(function () {
    console.log('survey ready');	
    let generatedUUID = generate_uuid();
    $("#UUID").val(generatedUUID);

    // tie the survey link to prefilled UUID form link and open the window
    $("#pre-evaluation-link").click(function() {
      let updated_survey_link = update_survey_link();
      if (updated_survey_link) {
        window.open(updated_survey_link);
      }
    });
    console.log('ready')
    $('#play-display-vid').hide();
    hide_play_error();

    $('input[type=radio][name=task_option]').change(function () {
      // undo the button press because we're disabling the task switcher
      // let currently_checked = $('input[name=task_option]:checked').val();
      // $(`#${currently_checked}_label`).removeClass('active');
      // $(`#${currently_checked}`).prop('checked', false);
      // $(`#${task_names[current_task_index]}_label`).addClass('active');
      //update_task();
    });

    $('.tool-img').on('dragstart', function (event) {
      let ele_id = $(this).attr('id').split('_')[1];
      console.log('Starting drag with tool id ' + ele_id);
      event.originalEvent.dataTransfer.setData('text', ele_id);
      event.originalEvent.dataTransfer.setData('is_move', false);
    });

    $('#play-display-vid').on('ended', function () {
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
        // JESSE TODO: check if this is needed? 
        //early_reset = false;
        //setTimeout(function () {
        //  console.log('trying to hit play again btn ' + early_reset);
        //  if (!early_reset) {
        //    auto_play_again();
        //  }
        //}, 4000);
      }
    });

    $('#reset-btn').click(function () {
      if ($('#reset-btn').hasClass('disabled-btn') && !DEBUG_MODE) {
        return;
      } 
      console.log('resetting');
      reinit();
      get_new_task();
    });

    $('#play-again-btn').click(function () {
      if ($('#play-again-btn').hasClass('disabled-btn')) {
        return;
      }
      $('#play-display-vid').hide();
      hide_play_error();
      game_result_success = null;

      $.get(host_name + '/reset_env?id=' + cur_env_id + get_time_and_uuid() + "&intentional=" + true, function (data, status) {
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
        $('#play-error-msg').text('Game has ended, cannot simulate. Press Retry or Next to play again');
        console.log('Game state is not prepared');
        return;
      }

      // Actually place all of the tools on the screen
      var place_pos = '';
      var place_idxs = '';
      var place_timestamps = '';
      var occurences = '';
      console.log(g_placed_tools);
      for (var i = 0; i < g_placed_tools.length; ++i) {
        console.log(g_placed_tools[i]);
        let norm_x = g_placed_tools[i].place_loc[0];
        let norm_y = g_placed_tools[i].place_loc[1];
        let idx = g_placed_tools[i].tool_id;
        let tool_place_timestamp = g_placed_tools[i].time_stamp;
        let tool_occurence = g_placed_tools[i].occurence;
        place_pos += norm_x + ',' + norm_y + ',';
        place_idxs += idx + ',';
        occurences += tool_occurence + ',';
        place_timestamps += tool_place_timestamp + ',';
        g_placed_tools[i].sent = true;
      }

      var removed_place_pos = '';
      var removed_place_idxs = '';
      var removed_place_timestamps = '';
      var removed_occurences = '';
      for (var i = 0; i < g_removed_tools.length; ++i) {
        // notify that we have removed some tools actually
        let norm_x = g_removed_tools[i].place_loc[0];
        let norm_y = g_removed_tools[i].place_loc[1];
        let idx = g_removed_tools[i].tool_id;
        let tool_place_timestamp = g_removed_tools[i].time_stamp;
        let tool_occurence = g_removed_tools[i].occurence;
        removed_place_pos += norm_x + ',' + norm_y + ',';
        removed_place_idxs += idx + ',';
        removed_occurences += tool_occurence + ',';
        removed_place_timestamps += tool_place_timestamp + ',';
      }
      g_removed_tools = [];
      var url = host_name + '/place_tool?id=' + cur_env_id + '&tool=' + place_idxs + '&pos=' + place_pos + '&tool_ts=' + place_timestamps + '&occurence=' + occurences + get_time_and_uuid();
      var removed_url = '&removed_tool=' + removed_place_idxs + '&removed_pos=' + removed_place_pos + '&removed_tool_ts=' + removed_place_timestamps + '&removed_occurence=' + removed_occurences;
      url += removed_url;
      url = encodeURI(url);
      disp_loading();
      $.get(url, function (data, status) {
        if (data.ok) {
          console.log('simulating');
          for (var i = 0; i < g_placed_tools.length; ++i) {
            console.log('hiding placed tool ' + g_placed_tools[i].place_id);
            $('#' + g_placed_tools[i].place_id).hide();
          }

          // All tools have been placed we are ready to simulate.
          $.get(host_name + '/simulate?id=' + cur_env_id + get_time_and_uuid(), function (data, status) {
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
    $('#create-demo-vid').on('ended',function(){
      var tool_div = document.getElementById("tools");
      tool_div.style.display = "block";
    });
    $('#tool-confirm').on('click', function(){
      var demo_div = document.getElementById("demo");
      demo_div.style.display = "block";
      // Initialize the task. 
      update_task();
    });
    if (DEBUG_MODE == true) {
      var video_div = document.getElementById("video");
      video_div.style.display = "block";
      var tool_div = document.getElementById("tools");
      tool_div.style.display = "block";
      var demo_div = document.getElementById("demo");
      demo_div.style.display = "block";
      update_task();
    }
  });