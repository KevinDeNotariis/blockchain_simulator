$(".add-transactions-form").on("submit", function (event) {
  event.preventDefault();

  const num_txs = $("#txs_num").val();

  if (!isNaN(num_txs) && num_txs !== "") {
    $.ajax({
      data: {
        num_txs: num_txs,
      },
      type: "POST",
      url: "/transaction/add_bunch_of_transactions",
    }).then(function (res) {
      location.reload();
    });
  } else {
    $("#txs_num").val("");
    $(this).append(
      "<div style='color: red' class='delete_me'><p>Incorrect input</p></div>"
    );
    const $new = $(this).find(".delete_me").last();
    setTimeout(() => {
      $new.remove();
    }, 3000);
  }
});
