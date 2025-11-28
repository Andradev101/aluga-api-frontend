
const ptTranslations: any = {
    Username: "Nome de usuário",
    "3–15 characters.": "3–15 caracteres.",

    Password: "Senha",
    "Min 8 chars, must include a letter, number & symbol.":
        "Mínimo de 8 caracteres, deve incluir uma letra, número e símbolo.",

    Birthdate: "Data de nascimento",
    "Must be 18 or older.": "Deve ter 18 anos ou mais.",

    Email: "E-mail",
    "Enter a valid email address.": "Digite um endereço de e-mail válido.",

    "Phone Number": "Número de telefone",
    "Include country code if needed.": "Inclua o código do país, se necessário.",

    "First Name": "Nome",
    "Your first name.": "Seu primeiro nome.",

    "Last Name": "Sobrenome",
    "Your last name.": "Seu sobrenome.",

    Address: "Endereço",
    "Your address.": "Seu endereço.",

    
    "Field cannot be blank.":"Campo não pode estar vazio."
};

export function translateMeta(meta: any) {
  const translated = { ...meta };

  if (meta.title && ptTranslations[meta.title]) {
    translated.title = ptTranslations[meta.title];
  }

  if (meta.description && ptTranslations[meta.description]) {
    translated.description = ptTranslations[meta.description];
  }

  return translated;
}