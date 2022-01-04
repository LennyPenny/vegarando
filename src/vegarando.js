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

function hasVeggieOption(options) {
    if (options.length === 0) {
        return true;
    }

    for (let option of options) {
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
     .is-vegetarian > div {
        box-shadow: inset 0.5rem 0px 0px 0px #7bc043;
        transition: all 0.5s;
     }
     .is-vegetarian > div:hover {
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

const getTextOfElementWithoutChildren = (element) => {
    return []
        .filter
        .call(element.childNodes, e => e.nodeType === Node.TEXT_NODE)
        .map(e => e.textContent)
        .join('');
}

const isOldMarkup = () => {
    return document.getElementById('root') === null;
}

const getCategories = () => {
    if (oldMarkup === true) {
        return document.querySelectorAll(".menucard__meals-group");
    }

    return document.querySelectorAll("[data-qa='menu-list'] section");
}

const getProductItems = (element) => {
    if (oldMarkup === true) {
        return element.querySelectorAll(".meal-container");
    }

    return element.querySelectorAll("[menu-item-id]");
}

const getProductName = (item) => {
    let nameItem = item.querySelector("h3");

    if (oldMarkup === true) {
        nameItem = item.querySelector("[data-product-name]");
    }

    if (nameItem === null) {
        return "";
    }

    return getTextOfElementWithoutChildren(nameItem);
}

const getProductInfo = (item) => {
    let infoItem = item.querySelector("[data-qa='util']:nth-child(2)");

    if (oldMarkup === true) {
        infoItem = item.querySelector(".meal__description-additional-info");
    }

    if (infoItem === null) {
        return "";
    }

    return infoItem.innerText;
}

const getProductOptions = (item) => {
    let optionsItem = item.querySelector("[data-qa='util']:nth-child(3)");

    if (oldMarkup === true) {
        optionsItem = item.querySelector(".meal__description-choose-from");
    }

    if (optionsItem === null) {
        return [];
    }

    return optionsItem.innerText.split(",");
}

function tagMeals() {
    const productItems = getProductItems(document);

    for (let item of productItems) {
        if (item.classList.contains("is-vegetarian") || item.classList.contains("is-meaty")) {
            continue;
        }

        const name = getProductName(item);
        const productInfo = getProductInfo(item);
        const options = getProductOptions(item);

        if (hasMatchingKeyword(name, wordConfigRegex.good) || hasMatchingKeyword(name, wordConfigRegex.vegan)) {
            tagMeal(item, "is-vegetarian");
            continue;
        }

        if (hasMatchingKeyword(name, wordConfigRegex.bad) || hasMatchingKeyword(productInfo, wordConfigRegex.bad)) {
            tagMeal(item, "is-meaty");
            continue;
        }

        if (!hasVeggieOption(options)) {
            tagMeal(item, "is-meaty");
            continue;
        }

        tagMeal(item, "is-vegetarian");
    }
}

function tagCategories() {
    const categories = getCategories();

    for (let category of categories) {
        if (category.classList.contains("is-vegetarian")) {
            continue;
        }

        let onlyMeatyMeals = true;
        for (let meal of getProductItems(category)) {
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

const observeMarkupChanges = () => {
    const targetNode = document.querySelector('body');
    const config = { attributes: false, childList: true, subtree: true };

    const callback = function(mutationsList) {
        for(const mutation of mutationsList) {
            if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
                for (const node of mutation.addedNodes) {
                    console.log('node', node, 'tageName', node.tagName);
                    if (node.tagName === "SECTION") {
                        tagMeals();
                        tagCategories();
                    }
                }
            }
        }
    };

    const observer = new MutationObserver(callback);
    observer.observe(targetNode, config);
}

const oldMarkup = isOldMarkup();

// firefox at least silently failed on addon errors, so we have to explicitly catch q.q
try {
    observeMarkupChanges();
    prepareStyle();
    tagMeals();
    tagCategories();

    initialHide();
} catch (error) {
    console.error(error);
}
