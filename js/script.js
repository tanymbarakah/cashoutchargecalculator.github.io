function calculateCharge() {
    var amountInput = document.getElementById('amount');
    var amount = parseFloat(amountInput.value);
  
    if (isNaN(amount) || amount < 50) {
      alert('Please enter a valid amount greater than or equal to 50 BDT.');
      amountInput.value = '';
      return;
    }
  
    var provider = document.getElementById('provider').value;
    var calculationMethod = document.getElementById('calculationMethod').value;
    var charge = 0;
  
    // Predefined percentages
    var appPercentages = {
      'bkash': 1.75,
      'nagad': 1.149,
      'upay': 1.4,
      'rocket': 1.67,
      'tap': 1.47,
    };
  
    var ussdPercentages = {
      'bkash': 1.85,
      'nagad': 1.494,
      'upay': 1.4,
      'rocket': 1.67,
      'tap': 1.80,
    };
  
    if (calculationMethod === 'app') {
      charge = amount * (appPercentages[provider] / 100);
    } else if (calculationMethod === 'ussd') {
      charge = amount * (ussdPercentages[provider] / 100);
    }
  
    displayResult(charge);
  }
  
  function displayResult(charge) {
    var resultDiv = document.getElementById('result');
    resultDiv.innerHTML = 'Cashout Charge: ' + charge.toFixed(2) + ' BDT';
  }
  