---
layout: people
title: People
permalink: /people/
order: 5
---

<h2>Principal Investigator</h2>
<div class='big-member'>
  <a target="_blank" href='https://clvrai.com/web_lim/'>
    <img src="/assets/people/joseph2_cropped.png" class='member-img' style='height: 200px;border-radius: 100px;'/>
    <div>
      <b>Joseph Lim (임재환)</b>
    </div>
  </a>
  <div>
Associate Professor @ KAIST
  </div>
</div>

<br />

<h2>Students</h2>

{% include members_pictures.html name='AllMembers' data=site.data.current_members %}

<h2>Alumni</h2>
<h4 style='text-align:left;'> PhD students </h4>
{% include members_list.html name='AllMembers' data=site.data.past_phd %}
<br>

<h4 style='text-align:left;'> MS/Undergraduate students </h4>
{% include members_list.html name='AllMembers' data=site.data.past_ms_ud %}
<br>

<h4 style='text-align:left;'> Visiting scholars </h4>
{% include members_list.html name='AllMembers' data=site.data.past_visitors %}
