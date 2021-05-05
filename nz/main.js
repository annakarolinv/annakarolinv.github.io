let stop = {
    nr: 10,
    name: "Doubtful Sound",
    lat: -45.316667,
    lng: 166.983333,
    user: "annakarolinv",
    wikipedia: "https://en.wikipedia.org/wiki/Doubtful_Sound_/_Patea"
};

console.log(stop.name);

const map = L.map("map", {
    // center: [stop.lat, stop.lng],
    // zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
// Objekt {} und Liste & Array [] erstellt 

let nav = document.querySelector("#navigation");
console.log(nav);

//console.log(ROUTE);

ROUTE.sort((stop1, stop2) => {
    if (stop1.nr > stop2.nr) {
        return 1;
    } else {
        return -1;
    }
});

for (let entry of ROUTE) {
    // console.log(entry);

    nav.innerHTML += `
        <option value="${entry.user}">Stop ${entry.nr}: ${entry.name}</option>
    `;

    let mrk = L.marker([entry.lat, entry.lng]).addTo(map);
    mrk.bindPopup(`
        <h4>Stop ${entry.nr}: ${entry.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${entry.wikipedia}">Read about the stop on Wikipedia</a></p>
    `);

    if (entry.nr == 10) {
        map.setView([entry.lat, entry.lng], 10);
        mrk.openPopup();
    }
}

nav.selectedIndex = 10 - 1;

nav.onchange = (evt) => {
    console.log(evt.target.selectedIndex);
    let selected = evt.target.selectedIndex;
    let options = evt.target.options;
    let username = options[selected].value;
    let link = `https://${username}.github.io/nz/index.html`;

    window.location.href = link;
    console.log(username, link);
};

