$(".set-up-button").on("click", function (event) {
  event.preventDefault();

  $(this).prop("disabled", true);
  $("#myModal").css("display", "block");

  $.ajax({
    type: "GET",
    url: "/set_up",
  }).then((res) => {
    $(this).prop("disabled", false);
    $("#myModal").children().text("Simulation is ready");
    setTimeout(() => {
      $("#myModal").css("display", "none");
    }, 1000);

    if ($(this).parent().find(".delete_me").length < 5) {
      $(this)
        .parent()
        .append(
          `<div style='color: red' class='delete_me'><p>${res.message}</p></div>`
        );
      const $new = $(this).parent().find(".delete_me").last();
      setTimeout(() => {
        $new.remove();
      }, 3000);
    }
  });
});
