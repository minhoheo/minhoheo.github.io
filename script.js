function publicationBySelected(group_by_id) {
  let topic = document.getElementById("group_by_topic");
  let year = document.getElementById("group_by_year");

  let text_topic = document.getElementById("publication-by-topic");
  let text_year = document.getElementById("publication-by-year");

  let detail_topic = document.getElementById("by-topic");
  let detail_year = document.getElementById("by-year");

  if (group_by_id == "publication-by-year") {
    topic.style.display = "none";
    year.style.display = "inline-block";

    detail_topic.style.display = "none";
    detail_year.style.display = "block";

    text_year.style = "font-weight: bold;";
    text_topic.style = "font-weight: normal;";
  } else if (group_by_id == "publication-by-topic") {
    topic.style.display = "inline-block";
    year.style.display = "none";

    detail_topic.style.display = "block";
    detail_year.style.display = "none";

    text_year.style = "font-weight: normal;";
    text_topic.style = "font-weight: bold;";
  }
}

$(".top-page-link").on("click", function () {
  $(".active-link").removeClass("active-link");
  $(this).addClass("active-link");
});
