let basemapGray = L.tileLayer.provider('BasemapAT.grau');

let map = L.map("map", {
    fullscreenControl: true, // plugin for Leaflet that adds fullscreen button to your maps
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
    humidity: L.featureGroup(),
};

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
    "Luftfeuchtigkeit (%)": overlays.humidity,
}, {
    collapsed: false // layer conrol permanently expanded
}).addTo(map);

overlays.temperature.addTo(map); // choose default layer and add to map

L.control.scale({
    imperial: false,
    maxWidth: 200,
    metric: true,
}).addTo(map);

// rain viewer plugin

// Funktion zum Einfärben der Label
let getColor = (value, colorRamp) => {
    // console.log("Wert: ", value, "Palette: ", colorRamp);
    for (let rule of colorRamp) {
        if (value >= rule.min && value < rule.max) {
            return rule.col;
        }
    }
    return "black";
};

// Funktion get directions
let getDirections = (value, directionRamp) => {
    for (let rule of directionRamp) {
        if (value >= rule.min && rule.max) {
            return rule.dir;
        }
    }
    return "NA"; // default
};

// Funktion newLabel
// liefert L.divIcon zurück & Argumente beim Aufruf: Koordinaten & den zu visualisierenden Wert als options-Objekt
let newLabel = (coords, options) => {
    let color = getColor(options.value, options.colors);
    let label = L.divIcon({ // erzeugt neuen Temperaturlabel
        html: `<div style="background-color:${color}">${options.value}</div>`, // definiert den angezeigten Text 
        className: "text-label" //  fügt dem Label eine CSS-Klasse hinzu - main.cs
    })
    let marker = L.marker([coords[1], coords[0]], {
        icon: label, // L.divIcon verwenden wir schließlich als Icon beim L.marker-Befehl
        title: `${options.station} (${coords[2]} m)`
    });
    return marker; // gibt die Funktion den erzeugten Marker zurück. Wir speichern ihn beim Aufruf der Funktion in der Variablen marker
};

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

fetch(awsURL)   // load data from server // auf Anwort des Servers warten, dann in JSON konvertierten, dann kann man damit weiter arbeiten
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        // Marker für Wetterstationen hinzufügen
        for (station of json.features) {
            let marker = L.marker(
                [station.geometry.coordinates[1], station.geometry.coordinates[0]]);

            //get direction
            let direction = getDirections(station.properties.WR, DIRECTIONS);

            /* let winddirection = '';
            if (typeof station.properties.WR == "number") {
                winddirection = getDirection(station.properties.WR, DIRECTIONS);
            } else{
                direction="NA";
            } */

            let formattedDate = new Date(station.properties.date); // spezifisches Datum eingeben

            // pop-up
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li> 
                    <li>Temperatur: ${station.properties.LT} °C</li>
                    <li>Schneehöhe: ${station.properties.HS} cm</li>
                    <li>Luftdruck: ${station.properties.LD} hPa</li>
                    <li>Luftfeuchtigkeit: ${station.properties.RH || '?' } %</li>
                    <li>Höhe der Wetterstation: ${station.geometry.coordinates[2]} m ü.d.M.</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} km/h</li>
                    <li>Windrichtung: ${direction || '?'}</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);

            marker.addTo(overlays.stations);

            // snow height
            if (typeof station.properties.HS == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.HS.toFixed(0),
                    colors: COLORS.snowheight,
                    station: station.properties.name
                });
                marker.addTo(overlays.snowheight);
            }

            // wind speed
            if (typeof station.properties.WG == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.WG.toFixed(0),
                    colors: COLORS.windspeed,
                    station: station.properties.name
                });
                marker.addTo(overlays.windspeed);
            }

            // temperature
            if (typeof station.properties.LT == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.LT.toFixed(1),
                    colors: COLORS.temperature,
                    station: station.properties.name
                });
                marker.addTo(overlays.temperature);
            }

            // humidity
            if (typeof station.properties.RH == "number") {
                let marker = newLabel(station.geometry.coordinates, {
                    value: station.properties.RH.toFixed(1),
                    colors: COLORS.humidity,
                    station: station.properties.name
                });
                marker.addTo(overlays.humidity);
            }

            // winddirection
            if (typeof station.properties.WR == "letter") {
                let marker = newLabel(station.properties.coordinates, {
                    value: station.properties.WR.directions,
                    colors: DIRECTIONS,
                    station: station.properties.name
                });
                marker.addTo(overlays.winddirection);
            }
        }

        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });

// Mini Map for overview
var miniMap = new L.Control.MiniMap(
    L.tileLayer.provider("BasemapAT.basemap"), {
        toggleDisplay: true, // button to minimise minimap, defaults to false
        minimized: false,
    }
).addTo(map);