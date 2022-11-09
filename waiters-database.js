module.exports = function WaitersDB(db){

    async function register(name,code){
        await db.none('INSERT INTO register_table (waiters,code) values($1,$2);',[name,code])
    }

    async function findDuplicate(name){

     const findUser = await db.oneOrNone('select count(*) from register_table where waiters = $1;',[name]);
     return findUser.count;

    }

    async function getUserByCode(code){
        const findUserByCODE = await db.oneOrNone('Select * from register_table where code = $1;', code)
        return findUserByCODE;
    }
    return{
        register,
        findDuplicate,
        getUserByCode
    }
}