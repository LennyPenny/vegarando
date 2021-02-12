"use strict";

const bad = /aal|salami|bacon|sucuk|schinken|chicken|ente|bulette|fisch|garnele|meeresfr|leber|kalb|schwein|lachs|pastete|lamm|prosciutto|sardellen|gyros|Hähnchen|Hänchen|hühner|hühn|hünchen|huhn|Scampi|wurst|rind|beef|fleisch|krabben|hackfleisch|wurst|würstchen|schnitzel|steak|turkey|kebab|kebap|pute|speck|shrimps|scmpi|bolognese|ribs|rippchen|rogan josh|goshet|murgh|döner|frutti di mare|prosciutto|gehacktes|gehacktem|wiener art|burger|ebi|kani|surimi|sake|unagi|tako|masago|saba|tekka|maguro|mongoika/gim;
const good = /vegetarisch|vegan|veggie|vegetaria|chay/gim; // chay is vietnamese for vegetarian
const vegan = /vegan/gim;

function highlight(elem, good, text) {
    let reg = new RegExp(`[\\p{Letter}\\p{Pd}]*${text}[\\p{Letter}\\p{Pd}]*`, "gmiu");

    findAndReplaceDOMText(elem, {
        find: reg,
        wrap: "span",
        wrapClass: `highlight-${good ? "good" : "bad"}`
    })
}

function highlightWords(elem) {
    for (let match of elem.innerHTML.matchAll(bad)) {
        highlight(elem, false, match[0]);
    }

    for (let match of elem.innerHTML.matchAll(good)) {
        highlight(elem, true, match[0]);
    };

    for (let match of elem.innerHTML.matchAll(vegan)) {
        highlight(elem, true, match[0]);
    };
}

function hasVeggieOption(elem) {
    const without = /ohne|nicht|kein/gi;
    let parsedOptions = elem.innerText.split(",");

    for (let option of parsedOptions) {
        if (option.match(without) !== null) {
            return true;
        }

        if (option.match(good) !== null || option.match(vegan) !== null) {
            return true;
        }
m
        if (option.match(bad) === null) {
            return true;
        }
    }

    return false;
}

function prepareStyle() {
    const styleTag = document.createElement("style");

    styleTag.innerText = `
     .is-vegetarian .meal {
        box-shadow: inset 0.5rem 0px 0px 0px #7bc043;
        transition: all 0.5s;
     }
     .is-vegetarian .meal:hover {
        box-shadow: inset 2rem 0px 0px 0px #7bc043;
        padding-left: 2rem;
     }
     .highlight-good {
        text-shadow: 0px 0px 5px rgb(0,255,0);
     }
     .highlight-bad {
        text-shadow: 0px 0px 5px rgb(255,0,0);
     }
    `;

    document.head.appendChild(styleTag);
}

function tagMeal(elem, classTag) {
    elem.classList.add(classTag);
    highlightWords(elem);
}

function tagMeals() {
    for (let c of document.getElementsByClassName("meal-container")) {
        let mealName = c.getElementsByClassName("meal-name")[0];
        let mealInfo = c.getElementsByClassName(
            "meal__description-additional-info"
        )[0];

        if (mealName === undefined) {
            continue;
        }

        const mealNameText = mealName.innerText;
        const mealInfoText = mealInfo ? mealInfo.innerText : '';

        if (mealNameText.match(good) !== null || mealNameText.match(vegan) !== null) {
            tagMeal(c, "is-vegetarian");
            continue;
        }

        if (mealNameText.match(bad) !== null || mealInfoText.match(bad) !== null) {
            tagMeal(c, "is-meaty");
            continue;
        }

        let mealOptions = c.getElementsByClassName(
            "meal__description-choose-from"
        )[0];
        if (mealOptions && !hasVeggieOption(mealOptions)) {
            tagMeal(c, "is-meaty");
            continue;
        }

        tagMeal(c, "is-vegetarian");
    }
}

function tagCategories() {
    for (let category of document.getElementsByClassName(
        "menucard__meals-group"
    )) {
        let onlyMeatyMeals = true;
        for (let meal of category.getElementsByClassName("meal-container")) {
            if (meal.classList.contains("is-vegetarian")) {
                onlyMeatyMeals = false;
            }
        }

        if (onlyMeatyMeals == false) {
            continue;
        }

        category.classList.add("is-meaty");
    }
}

function toggleMeaty(show) {
    for (let c of document.getElementsByClassName("is-meaty")) {
        c.style.display = (show && "none") || "block";
    }
}

browser.storage.onChanged.addListener(async (changes, area) => {
    if (area != "sync") {
        return;
    }

    toggleMeaty(changes["hideMeaty"].newValue);
});

async function initialHide() {
    toggleMeaty((await browser.storage.sync.get())["hideMeaty"]);
}

// firefox at least silently failed on addon errors, so we have to explicitly catch q.q
try {
    prepareStyle();
    tagMeals();
    tagCategories();

    initialHide();
} catch (error) {
    console.error(error);
}
