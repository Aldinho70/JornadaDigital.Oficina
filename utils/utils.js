export const getDataQuery = async (SQL) => {
    return await axios.post('../php/query.php', {SQL: SQL})
        .then( response =>{
            return response.data;
        })
        .catch( error =>{
            return error;
        })
}