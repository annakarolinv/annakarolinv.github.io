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
    center: [stop.lat, stop.lng],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
// Objekt {} und Liste & Array [] erstellt 

let mrk = L.marker([-45.316667, 166.983333]).addTo(map);
mrk.bindPopup(`
        <h4>Stop ${stop.nr}: ${stop.name}</h4>
        <p><i class="fas fa-external-link-alt mr-3"></i><a href="${stop.wikipedia}">Read about the stop on Wikipedia</a></p>
        `).openPopup();

// console.log(document.querySelector("#map")); /* Zugreifen auf ein Element aus einem bestimmten Script */
