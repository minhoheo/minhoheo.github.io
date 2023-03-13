
var g_early_reset = false;

g_placed_tools = [];
g_tool_occurences = {};
g_removed_tools = [];

function get_true_size() {
  let play_container_width = $('.play-container').get()[0].scrollWidth;
  var cur_size = (90 / 450) * play_container_width;
  return cur_size;
}

g_move_ele = null;
g_orig_pos = null;


function place_drag(event) {
  let ele_id = event.target.id.split('_')[1];
  console.log('Moving placed tool ' + ele_id);
  event.dataTransfer.setData('text', ele_id);
  event.dataTransfer.setData('is_move', true);
}

function place_mouse_up(e) {
  document.onmouseup = null;
  document.onmousemove = null;


  $('#' + g_move_ele).removeClass('no-hover');

  var match_idx = -1;
  for (var i = 0; i < g_placed_tools.length; ++i) {
    if (g_placed_tools[i].place_id == g_move_ele) {
      match_idx = i;
      break;
    }
  }
  
  if (match_idx == -1) {
    console.log('ISSUE');
    return;
  }

  coords = get_play_coordinates(e.pageX, e.pageY);
  norm_x = coords[0];
  norm_y = coords[1];
  place_top = coords[2];
  place_left = coords[3];
  is_over = coords[4];
  let tool = g_placed_tools[match_idx];

  if (is_over) {
    console.log('removing element');
    $('#' + tool.place_id).remove();
    var removed = g_placed_tools.splice(match_idx, 1)[0];
    // only add to removed tools if this thing was sent 
    if (tool.sent) {
      g_removed_tools.push({
        // add timestamp and unique identified for backend to recognize new actions
        'place_id': removed.place_id,
        'tool_id': removed.tool_id,
        'place_loc': removed.place_loc, 
        'time_stamp': new Date().getTime(),
        'occurence': removed.occurence,
      });
    }
  }
  else {
    check_valid_place(tool.tool_id, norm_x, norm_y, function () {
      console.log('Adjusting position of:');
      console.log(tool);
      $('#' + tool.place_id).css('left', place_left + 'px');
      $('#' + tool.place_id).css('top', place_top + 'px');
      g_placed_tools[match_idx].place_loc = [norm_x, norm_y];
      g_placed_tools[match_idx].time_stamp = new Date().getTime();
      g_move_ele = null;
      g_orig_pos = null;
    }, function () {
      $('#' + tool.place_id).css('left', g_orig_pos[0] + 'px');
      $('#' + tool.place_id).css('top', g_orig_pos[1] + 'px');
      g_move_ele = null;
      g_orig_pos = null;
    });
  }

}

function place_mouse_drag(e) {
  e = e || window.event;
  e.preventDefault();

  coords = get_play_coordinates(e.pageX, e.pageY);
  norm_x = coords[0];
  norm_y = coords[1];
  place_top = coords[2];
  place_left = coords[3];
  is_over = coords[4];

  $('#' + g_move_ele).css('left', place_left + 'px');
  $('#' + g_move_ele).css('top', place_top + 'px');
  $('#' + g_move_ele).addClass('no-hover');

  if (is_over) {
    $('#' + g_move_ele).addClass('trash-tool');
  }
  else {
    $('#' + g_move_ele).removeClass('trash-tool');
  }
}

function check_valid_place(tool_idx, norm_x, norm_y, on_success, on_failure = null) {
  var place_pos = '';
  var place_idxs = '';
  console.log(g_placed_tools);
  for (var i = 0; i < g_placed_tools.length; ++i) {
    console.log(g_placed_tools[i]);
    let norm_x = g_placed_tools[i].place_loc[0];
    let norm_y = g_placed_tools[i].place_loc[1];
    let idx = g_placed_tools[i].tool_id;
    if (idx == tool_idx) {
      continue
    }
    place_pos += norm_x + ',' + norm_y + ',';
    place_idxs += idx + ',';
  }

  place_idxs += tool_idx;
  place_pos += norm_x + ',' + norm_y;
  let params_url = '?id=' + cur_env_id + '&tool=' + place_idxs + '&pos=' + place_pos;
  var url = host_name + '/valid_place_tool' + params_url;
  url = encodeURI(url);

  //disp_loading();
  $.get(url, function (data, status) {
    if (data.ok) {
      on_success();
    }
    else {
      //hide_loading();
      disp_play_error('Placed object intersects another object.');
      if (on_failure != null) {
        on_failure();
      }
    }
  });
}



function drop(ev) {
  console.log('Dropped element');
  var should_reset = false;
  if (game_state == 'done') {
    should_reset = true;
    //console.log('Game state is done, cannot play more');
    //return;
  }
  console.log('on drop!');
  console.log(ev);
  ev.preventDefault();

  coords = get_play_coordinates(ev.pageX, ev.pageY);
  norm_x = coords[0];
  norm_y = coords[1];
  place_top = coords[2];
  place_left = coords[3];

  var tool_idx = ev.dataTransfer.getData("text");
  var is_move = ev.dataTransfer.getData("is_move");
  is_move = is_move == 'true';
  console.log('Tool idx ' + tool_idx);
  console.log('Is move ' + is_move);

  if (!is_move) {
    var endpoint = host_name + '/get_tool?id=' + cur_env_id + '&tool=' + tool_idx;
    endpoint += '&nocache=' + Math.random();

    let ep_style = 'top: ' + place_top + 'px; left: ' + place_left + 'px;';

    check_valid_place(tool_idx, norm_x, norm_y, function () {
      console.log('Actually placing tool');
      let place_id = 'placedtool_' + g_placed_tools.length;
      var img_src = '<img id="' + place_id + '" onmousedown="place_mouse_down(event)" width="' +
        get_true_size() + 'px;" class="overlay-img" src="' + endpoint +
        '" style="' + ep_style + '" ondrop="drop(event)" ondragover="allow_drop(event)"/>';
      $('#disp-container').append(img_src);

      // count how many occurences of this tool there are
      console.log('tool_idx: ' + tool_idx);
      if (tool_idx in g_tool_occurences) {
        g_tool_occurences[tool_idx] += 1;
      } else {
        g_tool_occurences[tool_idx] = 0;
      }
      var occurences = g_tool_occurences[tool_idx];
      console.log("tool_idx: " + tool_idx + " Occurence: " + occurences);

      // add timestamp and unique identified for backend to recognize new actions
      g_placed_tools.push({
        'place_id': place_id,
        'tool_id': tool_idx,
        'place_loc': [norm_x, norm_y],
        'time_stamp': new Date().getTime(),
        'occurence': occurences,
        'sent': false, // whether we sent to server
      });
      console.log(g_placed_tools);

      if (should_reset) {
        console.log('reseting game early');
        early_reset = true;
        auto_play_again();
      }
    });
  }
}

function place_mouse_down(e) {
  e = e || window.event;
  e.preventDefault();
  console.log('Placed mouse down');
  // get the mouse cursor position at startup:
  //pos3 = e.clientX;
  //pos4 = e.clientY;
  g_move_ele = (e.target || e.srcElement).id;
  document.onmouseup = place_mouse_up;
  // call a function whenever the cursor moves:
  document.onmousemove = place_mouse_drag;
  g_move_ele = (e.target || e.srcElement).id;

  let orig_x = $('#' + g_move_ele).css('left').split('p')[0];
  let orig_y = $('#' + g_move_ele).css('top').split('p')[0];

  g_orig_pos = [orig_x, orig_y];
}

function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

function get_play_coordinates(cur_x, cur_y) {
  var x = (cur_x - $('#play-display').offset().left);
  var y = (cur_y - $('#play-display').offset().top);

  let width = $('#play-display').width()
  let height = $('#play-display').height()

  var is_over = false;
  if (x < 0 || x > width)
    is_over = true;
  else if (y < 0 || y > height)
    is_over = true;
  x = clamp(x, 0, width);
  y = clamp(y, 0, height);

  let place_top = Math.round(y) - (get_true_size() / 2.0);
  let place_left = Math.round(x) - (get_true_size() / 2.0);

  // The coordinates are also reversed.
  var norm_x = -1.0 * (2.0 * (x / width) - 1.0);
  var norm_y = -1.0 * (2.0 * (y / height) - 1.0);

  return [norm_x, norm_y, place_top, place_left, is_over];
}

function allow_drop(ev) {
  ev.preventDefault();
}
