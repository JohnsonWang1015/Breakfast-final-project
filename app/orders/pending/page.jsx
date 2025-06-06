"use client";

import { useEffect, useState } from "react";
// import { updateOrderStatus, confirmPayment } from "@/app/orders/actions";

export default function PendingOrdersPage() {
    const [orders, setOrders] = useState([]);

    useEffect(() => {
        const getPendingOrders = async () => {
            try {
                let user;
                const sessionUser = sessionStorage.getItem("user");
                if (sessionUser) {
                    user = JSON.parse(sessionUser);
                }
                if (user.role !== "STAFF") {
                    console.log(user);

                    // window.location.href = "/";
                    return;
                }
                const response = await fetch(
                    `/api/orders/pending?userId=${user.id}`
                );
                const data = await response.json();
                setOrders(data);
            } catch (err) {
                console.error(err);
            }
        };
        getPendingOrders();
    }, []);

    const handleStatusChange = async (orderId, status) => {
        try {
            await fetch("/api/orders/update-status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId, status }),
            });

            // 從列表中移除或更新狀態
            setOrders((prev) => prev.filter((order) => order.id !== orderId));
        } catch (error) {
            console.error("Failed to update order status:", error);
        }
    };

    const handlePaymentConfirm = async (orderId) => {
        try {
            await fetch("/api/orders/confirm-payment", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId }),
            });

            // 更新前端訂單狀態
            setOrders((prev) =>
                prev.map((order) =>
                    order.id === orderId
                        ? { ...order, paymentStatus: true }
                        : order
                )
            );
        } catch (error) {
            console.error("Failed to confirm payment:", error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-100 via-pink-100 to-red-100 px-4 sm:px-6 py-8">
            <div className="max-w-5xl mx-auto">
                <h1 className="text-3xl font-bold mb-6 text-center sm:text-left text-gray-800">
                    待處理訂單
                </h1>

                {orders.length === 0 ? (
                    <p className="text-gray-500 text-center sm:text-left">
                        目前沒有待處理訂單。
                    </p>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div
                                key={order.id}
                                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition"
                            >
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-800">
                                            訂單 #{order.id.slice(0, 8)}
                                        </h3>
                                        <p className="text-sm text-gray-500">
                                            {new Date(
                                                order.createdAt
                                            ).toLocaleString()}
                                        </p>
                                    </div>
                                    <span
                                        className={`mt-2 sm:mt-0 px-3 py-1 rounded-full text-xs font-medium ${
                                            order.paymentStatus
                                                ? "bg-green-100 text-green-800"
                                                : "bg-red-100 text-red-800"
                                        }`}
                                    >
                                        {order.paymentStatus
                                            ? "已付款"
                                            : "未付款"}
                                    </span>
                                </div>

                                <div className="mb-3 space-y-1">
                                    <p className="text-gray-700">
                                        <strong>總金額：</strong> $
                                        {order.totalAmount.toFixed(2)}
                                    </p>
                                    <p className="text-gray-700">
                                        <strong>顧客：</strong>{" "}
                                        {order.customer.name}
                                    </p>
                                </div>

                                <div className="border-t pt-4">
                                    <h4 className="text-sm font-semibold mb-2 text-gray-700">
                                        餐點內容：
                                    </h4>
                                    <ul className="space-y-2">
                                        {order.items.map((item) => (
                                            <li
                                                key={item.id}
                                                className="flex justify-between text-sm text-gray-600"
                                            >
                                                <span>
                                                    {item.menuItem.name} ×{" "}
                                                    {item.quantity}
                                                    {item.specialRequest && (
                                                        <span className="block text-xs text-gray-400">
                                                            備註：
                                                            {
                                                                item.specialRequest
                                                            }
                                                        </span>
                                                    )}
                                                </span>
                                                <span>
                                                    $
                                                    {(
                                                        item.menuItem.price *
                                                        item.quantity
                                                    ).toFixed(2)}
                                                </span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="mt-6 flex flex-col sm:flex-row justify-between gap-3">
                                    {!order.paymentStatus && (
                                        <button
                                            onClick={() =>
                                                handlePaymentConfirm(order.id)
                                            }
                                            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                                        >
                                            確認付款
                                        </button>
                                    )}
                                    <button
                                        onClick={() =>
                                            handleStatusChange(
                                                order.id,
                                                "PREPARING"
                                            )
                                        }
                                        className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                                    >
                                        標記為製作中
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
