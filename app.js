// 菜單品項資料來源
const menu = [
    { id: 0, name: "珍珠奶茶", cost: 13 },
    { id: 1, name: "烏龍奶茶", cost: 35 },
    { id: 2, name: "潽洱奶茶", cost: 35 },
    { id: 3, name: "金宣奶茶", cost: 35 },
    { id: 4, name: "烏龍鮮奶茶", cost: 35 },
    { id: 5, name: "潽洱鮮奶茶", cost: 35 },
    { id: 6, name: "金宣鮮奶茶", cost: 35 },
    { id: 7, name: "蜜香鮮奶茶", cost: 35 },
    { id: 8, name: "蜜香奶茶", cost: 35 }
];

// 購物車清單狀態，畫面會依照此陣列重新繪製
const cart = [
    { itemID: 0, amount: 1 }
];

// 取得主要的 DOM 容器節點
const menuElement = document.querySelector("#menu");
const cartElement = document.querySelector("#cart");

// 監聽網頁載入完成事件，初始化菜單與購物車畫面
document.addEventListener("DOMContentLoaded", () => {
    menuElement.appendChild(MenuListElement());
    cartElement.appendChild(CartListElement());
});

/**
 * 查詢菜單中是否存在特定 ID 的品項
 * @param {number} id - 商品 ID
 * @returns {Object} 包含存在狀態與商品物件
 */
function CanGetMenuItem(id) {
    const item = menu.find(item => item.id === id);
    return {
        b: Boolean(item),
        item: item ? item : null
    };
}

/**
 * 查詢購物車中是否已有特定 ID 的項目
 * @param {number} id - 商品 ID
 * @returns {Object} 包含存在狀態與購物車項目物件
 */
function CanGetCartItem(id) {
    const item = cart.find(item => item.itemID === id);
    return {
        b: Boolean(item),
        item: item ? item : null
    };
}

/**
 * 建立並回傳整個菜單卡片外層容器
 */
function MenuListElement() {
    const menuList = document.createElement("div");
    menuList.id = "menuList";

    // 依序走訪所有菜單資料，生成單品卡片
    menu.forEach(item => {
        const itemNode = MenuItem(item.id);
        if (itemNode) menuList.appendChild(itemNode);
    });

    return menuList;
}

/**
 * 建立單一菜單品項的 HTML 元素節點
 * @param {number} itemID - 商品 ID
 */
function MenuItem(itemID) {
    const { b, item } = CanGetMenuItem(itemID);
    if (!b) return null;

    const itemElement = document.createElement("div");
    itemElement.classList.add("menuItem");

    const itemName = document.createElement("h2");
    itemName.textContent = item.name;

    const itemCost = document.createElement("p");
    itemCost.textContent = item.cost;

    itemElement.appendChild(itemName);
    itemElement.appendChild(itemCost);
    itemElement.appendChild(AddToCartButton(itemID));

    return itemElement;
}

/**
 * 建立加入購物車按鈕，並綁定點擊事件
 * @param {number} itemID - 商品 ID
 */
function AddToCartButton(itemID) {
    const button = document.createElement("button");
    button.classList.add("menu-add-to-cart-button");
    button.textContent = "+加入購物車";

    button.addEventListener("click", () => {
        const { b, item } = CanGetCartItem(itemID);

        // 若購物車已有該品項則累加數量，否則新增品項物件
        if (b) {
            item.amount++;
        } else {
            cart.push({ itemID: itemID, amount: 1 });
        }

        RefreshCart();
    });

    return button;
}

/**
 * 建立並渲染購物車面板內容（包含空購物車提示、項目列表與總額）
 */
function CartListElement() {
    const cartList = document.createElement("div");
    cartList.id = "cartList";

    const title = document.createElement("h1");
    title.textContent = "Cart";
    cartList.appendChild(title);

    // 異常情況處理：當購物車清單為空時，顯示文字提示
    if (cart.length === 0) {
        const notice = document.createElement("p");
        notice.classList.add("notice");
        notice.textContent = "購物車目前是空的，快去點餐吧！";
        cartList.appendChild(notice);
        return cartList;
    }

    // 依購物車資料陣列繪製每一筆項目
    cart.forEach(item => {
        const itemNode = CartItem(item.itemID);
        if (itemNode) cartList.appendChild(itemNode);
    });

    cartList.appendChild(TotalElement());
    cartList.appendChild(ClearCartButton());

    return cartList;
}

/**
 * 建立購物車單一項目的呈現列
 * @param {number} itemID - 商品 ID
 */
function CartItem(itemID) {
    const { b: canGetCartItem, item: cartItem } = CanGetCartItem(itemID);
    const { b: canGetMenuItem, item: menuItem } = CanGetMenuItem(itemID);

    if (!canGetCartItem || !canGetMenuItem) return null;

    const itemElement = document.createElement("div");
    itemElement.classList.add("cart-item");

    const itemInfo = document.createElement("h2");
    itemInfo.classList.add("cart-item-info");
    itemInfo.textContent = `${menuItem.name} - $${menuItem.cost}`;

    itemElement.appendChild(itemInfo);
    itemElement.appendChild(CartAction(cartItem.itemID));
    itemElement.appendChild(CartDeleteButton(cartItem.itemID));

    return itemElement;
}

/**
 * 建立購物車數量調整控制器（包含加減按鈕與輸入框防呆）
 * @param {number} itemID - 商品 ID
 */
function CartAction(itemID) {
    const { b: canGetCartItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canGetCartItem) return null;

    const action = document.createElement("div");
    action.classList.add("cart-action");

    const addButton = document.createElement("button");
    addButton.textContent = "+";
    addButton.addEventListener("click", () => {
        UpdateCartAmount(cartItem.itemID, 1);
    });

    const subtractButton = document.createElement("button");
    subtractButton.textContent = "-";
    subtractButton.addEventListener("click", () => {
        UpdateCartAmount(cartItem.itemID, -1);
    });

    const amount = document.createElement("input");
    amount.value = cartItem.amount;
    amount.type = "number";

    // 異常情況處理：限制使用者手動輸入的數值必須為正整數
    amount.addEventListener("change", () => {
        const val = parseInt(amount.value, 10);
        if (isNaN(val) || val <= 0) {
            alert("商品數量必須為大於 0 的整數！");
            amount.value = cartItem.amount; // 還原數值
            return;
        }
        cartItem.amount = val;
        RefreshCart();
    });

    action.appendChild(subtractButton);
    action.appendChild(amount);
    action.appendChild(addButton);

    return action;
}

/**
 * 建立單一品項的刪除按鈕，並執行不可逆操作前確認
 * @param {number} itemID - 商品 ID
 */
function CartDeleteButton(itemID) {
    const { b: canDeleteItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canDeleteItem) return null;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("cart-delete-button");
    deleteButton.textContent = "刪除";

    // 異常情況處理：不可逆操作前跳出確認視窗
    deleteButton.addEventListener("click", () => {
        const cartItemIndex = cart.findIndex(item => item.itemID === cartItem.itemID);
        // 使用 splice 移除該索引的資料
        cart.splice(cartItemIndex, 1);
        RefreshCart();
    });

    return deleteButton;
}

/**
 * 透過相對增量調整商品數量，防止數量扣至 0 或負數
 * @param {number} itemID - 商品 ID
 * @param {number} delta - 調整增量 (+1 或 -1)
 */
function UpdateCartAmount(itemID, delta) {
    const { b: canUpdateItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canUpdateItem) return;

    const newAmount = cartItem.amount + delta;
    // 數量若小於 1 則不動作（如需刪除請點刪除按鈕）
    if (newAmount <= 0) return;

    cartItem.amount = newAmount;
    RefreshCart();
}

/**
 * 重新渲染購物車區域，保持 DOM 與 cart 資料狀態同步
 */
function RefreshCart() {
    cartElement.replaceChildren();
    cartElement.appendChild(CartListElement());
}

/**
 * 建立總消費金額的呈現標籤
 */
function TotalElement() {
    const totalAmountElement = document.createElement("h2");
    totalAmountElement.textContent = `Total: $${TotalAmount()}`;
    return totalAmountElement;
}

/**
 * 使用 reduce 計算購物車中所有品項的總金額
 */
function TotalAmount() {
    return cart.reduce((total, cartItem) => {
        const { b, item: menuItem } = CanGetMenuItem(cartItem.itemID);
        if (!b) return total;
        // 小計累加：單價 * 數量
        return total + Number(cartItem.amount) * Number(menuItem.cost);
    }, 0);
}

/**
 * 建立清空購物車按鈕，具備確認提示機制
 */
function ClearCartButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("clear-button");
    button.textContent = "清空購物車";

    button.disabled = cart.length === 0;

    // 異常情況處理：整批清空前跳出 confirm 確認視窗
    button.addEventListener("click", () => {
        if (!confirm("確定要清空購物車內的所有商品嗎？")) {
            return;
        }
        // 清空陣列
        cart.length = 0;
        RefreshCart();
    });

    return button;
}