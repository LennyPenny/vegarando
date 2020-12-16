let hideMeatyCheckbox = document.querySelector("input[id='hideMeaty']");

hideMeatyCheckbox.addEventListener("click", (e) => {
    browser.storage.sync.set({
        "hideMeaty": hideMeatyCheckbox.checked
    });
})

async function main() {
    hideMeatyCheckbox.checked = (await browser.storage.sync.get())["hideMeaty"];
}

main();
