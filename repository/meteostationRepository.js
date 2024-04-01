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
    return {
        addMeteostation,
        deleteMeteostation,
        getMeasurement,
        deleteMeteostationSensor,
        updateMeteostation,
        getAllMeteostations,
        getSensorsByMeteostation,
        getOne,
        getSensorsFromMeteostation
    };

}

