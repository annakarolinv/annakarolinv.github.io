let basemapGray = L.tileLayer.provider('BasemapAT.grau');

// https://leafletjs.com/reference-1.7.1.html#map-example
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
}

// https://leafletjs.com/reference-1.7.1.html#control-layers
let layerControl = L.control.layers({
    "BasemapAT.grau": basemapGray,
    //https://leafletjs.com/reference-1.7.1.html#tilelayer 
    "BasemapAT.orthofoto": L.tileLayer.provider('BasemapAT.orthofoto'),
    "BasemapAT.surface": L.tileLayer.provider('BasemapAT.surface'),
    "BasemapAT.overlay": L.tileLayer.provider('BasemapAT.overlay'),
    // https://leafletjs.com/reference-1.7.1.html#layergroup-l-layergroup
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
}, {
    // layer conrol permanently expanded
    collapsed: false
}).addTo(map);

// choose layer and add to map immediatly 
overlays.temperature.addTo(map);

let awsURL = 'https://wiski.tirol.gv.at/lawine/produkte/ogd.geojson';

/*  
// https://leafletjs.com/reference-1.7.1.html#featuregroup
let awsLayer = L.featureGroup();
// https://leafletjs.com/reference-1.7.1.html#control-layers-addoverlay
layerControl.addOverlay(awsLayer, "Wetterstationen Tirol");
// awsLayer.addTo(map);

let snowLayer = L.featureGroup();
layerControl.addOverlay(snowLayer, "Schneehöhe (cm)");
// snowLayer.addTo(map);

let windLayer = L.featureGroup();
layerControl.addOverlay(windLayer, "Windgeschwindigkeit (km/h)");
//windLayer.addTo(map);

let tempLayer = L.featureGroup();
layerControl.addOverlay(tempLayer, "Lufttemperatur (°C)");
tempLayer.addTo(map);
*/


// load data from server 
// weil's fehleranfällig ist, muss man auf die Anwort des Servers warten, dann in JSON konvertierten, dann kann man damit weiter arbeiten
fetch(awsURL)
    .then(response => response.json())
    .then(json => {
        console.log('Daten konvertiert: ', json);
        // Marker für Wetterstationen hinzufügen
        for (station of json.features) {
            // console.log('Station: ', station);

            // https://leafletjs.com/reference-1.7.1.html#marker
            let marker = L.marker(
                [station.geometry.coordinates[1], station.geometry.coordinates[0]]);
            let formattedDate = new Date(station.properties.date);
            // dann kann man spezifisches Datum eingeben
            marker.bindPopup(`
                <h3>${station.properties.name}</h3>
                <ul>
                    <li>Datum: ${formattedDate.toLocaleDateString("de")}</li> 
                    <li>Temperatur: ${station.properties.LT} °C</li>
                    <li>Schneehöhe: ${station.properties.HS} cm</li>
                    <li>Luftdruck: ${station.properties.LD} hPa</li>
                    <li>Höhe der Wetterstation: ${station.geometry.coordinates[2]} m ü.d.M.</li>
                    <li>Windgeschwindigkeit: ${station.properties.WG || '?'} km/h</li>
                </ul>
                <a target="_blank" href="https://wiski.tirol.gv.at/lawine/grafiken/1100/standard/tag/${station.properties.plot}.png">Grafik</a>
            `);
            marker.addTo(overlays.stations);
            if (station.properties.HS) {
                let highlightClass = '';
                if (station.properties.HS > 100) {
                    highlightClass = 'snow-100';
                }
                if (station.properties.HS > 200) {
                    highlightClass = 'snow-200';
                }
                // https://leafletjs.com/reference-1.7.1.html#divicon
                let snowIcon = L.divIcon({
                    html: `<div class="snow-label ${highlightClass}">${station.properties.HS}</div>`
                })
                let snowMarker = L.marker([
                    station.geometry.coordinates[1], station.geometry.coordinates[0]
                ], {
                    icon: snowIcon
                });
                snowMarker.addTo(overlays.snowheight);
            }
            if (station.properties.WG) {
                let windHighlightClass = '';
                if (station.properties.WG > 10) {
                    windHighlightClass = 'wind-10';
                }
                if (station.properties.WG > 20) {
                    windHighlightClass = 'wind-20';
                }
                let windIcon = L.divIcon({
                    html: `<div class="wind-label ${windHighlightClass}">${station.properties.WG}</div>`,
                });
                let windMarker = L.marker([
                    station.geometry.coordinates[1],
                    station.geometry.coordinates[0]
                ], {
                    icon: windIcon
                });
                windMarker.addTo(overlays.windspeed);
            }
            if (station.properties.LT) {
                let tempHighlightClass = '';
                if (station.properties.LT > 0) {
                    tempHighlightClass = 'temp-pos';
                }
                if (station.properties.LT < 0) {
                    tempHighlightClass = 'temp-neg';
                }
                let tempIcon = L.divIcon({
                    html: `<div class="temp-label ${tempHighlightClass}">${station.properties.LT}</div>`
                })
                let tempMarker = L.marker([
                    station.geometry.coordinates[1], station.geometry.coordinates[0]
                ], {
                    icon: tempIcon
                });
                tempMarker.addTo(overlays.temperature);
            }
        }
        // set map view to all stations
        map.fitBounds(overlays.stations.getBounds());
    });