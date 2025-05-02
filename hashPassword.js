

async function hashPassword() {
  const hashedPassword = await bcrypt.hash("12345678", 10);
  console.log("Hashed Password:", hashedPassword);
}

hashPassword();
