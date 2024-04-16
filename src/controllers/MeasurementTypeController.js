/**
 Measurement Type:
 создание новых типов (POST),
 удаление типов (при условии, что нет измерений. каскадно удаляются записи из sensors_measurements)(DELETE/{type_id}),
 редактирование типов(PUT),
 просмотр всех моделей (GET)
 **/


const express = require('express');
const router = express.Router();


module.exports = function (pgWrapper) {

    //TODO: ПРОСМОТР ВСЕХ МОДЕЛЕЙ
    router.get("/all", async (req, res) => {
        try {
            const result = await pgWrapper.query("SELECT * FROM measurements_type");
            return res.json(result.rows);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            return res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

    //TODO: ОБЫЧНОЕ ДОБАВЛЕНИЕ
    router.post("/", async (req, res) => {
        const {type_id, type_name, type_units} = req.body;
        try {
            await pgWrapper.transaction(async (client) => {
                await client.query("INSERT INTO measurements_type (type_id,type_name, type_units) VALUES ($1, $2, $3)",
                    [type_id, type_name, type_units]);
            });
            return res.sendStatus(201);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            return res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

    // TODO: УДАЛЕНИЕ ПРИ УСЛОВИИ ЧТО НЕТ ИЗМЕРЕНИЙ
    router.delete("/:type_id", async (req, res) => {
        const {type_id} = req.params;
        try {
            await pgWrapper.transaction(async (client) => {
                const sql123 = "SELECT * FROM measurements_type WHERE type_id = $1";
                const result23 = await client.query(sql123, [type_id]);
                if (result23.rows.length <= 0) return res.status(400).json({message: 'Измерение не существует'});

                const sql1 = "SELECT * FROM measurements WHERE measuremnet_type = $1";
                const result = await client.query(sql1, [type_id]);
                if (result.rows.length > 0) return res.status(400).json({message: 'Существуют измерения, удаление невозможно'});

                const sql2 = "DELETE FROM sensors_measurements WHERE type_id = $1";
                await client.query(sql2, [type_id]);

                const sql3 = "DELETE FROM measurements_type WHERE type_id = $1";
                await client.query(sql3, [type_id]);
            });
            res.status(200).json({message: 'Успешно удалено'});
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });
    // TODO: ОБНОВЛЕНИЕ
    router.put("/:type_id", async (req, res) => {
        const {type_id} = req.params;
        const {type_name, type_units} = req.body;
        try {
            await pgWrapper.transaction(async (client) => {
                let sql;
                if (type_name && type_units) {
                    sql = "UPDATE measurements_type SET type_name = $1, type_units = $2 WHERE type_id = $3";
                    await client.query(sql, [type_name, type_units, type_id]);
                } else if (type_name) {
                    sql = "UPDATE measurements_type SET type_name = $1 WHERE type_id = $2";
                    await client.query(sql, [type_name, type_id]);
                } else if (type_units) {
                    sql = "UPDATE measurements_type SET type_units = $1 WHERE type_id = $2";
                    await client.query(sql, [type_units, type_id]);
                }
            })
            res.sendStatus(200);
        } catch (error) {
            console.error('Ошибка при выполнении запроса к базе данных:', error);
            res.status(500).json({message: 'Произошла ошибка при выполнении запроса к базе данных'});
        }
    });

    return router;
}


