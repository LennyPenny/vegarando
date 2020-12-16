let hideMeatyCheckbox = document.querySelector("input[id='hideMeaty']");

// oh my god can you please agree on `browser.`
var browser = window.browser ? window.browser : window.chrome;

hideMeatyCheckbox.addEventListener("click", (e) => {
    browser.storage.sync.set({
        "hideMeaty": hideMeatyCheckbox.checked
    });
})

async function main() {
    hideMeatyCheckbox.checked = (await browser.storage.sync.get())["hideMeaty"];
}

main();
