const db = require("../../config/db");
const { date } = require("../../lib/utils");

module.exports = {
    all() {
        try {
            const query = `SELECT recipes.*, chefs.name AS chef_name 
            FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id) ORDER BY recipes.created_at DESC`;
    
            return db.query(query);
        } catch (error) {
            console.error(error);
        }
    },

    async create(data, userId) {
        try {
            const query = `
                INSERT INTO recipes (
                    chef_id,
                    title,
                    ingredients,
                    preparation,
                    information,
                    created_at,
                    updated_at,
                    user_id
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) 
                RETURNING id
            `;
    
            const values = [
                data.chef,
                data.title,
                data.ingredients,
                data.preparation,
                data.information,
                date(Date.now()).iso,
                date(Date.now()).iso,
                data.userId || userId
            ];
    
            const results = await db.query(query, values);

            return results.rows[0].id;

        } catch (error) {
            console.error(error);
        }
    },

    find(id) {
        try {
            return db.query(`SELECT recipes.*, chefs.name AS chef_name 
            FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
            WHERE recipes.id=$1`, [id]);
        } catch (error) {
            console.error(error);
        }
    },

    findBy(filter) {
        try {
            let filterQuery = "",
                totalQuery = `SELECT recipes.*, chefs.name AS chef_name 
                FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id) `;
    
            if (filter) {
                filterQuery = `WHERE recipes.title ILIKE '%${filter}%'`;
    
                totalQuery = `SELECT recipes.*, chefs.name AS chef_name 
                FROM recipes LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
                ${filterQuery}`;
            }
    
            return db.query(totalQuery);
        } catch (error) {
            console.error(error);
        }
    },

    update(data) {
        try {
            const query = `
                UPDATE recipes SET 
                    chef_id=($1),
                    title=($2),
                    ingredients=($3),
                    preparation=($4),
                    information=($5)
                WHERE id=($6)
            `;
    
            const values = [
                data.chef,
                data.title,
                data.ingredients,
                data.preparation,
                data.information,
                data.id
            ];
    
             return db.query(query, values);
        } catch (error) {
            console.error(error);
        }
    },

    async delete(id) {
        try {
            await db.query(`DELETE FROM recipes_files WHERE recipes_files.recipe_id = $1`, [id]);
    
            return db.query(`DELETE FROM recipes WHERE id=$1`, [id]);
        } catch (error) {
            console.error(error);
        }
    },

    chefSelectOptions() {
        try {
            return db.query(`SELECT name, id FROM chefs`);
        } catch (error) {
            console.error(error);
        }
    },

    paginate(params) {
        try {
            const { filter, limit, offset, callback } = params;

            let query = "",
                filterQuery = "",
                totalQuery = `(
                    SELECT count(*) FROM recipes
                ) AS total`;


            if (filter) {
                filterQuery = ` WHERE recipes.title ILIKE '%${filter}%'`;

                totalQuery = `(
                    SELECT count(*) FROM recipes 
                    ${filterQuery}
                ) AS total`;
            }

            if (filter) {
                query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name 
                FROM recipes 
                LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
                ${filterQuery} ORDER BY recipes.updated_at DESC LIMIT $1 OFFSET $2`;
            } else {
                query = `SELECT recipes.*, ${totalQuery}, chefs.name AS chef_name 
                FROM recipes 
                LEFT JOIN chefs ON (recipes.chef_id = chefs.id) 
                ${filterQuery} ORDER BY recipes.created_at DESC LIMIT $1 OFFSET $2`;
            }

            db.query(query, [limit, offset], function (err, results) {
                if (err) throw `Database Error! ${err}`;

                callback(results.rows);
            });

        } catch (error) {
            console.error(error);
        }
    },

    files(id) {
        try {
            return db.query(`
            SELECT files.* FROM files LEFT JOIN recipes_files ON (files.id = recipes_files.file_id) LEFT
            JOIN recipes ON (recipes.id = recipes_files.recipe_id) WHERE recipes.id = $1
            `, [id]);
        } catch (error) {
            console.error(error);
        }
    }
}