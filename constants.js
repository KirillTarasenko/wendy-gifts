
const STASY_TG = 985612311;
const ASSOL7I_TG = 1100707268;
const OWNER_ID = 457980948;

const STEP_DELAY = 800;
const CHECK_NAME_STEP_DELAY = 400;
const MODERATORS = [STASY_TG, ASSOL7I_TG];

const ROLES_MODERATORS = [...MODERATORS, OWNER_ID];
const ROLES_ADMIN = [OWNER_ID];

const SENDER_ID = "127705881"; // XX tg@marstut


const MAIN_LIST = `
    https://docs.google.com/spreadsheets/u/0/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=0`;
const CHECK_LIST = `
    https://docs.google.com/spreadsheets/d/1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58/export?format=csv&id=1Q94gtj4Puk8JWTKsFE-aKBh_irITYOI3j53eW2IHl58&gid=1713670405`;


module.exports = { STASY_TG, ASSOL7I_TG, OWNER_ID, STEP_DELAY, CHECK_NAME_STEP_DELAY, MODERATORS, ROLES_MODERATORS, ROLES_ADMIN, SENDER_ID }