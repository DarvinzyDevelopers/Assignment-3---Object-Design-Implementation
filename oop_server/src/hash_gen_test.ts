import bcrypt from "bcryptjs";

const h1 = await bcrypt.hash("admin123", 10);
console.log(h1);
const h2 = await bcrypt.hash("user123", 10);
console.log(h2);
