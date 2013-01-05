function getBalance(callback) {
  API.request('GET', '/my/balance')
    .success(function(response) {
      var balance           = response.data.result;
      var coins_to_send     = balance.free_coins_count + balance.purchased_big_coins_count + balance.purchased_coins_count;
      var coins_to_exchange = balance.received_coins_count + balance.received_big_coins_count;

      $('#coins-to-send').html(coins_to_send);
      $('#coins-to-exchange').html(coins_to_exchange);

      callback(balance);
    })
    .send();
}
