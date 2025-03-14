let checkoutItems = [];
let payments = [];
let otherDescription = ""; // 🔹 Variável única para descrição de "Outros"

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("discount").value = "0"; // 🔹 Inicia o desconto em 0
    updateCheckout();
});

function addProduct(productId, name, price, stock) {
    let item = checkoutItems.find((p) => p.id === productId);
    if (item) {
        if (item.quantity < stock) item.quantity++;
    } else {
        checkoutItems.push({ id: productId, name, price, quantity: 1, stock });
    }
    updateCheckout();
}

function changeQuantity(productId, delta) {
    let item = checkoutItems.find((p) => p.id === productId);
    if (item && item.quantity + delta > 0 && item.quantity + delta <= item.stock) {
        item.quantity += delta;
    }
    updateCheckout();
}

function addPayment() {
    payments.push({ type: "money", value: 0 });
    renderPayments();
}

function updatePaymentType(index, value) {
    payments[index].type = value;
    renderPayments();
}

function updatePaymentValue(index, value) {
    payments[index].value = parseFloat(value) || 0;
    updateCheckout();
}

// 🔹 Função que atualiza a descrição do pagamento "Outros"
function updateOtherDesc(value) {
    otherDescription = value;
}

function updateCheckout() {
    let checkoutTable = document.getElementById("checkout-items");
    checkoutTable.innerHTML = checkoutItems
        .map(
            (item) => `
        <tr>
            <td>${item.name}</td>
            <td>
                <button onclick="changeQuantity(${item.id}, -1)">-</button>
                ${item.quantity}
                <button onclick="changeQuantity(${item.id}, 1)">+</button>
            </td>
            <td>R$ ${item.price.toFixed(2)}</td>
            <td>R$ ${(item.price * item.quantity).toFixed(2)}</td>
        </tr>
    `
        )
        .join("");

    let total = checkoutItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
    let discount = parseFloat(document.getElementById("discount").value) || 0;

    if (discount > total) {
        discount = total;
        document.getElementById("discount").value = discount.toFixed(2);
    }

    let paymentTotal = payments.reduce((sum, p) => sum + parseFloat(p.value || 0), 0);
    let remainingAmount = total - paymentTotal - discount;

    document.getElementById("checkout-total").innerText = `Total: R$ ${total.toFixed(2)}`;
    document.getElementById("remaining-amount").innerText = `Faltante: R$ ${remainingAmount.toFixed(2)}`;

    let finalizeButton = document.getElementById("finalize-sale");
    finalizeButton.disabled = remainingAmount !== 0 || total <= 0;
}

function renderPayments() {
    let paymentsList = document.getElementById("payments-list");
    paymentsList.innerHTML = payments
        .map(
            (p, index) => `
        <div>
            <select onchange="updatePaymentType(${index}, this.value)">
                <option value="pix" ${p.type === "pix" ? "selected" : ""}>PIX</option>
                <option value="credit" ${p.type === "credit" ? "selected" : ""}>Cartão de Crédito</option>
                <option value="debit" ${p.type === "debit" ? "selected" : ""}>Cartão de Débito</option>
                <option value="money" ${p.type === "money" ? "selected" : ""}>Dinheiro</option>
                <option value="other" ${p.type === "other" ? "selected" : ""}>Outros</option>
            </select>
            <input type="number" step="0.01" placeholder="Valor" value="${p.value}" oninput="updatePaymentValue(${index}, this.value)">
        </div>
    `
        )
        .join("");

    // 🔹 Verifica se existe pelo menos um pagamento do tipo "Outros"
    let hasOther = payments.some((p) => p.type === "other");

    let otherDescContainer = document.getElementById("other-desc-container");
    if (hasOther) {
        otherDescContainer.style.display = "block"; // 🔹 Exibe a descrição apenas quando "Outros" for selecionado
        otherDescContainer.innerHTML = `
            <label for="other-desc">Descrição (para "Outros"):</label>
            <input type="text" id="other-desc" placeholder="Descrição do pagamento" value="${otherDescription}" oninput="updateOtherDesc(this.value)">
        `;
    } else {
        otherDescContainer.style.display = "none"; // 🔹 Esconde a descrição quando não há "Outros"
        otherDescContainer.innerHTML = "";
    }
}

// 🔹 Enviar venda para o backend
async function finalizeSale() {
    let customerId = document.getElementById("customer").value || null;
    let sellerId = document.getElementById("seller").value || null;

    let saleData = {
        customer_id: customerId,
        seller_id: sellerId,
        products: checkoutItems,
        payments: payments,
        discount: parseFloat(document.getElementById("discount").value) || 0,
        other_desc: otherDescription,
    };

    try {
        let response = await fetch("/sales/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(saleData),
        });

        let result = await response.json();
        alert(result.message);

        if (result.success) {
            location.reload();
        }
    } catch (error) {
        console.error("Erro ao finalizar a venda:", error);
        alert("Erro ao processar a venda!");
    }
}
