---
layout: project
permalink: /create/
---
{%- include projects/p_logic/head.html -%}
<body>
  {%- include projects/p_logic/header.html -%}
  <main class="page-content" aria-label="Content">
      {%- include projects/p_logic/intro.html -%}


      {%- include projects/p_logic/pointers.html -%}

      <hr />

      {%- include projects/p_logic/play.html data=site.data.p_logic_demo_tasks -%}

      <hr />

      {%- include projects/p_logic/tools.html data=site.data.p_logic_tools -%}

      <hr />

      {%- include projects/p_logic/levels.html data=site.data.p_logic_levels -%}

      <hr />

      {%- include projects/p_logic/install.html -%}

      {%- include projects/p_logic/cite.html -%}
  </main>

  <footer class="site-footer h-card">
    <data class="u-url" href="{{ "/" | relative_url }}"></data>

    <div class="wrapper">

    <div class="footer-col-wrapper">
      Developed by Members of <a href='/'>CLVR</a>. Special thanks to Jingyun Yang and Jun Yamada for website. | 	&#169; Copyright {{ site.time | date: '%Y' }}, CLVR, USC.
    </div>

    </div>

  </footer>
</body>
