const apiPath = 'changchieh';
const baseUrl = 'https://livejs-api.hexschool.io';
const productsUrl = `${baseUrl}/api/livejs/v1/customer/${apiPath}/products`;
const cartsUrl = `${baseUrl}/api/livejs/v1/customer/${apiPath}/carts`;
const ordersUrl = `${baseUrl}/api/livejs/v1/customer/${apiPath}/orders`;

const TopEndAlert = Swal.mixin({
    iconColor: "#6A33F8",
    toast: true,
    position: "top-end",
    showConfirmButton: false,
    timer: 2000,
    // timerProgressBar: true,
    didOpen: (toast) => {
        toast.onmouseenter = Swal.stopTimer;
        toast.onmouseleave = Swal.resumeTimer;
    }
});

let allProductData = [];
let cartData = [];

function init() {
    getProductList();
    cartInit();
    cleanFormMessage();
}

init();


const productList = document.querySelector('.js-productList');

function getProductList() {
    axios.get(productsUrl)
        .then((res) => {
            allProductData = res.data.products;
            renderProductList(allProductData);
        })
        .catch((err) => {
            let str = document.createElement('p');
            str.textContent = ' Oops... 商品正在處理中 ';
            document.querySelector('.js-productDisplay').appendChild(str);
        });
}

function renderProductList(data) {
    productList.innerHTML = data.map((item) => `<li class="productCard">
    <h4 class="productType"> 新品 </h4>
    <img src="${item.images}" alt="${item.title}">
    <a href="#" class="addCartBtn js-addCartBtn" data-id=${item.id}> 加入購物車 </a>
    <h3>${item.title}</h3>
    <del class="originPrice">${item.origin_price}</del>
    <p class="nowPrice">${item.price}</p>
</li>`).join('');
}





const productSelect = document.querySelector('.js-productSelect');

productSelect.addEventListener('change', filterProduct);

function filterProduct(e) {
    let category = e.target.value;
    let filterItems = category === "全部" ? allProductData : allProductData.filter ((item) => item.category === category)
    renderProductList(filterItems);
}





productList.addEventListener('click', addCartItem);

function addCartItem(e) {
    e.preventDefault();
    if(e.target.nodeName !== 'A') {
        return;
    }
    let productId = e.target.getAttribute('data-id');
    let addNum = 1;
    cartData.forEach((item) => {
        if (item.product.id === productId) {
            addNum = item.quantity += 1;
        }
    })
    let addData = {
        "data": {
            "productId": productId,
            "quantity": addNum
        }
    }
    axios.post(cartsUrl, addData)
        .then((res) => {
            TopEndAlert.fire({
                icon: "success",
                title: "加入購物車成功",
            });
            getCartList();
            const cartBtnText = e.target;
            changeCartBtnText(cartBtnText);
        })
        .catch((err) => {
            TopEndAlert.fire({
                icon: "error",
                title: "加入購物車失敗",
                text: err.message
            });
        });
}

function changeCartBtnText(addSuccess) {
    addSuccess.textContent = ' 已加入購物車 ';
    addSuccess.setAttribute("style", "background-color: #301E5F");
}





function getCartList() {
    axios.get(cartsUrl)
        .then((res) => {
            cartData = res.data.carts;
            renderCartList(res);
        })
        .catch((err) => {
            Swal.fire({
                icon: "warning",
                iconColor: "#6A33F8",
                title: "Oops... 購物車搶修中。",
                text: err.message
            });
        })
}

const cartList = document.querySelector('.js-cartList');
const totalPrice = document.querySelector('.js-totalPrice');

function renderCartList(resData) {
    if(!cartData.length) {
        cartList.innerHTML = '<tr><td width=350px style="color: #797979"> 目前購物車是空的 </td></tr>';
        totalPrice.textContent = ` 0`;
        return
    }
    cartList.innerHTML = cartData.map((item) => `<tr>
    <td>
        <div class="cardItem-title">
            <img src="${item.product.images}" alt="${item.product.title}">
            <p>${item.product.title}</p>
        </div>
    </td>
    <td>NT$ ${item.product.price}</td>
    <td>
        <button type="button" class="removeBtn">
            <span class="material-icons removeIcon" data-removeNum="${item.id}">
                remove
            </span>
        </button>
        ${item.quantity}
        <button type="button" class="addBtn">
            <span class="material-icons addIcon" data-addNum="${item.id}">
                add
            </span>
        </button>
    </td>
    <td>NT$ ${item.product.price * item.quantity}</td>
    <td class="discardBtn">
        <a href="#" class="material-icons" data-id="${item.id}" data-productId="${item.product.id}">
            clear
        </a>
    </td>
    </tr>`).join('');
    totalPrice.textContent = ` ${resData.data.finalTotal}`;
}





cartList.addEventListener('click', addProductNum);
cartList.addEventListener('click', removeProductNum);

function addProductNum(e) {
    let cartId = e.target.getAttribute('data-addNum');
    if(cartId === null) {
        return;
    }
    let addNum = 1;
    cartData.forEach((item) => {
        if (item.id === cartId) {
            addNum = item.quantity += 1;
        }
    })
    const addNumData = {
        "data": {
            "id": cartId,
            "quantity": addNum
        }
    }
    axios.patch(cartsUrl, addNumData)
        .then((res) => {
            getCartList();
            TopEndAlert.fire({
                icon: "success",
                title: `修改購物車數量成功！`
            });
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                iconColor: "#6A33F8",
                title: "Oops... 修改購物車數量失敗，煩請聯繫客服。",
                text: err.message
            });
        })
}

function removeProductNum(e) {
    let cartId = e.target.getAttribute('data-removeNum');
    if(cartId === null) {
        return;
    }
    let removeNum = 1;
    cartData.forEach((item) => {
        if (item.id === cartId) {
            removeNum = item.quantity -= 1;
        }
    })
    if (removeNum < 1) {
        return
    }
    const removeNumData = {
        "data": {
            "id": cartId,
            "quantity": removeNum
        }
    }
    axios.patch(cartsUrl, removeNumData)
        .then((res) => {
            getCartList();
            TopEndAlert.fire({
                icon: "success",
                title: `修改購物車數量成功！`
            });
        })
        .catch((err) => {
            Swal.fire({
                icon: "error",
                iconColor: "#6A33F8",
                title: "Oops... 修改購物車數量失敗，煩請聯繫客服。",
                text: err.message
            });
        })
}





cartList.addEventListener('click', deleteCartItem);

function deleteCartItem(e) {
    e.preventDefault();
    let cartId = e.target.getAttribute('data-id');
    if(cartId === null) {
        return;
    }
    Swal.fire({
            title: "您確定要刪除此項商品嗎？",
            icon: "warning",
            iconColor: "#6A33F8",
            showCancelButton: true,
            confirmButtonColor: "#6A33F8",
            cancelButtonColor: "#000",
            confirmButtonText: "刪除",
            cancelButtonText: "取消"
        }).then((result) => {
            if (result.isConfirmed) {
                axios.delete(`${cartsUrl}/${cartId}`)
                    .then((res) => {
                        getCartList();
                        Swal.fire({
                            icon: "success",
                            iconColor: "#6A33F8",
                            title: "刪除成功！",
                            text: "此商品已從購物車移除"
                        });

                        let productId = e.target.getAttribute('data-productId');
                        unchangeCartBtnText(productId);
                    })
                    .catch((err) => {
                        Swal.fire({
                            icon: "error",
                            iconColor: "#6A33F8",
                            title: "Oops... 商品刪除失敗，煩請聯繫客服。",
                            text: err.message
                        });
                    });
            }
        });
}

function unchangeCartBtnText(id) {
    const cartBtn = document.querySelector(`[data-id=${id}]`);
    cartBtn.textContent = ' 加入購物車 ';
    cartBtn.removeAttribute("style");
}




const discardAllBtn = document.querySelector('.js-discardAllBtn');

discardAllBtn.addEventListener('click', cleanCart);

function cleanCart(e) {
    e.preventDefault();
    if(!cartData.length) {
        TopEndAlert.fire({
            icon: "warning",
            title: "您尚未選購任何商品！"
        });
        return;
    }
    
    Swal.fire({
            title: "您確定要清空購物車嗎？",
            icon: "warning",
            iconColor: "#6A33F8",
            showCancelButton: true,
            confirmButtonColor: "#6A33F8",
            cancelButtonColor: "#000",
            confirmButtonText: "清空",
            cancelButtonText: "取消"
        }).then((result) => {
            if (result.isConfirmed) {
                // axios.delete(cartsUrl)
                //     .then((res) => {
                //         getProductList();
                //         getCartList();
                //         Swal.fire({
                //             icon: "success",
                //             title: "購物車已清空",
                //             showConfirmButton: false,
                //             timer: 1500
                //         });
                //     })
                //     .catch((err) => {
                //         Swal.fire({
                //             icon: "error",
                //             title: "Oops... 購物車清空失敗，煩請聯繫客服。",
                //             text: err.message
                //         });
                //     });
                init();
                Swal.fire({
                    icon: "success",
                    iconColor: "#6A33F8",
                    title: "購物車已清空",
                    showConfirmButton: false,
                    timer: 1800
                });
            }
        });
}

function cartInit() {
    axios.delete(cartsUrl)
        .then((res) => {
            getCartList();
        })
        .catch((err) => {
            getCartList();
        });
}





const orderForm = document.querySelector('.js-orderForm');
const orderBtn = document.querySelector('.js-orderBtn');

orderForm.addEventListener("submit", function (e) {
    e.preventDefault();
    if (!cartData.length) {
        TopEndAlert.fire({
            icon: "warning",
            title: "您尚未選購任何商品！"
        });
        return;
    }
    checkFormValue();
});

function checkFormValue() {
    const constraints = {
        "姓名": {
            presence: {
                message: "^ 必填"
            },
        },
        "電話": {
            presence: {
                message: "^ 必填"
            },
            format: {
                pattern: "[09]{2}[0-9]{8}", // 09 開頭，後面接 8 位數字
                message: "^ 格式請填為 0912345678"
            }
        },
        Email: {
            presence: {
                message: "^ 必填"
            },
        },
        "寄送地址": {
            presence: {
                message: "^ 必填"
            }
        }
    };
    const result = validate(orderForm, constraints);
    cleanFormMessage();
    if (result) {
        renderFormMessage(result);
        return;
    }
    const customerName = document.querySelector('#customerName').value;
    const customerPhone = document.querySelector('#customerPhone').value;
    const customerEmail = document.querySelector('#customerEmail').value;
    const customerAdd = document.querySelector('#customerAddress').value;
    const customerTradeWay = document.querySelector('#tradeWay').value;
    const formData = {
        data: {
            user: {
                name: customerName,
                tel: customerPhone,
                email: customerEmail,
                address: customerAdd,
                payment: customerTradeWay
            }
        }
    }
    postOrder(formData);
}

function renderFormMessage(result) {
    let message;
    Object.keys(result).map((item) => {
        message = document.querySelector(`[data-message=${item}]`);
        message.textContent = result[item];
    });
}

function cleanFormMessage() {
    let message = document.querySelectorAll('.js-orderInfo-message');
    message.forEach((item) => {
        item.textContent = '';
    });
}

function postOrder(data) {
    Swal.fire({
        title: "訂購資訊正確嗎？",
        html: ` 姓名: ${data.data.user.name}<br>
        電話: ${data.data.user.tel}<br>
        Email: ${data.data.user.email}<br>
        寄送地址: ${data.data.user.address}<br>
        付款方式: ${data.data.user.payment}`,
        icon: "warning",
        iconColor: "#6A33F8",
        showCancelButton: true,
        confirmButtonColor: "#6A33F8",
        cancelButtonColor: "#000",
        confirmButtonText: "送出",
        cancelButtonText: "取消"
    }).then((result) => {
        if (result.isConfirmed) {
            axios.post(ordersUrl, data)
                .then((res) => {
                    init();
                    // getProductList();
                    // getCartList();
                    orderForm.reset();
                    Swal.fire({
                        icon: "success",
                        iconColor: "#6A33F8",
                        title: "訂單送出成功！",
                        showConfirmButton: false,
                        timer: 1500
                    });
                })
                .catch((err) => {
                    if (err.response.status == 400) {
                        TopEndAlert.fire({
                            icon: "warning",
                            title: "訂購資訊尚未填寫完整",
                            timer: 3000
                        });
                    } else if (err.response.status == 404) {
                        Swal.fire({
                            icon: "error",
                            iconColor: "#6A33F8",
                            title: "Oops... 訂單傳送失敗，煩請聯繫客服。",
                            text: err.message
                        });
                    }
                }) 
        }
    });
}
