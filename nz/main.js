const map = L.map("map", {
    center: [-45.316667, 166.983333],
    zoom: 13,
    layers: [
        L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png")
    ]
});
// Objekt {} und Liste & Array [] erstellt 

let mrk = L.marker([-45.316667, 166.983333]).addTo(map);
mrk.bindPopup("Doubtful Sound").openPopup();

console.log(document.querySelector("#map")); /* Zugreifen auf ein Element aus einem bestimmten Script */