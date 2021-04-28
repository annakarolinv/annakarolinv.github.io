let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    center: [47, 11],
    zoom: 9,
    layers: [
        basemapGray
    ]
});

let overlays = {
    stations: L.featureGroup(),
    temperature: L.featureGroup(),
    snowheight: L.featureGroup(),
    windspeed: L.featureGroup(),
    winddirection: L.featureGroup(),
    humidity: L.featureGroup()
}
/*  
    https://leafletjs.com/reference-1.7.1.html#map-example
    https://leafletjs.com/reference-1.7.1.html#featuregroup
    https://leafletjs.com/reference-1.7.1.html#control-layers-addoverlay
    https://leafletjs.com/reference-1.7.1.html#divicon
    https://leafletjs.com/reference-1.7.1.html#tilelayer 
    https://leafletjs.com/reference-1.7.1.html#layergroup-l-layergroup
    https://leafletjs.com/reference-1.7.1.html#marker
    https://leafletjs.com/reference-1.7.1.html#control-layers
*/

let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.overlay+ortho": L.layerGroup([
        L.tileLayer.provider('BasemapAT.orthofoto'),
        L.tileLayer.provider('BasemapAT.overlay')
    ])
}, {
    "Wetterstationen Tirol": overlays.stations,
    "Temperatur (°C)": overlays.temperature,
    "Schneehöhe (cm)": overlays.snowheight,
    "Windgeschwindigkeit (km/h)": overlays.windspeed,
    "Windrichtung": overlays.winddirection,
    "Luftfeuchtigkeit (%)": overlays.humidity
}, {
    collapsed: false    // layer conrol permanently expanded
}).addTo(map); 
overlays.temperature.addTo(map);    // choose layer and add to map immediatly

L.control.scale({
    imperial: false,
    maxWidth: 200,
    metric: true,
}).addTo(map);

// Funktion zum Einfärben der Label
// soll für einen gegebenen Wert die passende Farbe je nach Schwellenwerten ermitteln
let getColor = (value, colorRamp) => {
    // console.log("Wert: ", value, "Palette: ", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

// Funktion
// liefert L.divIcon zurück
// Argumente beim Aufruf: Koordinaten & den zu visualisierenden Wert als options-Objekt
let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors);
    let label = L.divIcon({     // erzeugt neuen Temperaturlabel
        html: `<div style="background-color:${color}">${options.value}</div>`,  // definiert den angezeigten Text 
        className: "text-label"     //  fügt dem Label eine CSS-Klasse hinzu - main.cs
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label,    // L.divIcon verwenden wir schließlich als Icon beim L.marker-Befehl
        title: `${options.station} (${coords[2]} m)`
    });
    return marker;  // gibt die Funktion den erzeugten Marker zurück. Wir speichern ihn beim Aufruf der Funktion in der Variablen marker
};

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';
fetch(awsURL)   // load data from server // auf Anwort des Servers warten, dann in JSON konvertierten, dann kann man damit weiter arbeiten
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json); 
        for (station of json.features) {    // Marker für Wetterstationen hinzufügen
            let marker = L.marker(
                [station.geometry.coordinates[1], station.geometry.coordinates[0]]);
            let formattedDate = new Date(station.properties.date);  // spezifisches Datum eingeben
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li> 
                    <li>Temperatur: ${station.properties.LT} °C</li>
                    <li>Schneehöhe: ${station.properties.HS} cm</li>
                    <li>Luftdruck: ${station.properties.LD} hPa</li>
                    <li>Luftfeuchtigkeit: ${station.properties.RH} %</li>
                    <li>Höhe der Wetterstation: ${station.geometry.coordinates[2]} m ü.d.M.</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} km/h</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(overlays.stations);
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);
            }
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }
            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1),
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);
            }
            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(1),
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);
            }
        }
        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });