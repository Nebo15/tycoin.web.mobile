var chached_balance;

function getBalance(callback) {
  API.request('GET', '/my/balance')
    .success(function(response) {
      var balance           = response.data.result;
      var coins_to_send     = balance.free_coins_count + balance.purchased_big_coins_count + balance.purchased_coins_count;
      var coins_to_exchange = balance.received_coins_count + balance.received_big_coins_count;

      $('#coins-to-send').html(coins_to_send);
      $('#coins-to-exchange').html(coins_to_exchange);

      balance.coins_to_send = coins_to_send;
      balance.coins_to_exchange = coins_to_exchange;

      balance.usual_coins_to_send = balance.free_coins_count + balance.purchased_coins_count;
      balance.big_coins_to_send = balance.purchased_big_coins_count;

      chached_balance = balance;

      callback(balance);
    })
    .send();
}

function getCachedBalance(callback) {
  callback(chached_balance);
}
