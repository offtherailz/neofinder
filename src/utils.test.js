import { applyAsteroidsFilter } from "./utils";
test('renders learn react link', () => {
    const asteroids = {
        type: "FeatureCollection",
        features: [
        {
            type: "Feature",
            properties: {
            name: "Asteroid 1",
            size: 100,
            hazard: false,
            },
            geometry: {
                type: "Point",
                coordinates: [1, 2]
            }
        },
        {
            type: "Feature",
            properties: {
            name: "Asteroid 2",
            size: 200,
            hazard: true,
            },
            geometry: {
                type: "Point",
                coordinates: [3, 4]
            }
        },
        ],
    };

    const filter = { horizon: true };
    const filterData = {
        horizonData: {
            type: "FeatureCollection",
            features: []
        },
        position: { latitude: 0, longitude: 0 },
        time: new Date(),
        activeHorizon: true,
        horizonHeight: 0
    };
    const filtered = applyAsteroidsFilter(asteroids, filter, filterData);

    expect(filtered.length).toBe(1);
    expect(filtered[0].properties.name).toBe("Asteroid 2");

});
