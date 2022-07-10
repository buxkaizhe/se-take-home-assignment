class Order {
  constructor(id, vip = 0) {
    this.id = id;
    this.status = 0;
    this.vip = vip;
  }
}

class Bot {
  constructor(id) {
    this.id = id;
    this.orderId = null;
    this.timer = null;
  }

  async processOrder(order) {
    this.orderId = order.id;
    order.status = 1;
    const interval = 100;
    order.secondsLeft = order.secondsLeft
      ? order.secondsLeft
      : order.vip == 1
        ? 5 * 1000
        : 10 * 1000;
    this.timer = setInterval(() => {
      order.secondsLeft -= interval;
      if (order.secondsLeft <= 0) {
        if (!this.deleted) {
          order.status = 2;
          this.orderId = null;
        }
        clearInterval(this.timer);
      }
      render();
    }, interval);
  }
}

class Main {
  constructor() {
    this.orderId = 0;
    this.botId = 0;
    this.bots = [];
    this.orders = [];
  }

  addBot() {
    this.bots.push(new Bot(this.botId++));
    render();
  }

  removeBot() {
    const tbrBot = this.bots
      .filter((b) => !b.deleted)
      .reduce((a, b) => {
        return a.id > b.id ? a : b;
      });
    if (!tbrBot) return;
    tbrBot.deleted = true;
    if (tbrBot.orderId != null) {
      clearInterval(tbrBot.timer);
      this.orders.find((order) => order.id == tbrBot.orderId).status = 0;
    }
    render();
  }

  getHighestPrioOrder() {
    return this.orders.find((o) => o.status == 0);
  }

  addOrder(vip = false) {
    this.orders.push(new Order(this.orderId++, vip));
    this.orders.sort((a, b) => {
      if (a.vip == b.vip) return a.id - b.id;
      else return b.vip - a.vip;
    });
    render();
  }

  processOrders() {
    this.bots
      .filter((b) => b.orderId == null && !b.deleted)
      .forEach((bot) => {
        const currOrder = this.getHighestPrioOrder();
        if (!currOrder) return;
        bot.processOrder(currOrder);
      });
  }
}

const main = new Main();

function render() {
  const botcontainer = document.getElementById("bots");
  const pendings = document.getElementById("pending-orders");
  const processs = document.getElementById("process-orders");
  const completes = document.getElementById("complete-orders");
  botcontainer.innerHTML =
    pendings.innerHTML =
    processs.innerHTML =
    completes.innerHTML =
    "";

  main.bots.forEach((b) => {
    let botNode = document.createElement("p");
    botNode.textContent =
      b.orderId != null
        ? `bot [${b.id}] => order [${b.orderId}]`
        : `bot [${b.id}] waiting`;
    if (b.deleted) {
      botNode.textContent = `bot [${b.id}] deleted`;
    }
    botcontainer.appendChild(botNode);
  });

  main.orders.forEach((o) => {
    let orderNode = document.createElement("p");
    orderNode.textContent =
      `order [${o.id}] ` + (o.secondsLeft > 0 ? ` [${(o.secondsLeft / 1000).toFixed(2)}]` : "");
    orderNode.style.color = o.vip ? "#ff0000" : "#000000";
    orderNode.style.fontWeight = o.vip ? "bold" : "normal";
    if (o.status == 0) {
      pendings.appendChild(orderNode);
    } else if (o.status == 1) {
      processs.appendChild(orderNode);
    } else if (o.status == 2) {
      completes.appendChild(orderNode);
    }
  });
}

setInterval(() => main.processOrders(), 10);
