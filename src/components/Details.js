import Tabs from "./common/Tabs.js";
import EphemTable from "./EphemTable.jsx";

const DetailTab = ({
    ephemerids
}) => <EphemTable ephemerids={ephemerids} />

 const Details = ({
    asteroids = [],
    ephemerids = {},
    selectedAsteroids = []
 }) => {
    const tabs = asteroids
        .filter(({name}) => selectedAsteroids.has(name))
        .map(({name}) => {
            return {
                label: name,
                content: <DetailTab ephemerids={ephemerids?.[name]?.ephem} />
            };
        });
    return <Tabs tabs={tabs} />;
}

export default Details;