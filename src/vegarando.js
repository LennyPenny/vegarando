"use strict";

/**
 * Search a given haystack string for and matches for a given regular expression.
 * All matches will be output in an array of strings and are guaranteed to be unique.
 * @param {string} haystack
 * @param {RegExp} regex
 * @return {string[]} List of matching keywords in original casing as present in haystack
 */
function getMatchingKeywords(haystack, regex) {
    let matches = new Set();

    for (let match of haystack.matchAll(regex)) {
        matches.add(match[0]);
    }

    return Array.from(matches);
}

/**
 * Check if the haystack string matches the given regular expression.
 * @param {string} haystack
 * @param {RegExp} regex
 * @return {boolean}
 */
function hasMatchingKeyword(haystack, regex) {
    return haystack.match(regex) !== null;
}

function highlight(elem, good, text) {
    let reg = new RegExp(`[\\p{Letter}\\p{Pd}]*${text}[\\p{Letter}\\p{Pd}]*`, "gmiu");

    findAndReplaceDOMText(elem, {
        find: reg,
        wrap: "span",
        wrapClass: `highlight-${good ? "good" : "bad"}`
    })
}

function highlightWords(elem) {
    for (let match of getMatchingKeywords(elem.innerHTML, wordConfigRegex.bad)) {
        highlight(elem, false, match);
    }

    for (let match of getMatchingKeywords(elem.innerHTML, wordConfigRegex.good)) {
        highlight(elem, true, match);
    }

    for (let match of getMatchingKeywords(elem.innerHTML, wordConfigRegex.vegan)) {
        highlight(elem, true, match);
    }
}

function hasVeggieOption(elem) {
    let parsedOptions = elem.innerText.split(",");

    for (let option of parsedOptions) {
        if (hasMatchingKeyword(option, wordConfigRegex.without)) {
            return true;
        }

        if (hasMatchingKeyword(option, wordConfigRegex.good) || hasMatchingKeyword(option, wordConfigRegex.vegan)) {
            return true;
        }

        if (!hasMatchingKeyword(option, wordConfigRegex.bad)) {
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

        if (hasMatchingKeyword(mealName.innerText, wordConfigRegex.good) || hasMatchingKeyword(mealName.innerText, wordConfigRegex.vegan)) {
            tagMeal(c, "is-vegetarian");
            continue;
        }

        if (
            hasMatchingKeyword(mealName.innerText, wordConfigRegex.bad) ||
            (mealInfo && hasMatchingKeyword(mealInfo.innerText, wordConfigRegex.bad))
        ) {
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

        if (onlyMeatyMeals === false) {
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
    if (area !== "sync") {
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
