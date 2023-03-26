---
layout: page
title: Publications
permalink: /publications/
order: 6
---
<div align="right">
    <a id="publication-by-year" onclick="publicationBySelected(this.id);" style="font-weight: bold;"> by year </a>
    /
    <a id="publication-by-topic" onclick="publicationBySelected(this.id);"> by topic </a>
</div>
<div align="right" style="display: none;" id="by-topic">
    <a id="robot-learning" href="#Robot Learning"> Robot Learning</a>
    /
    <a id="cognitive-model" href="#Cognitive Model"> Cognitive Model</a>
    /
    <a id="symbolic-representation" href="#Symbolic Representation"> Symbolic Representation</a>
    /
    <a id="reasoning-and-planning" href="#Reasoning and Planning"> Reasoning and Planning</a>
    /
    <a id="computer-vision" href="#Computer Vision"> Computer Vision</a>
    /
    <a id="and-more" href="#... and More!"> ... and More!</a>
</div>
<div align="right" style="display: inline-block;" id="by-year">
<br>
</div>

{% include publication_list.html data=site.data.publications %}
