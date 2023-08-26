const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'ZAR',
});

function getAllSales(callback) {
    fetch("http://localhost:9094/sales/records", {
        method: "GET",
        headers:
        {
            "Authorization":
                "Bearer 34f873721804d57a5faf3ea8809b8ef50340c69ed180"
        }
        ,
        redirect: "follow",
    })
        .then((response) => response.json())
        .then(callback)
        .catch((error) => console.log("error", error));
}

let subscriptionFee = 460 * 6

getAllSales((sales) => {
    let totalIncome = 0,
        totalProfit = 0,
        totalFees = 0;
console.log({SALES_LENGTH: sales.length});
    for (let i = 0; i < sales.length; i++) {
        const sale = sales[i];

        let fee = sale.fee.replace('R ', ""),
            price = sale.price.replace('R ', ""),
            profit = sale.profit.replace('R ', "");


        totalFees += Math.floor(Number(fee))
        totalProfit += Math.floor(Number(profit))
        totalIncome += Math.floor(Number(price))

    }

    console.log({
        "TOTAL_FEES": formatter.format(totalFees + subscriptionFee), TOTAL_SALES: formatter.format(totalIncome), PROFIT: formatter.format(totalProfit), LOGICAL: formatter.format(totalProfit - subscriptionFee)
    });

})