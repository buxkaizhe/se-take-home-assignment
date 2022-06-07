let orders = [];
let bots = [];

let orderid = 0;
let botid = 0;

function addOrder(vip = false) {
  const order = {
    orderid: orderid++,
    vip: vip ? 1 : 0,
    status: 0,
  };
  if (!vip) {
    orders.push(order);
  } else {
    const first_normal =
      orders.length == 0
        ? 0
        : orders.findIndex((o) => {
            return o.status == 0 && o.vip == false;
          });
    orders.splice(first_normal < 0 ? 0 : first_normal, 0, order);
  }
}

function getHighestPrioOrder() {
  return orders.length == 0 ? null : orders.find((o) => o.status == 0);
}

function addBot() {
  bots.push({ botid: botid++, orderid: null });
}

function delBot() {
  const availBot = bots.filter((b) => !b.deleted);
  const deletedBot =
    availBot.length == 0
      ? null
      : availBot.reduce((a, b) => {
          if (a.botid > b.botid) return a;
          else return b;
        });
  if (!deletedBot) return;
  deletedBot.deleted = true;
  if (deletedBot.orderid != null) {
    const affectedOrder = orders.find((o) => o.orderid == deletedBot.orderid);
    affectedOrder.status = 0;
  }
}

async function processOrder(bot) {
  let currOrder = getHighestPrioOrder();
  if (!currOrder) return;
  bot.orderid = currOrder.orderid;
  currOrder.status = 1;
  setTimeout(() => {
    if (!bot.deleted) {
      currOrder.status = 2;
      bot.orderid = null;
    }
  }, 10 * 1000);
}

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

  bots.forEach((b) => {
    let botNode = document.createElement("p");
    botNode.textContent =
      b.orderid != null
        ? `bot [${b.botid}] => order [${b.orderid}]`
        : `bot [${b.botid}] waiting`;
    if (b.deleted) {
      botNode.textContent = `bot [${b.botid}] deleted`;
    }
    botcontainer.appendChild(botNode);
  });

  orders.forEach((o) => {
    let orderNode = document.createElement("p");
    orderNode.textContent = `order [${o.orderid}]`;
    orderNode.style.color = o.vip == 1 ? "#ff0000" : "#000000";
    orderNode.style.fontWeight = o.vip == 1 ? "bold" : "normal";
    if (o.status == 0) {
      pendings.appendChild(orderNode);
    } else if (o.status == 1) {
      processs.appendChild(orderNode);
    } else if (o.status == 2) {
      completes.appendChild(orderNode);
    }
  });
}

function startWork() {
  if (bots.length > 0) {
    bots
      .filter((b) => b.orderid == null && !b.deleted)
      .forEach((b) => {
        processOrder(b);
      });
  }
}

setInterval(() => {
  render();
}, 10);

setInterval(() => {
  startWork();
}, 100);
