# 專題報告

## 1. 名稱
- 專題名稱：手搖飲料點餐與購物車結算系統
- 學號：23116162
- GitHub連結：https://github.com/HaemonMercer/Web-Programming-Mid-term-Exam

---
## 2. 目的

手搖飲料店線上點餐時，需要讓顧客清楚查看飲品價格，並即時統計選購內容與計算總金額。本專題使用 HTML、CSS 與 JavaScript，實作一個單頁面的購物車點餐系統，讓使用者可以自由選購飲品、手動或按鍵調整數量、移除品項，並具備異常輸入防呆與自動計算結算金額的功能。

## 3. 功能

- 顯示飲料菜單列表，呈現各品項名稱、價格與「+加入購物車」按鈕。
- 按「+加入購物車」後將飲品加入右側購物車；若已存在則自動將數量加 1。
- 購物車可使用「+」「-」按鈕調整購買數量，數量最低保持為 1。
- 購物車數量輸入框可手動輸入數值，若輸入非正整數、0 或負數會跳出提示並還原數值。
- 按「刪除」按鈕會先跳出確認視窗，確認後移除該項飲品。
- 自動計算並即時更新購物車的總消費金額。
- 按「清空購物車」按鈕會先跳出確認視窗，確認後移除全部品項並顯示空購物車提示。

4. 程式運作流程說明
程式使用兩個核心陣列管理資料：menu 是菜單品項，cart 記錄使用者選購的飲料與數量。網頁上的畫面一律根據 cart 陣列的狀態動態產生。

### 步驟 1：建立 menu 陣列與初始化畫面（DOMContentLoaded、MenuListElement）

menu 陣列存放所有飲品的固定資料，包含編號 (id)、名稱 (name) 與價格 (cost)。當網頁 DOM 結構載入完成後，執行 MenuListElement() 依序走訪 menu 陣列並動態建立菜單卡片，再掛載到畫面上。
```javascript
document.addEventListener("DOMContentLoaded", () => {
    menuElement.appendChild(MenuListElement());
    cartElement.appendChild(CartListElement());
});

function MenuListElement() {
    const menuList = document.createElement("div");
    menuList.id = "menuList";

    menu.forEach((item) => {
        const itemNode = MenuItem(item.id);
        if (itemNode) menuList.appendChild(itemNode);
    });

    return menuList;
}
```

程式碼說明：DOMContentLoaded 確保 DOM 節點載入後才執行畫面渲染；forEach 依序取出每道飲品資料並建立對應的卡片節點；CanGetMenuItem 則使用 find 依據 id 比對商品資料。

### 步驟 2：點選「+加入購物車」加入 cart 陣列（AddToCartButton）
使用者點擊飲品卡片上的「+加入購物車」按鈕時，程式先利用 CanGetCartItem 檢查購物車陣列 cart 是否已有該項商品：
- 已經有：取出該筆資料並將其 amount 數量加 1。
- 還沒有：使用 push 在 cart 陣列中新增一筆 { itemID: itemID, amount: 1 } 物件。
修改完資料後，呼叫 RefreshCart() 重新產生購物車畫面。
```javascript
function AddToCartButton(itemID) {
    const button = document.createElement("button");
    button.classList.add("menu-add-to-cart-button");
    button.textContent = "+加入購物車";

    button.addEventListener("click", () => {
        const { b, item } = CanGetCartItem(itemID);

        if (b) {
            item.amount++;
        } else {
            cart.push({ itemID: itemID, amount: 1 });
        }

        RefreshCart();
    });

    return button;
}
```

程式碼說明：使用解構賦值 { b, item } 接收比對結果；若存在就直接改變物件屬性，不存在則用 push() 將新資料放入陣列末端。

步驟 3：調整數量與手動輸入防呆（CartAction、UpdateCartAmount）

購物車項目提供「+」「-」按鈕與手動輸入框兩種調整管道：

按「+」或「-」：呼叫 UpdateCartAmount 傳入增量 delta（+1 或 -1）。若數量小於等於 0 則不動作，維持最少 1 杯。

手動輸入：監聽 change 事件，使用 parseInt 檢查輸入內容。若為非數字（NaN）或小於等於 0，跳出 alert 提示警告並將輸入框數值還原為原先數量。

驗證或更新完成後，呼叫 RefreshCart() 重新整理畫面。
```javascript
function CartAction(itemID) {
    const { b: canGetCartItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canGetCartItem) return null;

    amount.addEventListener("change", () => {
        const val = parseInt(amount.value, 10);
        if (isNaN(val) || val <= 0) {
            alert("商品數量必須為大於 0 的整數！");
            amount.value = cartItem.amount; // 還原成原本數值
            return;
        }
        cartItem.amount = val;
        RefreshCart();
    });

    return action;
}

function UpdateCartAmount(itemID, delta) {
    const { b: canUpdateItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canUpdateItem) return;

    const newAmount = cartItem.amount + delta;
    if (newAmount <= 0) return; // 數量低於 1 則不予遞減

    cartItem.amount = newAmount;
    RefreshCart();
}
```

程式碼說明：parseInt 負責字串轉整數；isNaN(val) || val <= 0 實作防呆驗證，避免畫面產生負數或無效值。

### 步驟 4：單品刪除與確認提示（CartDeleteButton）
使用者點擊該品項旁的「刪除」按鈕時，程式會先跳出 confirm 詢問視窗，避免使用者誤觸操作：
- 按「確定」：使用 findIndex 找出商品在 cart 陣列中的索引位置，並用 splice(cartItemIndex, 1) 從陣列中移除該筆資料。
- 按「取消」：不執行任何動作。
移除完畢後呼叫 RefreshCart() 更新畫面。
```javascript
function CartDeleteButton(itemID) {
    const { b: canDeleteItem, item: cartItem } = CanGetCartItem(itemID);
    if (!canDeleteItem) return null;

    const deleteButton = document.createElement("button");
    deleteButton.classList.add("cart-delete-button");
    deleteButton.textContent = "刪除";

    deleteButton.addEventListener("click", () => {
        if (!confirm("確定要將這項飲品從購物車中移除嗎？")) {
            return;
        }
        const cartItemIndex = cart.findIndex(item => item.itemID === cartItem.itemID);
        cart.splice(cartItemIndex, 1);

        RefreshCart();
    });

    return deleteButton;
}
```

程式碼說明：confirm 會回傳布林值，按取消則直接中斷函式；findIndex 取得陣列索引後，搭配 splice 刪除該元素。

### 步驟 5：計算總金額（TotalAmount、TotalElement）
購物車底部會顯示消費總金額。使用陣列的 reduce 方法，遍歷 cart 裡面的每一項商品，透過 CanGetMenuItem 查出對應的單價（cost），將「單價 × 數量」進行累加，最終回傳總花費。
```javascript
function TotalAmount() {
    return cart.reduce((total, cartItem) => {
        const { b, item: menuItem } = CanGetMenuItem(cartItem.itemID);
        if (!b) return total;

        return total + (Number(cartItem.amount) * Number(menuItem.cost));
    }, 0);
}

function TotalElement() {
    const totalAmountElement = document.createElement("h2");
    totalAmountElement.textContent = `Total: $${TotalAmount()}`;
    return totalAmountElement;
}
```
程式碼說明：reduce 以初始值 0 開始加總，每次迭代取得小計並累加至 total，簡潔且不依賴全域變數計數。

### 步驟 6：清空購物車（ClearCartButton）
清空按鈕在購物車為空時會自動設置 disabled 屬性。當有商品且點擊按鈕時，會跳出 confirm 確認視窗；若使用者確認清空，將陣列長度設為 0（cart.length = 0），並呼叫 RefreshCart()。
```javascript
function ClearCartButton() {
    const button = document.createElement("button");
    button.type = "button";
    button.classList.add("clear-button");
    button.textContent = "清空購物車";
    button.disabled = cart.length === 0;

    button.addEventListener("click", () => {
        if (!confirm("確定要清空購物車內的所有商品嗎？")) {
            return;
        }
        cart.length = 0;
        RefreshCart();
    });

    return button;
}
```
程式碼說明：cart.length = 0 可以快速清空原陣列內容；disabled 避免在空購物車時觸發無效事件。

### 步驟 7：資料驅動畫面重繪（RefreshCart、CartListElement）
每次購物車資料發生新增、數量調整、刪除或清空後，都統一呼叫 RefreshCart()。此函式會先以 replaceChildren() 清空整個購物車容器，再重新呼叫 CartListElement() 根據最新 cart 陣列畫出最新內容：
- cart 為空：顯示「購物車目前是空的，快去點餐吧！」提示文字。
- cart 有資料：走訪陣列畫出每一道品項、數量控制器、刪除按鈕、總金額與清空按鈕。
```javascript
function RefreshCart() {
    cartElement.replaceChildren();
    cartElement.appendChild(CartListElement());
}

function CartListElement() {
    const cartList = document.createElement("div");
    cartList.id = "cartList";

    if (cart.length === 0) {
        const notice = document.createElement("p");
        notice.classList.add("notice");
        notice.textContent = "購物車目前是空的，快去點餐吧！";
        cartList.appendChild(notice);
        return cartList;
    }

    cart.forEach((item) => {
        const itemNode = CartItem(item.itemID);
        if (itemNode) cartList.appendChild(itemNode);
    });

    cartList.appendChild(TotalElement());
    cartList.appendChild(ClearCartButton());
    return cartList;
}
```
程式碼說明：replaceChildren() 確保不會有舊節點殘留；利用 cart.length === 0 區分空狀態與清單狀態，貫徹資料驅動視覺的原則。

## 整體原則
本專案的所有操作均遵循核心規範：使用者操作只修改 cart 陣列資料，資料異動後一律呼叫 RefreshCart() 依陣列全權重繪畫面。 畫面絕不直接修改數值節點，保證介面呈現與記憶體中的資料嚴格同步。
