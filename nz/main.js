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

// <option value="annakarolinv">Doubtful Sound</option>


/* let mrk = L.marker([stop.lat, stop.lng]).addTo(map);
mrk.bindPopup(`
        <h4>Stop ${stop.nr}: ${stop.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${stop.wikipedia}">Read about the stop on Wikipedia</a></p>
        `).openPopup(); */

// console.log(document.querySelector("#map")); /* Zugreifen auf ein Element aus einem bestimmten Script */