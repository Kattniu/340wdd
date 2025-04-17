const pool = require("../database/");

const commentModel = {};

// Obtener comentarios por vehículo
commentModel.getCommentsByInvId = async function (inv_id) {
    const query = `
        SELECT c.comment_text, c.comment_date, a.account_firstname, a.account_lastname
        FROM public.comments c
        JOIN public.account a ON c.account_id = a.account_id
        WHERE c.inv_id = $1
        ORDER BY c.comment_date DESC;
    `;
    const result = await pool.query(query, [inv_id]);
    return result.rows;
};

// Agregar un nuevo comentario
commentModel.addComment = async function (account_id, inv_id, comment_text) {
    const query = `
        INSERT INTO public.comments (account_id, inv_id, comment_text, comment_date)
        VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        RETURNING *;
    `;
    const result = await pool.query(query, [account_id, inv_id, comment_text]);
    return result.rows[0];
};

module.exports = commentModel;