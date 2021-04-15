
let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray, 
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}).addTo(map);

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

// Leaflet Funktion
let awsLayer = featureGroup();
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
awsLayer.addTo(map);

// Daten von Server laden 
// weil's Fehleranfällig ist, muss man auf die Anwort des Servers warten, dann in JSON konvertierten, dann kann man damit weiter arbeiten
fetch(awsURL)
    .then(response => response.json()) 
    .then(json => {
        console.log('Daten konvertiert: ', json);
        // Marker für Wetterstationen hinzufügen
        for (station of json.features) {
            // console.log('Station: ', station);
            let marker = L.marker(
                [station.geometry.coordinates[1], station.geometry.coordinates[0]
            ]);
            let formattedDate = new Date(station.properties.date);
            // dann kann man das Länderspezifische Datum eingeben
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li> 
                    <li>Temperatur: ${station.properties.LT} °C</li>
                </ul>
            `);
            marker.addTo(awsLayer);
        }
        // set map view to all stations
        map.fitBounds(awsLayer.getBounds);
});

// Schneewert
// Luftfeuchtigkeit
// Höhe der Wetterstation

