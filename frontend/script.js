const Modal = {
  open(){
    document
      .querySelector('.modal-overlay')
      .classList.add('active')
  },

  close(){
    document
      .querySelector('.modal-overlay')
      .classList.remove('active')
  }
};

const Storage = {
  get() {
    return JSON.parse(localStorage.getItem('storage.transactions')) || []
  },

  set(transactions) {
    localStorage.setItem("storage.transactions", JSON.stringify(transactions));
  },
}

const Transactions = {
  all:Storage.get(),

  add(transaction) {
    Transactions.all.push(transaction)
    App.reload()
  },

  remove(index) {
    Transactions.all.splice(index, 1)

    App.reload();
  },

  incomes() {
    let income = 0;

    Transactions.all.forEach((transaction) => {
      if(transaction.amount > 0){
        income += transaction.amount
      }
    })

    return income;
  },

  expense() {
    let expense = 0;

    Transactions.all.forEach((transaction) => {
      if(transaction.amount <0 ){
        expense += transaction.amount
      } 
    })

    return expense
  },

  total() {
    return  Transactions.incomes() + Transactions.expense() ;
  }
};

const DOM = {
  transactionsContainer: document.querySelector('#data-table tbody') ,
  addTransaction(transaction, index) {
    const tr = document.createElement('tr');
    tr.innerHTML = DOM.innerHtmlTransaction(transaction, index);
    tr.dataset.index = index;


    DOM.transactionsContainer.appendChild(tr)
  },

  innerHtmlTransaction(transaction, index){
    const cssClass = transaction.amount > 0 ? 'income': 'expense';
    
    const amount = Utils.formatCurrency(transaction.amount);
    
    const html = `
      <td class="description">${transaction.description}</td>
      <td class=${cssClass}>${amount}</td>
      <td class="date">${transaction.date}</td>
      <td><img onClick="Transactions.remove(${index})" src="./assets/minus.svg" alt="Remover transação" ></td>
    `

    return html
  },

  updateBalance() {
    document
      .querySelector('#incomeDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.incomes());
    
    document
      .querySelector('#expenseDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.expense());
      
    document
      .querySelector('#totalDisplay')
      .innerHTML = Utils.formatCurrency(Transactions.total());
  },

  clearTransactions() {
    DOM.transactionsContainer.innerHTML = ''
  }
};

const Utils = {
  formatAmount(value){
    value = Number(value) * 100;
    return value;
  },

  formatDate(date){
    const splittedDate = date.split("-")
    return `${splittedDate[2]}/${splittedDate[1]}/${splittedDate[0]}`
  },

  formatCurrency(value) {
    const signal = Number(value) < 0? '-' : '';

    value = String(value).replace(/\D/g, '');

    value = Number(value) / 100;

    value = value.toLocaleString('pt-BR', { style: "currency", currency: "BRL" })

    return signal + value
  }
};

const Form = {
  description: document.querySelector('input#description'),
  amount: document.querySelector('input#amount'),
  date: document.querySelector('input#date'),

  getValues() {
    return {
      description: Form.description.value,
      amount: Form.amount.value,
      date: Form.date.value,
    }
  },

  validateField() {
    const { description, amount, date } = Form.getValues();
    
    if(description.trim() === '' || amount.trim() === '' || date.trim() ===''){
      throw new Error("Preencha todos os campos")
    }
  },

  formatData() {
    let { description, amount, date } = Form.getValues();
    amount = Utils.formatAmount(amount);
    date = Utils.formatDate(date);

    return {
      description,
      amount,
      date
    }
  },
  
  clearFields() { 
    Form.description.value = '';
    Form.date.value = '';
    Form.amount.value = '';
  },

  submit(event) {
    event.preventDefault();7

    try {
      Form.validateField();
      const transaction = Form.formatData(); 
      Transactions.add(transaction);
      Form.clearFields();
      Modal.close();

    } catch (error) {
      alert(error.message)
    }

  },
};

const App = {
  init() {
    Transactions.all.forEach((transaction, index) => {
      DOM.addTransaction(transaction, index)
    })
    
    DOM.updateBalance()

    Storage.set(Transactions.all);
  },

  reload() {
    DOM.clearTransactions()
    App.init()
  },

};

App.init();
