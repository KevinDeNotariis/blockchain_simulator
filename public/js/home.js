$(".set-up-button").on("click", function (event) {
  event.preventDefault();

  $.ajax({
    type: "GET",
    url: "/set_up",
  }).then((res) => {
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
