var wordConfig = {
    "bad": [
        "aal",
        "salami",
        "bacon",
        "sucuk",
        "schinken",
        "chicken",
        "ente",
        "bulette",
        "fisch",
        "garnele",
        "meeresfr",
        "leber",
        "kalb",
        "schwein",
        "lachs",
        "pastete",
        "lamm",
        "prosciutto",
        "kapern",
        "sardellen",
        "gyros",
        "Hähnchen",
        "Hänchen",
        "hühner",
        "hühn",
        "hünchen",
        "huhn",
        "Scampi",
        "wurst",
        "rind",
        "beef",
        "fleisch",
        "krabben",
        "hackfleisch",
        "wurst",
        "würstchen",
        "schnitzel",
        "steak",
        "turkey",
        "kebab",
        "kebap",
        "pute",
        "speck",
        "shrimps",
        "scmpi",
        "bolognese",
        "ribs",
        "rippchen",
        "rogan josh",
        "goshet",
        "murgh",
        "döner",
        "frutti di mare",
        "prosciutto",
        "gehacktes",
        "gehacktem",
        "wiener art",
        "burger",
        "ebi",
        "kani",
        "surimi",
        "sake",
        "unagi",
        "tako",
        "masago",
        "saba",
        "tekka",
        "maguro",
        "mongoika",
        "pork",
        "salsiccia",
    ],
    "good": [
        "vegetarisch",
        "vegan",
        "veggie",
        "vegetaria",
        "chay"
    ],
    "vegan": [
        "vegan"
    ],
    "without": [
        "ohne",
        "nicht",
        "kein"
    ]
}

var wordConfigRegex = {
    "bad": new RegExp(wordConfig.bad.join("|"), "gim"),
    "good": new RegExp(wordConfig.good.join("|"), "gim"),
    "vegan": new RegExp(wordConfig.vegan.join("|"), "gim"),
    "without": new RegExp(wordConfig.without.join("|"), "gim")
}
