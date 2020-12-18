import db from "../../data/dbConfig.js";

export default getLeaderboard;

const getLeaderboard = (name, age, rank) => {
    return db("users")
        .select({ name }, { age }, { rank })
        .orderBy({ rank });
};