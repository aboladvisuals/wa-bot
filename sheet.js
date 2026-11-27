async function saveOrder(order) {
  try {
    await fetch(process.env.SHEET_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret: process.env.SHEET_SECRET, ...order }),
    });
  } catch (err) {
    console.error("Sheet error:", err.message);
  }
}
export { saveOrder };