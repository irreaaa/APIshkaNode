// repository/meteostationRepository.js


// Добавление метеостанции
module.exports = function (pool) {
    async function addMeteostation(meteostation) {
        const {name, longitude, latitude} = meteostation;
        const query = 'INSERT INTO meteostations (station_name, station_longitude, station_latitude) VALUES ($1, $2, $3)';
        await pool.query(query, [name, longitude, latitude]);
    }

// Удаление метеостанции
    async function deleteMeteostation(stationId) {
        const query = 'DELETE FROM meteostations WHERE station_id = $1';
        await pool.query(query, [stationId]);
    }

// Получение измерений для метеостанции
    async function getMeasurement(meteostation_id) {
        const query = 'SELECT * FROM meteostations_sensors ms JOIN sensors_measurements sm ON ms.sensor_id = sm.sensor_id JOIN measurements_type mt ON mt.type_id = sm.type_id JOIN measurements m ON mt.type_id = m.measuremnet_type WHERE station_id = $1';
        const result = await pool.query(query, [meteostation_id]);
        return result.rows;
    }

// Удаление связанных с метеостанцией датчиков
    async function deleteMeteostationSensor(id) {
        const query = 'DELETE FROM meteostations_sensors WHERE station_id = $1';
        await pool.query(query, [id]);
    }

// Обновление информации о метеостанции
    async function updateMeteostation(meteostation) {
        const {id, name, longitude, latitude} = meteostation;
        const query = 'UPDATE meteostations SET station_name = $1, station_longitude = $2, station_latitude = $3 WHERE station_id = $4';
        await pool.query(query, [name, longitude, latitude, id]);
    }

// Получение всех метеостанций
    async function getAllMeteostations() {
        const query = 'SELECT * FROM meteostations';
        const result = await pool.query(query);
        return result.rows;
    }

// Получение датчиков для метеостанции
    async function getSensorsByMeteostation(stationId) {
        const query = 'SELECT s.sensor_id, s.sensor_name FROM sensors s JOIN meteostations_sensors ms ON s.sensor_id = ms.sensor_id WHERE ms.station_id = $1';
        const result = await pool.query(query, [stationId]);
        return result.rows;
    }

// Получение информации о метеостанции по ID
    async function getOne(id) {
        const query = 'SELECT * FROM meteostations WHERE station_id = $1';
        const result = await pool.query(query, [id]);
        return result.rows[0];
    }

// Получение датчиков для метеостанции по ID
    async function getSensorsFromMeteostation(meteostation_id) {
        const query = 'SELECT * FROM meteostations_sensors ms JOIN sensors s ON ms.sensor_id = s.sensor_id WHERE station_id = $1';
        const result = await pool.query(query, [meteostation_id]);
        return result.rows;
    }
    async function addMeteostationSensor(meteostationSensor) {
        for (const a of meteostationSensor) {
            console.log(a)
            const { meteostation_sensor } = a;
            let { sensor_inventory_number, station_id, sensor_id, added_ts } = meteostation_sensor;
            if(added_ts == null) {
                added_ts = new Date();
            }
            const query = 'INSERT INTO meteostations_sensors (sensor_inventory_number, station_id, sensor_id, added_ts) VALUES ($1, $2, $3, $4)';
            await pool.query(query, [sensor_inventory_number, station_id, sensor_id, added_ts]);
        }

    }

    async function removeMeteostationSensor(sensor_inventory_number, removed_ts) {
        if(removed_ts == null) {
            removed_ts = new Date();
        }
        const query = 'UPDATE meteostations_sensors SET removed_ts = $1 WHERE sensor_inventory_number = $2';
        await pool.query(query, [removed_ts, sensor_inventory_number]);
    }

    async function getAllMeteostationSensors() {
        const query = 'SELECT * FROM meteostations m JOIN meteostations_sensors ms ON m.station_id = ms.station_id JOIN sensors s ON ms.sensor_id = s.sensor_id;';
        const result = await pool.query(query);

        const meteostations = {};
        result.rows.forEach(row => {
            const { station_id, station_name, station_longitude, station_latitude, sensor_inventory_number, sensor_id, sensor_name, sensor_added_ts, sensor_remove_ts } = row;
            if (!meteostations[station_id]) {
                meteostations[station_id] = {
                    station_id,
                    station_name,
                    station_longitude,
                    station_latitude,
                    sensors: []
                };
            }
            meteostations[station_id].sensors.push({
                sensor_inventory_number,
                sensor_id,
                sensor_name,
                sensor_added_ts,
                sensor_remove_ts
            });
        });

        const meteostationsArray = Object.values(meteostations).map(station => {
            return {
                meteostation: station
            };
        });

        return { meteostations_sensors: meteostationsArray };
    }
    return {
        addMeteostation,
        deleteMeteostation,
        getMeasurement,
        deleteMeteostationSensor,
        updateMeteostation,
        getAllMeteostations,
        getSensorsByMeteostation,
        getSensorsFromMeteostation,
        addMeteostationSensor,
        removeMeteostationSensor,
        getAllMeteostationSensors,

                 getOne
    };

}

