"use strict"

const bad = /aal|salami|bacon|sucuk|schinken|chicken|ente|bulette|fisch|garnele|meeresfr|leber|kalb|schwein|lachs|pastete|lamm|prosciutto|kapern|sardellen|gyros|Hähnchen|Hänchen|hühner|huhn|Scampi|wurst|rind|beef|fleisch|krabben|hackfleisch|wurst|würstchen|schnitzel|steak|turkey|kebab|pute|speck/i;
const good = /vegetarisch|vegan|veggie|vegetaria/i;
const vegan = /vegan/i;

function hasVeggieOption(elem) {
    const without = /ohne|nicht|kein/i;
    let parsedOptions = elem.innerText.split(",");
    
    for (let option of parsedOptions) {
        if (without.test(option)) {
            return true;
        }

        if (good.test(option) || vegan.test(option)) {
            return true;
        }

        if (!bad.test(option)) {
            return true;
        }
    }

    return false;
}

function tagMeals() {
    for (let c of document.getElementsByClassName("meal-container")) {
        let mealName = c.getElementsByClassName("meal-name")[0]
        let mealInfo = c.getElementsByClassName("meal__description-additional-info")[0];
        
        if (good.test(mealName.innerText) || vegan.test(mealName.innerText)) {
            c.style.backgroundColor = "green";
            continue;
        }

        if (bad.test(mealName.innerText) || (mealInfo && bad.test(mealInfo.innerText))) {
            continue;
        }

        let mealOptions = c.getElementsByClassName("meal__description-choose-from")[0];
        if (mealOptions && !hasVeggieOption(mealOptions)) {
            continue;
        }

        c.style.backgroundColor = "green";
    }
}

// firefox at least silently failed on addon errors, so we have to explicitly catch q.q
try {
    tagMeals();
} catch (error) {
    console.error(error)
}

