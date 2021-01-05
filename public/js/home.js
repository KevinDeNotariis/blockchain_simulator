$(".btn-mine").on("click", function (event) {
  event.preventDefault();

  $block = $(this).closest(".block-container");
  const data = retrieve_data(this);

  $.ajax({
    data: data,
    type: "GET",
    url: "/mine_block",
  }).then(function (res) {
    $block.find(".block-hash-value").text(res.hash);
    $block.find(".block-nonce-value").text(res.nonce);

    //Update the previous_hash of the next block
    if ($block.next().find(".block-id-value").text()) {
      $block.next().find(".block-prev-hash-value").text(res.hash);
      compute_hash_of_every_block($block.next());
    }
  });
});

$(".btn-mine-onwards").on("click", function (event) {
  event.preventDefault();

  $block = $(this).closest(".block-container");
  const data = retrieve_data(this);

  $.ajax({
    data: data,
    type: "GET",
    url: "/mine_block",
  }).then(function (res) {
    $block.find(".block-hash-value").text(res.hash);
    $block.find(".block-nonce-value").text(res.nonce);

    //Update the previous_hash of the next block
    if ($block.next().find(".block-id-value").text()) {
      $block.next().find(".block-prev-hash-value").text(res.hash);
      mine_block($block.next());
    }
  });
});

function mine_block(elem) {
  let data = retrieve_data(elem);

  $.ajax({
    data: data,
    type: "GET",
    url: "/mine_block",
  }).then(function (res) {
    $(elem).find(".block-hash-value").text(res.hash);
    $(elem).find(".block-nonce-value").text(res.nonce);

    //Update the previous_hash of the next block and call the function for this block
    if (elem.next().find(".block-id-value").text()) {
      $(elem).next().find(".block-prev-hash-value").text(res.hash);

      mine_block(elem.next());
    }
  });
}

function retrieve_data(elem) {
  let $block = $(elem).closest(".block-container");

  let transactions = [];
  $transactions = $block.find(".block-tx-value");

  $transactions.map((key, value) => {
    transactions.push(value.innerText);
  });

  return {
    id: $block.find(".block-id-value").text(),
    transactions_id: transactions,
    previous_hash: $block.find(".block-prev-hash-value").text(),
  };
}

function compute_hash_of_every_block(elem) {
  let data = retrieve_data(elem);
  // Need to take also the nonce
  data.nonce = $(elem).find(".block-nonce-value").text().trim();

  $.ajax({
    data: data,
    type: "GET",
    url: "/hash_block",
  }).then(function (res) {
    $(elem).find(".block-hash-value").text(res.hash);

    //Update the previous_hash of the next block and call the function for this block
    if (elem.next().find(".block-id-value").text()) {
      $(elem).next().find(".block-prev-hash-value").text(res.hash);

      compute_hash_of_every_block(elem.next());
    }
  });
}
